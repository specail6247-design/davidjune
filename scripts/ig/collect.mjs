#!/usr/bin/env node
// ① 수집 — RSS 피드에서 최근 이슈를 긁어 data/ig/raw/YYYY-MM-DD.json 으로 저장한다.
// 사용: node scripts/ig/collect.mjs [--hours 30] [--date YYYY-MM-DD]

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { fetchFeed } from './lib/rss.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'data/ig');

export function today(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400_000);
  // KST 기준 날짜 — 아침 브리핑이 한국 시간에 맞아야 한다.
  return new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

function feedUrl(feed) {
  if (feed.kind !== 'google-news') return feed.url;
  // when: 연산자를 붙여야 신선한 기사만 온다. 없으면 관련성 순으로 몇 달 전 기사가 섞인다.
  const q = encodeURIComponent(feed.window ? `${feed.query} when:${feed.window}` : feed.query);
  return `https://news.google.com/rss/search?q=${q}&hl=ko&gl=KR&ceid=KR:ko`;
}

/** 동시성 제한 병렬 실행 */
async function pool(items, limit, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    })
  );
  return out;
}

export async function collect({ hours = 30 } = {}) {
  const cfg = JSON.parse(await readFile(path.join(ROOT, 'scripts/ig/lib/feeds.json'), 'utf8'));
  const cutoff = Date.now() - hours * 3600_000;

  const results = await pool(cfg.feeds, 6, async (feed) => {
    const { items, error } = await fetchFeed({ ...feed, url: feedUrl(feed) });
    return { feed, items, error };
  });

  const all = [];
  const sources = [];

  for (const { feed, items, error } of results) {
    // pubDate가 없는 항목은 버리지 않고 통과시킨다 — 일부 피드는 날짜를 안 준다.
    const fresh = items.filter((it) => !it.publishedAt || Date.parse(it.publishedAt) >= cutoff);
    sources.push({
      id: feed.id, name: feed.name, weight: feed.weight,
      fetched: items.length, fresh: fresh.length, error,
    });
    for (const it of fresh) all.push({ ...it, weight: feed.weight });
  }

  return { collectedAt: new Date().toISOString(), windowHours: hours, sources, items: all };
}

async function main() {
  const args = process.argv.slice(2);
  const hours = Number(args[args.indexOf('--hours') + 1]) || 30;
  const date = args.includes('--date') ? args[args.indexOf('--date') + 1] : today();

  const result = await collect({ hours });
  await mkdir(path.join(DATA, 'raw'), { recursive: true });
  const out = path.join(DATA, 'raw', `${date}.json`);
  await writeFile(out, JSON.stringify(result, null, 2));

  const ok = result.sources.filter((s) => !s.error);
  const bad = result.sources.filter((s) => s.error);
  console.log(`수집 완료: ${result.items.length}건 / 소스 ${ok.length}개 성공, ${bad.length}개 실패`);
  for (const s of ok) console.log(`  ✓ ${s.name}: ${s.fresh}/${s.fetched}건 (최근 ${hours}h)`);
  for (const s of bad) console.log(`  ✗ ${s.name}: ${s.error}`);
  console.log(`→ ${path.relative(ROOT, out)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
