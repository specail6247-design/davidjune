#!/usr/bin/env node
// ⑤-R 릴스 렌더링 — 슬라이드 JSON → PNG(1080×1920) → mp4(9:16).
// Chrome headless 로 프레임을 굽고 ffmpeg 으로 영상을 합성한다.
//
// 왜 캐러셀이 아니라 릴스인가: 릴스는 인스타의 발견 엔진이라 조회 대부분이 비팔로워에서 나온다.
// 캐러셀보다 도달이 36% 높다. 대신 첫 3초에서 최대 50%가 이탈하므로 후킹과 움직임이 전부다.
//
// 사용: node scripts/ig/render-reel.mjs --slug <슬러그> [--date YYYY-MM-DD] [--audio <mp3>]

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

const W = 1080, H = 1920, FPS = 30;

// 전환은 slideup — 크로스페이드(fade)를 쓰면 두 슬라이드의 텍스트가 겹쳐 보이는 구간이 생겨
// 그 순간 아무것도 읽히지 않는다. 정보성 릴스는 가독성이 전부라 밀어내는 전환이 맞다.
// 0.35초는 "넘어갔다"는 인지는 주되 읽는 흐름은 끊지 않는 길이다.
const TRANSITION = 'slideup';
const XFADE = 0.35;
const MIN_SEC = 5, MAX_SEC = 90;  // Graph API: 이 범위를 벗어나면 릴스 탭에 노출되지 않는다

// 슬라이드 유형별 기본 노출 시간. 읽는 데 걸리는 시간을 기준으로 잡았다.
const DEFAULT_SEC = { hook: 3.5, context: 3.0, point: 3.0, summary: 4.5, cta: 4.0 };

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];

function findChrome() {
  const hit = process.env.CHROME_PATH || CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!hit) throw new Error('Chrome 을 찾지 못했습니다. CHROME_PATH 환경변수로 지정하세요.');
  return hit;
}

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rich = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="grad">$1</span>');

function slideHtml(slide, i, total, brand, css) {
  const pct = Math.round(((i + 1) / total) * 100);
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
      body = `<h2>${rich(slide.title)}</h2><div class="card">${rows}</div>`;
      break;
    }

    case 'cta':
      body = `
        <h2>${rich(slide.title)}</h2>
        ${slide.sub ? `<p class="sub">${esc(slide.sub)}</p>` : ''}
        <div class="card"><div class="cta">${rich(slide.cta ?? '')}</div></div>`;
      break;

    default:
      body = `
        ${slide.n ? `<div class="kicker">${esc(slide.n)}</div>` : ''}
        <h2>${rich(slide.title)}</h2>
        ${slide.sub ? `<p class="sub">${esc(slide.sub)}</p>` : ''}`;
  }

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="orb1"></div><div class="orb2"></div>
<div class="progress"><div class="fill" style="width:${pct}%"></div></div>
<div class="brand">${esc(brand)}</div>
<div class="body z">${body}</div>
${slide.foot ? `<div class="foot z">${esc(slide.foot)}</div>` : ''}
</body></html>`;
}

/**
 * macOS 하드웨어 인코더가 있으면 그걸 쓴다. 없으면 libx264 로 떨어진다.
 * 텍스트 위주 영상이라 비트레이트를 넉넉히(10M) 준다 — 낮으면 글자 가장자리가 뭉갠다.
 */
let _codec = null;
async function videoCodecArgs() {
  if (_codec) return _codec;
  try {
    const { stdout } = await exec('ffmpeg', ['-hide_banner', '-encoders']);
    _codec = stdout.includes('h264_videotoolbox')
      ? ['-c:v', 'h264_videotoolbox', '-b:v', '10M']
      : ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20'];
  } catch {
    _codec = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20'];
  }
  return _codec;
}

async function shoot(chrome, htmlPath, pngPath) {
  await exec(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${W},${H}`,
    `--screenshot=${pngPath}`, `file://${htmlPath}`,
  ], { timeout: 60_000 });
}

// 팬 방향 4가지를 순환시킨다. 같은 방향만 반복하면 리듬이 단조롭다.
const PAN_DIRS = [
  ['(iw-ow)*%T%', '(ih-oh)*%T%'],          // ↘
  ['(iw-ow)*(1-%T%)', '(ih-oh)*%T%'],      // ↙
  ['(iw-ow)*%T%', '(ih-oh)*(1-%T%)'],      // ↗
  ['(iw-ow)*(1-%T%)', '(ih-oh)*(1-%T%)'],  // ↖
];

/**
 * ffmpeg 필터 그래프 조립.
 *
 * 각 슬라이드를 8% 크게 잡아 놓고 crop 창을 움직여 켄번스 효과를 만든다.
 * 정지 화면은 릴스에서 즉시 스크롤당하므로 계속 움직여야 한다.
 *
 * 원래 zoompan 을 썼는데 9장 27초에 4분 28초가 걸렸다(프레임마다 재스케일).
 * crop 팬으로 바꾸니 같은 결과가 90배 빨라졌다. 화면이 움직인다는 목적은 동일하다.
 */
function buildFilter(secs) {
  const n = secs.length;
  const parts = [];
  const sw = Math.round((W * 1.08) / 2) * 2;   // 짝수 유지 (yuv420p 요구)
  const sh = Math.round((H * 1.08) / 2) * 2;

  secs.forEach((sec, i) => {
    const [xe, ye] = PAN_DIRS[i % PAN_DIRS.length];
    const T = `min(t/${sec},1)`;
    const x = xe.replaceAll('%T%', T);
    const y = ye.replaceAll('%T%', T);
    parts.push(
      `[${i}:v]scale=${sw}:${sh},crop=${W}:${H}:x='${x}':y='${y}',fps=${FPS},setsar=1[v${i}]`
    );
  });

  if (n === 1) return { filter: parts.join(';'), out: '[v0]' };

  let prev = '[v0]';
  let acc = secs[0];
  for (let i = 1; i < n; i++) {
    const out = i === n - 1 ? '[vout]' : `[x${i}]`;
    const offset = (acc - XFADE).toFixed(3);
    parts.push(`${prev}[v${i}]xfade=transition=${TRANSITION}:duration=${XFADE}:offset=${offset}${out}`);
    acc += secs[i] - XFADE;
    prev = out;
  }
  return { filter: parts.join(';'), out: '[vout]' };
}

export async function renderReel(draft, { date = today(), audio = null } = {}) {
  const chrome = findChrome();
  const css = await readFile(path.join(TPL, 'reel.css'), 'utf8');
  const outDir = path.join(DATA, 'reels', date);
  const frameDir = path.join(outDir, `.frames-${draft.slug}`);
  await mkdir(frameDir, { recursive: true });

  const brand = draft.brand ?? '@your_account';
  const slides = draft.slides;
  const secs = slides.map((s) => Number(s.sec) || DEFAULT_SEC[s.type] || 3.0);

  // 프레임 굽기
  const frames = [];
  for (let i = 0; i < slides.length; i++) {
    const n = String(i + 1).padStart(2, '0');
    const htmlPath = path.join(frameDir, `${n}.html`);
    const pngPath = path.join(frameDir, `${n}.png`);
    await writeFile(htmlPath, slideHtml(slides[i], i, slides.length, brand, css));
    await shoot(chrome, htmlPath, pngPath);
    frames.push(pngPath);
  }

  // 총 길이 = 각 슬라이드 합 - 전환 겹침
  const total = secs.reduce((a, b) => a + b, 0) - XFADE * (slides.length - 1);

  const { filter, out } = buildFilter(secs);
  const args = [];
  frames.forEach((f, i) => args.push('-loop', '1', '-t', String(secs[i]), '-i', f));

  // 오디오도 '입력'이므로 -filter_complex 앞에 와야 한다.
  // 무음이라도 트랙은 넣는다 — 오디오가 없으면 일부 업로드 경로에서 처리에 실패한다.
  if (audio) args.push('-i', audio);
  else args.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');

  args.push(
    '-filter_complex', filter,
    '-map', out,
    '-map', `${frames.length}:a`,
    '-c:a', 'aac', '-b:a', '128k', '-shortest'
  );

  const mp4 = path.join(outDir, `${draft.slug}.mp4`);
  args.push(...(await videoCodecArgs()));
  args.push(
    '-pix_fmt', 'yuv420p',              // 인스타 호환 필수
    '-profile:v', 'high', '-level', '4.1',
    '-r', String(FPS), '-movflags', '+faststart',
    '-y', mp4
  );

  await exec('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args], { timeout: 300_000 });

  // 커버 이미지 — 프로필 그리드에서는 정중앙 1080×1080으로 잘린다
  const cover = path.join(outDir, `${draft.slug}-cover.jpg`);
  await exec('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', frames[0],
    '-vf', `scale=${W}:${H}`, '-q:v', '2', '-y', cover]);

  await rm(frameDir, { recursive: true, force: true });
  return { mp4, cover, seconds: total, slides: slides.length };
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
  if (!slug) {
    console.error('사용법: node scripts/ig/render-reel.mjs --slug <슬러그> [--audio <mp3>]');
    process.exit(1);
  }
  const date = args.includes('--date') ? args[args.indexOf('--date') + 1] : today();
  const audio = args.includes('--audio') ? args[args.indexOf('--audio') + 1] : null;

  const draft = JSON.parse(await readFile(path.join(DATA, 'drafts', `${slug}.json`), 'utf8'));

  const last = draft.slides.at(-1);
  if (draft.slides[0]?.type !== 'hook') console.warn('⚠️  1번 슬라이드가 hook 이 아닙니다. 첫 3초에서 최대 50%가 이탈합니다.');
  if (last?.type !== 'cta') console.warn('⚠️  마지막이 CTA가 아닙니다. DM 공유가 최상위 신호입니다.');
  if (!draft.slides.some((s) => s.type === 'summary')) console.warn('⚠️  요약 카드가 없습니다. 저장 유발의 핵심 지점입니다.');

  const r = await renderReel(draft, { date, audio });

  console.log(`릴스 생성 — ${r.slides}장 / ${r.seconds.toFixed(1)}초 / ${W}×${H}`);
  console.log(`  ${path.relative(ROOT, r.mp4)}`);
  console.log(`  ${path.relative(ROOT, r.cover)} (커버)`);
  if (r.seconds < MIN_SEC || r.seconds > MAX_SEC) {
    console.warn(`⚠️  ${r.seconds.toFixed(1)}초 — 릴스 탭 노출 조건은 ${MIN_SEC}~${MAX_SEC}초입니다. 이 범위를 벗어나면 일반 동영상으로 게시됩니다.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
