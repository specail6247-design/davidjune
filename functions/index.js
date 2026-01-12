const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const isEmojiOnly = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }
  const regex = /[\p{Extended_Pictographic}\uFE0F\u200D\u{1F3FB}-\u{1F3FF}]/gu;
  const stripped = value.replace(regex, "");
  return stripped.length === 0;
};

exports.sendPushNotification = functions.firestore
  .document("fcm_tokens/{token}")
  .onCreate(async (snapshot) => {
    const token = snapshot.id;
    const payload = {
      notification: {
        title: "Welcome to EmojiWorld!",
        body: "Here is your first emoji: 👋",
        image: "https://firebasestorage.googleapis.com/v0/b/emojipwa.appspot.com/o/assets%2Femoji.png?alt=media&token=df1b62a6-2923-41f3-8b17-e23e2a77b61f",
      },
      webpush: {
        fcm_options: {
          link: "/profile",
        },
      },
    };

    try {
      await admin.messaging().send({ token, ...payload });
      console.log("Push notification sent successfully to token:", token);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  });

exports.validateMissionEmoji = functions.firestore
  .document("missions/{missionId}")
  .onWrite(async (change, context) => {
    if (!change.after.exists) {
      return null;
    }

    const data = change.after.data();
    const legacyInvalid =
      (data.mission_emoji && !isEmojiOnly(data.mission_emoji)) ||
      (data.banner_emoji && !isEmojiOnly(data.banner_emoji));
    const v2Invalid =
      (data.missionEmoji && !isEmojiOnly(data.missionEmoji)) ||
      (data.bannerEmoji && !isEmojiOnly(data.bannerEmoji)) ||
      (data.roomEmoji && !isEmojiOnly(data.roomEmoji));
    if (legacyInvalid || v2Invalid) {
      await change.after.ref.delete();
      await admin.firestore().collection("mission_rejections").add({
        mission_id: context.params.missionId,
        mission_emoji: data.mission_emoji || data.missionEmoji || null,
        banner_emoji: data.banner_emoji || data.bannerEmoji || null,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return null;
  });

const getWeekKey = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const year = date.getUTCFullYear();
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const dayOffset = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
  const week = Math.ceil((dayOffset + firstDay.getUTCDay() + 1) / 7);
  return `${year}-W${week}`;
};

const calculateStreak = (dates) => {
  if (!dates.length) {
    return 0;
  }
  let streak = 1;
  let prev = new Date(`${dates[0]}T00:00:00Z`);
  for (let i = 1; i < dates.length; i += 1) {
    const current = new Date(`${dates[i]}T00:00:00Z`);
    const diff = Math.round((prev - current) / 86400000);
    if (diff === 1) {
      streak += 1;
      prev = current;
    } else {
      break;
    }
  }
  return streak;
};

exports.updateLeaderboardOnMissionComplete = functions.firestore
  .document("userMissions/{missionId}")
  .onWrite(async (change, context) => {
    if (!change.after.exists) {
      return null;
    }
    const after = change.after.data();
    const before = change.before.exists ? change.before.data() : null;
    if (after.status !== "completed" || (before && before.status === "completed")) {
      return null;
    }

    const userId = after.userId;
    const dateKey = after.date;
    const weekKey = getWeekKey(dateKey);

    const profileSnap = await admin.firestore().collection("userProfiles").doc(userId).get();
    const profile = profileSnap.exists ? profileSnap.data() : {};

    const recent = await admin
      .firestore()
      .collection("userMissions")
      .where("userId", "==", userId)
      .where("status", "==", "completed")
      .orderBy("date", "desc")
      .limit(7)
      .get();

    const dates = recent.docs.map((doc) => doc.data().date);
    const streak = calculateStreak(dates);
    let score = 1;
    if (streak >= 7) {
      score += 2;
    } else if (streak >= 3) {
      score += 1;
    }

    const dailyRef = admin
      .firestore()
      .collection("leaderboardDaily")
      .doc(dateKey)
      .collection("entries")
      .doc(userId);
    const weeklyRef = admin
      .firestore()
      .collection("leaderboardWeekly")
      .doc(weekKey)
      .collection("entries")
      .doc(userId);

    await admin.firestore().runTransaction(async (tx) => {
      tx.set(
        dailyRef,
        {
          userId,
          score,
          streak,
          avatarEmoji: profile?.avatarEmoji || "🙂",
          countryEmoji: profile?.countryEmoji || "🌍",
        },
        { merge: true },
      );

      const weeklySnap = await tx.get(weeklyRef);
      const prevScore = weeklySnap.exists ? weeklySnap.data().score || 0 : 0;
      tx.set(
        weeklyRef,
        {
          userId,
          score: prevScore + score,
          streak,
          avatarEmoji: profile?.avatarEmoji || "🙂",
          countryEmoji: profile?.countryEmoji || "🌍",
        },
        { merge: true },
      );
    });

    return null;
  });

exports.validatePostEmoji = functions.firestore
  .document("posts/{postId}")
  .onWrite(async (change, context) => {
    if (!change.after.exists) {
      return null;
    }
    const data = change.after.data();
    if (!isEmojiOnly(data.roomEmoji) || !isEmojiOnly(data.moodEmoji) || !isEmojiOnly(data.captionEmoji)) {
      await change.after.ref.delete();
      await admin.firestore().collection("post_rejections").add({
        post_id: context.params.postId,
        roomEmoji: data.roomEmoji || null,
        moodEmoji: data.moodEmoji || null,
        captionEmoji: data.captionEmoji || null,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    return null;
  });

const getPeriodKey = (date = new Date()) => date.toISOString().slice(0, 7);

exports.revealInfo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "auth required");
  }
  const viewerId = context.auth.uid;
  const targetUserId = data?.targetUserId || viewerId;

  const revealRateSnap = await admin
    .firestore()
    .collection("reveal_rate")
    .doc(viewerId)
    .get();
  const revealLast = revealRateSnap.exists ? revealRateSnap.data().lastAt?.toMillis() : 0;
  if (Date.now() - revealLast < 5 * 1000) {
    throw new functions.https.HttpsError("resource-exhausted", "rate");
  }

  await admin.firestore().collection("reveal_rate").doc(viewerId).set(
    {
      lastAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  const subSnap = await admin.firestore().collection("subscriptions").doc(viewerId).get();
  const sub = subSnap.exists ? subSnap.data() : null;
  const plan = sub?.plan || "basic";
  const periodKey = sub?.currentPeriodStart
    ? sub.currentPeriodStart.slice(0, 7)
    : getPeriodKey();
  const limitMap = { basic: 3, plus: 10, elite: 50 };
  const limit = limitMap[plan] || 3;

  const revealsSnap = await admin
    .firestore()
    .collection("info_reveals")
    .where("viewerId", "==", viewerId)
    .where("periodKey", "==", periodKey)
    .get();

  if (revealsSnap.size >= limit) {
    throw new functions.https.HttpsError("resource-exhausted", "limit");
  }

  await admin.firestore().collection("info_reveals").add({
    viewerId,
    targetUserId,
    periodKey,
    planAtTime: plan,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const profileSnap = await admin.firestore().collection("userProfiles").doc(targetUserId).get();
  const profile = profileSnap.exists ? profileSnap.data() : {};

  const missionsSnap = await admin
    .firestore()
    .collection("userMissions")
    .where("userId", "==", targetUserId)
    .orderBy("date", "desc")
    .limit(7)
    .get();
  const recentMissionEmojis = missionsSnap.docs.map((doc) => doc.data().missionEmoji || "🎯");

  const completedSnap = await admin
    .firestore()
    .collection("userMissions")
    .where("userId", "==", targetUserId)
    .where("status", "==", "completed")
    .orderBy("date", "desc")
    .limit(7)
    .get();

  const engagementLevel = Math.min(5, completedSnap.size || 1);
  const lastDate = missionsSnap.docs[0]?.data()?.date;
  let activityStatus = "⚫";
  if (lastDate) {
    const diff = Math.abs(Date.now() - new Date(`${lastDate}T00:00:00Z`).getTime());
    activityStatus = diff < 2 * 86400000 ? "🟢" : diff < 7 * 86400000 ? "🟡" : "⚫";
  }

  return {
    remaining: Math.max(0, limit - revealsSnap.size - 1),
    periodKey,
    payload: {
      avatarEmoji: profile?.avatarEmoji || "🙂",
      countryEmoji: profile?.countryEmoji || "🌍",
      learnEmoji: "🧠",
      recentMissionEmojis,
      engagementLevel,
      activityStatus,
    },
  };
});

exports.purchaseGift = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "auth required");
  }
  const senderId = context.auth.uid;
  const receiverId = data?.receiverId || senderId;
  const emoji = data?.emoji;
  const tier = data?.tier || "basic";
  if (!emoji || typeof emoji !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "emoji required");
  }

  const rateSnap = await admin
    .firestore()
    .collection("gift_rate")
    .doc(senderId)
    .get();
  const last = rateSnap.exists ? rateSnap.data().lastAt?.toMillis() : 0;
  if (Date.now() - last < 10 * 1000) {
    throw new functions.https.HttpsError("resource-exhausted", "rate");
  }

  await admin.firestore().collection("gift_rate").doc(senderId).set(
    {
      lastAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await admin.firestore().collection("user_gifts").add({
    userId: receiverId,
    giftId: `${receiverId}-${emoji}`,
    emoji,
    tier,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true };
});
