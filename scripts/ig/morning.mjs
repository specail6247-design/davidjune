#!/usr/bin/env node
// 아침 파이프라인 한 방 실행: 수집 → 중복판정 → 분류 → 브리핑.
// Claude Code 가 매일 아침 이 스크립트를 돌린 뒤 브리핑을 읽고 판단한다.
// 사용: node scripts/ig/morning.mjs [--hours 30] [--date YYYY-MM-DD] [--top 3]

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function run(script, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [path.join(HERE, script), ...args], { stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} 실패 (exit ${code})`))));
  });
}

const argv = process.argv.slice(2);
const pick = (flag) => (argv.includes(flag) ? [flag, argv[argv.indexOf(flag) + 1]] : []);
const date = pick('--date');

const steps = [
  ['collect.mjs',  [...pick('--hours'), ...date]],
  ['dedupe.mjs',   [...pick('--threshold'), ...date]],
  ['classify.mjs', [...date]],
  ['brief.mjs',    [...pick('--top'), ...date]],
];

for (const [script, args] of steps) {
  console.log(`\n▶ ${script}`);
  await run(script, args);
}
console.log('\n✅ 아침 파이프라인 완료');
