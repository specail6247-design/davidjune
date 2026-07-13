# AGORA — US Launch Kit (미국 시장 알리기 키트)

> 목적: Hacker News / X / Product Hunt / Reddit에 복붙 가능한 영문 자료.
> 전제: 영어 데모 페이지(/agora/en/) 완성 후 발사. 발사 시각은 **미국 화~목 오전 8~10시(태평양)** = 한국시간 **수~금 자정~새벽 2시**.

---

## 1) Hacker News — "Show HN" (가장 먼저, 효과 최대)

**제목 (이 중 하나):**
- Show HN: Agora – A marketplace where AI agents haggle each other for real bookings
- Show HN: I built a market where my AI agent negotiates prices with shop agents

**본문:**

Hi HN — solo founder from Seoul here.

I built Agora, a two-sided marketplace where the buyer side and the seller side are both AI agents:

- A shop owner registers their "agent" in 30 seconds: base price, max discount they allow, and perks they're willing to throw in (free dessert, window seat...).
- A consumer posts a request in plain language ("dinner for 4 this Saturday, budget $90").
- Shop agents bid in real time, the consumer's agent pushes back for better terms, shop agents counter-bid within the rules their owner set.
- A human taps "approve" once. The deal is recorded, the shop gets the booking instantly. Operator has a kill switch and an auto-approve limit over the whole market.

Everything runs serverless (vanilla JS + Firestore, negotiation engine runs in the browser). No payment processing yet — pilot bookings settle in-store, so I stay out of fintech regulation while proving the loop.

Why: agentic commerce protocols (ACP/AP2/UCP) assume merchants have agent-ready endpoints. Millions of small local businesses (nail salons, BBQ joints, guesthouses) never will — unless someone builds their agent for them. That supply side is what I'm building, starting in Korea where nobody's doing it.

Live demo (English floor): https://emojiworld-195a0.web.app/agora/en/
(Custom domain pending — same app runs the Korean market at /agora/)
Would love feedback on the negotiation mechanics and what would make you trust an agent to book for you.

**HN 생존 수칙:**
- 게시 후 4시간은 댓글에 전부 답할 것 (밤샘 각오)
- 절대 지인에게 업보트 부탁 금지 (링크 직접 공유도 금지 — 감지되면 순위 강등)
- 질문엔 데이터와 코드로 답하기. 겸손하게, 방어적이지 않게

---

## 2) X(트위터) 스레드 — HN과 같은 날

**Tweet 1 (훅 + 영상):**
My AI agent just haggled with 3 restaurant agents and saved me $12.

Not a simulation. Real marketplace, real bookings, human approves at the end.

Solo-built in Seoul. Here's how it works 🧵
[협상 장면 화면 녹화 GIF/영상 첨부 — 필수]

**Tweet 2:**
Shop owners set 3 rules: base price, max discount, perks they can offer.
That's it. Their agent bids 24/7 on their behalf.
No app to learn. No staff to hire.

**Tweet 3:**
Consumer side: type what you want. "Dinner for 4, Saturday 7pm, $90 budget."
Your agent broadcasts it. Shop agents compete. You watch them fight for your money in real time.

**Tweet 4:**
The part VCs care about: there's a control tower.
Kill switch for the whole market. Auto-approve limits. Every negotiation logged.
Agent commerce needs human override — this is what it looks like.

**Tweet 5:**
Why Korea first: 7M small businesses, zero agent infrastructure, and the big platforms (Naver/Kakao) only serve their own walled gardens.
The neutral supply-side layer is wide open.

**Tweet 6 (CTA):**
Live now → [URL]
Building toward the day ChatGPT books your Seoul dinner through my merchants' agents.
Follow along — shipping weekly.

---

## 3) Product Hunt (HN 반응 확인 후 1~2주 뒤)

- **Name:** Agora
- **Tagline:** The marketplace where AI agents haggle for you
- **설명 (첫 댓글):** Picto 때 썼던 maker comment 포맷 재활용 — 문제(전화 예약 지옥/노쇼) → 데모 GIF → 사장님 30초 온보딩 → 로드맵(ACP 연동) → 피드백 요청
- 갤러리: 협상 라이브 3장 + 관제탑 1장 + 사장님 콘솔 1장 (다크 테마 통일)
- 태그: Artificial Intelligence / Marketplace / SaaS

---

## 4) Reddit (r/SideProject, r/ArtificialIntelligence)

**제목:** I built a marketplace where AI agents negotiate with each other — humans only click "approve"

**본문 요약:** Show HN 본문 축약 + "한국에서 시작한 이유" + 데모 GIF. 광고 티 금지, 스토리로. 댓글에 상주할 것.
(r/InternetIsBeautiful은 셀프 프로모 규정 엄격 — 제3자가 올려줄 때까지 보류)

---

## 5) 상시 채널 (스파이크 후 매주)

- AI 뉴스레터 제보: Ben's Bites, The Rundown, TLDR AI — "agent-to-agent commerce, live demo" 한 줄 피치 메일
- AI 디렉토리 등록: There's An AI For That, Futurepedia, Fazier
- 주간 빌드로그를 X에 — "Week N of building the agent economy's supply side"

---

## 발사 전 체크리스트

- [x] 영어 데모 페이지 — 완료: https://emojiworld-195a0.web.app/agora/en/ (소비자+사장님, USD, 미국 전용 플로어로 리전 분리)
- [x] 미국 데모 가게 시드 — Lupone Trattoria / Molto Osteria / Salon de May (Demo)
- [ ] 협상 장면 15초 화면 녹화 (GIF + MP4) — 폰/QuickTime으로 en/ 데모 1회 녹화
- [ ] 커스텀 도메인 연결 (선택이지만 강력 추천 — Firebase 콘솔 > Hosting > 커스텀 도메인, 예: agoramarket.app. 태준님만 가능: 도메인 구매 필요)
- [ ] HN 계정 (news.ycombinator.com 가입 — 태준님 직접. 새 계정도 Show HN 게시 가능)
- [ ] X 계정 정리 (bio: "Building Agora — AI agents that haggle. Seoul → world")
- [ ] 발사: **한국시간 수요일 자정 00:00~02:00 (= 화요일 08:00~10:00 PT)** — HN 게시 → X 스레드 → 4시간 댓글 상주

## 🚀 원클릭 발사 버튼 (제목·링크 미리 채워짐)

**HN 발사 버튼** — 누르면 제목+링크가 채워진 제출 화면이 열림 (로그인/가입만 하면 됨):
https://news.ycombinator.com/submitlink?u=https%3A%2F%2Femojiworld-195a0.web.app%2Fagora%2Fen%2F&t=Show%20HN%3A%20Agora%20%E2%80%93%20A%20marketplace%20where%20AI%20agents%20haggle%20each%20other%20for%20real%20bookings

**X 발사 버튼** — 누르면 첫 트윗이 작성된 채로 열림 (게시 전 데모 영상 첨부 권장):
https://twitter.com/intent/tweet?text=My%20AI%20agent%20just%20haggled%20with%20restaurant%20agents%20and%20saved%20me%20%2417.%0A%0ANot%20a%20simulation%20%E2%80%94%20real%20marketplace%2C%20real%20bookings%2C%20a%20human%20approves%20at%20the%20end.%20Solo-built%20in%20Seoul.%0A%0AWatch%20agents%20fight%20for%20your%20money%3A%0Ahttps%3A%2F%2Femojiworld-195a0.web.app%2Fagora%2Fen%2F

## 발사 당일 절차 (권장: 수요일 자정 KST, 총 15분)

1. 위 **HN 발사 버튼** 클릭 → 로그인(또는 30초 가입) → Submit 클릭
2. 게시 직후 본문 내용을 첫 댓글로 작성 (위 1)번 본문 복붙)
3. 위 **X 발사 버튼** 클릭 → 데모 영상 첨부 → 게시, 이어서 2)번 스레드 나머지
4. 댓글 알림 켜고 4시간 상주 — 모든 질문에 답변 (Claude에게 영어 답변 초안 요청 가능)
