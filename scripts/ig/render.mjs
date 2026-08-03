#!/usr/bin/env node
// ⑤ 캐러셀 렌더링 — 슬라이드 JSON → HTML → PNG(1080×1350).
// 이미 설치된 Chrome 의 headless 스크린샷을 쓴다. puppeteer 등 추가 의존성 없음.
// 사용: node scripts/ig/render.mjs --slug <슬러그> [--date YYYY-MM-DD]
//   입력: data/ig/drafts/<슬러그>.json
//   출력: data/ig/cards/<날짜>/<슬러그>-01.png ...

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { today } from './collect.mjs';

const exec = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'data/ig');
const TPL = path.join(ROOT, 'scripts/ig/lib/templates');

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];

function findChrome() {
  const hit = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!hit) throw new Error('Chrome 을 찾지 못했습니다. CHROME_PATH 환경변수로 지정하세요.');
  return process.env.CHROME_PATH || hit;
}

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// 카피에서 **강조** 만 허용한다. 그 외 태그는 escape 되어 그대로 노출된다.
const rich = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="grad">$1</span>');

function slideHtml(slide, i, total, brand, css) {
  const page = `${i + 1} / ${total}`;
  let body = '';

  switch (slide.type) {
    case 'hook':
      body = `
        ${slide.kicker ? `<div class="kicker">${esc(slide.kicker)}</div>` : ''}
        <h1>${rich(slide.title)}</h1>
        ${slide.sub ? `<p class="sub">${esc(slide.sub)}</p>` : ''}`;
      break;

    case 'summary': {
      const rows = (slide.rows ?? []).map((r, n) =>
        `<div class="row"><div class="num">${n + 1}</div><div>${rich(r)}</div></div>`).join('');
      body = `
        <h2>${rich(slide.title)}</h2>
        <div class="card" style="margin-top:44px">${rows}</div>`;
      break;
    }

    case 'cta':
      body = `
        <h2>${rich(slide.title)}</h2>
        ${slide.sub ? `<p class="sub">${esc(slide.sub)}</p>` : ''}
        <div class="card" style="margin-top:44px"><div class="cta">${rich(slide.cta ?? '')}</div></div>`;
      break;

    default: // point / context
      body = `
        ${slide.n ? `<div class="kicker">${slide.n}</div>` : ''}
        <h2>${rich(slide.title)}</h2>
        ${slide.sub ? `<p class="sub">${esc(slide.sub)}</p>` : ''}`;
  }

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="orb1"></div><div class="orb2"></div>
<div class="top z"><div class="brand">${esc(brand)}</div><div class="page">${page}</div></div>
<div class="body z">${body}</div>
${slide.foot ? `<div class="foot z">${esc(slide.foot)}</div>` : ''}
</body></html>`;
}

async function shoot(chrome, htmlPath, pngPath) {
  await exec(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1080,1350',
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`,
  ], { timeout: 60_000 });
}

export async function render(draft, { date = today() } = {}) {
  const chrome = findChrome();
  const css = await readFile(path.join(TPL, 'carousel.css'), 'utf8');
  const outDir = path.join(DATA, 'cards', date);
  const tmpDir = path.join(outDir, '.html');
  await mkdir(tmpDir, { recursive: true });

  const brand = draft.brand ?? '@your_account';
  const total = draft.slides.length;
  const files = [];

  for (let i = 0; i < total; i++) {
    const n = String(i + 1).padStart(2, '0');
    const htmlPath = path.join(tmpDir, `${draft.slug}-${n}.html`);
    const pngPath = path.join(outDir, `${draft.slug}-${n}.png`);
    await writeFile(htmlPath, slideHtml(draft.slides[i], i, total, brand, css));
    await shoot(chrome, htmlPath, pngPath);
    files.push(pngPath);
  }

  await rm(tmpDir, { recursive: true, force: true });
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args[args.indexOf('--slug') + 1];
  if (!args.includes('--slug') || !slug) {
    console.error('사용법: node scripts/ig/render.mjs --slug <슬러그>');
    process.exit(1);
  }
  const date = args.includes('--date') ? args[args.indexOf('--date') + 1] : today();

  const draft = JSON.parse(await readFile(path.join(DATA, 'drafts', `${slug}.json`), 'utf8'));

  // 2026 알고리즘 기준 — 7~10장 구간에서 저장률이 가장 높다.
  if (draft.slides.length < 7 || draft.slides.length > 10) {
    console.warn(`⚠️  슬라이드 ${draft.slides.length}장 — 저장률이 가장 높은 구간은 7~10장입니다.`);
  }
  const last = draft.slides.at(-1);
  if (last?.type !== 'cta') console.warn('⚠️  마지막 장이 CTA가 아닙니다. DM 공유 유도가 최상위 신호입니다.');
  if (!draft.slides.some((s) => s.type === 'summary')) console.warn('⚠️  요약 카드가 없습니다. 저장 유발의 핵심 지점입니다.');

  const files = await render(draft, { date });
  console.log(`캐러셀 ${files.length}장 생성`);
  for (const f of files) console.log(`  ${path.relative(ROOT, f)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
