#!/usr/bin/env node
// ④ 아침 브리핑 — 사람이 1분 안에 읽고, Claude가 그대로 판단 재료로 쓸 수 있는 한 장.
// 사용: node scripts/ig/brief.mjs [--date YYYY-MM-DD] [--top 3]

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { today } from './collect.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'data/ig');

function ago(iso) {
  if (!iso) return '시각미상';
  const h = (Date.now() - Date.parse(iso)) / 3600_000;
  if (h < 1) return '방금';
  if (h < 24) return `${Math.round(h)}시간 전`;
  return `${Math.round(h / 24)}일 전`;
}

/** 이슈 한 줄 — 중복·재등장·지역 표시가 이 줄에 다 들어간다 */
function line(c) {
  const badges = [];
  if (c.dupCount > 0) badges.push(`중복 ${c.dupCount}건·매체 ${c.spread}개`);
  if (c.recurring) badges.push(`🔁 ${c.recurring.daysAgo}일 전 다룸`);
  if (c.local) badges.push('지역한정');
  if (c.needsReview) badges.push('❓분류확인');
  const tail = badges.length ? `  \`${badges.join(' / ')}\`` : '';
  return `- **${c.title}** — ${c.outlet}, ${ago(c.publishedAt)}${tail}\n  [원문](${c.link})`;
}

/** 2026 알고리즘 기준으로 이 이슈가 왜 후보인지 설명 */
function whyCandidate(c) {
  const r = [];
  if (c.signals.sendHits.length) r.push(`공유 유발어(${c.signals.sendHits.slice(0, 3).join('·')})`);
  if (c.signals.saveHits.length) r.push(`저장 유발어(${c.signals.saveHits.slice(0, 3).join('·')})`);
  else if (c.signals.save >= 0.5) r.push(`${c.label} 이슈라 '신청 조건·방법'으로 옮기면 저장 유발`);
  if (c.spread >= 4) r.push(`${c.spread}개 매체가 동시 보도 = 실제로 큰 이슈`);
  if (c.signals.fresh >= 1) r.push('6시간 이내 신선');
  return r.length ? r.join(' · ') : '니치 적합도 기반';
}

/**
 * 후보 선정 시 한 카테고리가 자리를 독점하지 않게 막는다.
 * 점수만으로 뽑으면 그날 지원사업 뉴스가 쏟아진 날은 TOP3가 전부 정부지원으로 채워져
 * 선택지가 사라진다.
 */
function pickCandidates(list, top, perCategory = 2) {
  const picked = [];
  const used = new Map();
  for (const c of list) {
    const n = used.get(c.category) ?? 0;
    if (n >= perCategory) continue;
    picked.push(c);
    used.set(c.category, n + 1);
    if (picked.length >= top) return picked;
  }
  for (const c of list) {              // 제약 때문에 못 채웠으면 점수순으로 마저 채운다
    if (picked.length >= top) break;
    if (!picked.includes(c)) picked.push(c);
  }
  return picked;
}

export function buildBrief(doc, { top = 3 } = {}) {
  const all = doc.clusters;
  const onNiche = all.filter((c) => !c.offNiche);
  const candidates = pickCandidates(onNiche, top);
  const review = onNiche.filter((c) => c.needsReview);
  const recurring = onNiche.filter((c) => c.recurring);
  const duped = onNiche.filter((c) => c.dupCount > 0);

  const L = [];
  L.push(`# 📥 ${doc.date} 아침 브리핑 — 창업·부업·수익화`);
  L.push('');
  L.push(`> 수집 ${doc.stats.rawItems}건 → URL중복 제거 ${doc.stats.afterUrlDedupe}건 → **이슈 ${doc.stats.clusters}개** ` +
         `(니치 관련 ${onNiche.length} / 무관 ${all.length - onNiche.length})`);
  L.push(`> 중복 묶임 ${duped.length}개 · 과거 재등장 ${recurring.length}개 · 분류 확인 필요 ${review.length}개`);
  L.push('');

  // ── 오늘의 콘텐츠 후보 ──
  L.push('## 🎯 오늘의 콘텐츠 후보 TOP ' + top);
  L.push('');
  candidates.forEach((c, i) => {
    L.push(`### ${i + 1}. ${c.emoji} ${c.title}`);
    L.push(`- **점수 ${c.score}** — ${whyCandidate(c)}`);
    L.push(`- 신호: 저장 ${c.signals.save} / 공유 ${c.signals.send} / 신선도 ${c.signals.fresh} / 매체 ${c.spread}개`);
    if (c.dupCount > 0) L.push(`- 같은 이슈 ${c.dupCount}건 더: ${c.outlets.slice(0, 6).join(', ')}`);
    if (c.recurring) L.push(`- 🔁 ${c.recurring.daysAgo}일 전에도 다룬 주제 (유사도 ${c.recurring.similarity}) — 후속인지 재탕인지 확인`);
    if (c.local) L.push('- ⚠️ 지역 한정 소식 — 전국 대상 콘텐츠로 바꾸려면 각도 조정 필요');
    L.push(`- [원문](${c.link}) · ${c.outlet} · ${ago(c.publishedAt)}`);
    L.push('');
  });

  // ── 분류 확인 필요 ──
  if (review.length) {
    L.push('## ❓ 분류 확인 필요');
    L.push('');
    L.push('규칙으로는 애매한 항목. 카테고리를 확정하거나 니치 무관으로 내릴 것.');
    L.push('');
    for (const c of review.slice(0, 12)) {
      L.push(`- [${c.label}] **${c.title}** — 매칭어: ${c.categoryHits.join(', ') || '없음'}`);
    }
    L.push('');
  }

  // ── 카테고리별 ──
  L.push('## 📂 카테고리별 신규 이슈');
  L.push('');
  const byCat = new Map();
  for (const c of onNiche) {
    if (!byCat.has(c.label)) byCat.set(c.label, []);
    byCat.get(c.label).push(c);
  }
  for (const [label, list] of [...byCat.entries()].sort((a, b) => b[1].length - a[1].length)) {
    L.push(`### ${list[0].emoji} ${label} (${list.length}건)`);
    L.push('');
    for (const c of list.slice(0, 8)) L.push(line(c));
    if (list.length > 8) L.push(`- …외 ${list.length - 8}건`);
    L.push('');
  }

  // ── 재등장 ──
  if (recurring.length) {
    L.push('## 🔁 과거에 다룬 주제의 재등장');
    L.push('');
    for (const c of recurring.slice(0, 10)) {
      L.push(`- **${c.title}** — ${c.recurring.daysAgo}일 전(${c.recurring.seenOn}) 유사도 ${c.recurring.similarity}`);
    }
    L.push('');
  }

  // ── 걸러진 것 ──
  const off = all.filter((c) => c.offNiche);
  if (off.length) {
    L.push(`<details><summary>🗑️ 니치 무관으로 제외 (${off.length}건)</summary>`);
    L.push('');
    for (const c of off.slice(0, 25)) L.push(`- ${c.title} — ${c.outlet}`);
    if (off.length > 25) L.push(`- …외 ${off.length - 25}건`);
    L.push('');
    L.push('</details>');
    L.push('');
  }

  L.push('---');
  L.push('');
  L.push('### 다음 단계');
  L.push('1. 위 후보 중 1건 선택 (또는 분류 확인 항목에서 승격)');
  L.push('2. 원문에서 수치·날짜·조건 확인 — 추측 금지');
  L.push('3. 릴스 슬라이드 카피 작성 — 7~9장 / 20~40초 / 후킹 → 맥락 → 본문 → 요약카드 → CTA');
  L.push('4. `node scripts/ig/render-reel.mjs --slug <슬러그>` → mp4 생성');
  L.push('5. `node scripts/ig/upload.mjs --slug <슬러그> --deploy` → 공개 URL');
  L.push('6. `node scripts/ig/publish.mjs --slug <슬러그>` → 확인 후 `--confirm` 으로 발행');
  L.push('');

  return L.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const date = args.includes('--date') ? args[args.indexOf('--date') + 1] : today();
  const top = Number(args[args.indexOf('--top') + 1]) || 3;

  const doc = JSON.parse(await readFile(path.join(DATA, 'issues', `${date}.json`), 'utf8'));
  const md = buildBrief(doc, { top });

  await mkdir(path.join(DATA, 'briefs'), { recursive: true });
  const out = path.join(DATA, 'briefs', `${date}.md`);
  await writeFile(out, md);
  console.log(`브리핑 생성 → ${path.relative(ROOT, out)} (${md.split('\n').length}줄)`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
