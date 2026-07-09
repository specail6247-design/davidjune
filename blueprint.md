# ✨ Picto 프로젝트 청사진

## 📍 1. 프로젝트 개요

Picto는 **이모지만으로** 전 세계 사람들과 소통하는 소셜 네트워크입니다. 텍스트를 없애 언어 장벽을 제거하고, "좋아요를 모으면 사진을 올릴 수 있는" 독자적인 루프로 인스타그램과 차별화합니다.

- **라이브 URL:** https://emojiworld-195a0.web.app
- **핵심 컨셉:** 이모지 = 유일한 공용어. 사진 = 커뮤니티가 부여하는 특권.
- **기술 스택:** Next.js 14 (static export) · TypeScript · Firebase (Auth + Firestore + Hosting)
- **글로벌 비전:** 7살부터 97살까지, 언어 장벽 없는 '제2의 인스타그램'

## 🎯 2. 차별화 4대 기둥 (마케팅 & 제품 공통)

1. **🌍 언어 장벽 제로** — 모든 게시물·댓글이 이모지 전용
2. **❤️➡️📸 사진은 특권** — 반응 5개 = 사진 티켓 1장 (무료 티켓 1장 제공). 사진 스팸 없는 피드
3. **🛡️ 악플 원천 차단** — 댓글이 이모지 전용이라 욕설 입력이 물리적으로 불가능
4. **🎈 3초 온보딩** — 게스트(익명) 로그인으로 가입 없이 시작

## 🏗️ 3. 현재 아키텍처 (2026-07 재건축 완료)

### 라우트 구조
- `/` — 마케팅 랜딩 (EN/KO 자동감지+토글, SEO 메타데이터, OG 이미지)
- `/login` — 게스트(익명) + Google 로그인 (Firebase Auth)
- `/app/feed` — 실시간 피드 (Firestore onSnapshot, 최신 50개)
- `/app/post` — 이모지 작문기(카테고리 탭 + 최대 16자) + 사진 티켓 게이트
- `/app/missions` `/app/profile` `/app/explore` `/app/friends` — 부가 기능
- `/admin` — 실데이터 대시보드 (posts/users 카운트)

### 데이터 모델 (Firestore)
- `posts/{id}`: userId, authorEmoji, countryEmoji, moodEmoji, caption(이모지 전용), imageUrl(압축 dataURL), createdAt
- `posts/{id}/reactions/{uid}`: emoji — 유저당 1개, 같은 이모지 재탭 시 취소
- `posts/{id}/comments/{cid}`: 이모지 전용 댓글
- `userProfiles/{uid}`: avatarEmoji, countryEmoji, bio
- **사진 티켓 공식:** `1(무료) + floor(총 받은 반응 ÷ 5) − 올린 사진 수`

### 주요 설계 결정
- **NextAuth 제거** → Firebase Auth (정적 배포 100% 호환)
- **Storage 미사용** → 클라이언트 캔버스 압축(≤900px, ≤600KB) 후 Firestore에 dataURL 저장 (무료 플랜 호환)
- **온보딩:** 5개국어(한/영/일/중/태) WelcomeTour, 브라우저 언어 자동감지, ❓ 버튼으로 재열람
- **보안 규칙:** 전면 재작성 — 본인 문서만 쓰기, admin 컬렉션 클라이언트 쓰기 차단

## ⚠️ 4. 운영 체크리스트

- [ ] **Firebase Console → Authentication → 시작하기 → 익명 + Google 활성화** (로그인 필수 조건!)
- [x] Firestore 데이터베이스 생성 (nam5) 및 보안 규칙 배포
- [x] Hosting 배포 파이프라인 (`npm run build` → `npx firebase-tools deploy --only hosting`)
- [ ] 런칭 전 시드 게시물 10~15개
- [ ] Product Hunt 런칭 → `docs/launch/PRODUCT_HUNT_KIT.md`

## 💰 5. 수익화 로드맵

1. **v1 (라이브):** 무료 + 사진 티켓 루프로 리텐션
2. **v1.5:** Picto Plus — 프리미엄 이모지 팩·프로필 오라·부스트 (`/app/upgrade` UI 존재)
3. **v2:** 사진 티켓 소액 결제 (희소성의 수익화)
4. **v3:** 크리에이터 이모지 팩 마켓 (수수료)

## 🗺️ 6. 다음 개발 후보 (피드백 기반으로 우선순위 결정)

- 팔로우/친구 시스템 및 친구 전용 피드
- 이모지 스토리(24시간 소멸) 고도화
- 리더보드 실데이터 연동 (Cloud Functions 필요 → Blaze 검토)
- 사진 티켓 서버사이드 검증 (Cloud Functions)
- 다국어 랜딩 (일/중/태 추가)
- FCM 푸시 알림 재활성화
