#!/usr/bin/env node
// ⑥-B 게시 — Instagram Graph API 로 릴스를 올린다.
//
// 발행은 되돌릴 수 없으므로 승인 게이트를 둔다:
//   --confirm 없이 실행하면 컨테이너 생성과 처리 완료까지만 하고 멈춘다.
//   실제 media_publish 는 --confirm 을 명시했을 때만 호출한다.
//
// 사용:
//   node scripts/ig/publish.mjs --slug <슬러그> --dry-run   # 토큰 없이 페이로드만 확인
//   node scripts/ig/publish.mjs --slug <슬러그>             # 컨테이너까지 만들고 정지
//   node scripts/ig/publish.mjs --slug <슬러그> --confirm   # 실제 게시
//
// 환경변수: IG_USER_ID, IG_ACCESS_TOKEN, (선택) IG_API_VERSION

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { today } from './collect.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'data/ig');

// Meta 는 반년마다 새 버전을 내고 각 버전을 약 2년 지원한다.
// 최신 버전은 공식 changelog 에서 확인할 것 — 여기 값은 기본값일 뿐이다.
const API = process.env.IG_API_VERSION || 'v25.0';
const BASE = `https://graph.facebook.com/${API}`;

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 5 * 60_000;

async function graph(endpoint, { method = 'GET', params = {}, token }) {
  const url = new URL(`${BASE}${endpoint}`);
  const payload = { ...params, access_token: token };

  let res;
  if (method === 'GET') {
    for (const [k, v] of Object.entries(payload)) if (v != null) url.searchParams.set(k, String(v));
    res = await fetch(url, { method: 'GET' });
  } else {
    const body = new URLSearchParams();
    for (const [k, v] of Object.entries(payload)) if (v != null) body.set(k, String(v));
    res = await fetch(url, { method: 'POST', body });
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error ?? {};
    throw new Error(
      `Graph API ${res.status} — ${e.message ?? '알 수 없는 오류'}` +
      (e.code ? ` (code ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ''})` : '')
    );
  }
  return json;
}

/** 남은 게시 한도 — 24시간 이동창 기준 100건 */
async function publishingLimit(igUserId, token) {
  const r = await graph(`/${igUserId}/content_publishing_limit`, {
    params: { fields: 'config,quota_usage' }, token,
  });
  const d = r.data?.[0] ?? {};
  return { used: d.quota_usage ?? 0, total: d.config?.quota_total ?? 100 };
}

/** 영상은 즉시 준비되지 않는다. FINISHED 가 될 때까지 기다린다. */
async function waitForContainer(containerId, token, { onTick } = {}) {
  const started = Date.now();
  while (Date.now() - started < POLL_TIMEOUT_MS) {
    const r = await graph(`/${containerId}`, {
      params: { fields: 'status_code,status' }, token,
    });
    const code = r.status_code;
    onTick?.(code, Math.round((Date.now() - started) / 1000));

    if (code === 'FINISHED') return r;
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new Error(`컨테이너 처리 실패: ${code} — ${r.status ?? ''}`);
    }
    await new Promise((r2) => setTimeout(r2, POLL_INTERVAL_MS));
  }
  throw new Error(`컨테이너가 ${POLL_TIMEOUT_MS / 1000}초 안에 준비되지 않았습니다.`);
}

async function loadInputs(slug, date) {
  const urlsPath = path.join(DATA, 'reels', date, `${slug}.urls.json`);
  if (!existsSync(urlsPath)) {
    throw new Error(
      `공개 URL 정보가 없습니다: ${path.relative(ROOT, urlsPath)}\n` +
      `먼저 실행하세요: node scripts/ig/upload.mjs --slug ${slug} --deploy`
    );
  }
  const urls = JSON.parse(await readFile(urlsPath, 'utf8'));

  const draftPath = path.join(DATA, 'drafts', `${slug}.json`);
  const draft = existsSync(draftPath) ? JSON.parse(await readFile(draftPath, 'utf8')) : {};

  const caption = draft.caption ?? '';
  if (!caption) console.warn('⚠️  draft 에 caption 이 없습니다. 캡션 없이 게시됩니다.');

  return { ...urls, caption, draft };
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
  if (!slug) {
    console.error('사용법: node scripts/ig/publish.mjs --slug <슬러그> [--dry-run] [--confirm]');
    process.exit(1);
  }
  const date = args.includes('--date') ? args[args.indexOf('--date') + 1] : today();
  const dryRun = args.includes('--dry-run');
  const confirmed = args.includes('--confirm');

  const { videoUrl, coverUrl, caption } = await loadInputs(slug, date);

  const containerParams = {
    media_type: 'REELS',
    video_url: videoUrl,
    cover_url: coverUrl,
    caption,
    share_to_feed: 'true',
  };

  if (dryRun) {
    console.log(`[dry-run] POST ${BASE}/{IG_USER_ID}/media`);
    console.log(JSON.stringify(containerParams, null, 2));
    console.log(`\n[dry-run] 이후: status_code 폴링 → POST ${BASE}/{IG_USER_ID}/media_publish`);
    console.log('실제 호출은 하지 않았습니다.');
    return;
  }

  const igUserId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  if (!igUserId || !token) {
    console.error(
      '환경변수가 없습니다: IG_USER_ID, IG_ACCESS_TOKEN\n' +
      '\n' +
      'Meta 앱 심사(instagram_business_content_publish)가 승인된 뒤 발급받을 수 있습니다.\n' +
      '준비 절차는 docs/ig-autopilot/PLAN.md 8절을 보세요.\n' +
      '\n' +
      '토큰 없이 요청 형태만 확인하려면 --dry-run 을 붙이세요.'
    );
    process.exit(1);
  }

  const limit = await publishingLimit(igUserId, token);
  console.log(`게시 한도: ${limit.used}/${limit.total} (24시간 기준)`);
  if (limit.used >= limit.total) {
    console.error('한도를 모두 썼습니다. 24시간 뒤에 다시 시도하세요.');
    process.exit(1);
  }

  console.log(`\n컨테이너 생성 중… (${videoUrl})`);
  const container = await graph(`/${igUserId}/media`, { method: 'POST', params: containerParams, token });
  console.log(`  컨테이너 ID: ${container.id}`);

  console.log('영상 처리 대기 중…');
  await waitForContainer(container.id, token, {
    onTick: (code, sec) => console.log(`  [${sec}s] ${code}`),
  });
  console.log('  ✅ 처리 완료');

  if (!confirmed) {
    console.log('\n──────── 게시 직전 정지 ────────');
    console.log(`영상  : ${videoUrl}`);
    console.log(`커버  : ${coverUrl ?? '(없음)'}`);
    console.log(`캡션  :\n${caption.split('\n').map((l) => '  ' + l).join('\n')}`);
    console.log('\n확인 후 발행하려면 아래를 실행하세요:');
    console.log(`  node scripts/ig/publish.mjs --slug ${slug} --confirm`);
    console.log('\n※ 컨테이너는 24시간 뒤 만료됩니다. 그 안에 발행하지 않으면 다시 만들어야 합니다.');
    return;
  }

  console.log('\n발행 중…');
  const published = await graph(`/${igUserId}/media_publish`, {
    method: 'POST', params: { creation_id: container.id }, token,
  });
  console.log(`✅ 게시 완료 — media ID: ${published.id}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => {
  console.error(`\n❌ ${e.message}`);
  process.exit(1);
});
