// 의존성 없는 RSS 2.0 / Atom 파서.
// npm 패키지를 늘리지 않기 위해 정규식 기반으로 필요한 필드만 뽑는다.

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&apos;': "'", '&#39;': "'", '&nbsp;': ' ', '&middot;': '·',
};

export function decodeEntities(s = '') {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m] ?? m);
}

function stripTags(s = '') {
  return decodeEntities(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// <tag>값</tag> 또는 <tag><![CDATA[값]]></tag>
function tag(block, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i');
  const m = block.match(re);
  if (!m) return '';
  const raw = m[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return decodeEntities((cdata ? cdata[1] : raw).trim());
}

// Atom은 <link href="..."/> 형태를 쓴다.
function atomLink(block) {
  const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
  if (alt) return decodeEntities(alt[1]);
  const any = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return any ? decodeEntities(any[1]) : '';
}

function blocks(xml, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'gi');
  return [...xml.matchAll(re)].map((m) => m[1]);
}

// 실제 매체명. 구글 뉴스는 <source>를 주고, 없으면 제목 끝 " - 매체명" 꼬리에서 뽑는다.
// 매체 다양성(같은 이슈를 몇 개 매체가 다뤘나)은 이슈 크기를 재는 핵심 신호라 정확히 잡아야 한다.
function extractOutlet(block, title, fallback) {
  const src = tag(block, 'source');
  if (src) return src;
  const m = title.match(/\s[-–—]\s([^-–—]{2,30})$/);
  return m ? m[1].trim() : fallback;
}

/** RSS/Atom 문자열 → 정규화된 항목 배열 */
export function parseFeed(xml, sourceName) {
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const raw = isAtom ? blocks(xml, 'entry') : blocks(xml, 'item');

  return raw.map((b) => {
    const title = stripTags(tag(b, 'title'));
    const link = isAtom ? atomLink(b) : (tag(b, 'link') || atomLink(b));
    const date =
      tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') ||
      tag(b, 'dc:date') || '';
    const summary = stripTags(
      tag(b, 'description') || tag(b, 'summary') || tag(b, 'content') || ''
    ).slice(0, 400);

    return {
      title,
      link,
      publishedAt: normalizeDate(date),
      summary,
      source: sourceName,                                  // 어느 피드에서 왔나
      outlet: extractOutlet(b, title, sourceName),         // 실제 매체명
    };
  }).filter((it) => it.title && it.link);
}

function normalizeDate(s) {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** 피드 1건 수집. 실패해도 던지지 않고 빈 배열 + 에러를 돌려준다. */
export async function fetchFeed(feed, { timeoutMs = 12000 } = {}) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(feed.url, {
      signal: ac.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': UA,
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.6',
      },
    });
    if (!res.ok) return { items: [], error: `HTTP ${res.status}` };
    const xml = await res.text();
    const items = parseFeed(xml, feed.name).map((it) => ({ ...it, feedId: feed.id }));
    return { items, error: null };
  } catch (e) {
    return { items: [], error: e.name === 'AbortError' ? 'timeout' : String(e.message || e) };
  } finally {
    clearTimeout(timer);
  }
}
