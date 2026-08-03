#!/usr/bin/env node
// ⑥-A 호스팅 업로드 — 릴스 mp4와 커버를 Firebase Hosting 의 공개 URL로 올린다.
// Graph API 는 로컬 파일을 받지 않고 공개 HTTPS URL 만 받으므로 게시 전 반드시 거쳐야 하는 단계다.
//
// 사용: node scripts/ig/upload.mjs --slug <슬러그> [--date YYYY-MM-DD] [--deploy]
//   --deploy 없이 실행하면 파일 준비와 URL 계산만 하고 실제 배포는 하지 않는다(기본값).

import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { today } from './collect.mjs';

const exec = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'data/ig');

/** firebase.json 의 hosting.public + .firebaserc 에서 배포 경로와 도메인을 읽는다 */
async function hostingConfig() {
  const fb = JSON.parse(await readFile(path.join(ROOT, 'firebase.json'), 'utf8'));
  const rc = JSON.parse(await readFile(path.join(ROOT, '.firebaserc'), 'utf8'));
  const project = rc.projects?.default;
  if (!project) throw new Error('.firebaserc 에 default 프로젝트가 없습니다.');
  return {
    project,
    publicDir: path.join(ROOT, fb.hosting.public),
    baseUrl: `https://${project}.web.app`,
  };
}

export async function stage(slug, { date = today() } = {}) {
  const { project, publicDir, baseUrl } = await hostingConfig();

  const mp4 = path.join(DATA, 'reels', date, `${slug}.mp4`);
  const cover = path.join(DATA, 'reels', date, `${slug}-cover.jpg`);
  if (!existsSync(mp4)) {
    throw new Error(`릴스가 없습니다: ${path.relative(ROOT, mp4)}\n먼저 render-reel.mjs 로 만드세요.`);
  }

  // out/ 은 next build 산출물이라 재빌드하면 지워진다. 게시 직전에 복사하는 것을 전제로 한다.
  const destDir = path.join(publicDir, 'ig', date);
  await mkdir(destDir, { recursive: true });
  await copyFile(mp4, path.join(destDir, `${slug}.mp4`));
  if (existsSync(cover)) await copyFile(cover, path.join(destDir, `${slug}-cover.jpg`));

  const urls = {
    videoUrl: `${baseUrl}/ig/${date}/${slug}.mp4`,
    coverUrl: existsSync(cover) ? `${baseUrl}/ig/${date}/${slug}-cover.jpg` : null,
  };

  // publish.mjs 가 읽을 수 있도록 남긴다
  await writeFile(
    path.join(DATA, 'reels', date, `${slug}.urls.json`),
    JSON.stringify({ slug, date, project, ...urls }, null, 2)
  );

  return { project, destDir, ...urls };
}

async function deploy() {
  const { stdout, stderr } = await exec('firebase', ['deploy', '--only', 'hosting'], {
    cwd: ROOT, timeout: 600_000, maxBuffer: 10 * 1024 * 1024,
  });
  return (stdout || '') + (stderr || '');
}

/** 배포 후 실제로 접근 가능한지 확인 — Graph API 가 가져갈 수 있어야 게시가 된다 */
export async function verify(url) {
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  return {
    ok: res.ok,
    status: res.status,
    type: res.headers.get('content-type'),
    length: Number(res.headers.get('content-length') || 0),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
  if (!slug) {
    console.error('사용법: node scripts/ig/upload.mjs --slug <슬러그> [--deploy]');
    process.exit(1);
  }
  const date = args.includes('--date') ? args[args.indexOf('--date') + 1] : today();

  const r = await stage(slug, { date });
  console.log(`배포 대기열에 복사 완료 → ${path.relative(ROOT, r.destDir)}`);
  console.log(`  video: ${r.videoUrl}`);
  if (r.coverUrl) console.log(`  cover: ${r.coverUrl}`);

  if (!args.includes('--deploy')) {
    console.log('\n실제 배포는 하지 않았습니다. 올리려면 --deploy 를 붙이세요.');
    console.log('⚠️  firebase deploy 는 out/ 전체를 배포합니다. next build 가 최신인지 확인하세요.');
    return;
  }

  console.log('\nFirebase Hosting 배포 중…');
  const log = await deploy();
  console.log(log.split('\n').filter((l) => /Hosting URL|files uploaded|Deploy complete|error/i.test(l)).join('\n'));

  const v = await verify(r.videoUrl);
  console.log(`\n검증: ${v.ok ? '✅' : '❌'} HTTP ${v.status} · ${v.type} · ${(v.length / 1024 / 1024).toFixed(1)}MB`);
  if (!v.ok) console.error('공개 URL 로 접근되지 않으면 Graph API 가 영상을 가져갈 수 없습니다.');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
