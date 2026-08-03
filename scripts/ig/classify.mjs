#!/usr/bin/env node
// ③ 분류 & 스코어링 — 카테고리를 붙이고, 2026 인스타 알고리즘 신호를 역산해 콘텐츠 가치를 매긴다.
// 규칙 기반으로 90%를 처리하고, 애매한 것만 needs_review 로 표시해 Claude가 아침에 판단한다.
// 사용: node scripts/ig/classify.mjs [--date YYYY-MM-DD]

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { normalize } from './lib/fingerprint.mjs';
import { today } from './collect.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'data/ig');

function countHits(haystack, keywords) {
  const hits = [];
  for (const k of keywords) if (haystack.includes(k)) hits.push(k);
  return hits;
}

// 특정 지자체 주민만 해당되는 소식인가.
// 전국 어디서나 쓸 수 있는 정보가 훨씬 넓게 공유되므로 지역 한정 건은 우선순위를 낮춘다.
const LOCAL_RE = /(^|[\s\[(·,])[가-힣]{2,4}(시|군|구|도|시청|군청|구청|도청|시의회|군의회|구의회)(?![가-힣])/;
function isLocal(title) {
  if (/(전국|정부|중기부|국세청|고용노동부|중소벤처기업부)/.test(title)) return false;
  return LOCAL_RE.test(title);
}

export function classifyOne(cluster, tax, now = Date.now()) {
  const hay = normalize(`${cluster.title} ${cluster.summary ?? ''}`);

  // --- 니치 게이트 ---
  // 구글 뉴스 검색은 무관한 기사를 상당량 끌고 온다("신봉선 갱년기", 게임 공략 등).
  // 니치 핵심어가 하나도 없으면 분류 실패가 아니라 애초에 우리 주제가 아니다.
  const nicheHits = countHits(hay, tax.niche.core);
  const offNiche = nicheHits.length === 0;

  // --- 카테고리 ---
  // 히트 수만 세면 짧고 흔한 키워드가 이긴다("ai" 1개 > "소상공인,융자" 2개).
  // 키워드 길이를 가중해 변별력 있는 매칭을 우선한다.
  const weightOf = (hits) => hits.reduce((s, k) => s + Math.min(k.length, 6), 0);
  const scored = tax.categories
    .map((c) => { const hits = countHits(hay, c.keywords); return { c, hits, w: weightOf(hits) }; })
    .sort((a, b) => b.w - a.w || b.hits.length - a.hits.length);
  const top = scored[0];
  const runnerUp = scored[1];

  const matched = top.w > 0;
  const category = matched ? top.c.id : 'etc';
  const label = matched ? top.c.label : '미분류';
  const emoji = matched ? top.c.emoji : '❓';

  // 판단 필요 = 니치 안에 있는데 분류가 애매한 것만.
  // 니치 밖 항목은 판단 대상이 아니라 그냥 버릴 것이므로 review 에 넣지 않는다.
  const ambiguous = !matched || (runnerUp && top.w > 0 && top.w - runnerUp.w <= 1);
  const needsReview = !offNiche && ambiguous;

  // --- 알고리즘 신호 역산 ---
  const saveHits = countHits(hay, tax.signals.save.keywords);
  const sendHits = countHits(hay, tax.signals.send.keywords);

  // 저장 신호 = 제목의 실용 키워드 + 카테고리 자체의 저장 전환 가능성 중 높은 쪽.
  // 뉴스 제목은 "방법·총정리"를 쓰지 않지만, 지원금 이슈는 캐러셀로 옮기면 곧 저장용 정보가 된다.
  const save = Math.max(
    Math.min(1, saveHits.length / 2),
    tax.saveBase?.[category] ?? 0.2
  );
  const send = Math.min(1, sendHits.length / 2);      // 공유 유발: 최상위 신호
  const ageH = cluster.publishedAt ? (now - Date.parse(cluster.publishedAt)) / 3600_000 : 24;
  const fresh = ageH <= 6 ? 1 : ageH <= 12 ? 0.7 : ageH <= 24 ? 0.4 : 0.15;
  const spread = Math.min(1, (cluster.spread - 1) / 6); // 매체 7개 이상이면 만점
  const niche = Math.min(1, nicheHits.length / 2);      // 니치 적합도
  const local = isLocal(cluster.title);

  // 가중치: 저장·공유가 2026 알고리즘의 최상위 신호이므로 ×3
  const raw = save * 3 + send * 3 + fresh * 2 + spread * 2 + niche * 2;
  // 니치 밖 항목은 아무리 신선하고 널리 퍼져도 우리 계정 콘텐츠가 될 수 없다.
  const score = Number((raw * (cluster.weight ?? 1) * (offNiche ? 0.15 : 1) * (local ? 0.6 : 1)).toFixed(2));

  return {
    ...cluster,
    category, label, emoji,
    categoryHits: top.hits,
    offNiche, nicheHits, local,
    needsReview,
    signals: {
      save: Number(save.toFixed(2)), send: Number(send.toFixed(2)),
      fresh: Number(fresh.toFixed(2)), spread: Number(spread.toFixed(2)),
      niche: Number(niche.toFixed(2)),
      saveHits, sendHits, ageHours: Number(ageH.toFixed(1)),
    },
    score,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const date = args.includes('--date') ? args[args.indexOf('--date') + 1] : today();

  const tax = JSON.parse(await readFile(path.join(ROOT, 'scripts/ig/lib/taxonomy.json'), 'utf8'));
  const file = path.join(DATA, 'issues', `${date}.json`);
  const doc = JSON.parse(await readFile(file, 'utf8'));

  doc.clusters = doc.clusters
    .map((c) => classifyOne(c, tax))
    .sort((a, b) => b.score - a.score);
  doc.classifiedAt = new Date().toISOString();

  await writeFile(file, JSON.stringify(doc, null, 2));

  const onNiche = doc.clusters.filter((c) => !c.offNiche);
  const byCat = {};
  for (const c of onNiche) byCat[c.label] = (byCat[c.label] ?? 0) + 1;
  const review = doc.clusters.filter((c) => c.needsReview).length;

  console.log(`분류 완료: ${doc.clusters.length}개 이슈 중 니치 관련 ${onNiche.length}개 / 무관 ${doc.clusters.length - onNiche.length}개`);
  for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}건`);
  console.log(`  판단 필요(needs_review): ${review}건`);
  console.log(`\n  상위 6개:`);
  for (const c of doc.clusters.slice(0, 6)) {
    console.log(`   ${String(c.score).padStart(5)} ${c.emoji} ${c.title.slice(0, 42)}`);
    console.log(`         저장${c.signals.save} 공유${c.signals.send} 신선${c.signals.fresh} 매체${c.spread}개`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
