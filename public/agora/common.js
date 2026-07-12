// AGORA 공용 — Firebase 초기화 + 헬퍼
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInAnonymously,
  GoogleAuthProvider, signInWithPopup, signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore, collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  getCountFromServer, getAggregateFromServer, sum
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCoioGXreyhEdu9YAlsB7PBU_xoaXQKA8",
  authDomain: "emojiworld-195a0.firebaseapp.com",
  projectId: "emojiworld-195a0",
  storageBucket: "emojiworld-195a0.firebasestorage.app",
  messagingSenderId: "820644065220",
  appId: "1:820644065220:web:59d0f08bf6a9474714be91",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const OPERATOR_EMAIL = "specail6247@gmail.com";
export const FEE_PCT = 2;

// 익명 로그인 보장 — 모든 페이지 공통 진입점
export function ensureAuth() {
  return new Promise((resolve, reject) => {
    const off = onAuthStateChanged(auth, (user) => {
      if (user) { off(); resolve(user); }
      else signInAnonymously(auth).catch((e) => { off(); reject(e); });
    });
  });
}

export function watchAuth(cb) { return onAuthStateChanged(auth, cb); }

export async function googleSignIn() {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  return res.user;
}

export function logout() { return signOut(auth); }

// 시장 설정 구독 (없으면 기본값)
export const DEFAULT_SETTINGS = { paused: false, autoApproveLimit: 0, feePct: FEE_PCT };
export function watchSettings(cb) {
  return onSnapshot(doc(db, "agora_settings", "market"),
    (snap) => cb(snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : { ...DEFAULT_SETTINGS }),
    () => cb({ ...DEFAULT_SETTINGS })
  );
}

// 표기 헬퍼
export const won = (n) => "₩" + Number(n || 0).toLocaleString("ko-KR");
export const usd = (n) => "$" + Number(n || 0).toLocaleString("en-US");
export const money = (n, currency) => currency === "USD" ? usd(n) : won(n);
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));
export const timeAgo = (ts) => {
  if (!ts) return "";
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return s + "초 전";
  if (s < 3600) return Math.floor(s / 60) + "분 전";
  if (s < 86400) return Math.floor(s / 3600) + "시간 전";
  return Math.floor(s / 86400) + "일 전";
};

export const CATEGORIES = {
  food: { label: "식당", emoji: "🍝", unit: "인" },
  hair: { label: "미용실", emoji: "💇", unit: "명" },
  stay: { label: "숙소", emoji: "🏝", unit: "박" },
  etc:  { label: "기타", emoji: "🛍", unit: "건" },
};

let toastEl = null, toastTimer = null;
export function toast(text) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
}

// 상단바 시장 상태 표시
export function bindMarketStatus(el) {
  return watchSettings((s) => {
    el.classList.toggle("paused", !!s.paused);
    el.querySelector(".t").textContent = s.paused ? "시장 일시 정지" : "시장 열림";
  });
}

export {
  app, auth, db,
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  getCountFromServer, getAggregateFromServer, sum
};
