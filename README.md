# 🪩🌍 EmojiWorld

**No Words. Just Emoji.** — 이모지만으로 전 세계와 소통하는 소셜 네트워크

라이브: **https://emojiworld-195a0.web.app** · 청사진: [blueprint.md](./blueprint.md) · 런칭 킷: [docs/launch/PRODUCT_HUNT_KIT.md](./docs/launch/PRODUCT_HUNT_KIT.md)

## 개발

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 정적 빌드 → out/
```

## 배포

```bash
npm run build
npx firebase-tools deploy --only hosting            # 웹 배포
npx firebase-tools deploy --only firestore:rules    # 보안 규칙 배포
```

## ⚠️ 최초 1회 설정 (로그인 활성화)

Firebase 콘솔에서 Authentication을 활성화해야 로그인이 작동합니다:

1. https://console.firebase.google.com/project/emojiworld-195a0/authentication 접속
2. **시작하기** 클릭
3. **익명(Anonymous)** 제공업체 → 사용 설정 (게스트 로그인용)
4. **Google** 제공업체 → 사용 설정 (프로젝트 지원 이메일 선택)

## 핵심 규칙

- 게시물/댓글은 **이모지 전용** (텍스트 차단 → 악플 불가능)
- **반응 5개 = 사진 티켓 1장** (신규 유저 무료 1장) — 사진은 특권!
