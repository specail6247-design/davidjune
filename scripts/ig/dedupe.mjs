#!/usr/bin/env node
// ② 중복 판정 — 같은 이슈를 다룬 기사를 하나로 묶고, 과거에 다룬 적 있는지 표시한다.
// 중복을 "지우지" 않는다. 여러 매체가 동시에 다뤘다는 사실 자체가 이슈 크기의 신호이므로 남겨서 표시한다.
// 사용: node scripts/ig/dedupe.mjs [--date YYYY-MM-DD] [--threshold 0.55]

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { cleanTitle, tokens, similarity, titleHash, urlKey } from './lib/fingerprint.mjs';
import { today } from './collect.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'data/ig');
const SEEN_DAYS = 14;

/** 최소 1개 토큰을 공유하는 쌍만 비교하도록 역인덱스를 만든다 (O(n²) 회피) */
function buildIndex(records) {
  const idx = new Map();
  records.forEach((r, i) => {
    for (const t of r.tokens) {
      if (!idx.has(t)) idx.set(t, []);
      idx.get(t).push(i);
    }
  });
  return idx;
}

function candidatesFor(i, rec, idx) {
  const seen = new Set();
  for (const t of rec.tokens) {
    for (const j of idx.get(t) ?? []) if (j > i) seen.add(j);
  }
  return seen;
}

class UnionFind {
  constructor(n) { this.p = Array.from({ length: n }, (_, i) => i); }
  find(x) { while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; } return x; }
  union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.p[rb] = ra; }
}

// threshold: 제목 유사도만으로 같은 이슈라고 볼 수 있는 선.
// rareThreshold / idfThreshold: 유사도는 낮지만 고유명사를 공유하는 쌍을 건지는 2차 조건.
export function dedupe(items, {
  threshold = 0.55,
  rareThreshold = 0.20,
  idfThreshold = 2.8,
  maxSecondaryCluster = 30,
} = {}) {
  // 1단계 — URL 완전 중복 접기
  const byUrl = new Map();
  for (const it of items) {
    const key = urlKey(it.link);
    const prev = byUrl.get(key);
    if (!prev) byUrl.set(key, { ...it, urlDupes: 0 });
    else prev.urlDupes++;
  }
  const records = [...byUrl.values()].map((it) => ({
    ...it,
    clean: cleanTitle(it.title),
    tokens: tokens(it.title),
  }));

  // 2단계 — 제목 유사도로 1차 클러스터링
  const idx = buildIndex(records);
  const uf = new UnionFind(records.length);
  const pairs = [];
  for (let i = 0; i < records.length; i++) {
    for (const j of candidatesFor(i, records[i], idx)) {
      const sim = similarity(records[i].title, records[j].title);
      pairs.push({ i, j, sim });
      if (sim >= threshold) uf.union(i, j);
    }
  }

  // 3단계 — 고유명사 기반 2차 병합.
  // 같은 사건도 매체마다 표현이 전혀 달라("…한 번에 출범" vs "…본격 가동") 유사도가 0.25까지 떨어진다.
  // 그래도 사업명·기관명은 살아남으므로 그걸 근거로 병합한다.
  //
  // 중요: IDF 합을 그냥 쓰면 안 된다. "소상공인+지원+모집"(합 5.5)처럼 흔한 단어 조합이
  // 임계값을 넘고, Union-Find 특성상 연쇄적으로 이어져 무관한 기사 39건이 한 덩어리가 된다.
  // 그래서 고유명사급(IDF ≥ 2.5) 토큰만 합산한다 — 흔한 단어는 몇 개를 공유하든 0점이다.
  const df = new Map();
  for (const r of records) for (const t of r.tokens) df.set(t, (df.get(t) ?? 0) + 1);
  const N = records.length;
  const idf = (t) => Math.log(N / (df.get(t) ?? 1));
  const PROPER_NOUN_IDF = 2.5;

  // 연쇄 폭주 방지: 2차 병합은 유사도가 낮은 쌍을 잇는 만큼, 한 번 잘못 이어지면
  // 사슬을 타고 무관한 기사까지 끌려온다. 결과 크기에 상한을 둬서 사고를 국소화한다.
  const size = new Array(records.length).fill(0);
  for (let i = 0; i < records.length; i++) size[uf.find(i)]++;

  for (const { i, j, sim } of pairs) {
    if (sim < rareThreshold || sim >= threshold) continue;
    const ri = uf.find(i), rj = uf.find(j);
    if (ri === rj) continue;
    if (size[ri] + size[rj] > maxSecondaryCluster) continue;
    let info = 0;
    for (const t of records[i].tokens) {
      if (!records[j].tokens.has(t)) continue;
      const v = idf(t);
      if (v >= PROPER_NOUN_IDF) info += v;
    }
    if (info >= idfThreshold) {
      const merged = size[ri] + size[rj];
      uf.union(i, j);
      size[uf.find(i)] = merged;
    }
  }

  // 4단계 — 클러스터 조립
  const groups = new Map();
  records.forEach((r, i) => {
    const root = uf.find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(r);
  });

  const clusters = [...groups.values()].map((members) => {
    // 대표: 니치 적합도 높은 소스 → 최신 → 제목이 구체적인(긴) 것
    const rep = [...members].sort((a, b) =>
      (b.weight - a.weight) ||
      (Date.parse(b.publishedAt ?? 0) - Date.parse(a.publishedAt ?? 0)) ||
      (b.clean.length - a.clean.length)
    )[0];

    const outlets = [...new Set(members.map((m) => m.outlet ?? m.source))];
    return {
      id: titleHash(rep.title),
      title: rep.clean,
      link: rep.link,
      publishedAt: rep.publishedAt,
      summary: rep.summary,
      outlet: rep.outlet ?? rep.source,
      feeds: [...new Set(members.map((m) => m.source))],
      weight: Math.max(...members.map((m) => m.weight)),
      dupCount: members.length - 1,          // 같은 이슈를 다룬 추가 기사 수
      outlets,                                // 다룬 매체 목록
      spread: outlets.length,                 // 매체 다양성 = 이슈 크기 신호
      members: members.map((m) => ({ title: m.clean, outlet: m.outlet ?? m.source, link: m.link })),
    };
  });

  return { clusters, stats: { rawItems: items.length, afterUrlDedupe: records.length, clusters: clusters.length } };
}

/** 최근 SEEN_DAYS일 지문과 대조해 재등장 여부를 표시 */
async function markRecurring(clusters, date) {
  const seenPath = path.join(DATA, 'seen.json');
  const seen = existsSync(seenPath) ? JSON.parse(await readFile(seenPath, 'utf8')) : {};

  const cutoff = new Date(Date.parse(`${date}T00:00:00Z`) - SEEN_DAYS * 86400_000)
    .toISOString().slice(0, 10);
  for (const d of Object.keys(seen)) if (d < cutoff || d === date) delete seen[d];

  const history = [];
  for (const [d, entries] of Object.entries(seen)) {
    for (const e of entries) history.push({ ...e, date: d });
  }

  for (const c of clusters) {
    let best = null;
    for (const h of history) {
      const sim = h.id === c.id ? 1 : similarity(c.title, h.title);
      if (sim >= 0.5 && (!best || sim > best.sim)) best = { ...h, sim };
    }
    if (best) {
      const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${best.date}T00:00:00Z`)) / 86400_000);
      c.recurring = { seenOn: best.date, daysAgo: days, similarity: Number(best.sim.toFixed(2)) };
    }
  }

  seen[date] = clusters.map((c) => ({ id: c.id, title: c.title }));
  await writeFile(seenPath, JSON.stringify(seen, null, 2));
  return clusters;
}

async function main() {
  const args = process.argv.slice(2);
  const date = args.includes('--date') ? args[args.indexOf('--date') + 1] : today();
  const threshold = Number(args[args.indexOf('--threshold') + 1]) || 0.55;

  const raw = JSON.parse(await readFile(path.join(DATA, 'raw', `${date}.json`), 'utf8'));
  const { clusters, stats } = dedupe(raw.items, { threshold });
  await markRecurring(clusters, date);

  await mkdir(path.join(DATA, 'issues'), { recursive: true });
  const out = path.join(DATA, 'issues', `${date}.json`);
  await writeFile(out, JSON.stringify({ date, threshold, stats, clusters }, null, 2));

  const dup = clusters.filter((c) => c.dupCount > 0);
  const rec = clusters.filter((c) => c.recurring);
  console.log(`중복 판정 완료 (임계값 ${threshold})`);
  console.log(`  원본 ${stats.rawItems}건 → URL중복 제거 ${stats.afterUrlDedupe}건 → 이슈 ${stats.clusters}개`);
  console.log(`  중복 묶임: ${dup.length}개 이슈 (최대 ${Math.max(0, ...clusters.map((c) => c.dupCount))}건 중복)`);
  console.log(`  과거 재등장: ${rec.length}개`);
  console.log(`→ ${path.relative(ROOT, out)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
