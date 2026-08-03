// 한국어 뉴스 제목 정규화 · 지문 · 유사도.
// 형태소 분석기 없이 조사 제거 + 글자 bigram 조합으로 실무 수준 정확도를 낸다.

import { createHash } from 'node:crypto';

// 구글 뉴스는 제목 끝에 " - 매체명"을 붙인다. 이걸 떼야 같은 기사가 같은 지문이 된다.
const OUTLET_TAIL = /\s[-–—]\s[^-–—]{2,30}$/;

// 기사 상투어 — 내용이 아니라 형식 표시라 지문에서 뺀다.
const BOILERPLATE = /\[(단독|종합|속보|포토|영상|인터뷰|기고|칼럼|사설|특징주|르포|현장|일문일답|카드뉴스)\s*\d*\]|\((종합|속보|재송|보도자료)\d*\)/g;

// 빈출 조사·어미. 긴 것부터 지워야 "에서는"이 "는"으로 잘리지 않는다.
const PARTICLES = [
  '에서는', '으로는', '에게서', '이라고', '라고도', '에서도', '까지도',
  '에서', '으로', '에게', '한테', '보다', '처럼', '부터', '까지', '마저', '조차',
  '이라', '라는', '이란', '라며', '이며', '하며', '했다', '한다', '된다', '되다',
  '들이', '들을', '들은', '들의',
  '은', '는', '이', '가', '을', '를', '의', '에', '와', '과', '도', '만', '로', '랑',
];

// 불용어. 시점·서술어에 더해 뉴스 제목 상투어까지 넓게 잡는다.
//
// 왜 이렇게 넓은가: 중복 판정은 "드문 단어를 공유하면 같은 사건"이라는 가정에 기대는데,
// '진출·글로벌·최대' 같은 일반명사도 그날 데이터에서 드물면 고유명사처럼 취급되어
// 무관한 기사끼리 연쇄로 묶인다. 실제로 무신사·한진·강진군 기사가 '진출/최대' 하나로
// 39건 한 덩어리가 된 적이 있다. 변별력 없는 상투어는 아예 지문에서 뺀다.
const STOPWORDS = new Set([
  // 시점·서술
  '오늘', '내일', '올해', '작년', '지난', '이번', '최근', '현재', '관련', '위해', '통해',
  '대한', '따르면', '밝혔다', '전했다', '나타났다', '것으로', '있다', '없다', '대해',
  '기자', '뉴스', '단독', '종합', '속보',
  // 규모·정도
  '최대', '최소', '최고', '최초', '확대', '축소', '증가', '감소', '급증', '급감', '규모',
  '억원', '만원', '천만원', '이상', '이하', '전국', '국내', '지역', '주요',
  // 사업 상투어
  '진출', '해외', '글로벌', '강화', '개선', '추진', '운영', '제공', '실시', '개최', '진행',
  '계획', '예정', '발표', '시작', '마련', '조성', '구축', '도입', '확보', '성장', '발전',
  '활성화', '본격', '가동', '착수', '나선다', '돕는다', '맡는다',
  // 범용 명사
  '사업', '프로젝트', '서비스', '플랫폼', '브랜드', '기업', '업체', '기관', '센터', '분야',
  '참여', '신청', '접수', '대상', '방안', '정책', '제도', '사회', '경제', '산업', '시장',
  // 공고 상투어 — '참여자 모집', '수행기관 선정'처럼 조합으로 자주 붙어 오병합의 주범이다
  '모집', '선정', '선발', '공모', '지급', '모집공고', '참여자', '신청자', '수행기관', '지원사업',
]);

/** 표시용 제목 — 매체 꼬리와 상투어만 걷어낸다. */
export function cleanTitle(title = '') {
  return title
    .replace(BOILERPLATE, ' ')
    .replace(OUTLET_TAIL, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 비교용 정규화 — 문장부호·공백·따옴표 차이를 모두 제거한다. */
export function normalize(title = '') {
  return cleanTitle(title)
    .toLowerCase()
    .replace(/[“”„‟"']/g, '')
    .replace(/[‘’`]/g, '')
    .replace(/[…·・]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 어절에서 조사를 떼고 의미 토큰만 남긴다. */
export function tokens(title = '') {
  const out = new Set();
  for (let w of normalize(title).split(' ')) {
    if (!w) continue;
    // 숫자·영문은 그대로 (고유명사·금액·연도는 중복 판정의 핵심 단서)
    if (/^[a-z0-9]+$/.test(w)) { if (w.length >= 2) out.add(w); continue; }
    for (const p of PARTICLES) {
      if (w.length > p.length + 1 && w.endsWith(p)) { w = w.slice(0, -p.length); break; }
    }
    if (w.length >= 2 && !STOPWORDS.has(w)) out.add(w);
  }
  return out;
}

/** 글자 2-gram — 조사 제거가 놓친 어미 변형을 흡수한다. */
function bigrams(title = '') {
  const s = normalize(title).replace(/ /g, '');
  const out = new Set();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * 제목 유사도 0~1.
 * 어절 자카드(의미)와 bigram 자카드(표기)를 함께 본다.
 * 한쪽만 높은 경우는 오탐일 확률이 높아 가중 평균으로 눌러준다.
 */
export function similarity(t1, t2) {
  const word = jaccard(tokens(t1), tokens(t2));
  const gram = jaccard(bigrams(t1), bigrams(t2));
  return word * 0.6 + gram * 0.4;
}

/** 재실행·과거 대비 비교용 안정 지문 */
export function titleHash(title = '') {
  const key = [...tokens(title)].sort().join(' ');
  return createHash('sha1').update(key).digest('hex').slice(0, 16);
}

const TRACKING = /^(utm_|fbclid|gclid|igshid|ref|ref_src|spm|cmpid|from)/i;

/** 추적 파라미터·AMP·말미 슬래시를 걷어낸 URL 지문 */
export function urlKey(link = '') {
  try {
    const u = new URL(link);
    for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
    const host = u.hostname.replace(/^www\./, '').replace(/^amp\./, '');
    const path = u.pathname.replace(/\/amp\/?$/, '').replace(/\/+$/, '');
    const qs = u.searchParams.toString();
    return `${host}${path}${qs ? '?' + qs : ''}`.toLowerCase();
  } catch {
    return link.trim().toLowerCase();
  }
}
