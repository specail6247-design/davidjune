// EmojiWorld 시드 게시물 스크립트 (Firestore REST, owner OAuth — 규칙 우회)
import { readFileSync } from 'fs';

const TOKEN = process.env.TOKEN;
const BASE = 'https://firestore.googleapis.com/v1/projects/emojiworld-195a0/databases/(default)/documents';

const sunsetB64 = readFileSync(process.env.SUNSET_JPG, 'base64');
const sunsetDataUrl = `data:image/jpeg;base64,${sunsetB64}`;

const now = Date.now();
const H = 3600_000;
const ts = (hoursAgo) => new Date(now - hoursAgo * H).toISOString();

// [userId, author, country, mood, caption, hoursAgo, imageUrl?]
const posts = [
  ['seed_u01', '🧑‍🦱', '🇧🇷', '🤩', '⚽🔥🎉🙌', 1.2],
  ['seed_u02', '👧', '🇯🇵', '😌', '📚😮‍💨☕✨', 2.1],
  ['seed_u03', '🧑', '🇰🇷', '😤', '☀️🏃💦💪', 3.4],
  ['seed_u04', '👴', '🇮🇹', '😋', '🍝👨‍🍳💯🍷', 4.8],
  ['seed_u05', '🧒', '🇺🇸', '🥱', '🌧️🏠🎮🍕', 6.5],
  ['seed_u06', '👵', '🇫🇷', '🥰', '🐶🦴🥎❤️', 8.2],
  ['seed_u07', '🧑', '🇩🇪', '😆', '✈️🧳🌍📸', 10.7, 'SUNSET'],
  ['seed_u08', '👧', '🇲🇽', '🥳', '🎂2️⃣0️⃣🎁🎈', 13.0],
  ['seed_u09', '🧓', '🇮🇳', '😌', '🌅🧘🍃😮‍💨', 16.5],
  ['seed_u10', '🧑', '🇺🇸', '😩', '💼😩☕☕☕', 20.0],
  ['seed_u11', '🧑‍🦱', '🇬🇧', '😎', '🎸🎶🌙✨', 25.3],
  ['seed_u12', '👦', '🇰🇷', '😊', '🍚🥢👨‍👩‍👧💕', 30.1],
  ['seed_u13', '👧', '🇪🇸', '😎', '🌊🏖️🍉☀️', 35.6],
  ['seed_u14', '👵', '🇹🇭', '😂', '🧑‍🍳🍞🔥😅', 41.0],
  ['seed_u15', '🧑', '🇳🇱', '😌', '🚲🌳🎧🦆', 46.2],
];

// postIndex -> [[emoji, count], ...]
const reactions = {
  0: [['❤️', 6], ['🔥', 4], ['😂', 2]],
  1: [['❤️', 4], ['🥺', 2]],
  2: [['🔥', 5], ['👏', 3]],
  3: [['😮', 4], ['❤️', 5], ['👏', 2]],
  5: [['❤️', 7], ['🥺', 3]],
  6: [['😮', 6], ['❤️', 8], ['🔥', 3]],
  8: [['❤️', 3], ['👏', 2]],
  11: [['❤️', 5], ['🥺', 4]],
  12: [['🔥', 6], ['😂', 3]],
  13: [['😂', 9], ['❤️', 4]],
};

// postIndex -> [comments]
const comments = {
  0: ['🔥🔥🔥', '👏😄', '⚽❤️'],
  3: ['😋🤤', '👨‍🍳💯'],
  6: ['😍✨', '🌅❤️', '✈️🫶'],
  13: ['😂😂', '🍞💪'],
};

const sv = (s) => ({ stringValue: s });
const tv = (t) => ({ timestampValue: t });

async function put(path, fields) {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
}

async function post(path, fields) {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
}

for (let i = 0; i < posts.length; i++) {
  const [uid, author, country, mood, caption, hoursAgo, img] = posts[i];
  const postId = `seed_post_${String(i + 1).padStart(2, '0')}`;
  const createdAt = ts(hoursAgo);

  const fields = {
    userId: sv(uid),
    authorEmoji: sv(author),
    countryEmoji: sv(country),
    moodEmoji: sv(mood),
    caption: sv(caption),
    visibility: sv('public'),
    createdAt: tv(createdAt),
  };
  if (img === 'SUNSET') fields.imageUrl = sv(sunsetDataUrl);
  else fields.imageUrl = { nullValue: null };

  await put(`posts/${postId}`, fields);

  const rx = reactions[i] || [];
  let r = 0;
  for (const [emoji, count] of rx) {
    for (let c = 0; c < count; c++) {
      const ruid = `seed_r_${i}_${r++}`;
      await put(`posts/${postId}/reactions/${ruid}`, {
        uid: sv(ruid),
        emoji: sv(emoji),
        createdAt: tv(ts(hoursAgo - 0.1 - r * 0.02)),
      });
    }
  }

  for (const c of comments[i] || []) {
    await post(`posts/${postId}/comments`, {
      user_id: sv(`seed_c_${i}`),
      emoji_comment: sv(c),
      created_at: tv(ts(hoursAgo - 0.3)),
    });
  }

  console.log(`✅ ${postId} (${caption}) reactions=${rx.reduce((a, [, n]) => a + n, 0)}`);
}
console.log('🌱 seeding done');
