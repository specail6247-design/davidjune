/* AINEMA 큐레이션 카탈로그
 * 새 작품 추가법: 아래 형식으로 객체 하나만 추가하면 끝.
 * videoId = YouTube URL의 watch?v= 뒤 11자리.
 * 썸네일은 YouTube에서 자동으로 가져옴 (비용 0원).
 */

const CATEGORIES = [
  { key: "film", label: "AI 단편영화" },
  { key: "animation", label: "AI 애니메이션" },
  { key: "mv", label: "AI 뮤직비디오" },
  { key: "series", label: "AI 시리즈 & 코미디" },
  { key: "ad", label: "광고 & 실험영상" },
];

/* 오늘의 TOP 10 — 순서 = 랭킹. id를 재배열하면 순위가 바뀜 */
const TOP10 = [
  "air-head",
  "kalshi-yolo",
  "hardest-part",
  "anime-rps",
  "the-frost",
  "nv-zorgop",
  "pocket-watch",
  "jetty-tsunami",
  "lp-lost",
  "somme-requiem",
];

const CATALOG = [
  /* ---------- 단편영화 ---------- */
  {
    id: "air-head",
    title: "Air Head",
    creator: "shy kids",
    tool: "Sora",
    year: 2024,
    category: "film",
    featured: true,
    videoId: "9oryIMNVtto",
    desc: "머리가 풍선인 남자 '써니'의 이야기. OpenAI Sora로 만들어진 최초의 단편영화로, AI 시네마 시대의 개막을 알린 상징적 작품.",
  },
  {
    id: "the-frost",
    title: "The Frost",
    creator: "Waymark",
    tool: "DALL·E 2 + D-ID",
    year: 2023,
    category: "film",
    videoId: "QW-NFkVDfdA",
    desc: "얼어붙은 설원에서 벌어지는 12분짜리 SF 스릴러. 모든 숏을 AI로 생성해 '최초로 바이럴된 AI 영화'라는 타이틀을 얻은 작품.",
  },
  {
    id: "somme-requiem",
    title: "Somme Requiem",
    creator: "Myles",
    tool: "Runway Gen-2",
    year: 2024,
    category: "film",
    videoId: "JE9UO9_Li7M",
    desc: "1914년 겨울, 1차 세계대전 참호 속 크리스마스 휴전. 실화에서 영감을 받은 AI 전쟁 드라마.",
  },
  {
    id: "pocket-watch",
    title: "Pocket Watch",
    creator: "AI 필름메이커",
    tool: "Veo 3 + Kling",
    year: 2025,
    category: "film",
    videoId: "WY10gRMJhyI",
    desc: "네오 누아르 스타일의 시간여행 스릴러. 일관된 캐릭터와 서사를 유지한 AI 영화의 진화를 보여주는 작품.",
  },
  {
    id: "jetty-tsunami",
    title: "Jetty Tsunami",
    creator: "AI 필름메이커",
    tool: "Seedance 2.0 + Kling + Veo",
    year: 2026,
    category: "film",
    videoId: "TBvErYkNSiw",
    desc: "아버지를 추억하러 떠난 방파제 낚시 여행, 지진이 몰고 온 거대한 쓰나미. 최신 AI 툴 3종을 결합한 재난 스릴러.",
  },
  {
    id: "discarded-companion",
    title: "Discarded Companion",
    creator: "AI 필름메이커",
    tool: "Kling + Veo 3",
    year: 2026,
    category: "film",
    videoId: "YY-M5bxTY28",
    desc: "버려진 로봇 동반자의 이야기를 그린 시네마틱 SF 단편.",
  },
  {
    id: "the-farm",
    title: "The Farm",
    creator: "MindStudio",
    tool: "Seedance 1.5 + Kling O3 + Veo 3.1",
    year: 2026,
    category: "film",
    videoId: "2FTyd4waDgs",
    desc: "최신 세대 AI 툴을 총동원해 만든 2026년의 단편영화.",
  },
  {
    id: "titan-hunter",
    title: "The Titan Hunter",
    creator: "MindStudio",
    tool: "Seedance 1.5 + Kling O3 + Veo 3.1",
    year: 2026,
    category: "film",
    videoId: "NlueP6O9n4E",
    desc: "거대 괴수를 쫓는 사냥꾼의 이야기. AI 판타지 액션의 현재 수준을 보여주는 작품.",
  },

  /* ---------- 애니메이션 ---------- */
  {
    id: "anime-rps",
    title: "Anime Rock, Paper, Scissors",
    creator: "Corridor",
    tool: "Stable Diffusion",
    year: 2023,
    category: "animation",
    videoId: "GVT3WUa-48Y",
    desc: "가위바위보를 소재로 한 애니메이션 대결. AI 애니메이션 논쟁의 시작점이 된 화제작.",
  },

  /* ---------- 뮤직비디오 ---------- */
  {
    id: "hardest-part",
    title: "Washed Out — The Hardest Part",
    creator: "Paul Trillo",
    tool: "Sora",
    year: 2024,
    category: "mv",
    videoId: "-Nb-M1GAOX8",
    desc: "Sora로 제작된 세계 최초의 공식 뮤직비디오. 끝없이 이어지는 줌 인 여정으로 한 커플의 일생을 그린다.",
  },
  {
    id: "lp-lost",
    title: "Linkin Park — Lost",
    creator: "Linkin Park",
    tool: "Kaiber",
    year: 2023,
    category: "mv",
    videoId: "7NK_JOkuSVY",
    desc: "20년 만에 공개된 미발표곡의 공식 뮤직비디오를 AI로 제작. 메이저 아티스트 최초의 AI MV 중 하나.",
  },

  /* ---------- 시리즈 & 코미디 ---------- */
  {
    id: "nv-zorgop",
    title: "Zorgop Knows All",
    creator: "Neural Viz",
    tool: "Veo + Runway + ElevenLabs",
    year: 2025,
    category: "series",
    videoId: "BL9-jHGnxyc",
    desc: "인류 이후의 세계 '모노버스'에서 방송되는 기괴한 토크쇼. AI 코미디 유니버스의 대표주자 Neural Viz의 인기 에피소드.",
  },
  {
    id: "nv-gluron-dating",
    title: "Gluron Dating Show",
    creator: "Neural Viz",
    tool: "Veo + Runway + ElevenLabs",
    year: 2025,
    category: "series",
    videoId: "U2IwvdyLj2E",
    desc: "글루론들의 데이팅 쇼. 모노버스 세계관 속 외계 리얼리티 프로그램 패러디.",
  },
  {
    id: "nv-church-z",
    title: "The Church of Z",
    creator: "Neural Viz",
    tool: "Veo + Runway + ElevenLabs",
    year: 2025,
    category: "series",
    videoId: "fmV5n8Gu9mQ",
    desc: "모노버스의 수상한 종교 단체를 다룬 다큐멘터리 패러디 에피소드.",
  },
  {
    id: "nv-tooth-booth",
    title: "The Tooth Booth",
    creator: "Neural Viz",
    tool: "Veo + Runway + ElevenLabs",
    year: 2025,
    category: "series",
    videoId: "ljXz9r97M3E",
    desc: "이빨 부스에 오신 것을 환영합니다. 설명 불가능한 모노버스식 유머.",
  },

  /* ---------- 광고 & 실험 ---------- */
  {
    id: "kalshi-yolo",
    title: "Kalshi — YOLO",
    creator: "Kalshi",
    tool: "Veo 3",
    year: 2025,
    category: "ad",
    videoId: "mzXFURkcCt4",
    desc: "제작비 단 2,000달러, 이틀 만에 만들어 NBA 파이널 프라임타임에 방영된 최초의 완전 AI 생성 TV 광고.",
  },
];
