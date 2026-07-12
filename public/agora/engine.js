// AGORA 협상 엔진 — 실제 Firestore 데이터로 에이전트 간 호가/재호가/체결을 수행
// 다국어(ko/en) · 다중 리전(kr/us) 지원: 요청 문서의 lang/region 필드를 따른다.
import {
  db, collection, doc, addDoc, setDoc, updateDoc, getDoc, getDocs,
  query, where, serverTimestamp, FEE_PCT
} from "./common.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const running = new Set();

// ── 로케일 ──────────────────────────────────────────────────
export const LOCALES = {
  ko: {
    currency: "KRW",
    money: (n) => "₩" + Number(n || 0).toLocaleString("ko-KR"),
    round: (n) => Math.max(0, Math.round(n / 100) * 100),
    cats: { food: "식당", hair: "미용실", stay: "숙소", etc: "기타" },
    units: { food: "인", hair: "명", stay: "박", etc: "건" },
    myAgent: "내 에이전트",
    merchantAgent: (name) => `${name} 사장님 에이전트`,
    open: (text, qty, unit, budget, money) =>
      `요청 접수: ${text} — 조건을 분석해 시장에 공개합니다. (수량 ${qty}${unit}${budget ? " · 예산 " + money(budget) : ""})`,
    broadcast: (cat, n) => `AGORA 거래소에 의뢰 공개 — ${cat} 에이전트 ${n}곳 응답 시작`,
    noMerchants: (cat) => `아직 '${cat}' 업종에 입점한 사장님 에이전트가 없습니다. 사장님 콘솔에서 첫 가게를 등록해 보세요.`,
    quote: (qty, unit, price, money) => `요청 일정 가능합니다. ${qty}${unit} 기준 총 ${money(price)} 호가합니다.`,
    counterOver: (budget, money) => `예산 ${money(budget)}을 넘습니다. 예산 내 구성 또는 서비스 포함으로 재호가 요청드립니다.`,
    counterOk: () => `호가 확인했습니다. 가격 조정이나 서비스 추가 여지가 있으면 재호가 부탁드립니다.`,
    improve: (perkTxt, price, disc, money) => `재호가: ${perkTxt}총 ${money(price)}${disc ? ` (${disc}% 조정)` : ""}까지 맞추겠습니다.`,
    perkJoin: (perk) => `${perk} 포함, `,
    reasons: { budget: "예산 충족", cheapest: "최저가", perks: "서비스 포함", rating: (r) => `평점 ${r.toFixed(1)}` },
    decide: (name, reasons) => `호가 마감 — ${name} 낙찰 추천 (${reasons}). 승인하시면 바로 체결합니다.`,
    autoApprove: (limitTxt) => `운영자 자동승인 한도(${limitTxt}) 이내 — 자동 체결을 진행합니다.`,
    dealDone: (name, priceTxt, dealNo, auto) => `✅ 체결 완료 — ${name} · ${priceTxt} · 체결번호 ${dealNo}${auto ? " (자동승인 한도 이내)" : ""}`,
    pausedMsg: "⛔ 운영자가 시장을 일시 정지했습니다. 협상이 중단됩니다.",
    llmSystem: "너는 AGORA(에이전트 거래 시장)의 협상 에이전트다. 주어진 상황에 맞는 자연스러운 한국어 협상 대사를 딱 한 문장(최대 90자)으로만 출력한다. 따옴표나 설명 없이 대사만. 금액이 주어지면 반드시 그 금액을 그대로 언급한다.",
  },
  en: {
    currency: "USD",
    money: (n) => "$" + Number(n || 0).toLocaleString("en-US"),
    round: (n) => Math.max(0, Math.round(n)),
    cats: { food: "restaurant", hair: "hair salon", stay: "stay", etc: "shop" },
    units: { food: " guests", hair: " person", stay: " nights", etc: " items" },
    myAgent: "My agent",
    merchantAgent: (name) => `${name} — shop agent`,
    open: (text, qty, unit, budget, money) =>
      `Request received: ${text} — analyzing terms and broadcasting to the market. (qty ${qty}${unit}${budget ? " · budget " + money(budget) : ""})`,
    broadcast: (cat, n) => `Request posted to the AGORA exchange — ${n} ${cat} agents responding`,
    noMerchants: (cat) => `No ${cat} agents in this market yet. Open one in 30 seconds from the shop console.`,
    quote: (qty, unit, price, money) => `We can take that booking. For ${qty}${unit}, our quote is ${money(price)} total.`,
    counterOver: (budget, money) => `That's over the ${money(budget)} budget. Please re-quote within budget, or sweeten the deal.`,
    counterOk: () => `Quotes received. Any room to improve on price or throw in perks? Final offers, please.`,
    improve: (perkTxt, price, disc, money) => `Revised offer: ${perkTxt}${money(price)} total${disc ? ` (${disc}% off)` : ""}. That's our best.`,
    perkJoin: (perk) => `${perk} included, `,
    reasons: { budget: "within budget", cheapest: "lowest price", perks: "perks included", rating: (r) => `rating ${r.toFixed(1)}` },
    decide: (name, reasons) => `Bidding closed — recommending ${name} (${reasons}). Approve and I'll close the deal.`,
    autoApprove: (limitTxt) => `Within the operator's auto-approve limit (${limitTxt}) — closing automatically.`,
    dealDone: (name, priceTxt, dealNo, auto) => `✅ Deal closed — ${name} · ${priceTxt} · confirmation ${dealNo}${auto ? " (auto-approved)" : ""}`,
    pausedMsg: "⛔ The operator paused the market. Negotiation halted.",
    llmSystem: "You are a negotiation agent on AGORA, an agent-to-agent marketplace. Output exactly one natural English negotiation line (max 140 chars) fitting the given context. No quotes, no explanations. If an amount is given, state it verbatim.",
  },
};
const pickLocale = (req) => LOCALES[req?.lang === "en" ? "en" : "ko"];

// ── LLM 브레인 모드 (관제탑에서 API 키 저장 시) ─────────────
const LLM_KEY_STORAGE = "agora_anthropic_key";
export const getLlmKey = () => { try { return localStorage.getItem(LLM_KEY_STORAGE) || ""; } catch { return ""; } };
export const setLlmKey = (k) => { try { k ? localStorage.setItem(LLM_KEY_STORAGE, k) : localStorage.removeItem(LLM_KEY_STORAGE); } catch {} };

async function genLine(fallback, ctx, L) {
  const key = getLlmKey();
  if (!key) return fallback;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 140,
        system: L.llmSystem,
        messages: [{ role: "user", content: JSON.stringify(ctx) }],
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return fallback;
    const data = await res.json();
    const text = (data.content?.[0]?.text || "").trim();
    return text && text.length <= 200 ? text : fallback;
  } catch {
    return fallback;
  }
}

// ── Firestore 기록 헬퍼 ─────────────────────────────────────
async function postEvent(reqId, ev) {
  await addDoc(collection(db, "agora_requests", reqId, "events"), {
    ...ev, ts: Date.now(), createdAt: serverTimestamp(),
  });
}
async function putOffer(reqId, merchantId, data) {
  await setDoc(doc(db, "agora_requests", reqId, "offers", merchantId), {
    ...data, ts: Date.now(), createdAt: serverTimestamp(),
  }, { merge: true });
}
async function marketSettings() {
  try {
    const snap = await getDoc(doc(db, "agora_settings", "market"));
    return snap.exists() ? snap.data() : {};
  } catch { return {}; }
}

async function haltIfPaused(reqId, L) {
  const s = await marketSettings();
  if (s.paused) {
    await postEvent(reqId, { who: "sys", text: L.pausedMsg });
    await updateDoc(doc(db, "agora_requests", reqId), { status: "paused" });
    return true;
  }
  return false;
}

// ── 체결 ────────────────────────────────────────────────────
export async function approveOffer(reqId, req, offer, buyerUid, auto = false) {
  const L = pickLocale(req);
  const s = await marketSettings();
  if (s.paused) throw new Error("market-paused");

  const fee = Math.round(offer.price * ((s.feePct ?? FEE_PCT) / 100) * 100) / 100;
  const dealNo = "AG-" + Date.now().toString(36).toUpperCase();
  const dealRef = await addDoc(collection(db, "agora_deals"), {
    dealNo,
    requestId: reqId,
    requestText: req.text || "",
    category: req.category || "etc",
    merchantId: offer.merchantId,
    merchantName: offer.merchantName,
    buyerUid,
    price: offer.price,
    fee,
    currency: L.currency,
    lang: req.lang === "en" ? "en" : "ko",
    region: req.region || "kr",
    auto,
    status: "confirmed",
    ts: Date.now(),
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "agora_requests", reqId), {
    status: "closed", winnerOfferId: offer.merchantId, dealId: dealRef.id,
  });
  await postEvent(reqId, {
    who: "sys",
    text: L.dealDone(offer.merchantName, L.money(offer.price), dealNo, auto),
  });
  return { dealId: dealRef.id, dealNo };
}

// ── 메인: 협상 실행 (요청 작성자의 브라우저에서 구동) ──────
export async function runNegotiation(reqId, req) {
  if (running.has(reqId)) return;
  running.add(reqId);
  const L = pickLocale(req);
  const reqRef = doc(db, "agora_requests", reqId);
  const catKey = req.category || "etc";
  const catLabel = L.cats[catKey] || L.cats.etc;
  const unit = L.units[catKey] || L.units.etc;
  const region = req.region || "kr";
  const qty = Math.max(1, Number(req.qty) || 1);
  const budget = Number(req.budget) || 0;

  try {
    if (await haltIfPaused(reqId, L)) return;
    await updateDoc(reqRef, { status: "negotiating" });

    // 1) 입점 가게 조회 (실데이터, 리전 일치만)
    const snap = await getDocs(query(
      collection(db, "agora_merchants"),
      where("category", "==", catKey)
    ));
    let merchants = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((m) => m.active !== false && (m.region || "kr") === region);
    merchants.sort(() => Math.random() - 0.5);
    merchants = merchants.slice(0, 5);

    if (!merchants.length) {
      await postEvent(reqId, { who: "sys", text: L.noMerchants(catLabel) });
      await updateDoc(reqRef, { status: "empty" });
      return;
    }

    await postEvent(reqId, {
      who: "me", name: L.myAgent,
      text: await genLine(L.open(req.text, qty, unit, budget, L.money),
        { role: "consumer_open", requestText: req.text, qty, budget }, L),
    });
    await sleep(900);
    await postEvent(reqId, { who: "sys", text: L.broadcast(catLabel, merchants.length) });

    // 2) 1라운드: 최초 호가
    const offers = [];
    for (let i = 0; i < merchants.length; i++) {
      const m = merchants[i];
      await sleep(i === 0 ? 1100 : 1400);
      if (await haltIfPaused(reqId, L)) return;
      const price1 = L.round((Number(m.basePrice) || 0) * qty);
      offers.push({ m, price1, price: price1, perks: [] });
      await putOffer(reqId, m.id, {
        merchantId: m.id, merchantName: m.name, price: price1, origPrice: null,
        perks: [], round: 1, rating: Number(m.rating) || 4.5, currency: L.currency,
      });
      await postEvent(reqId, {
        who: "m", name: L.merchantAgent(m.name), merchantId: m.id, round: 1,
        text: await genLine(L.quote(qty, unit, price1, L.money),
          { role: "merchant_quote", merchantName: m.name, price: price1, requestText: req.text }, L),
      });
    }

    // 3) 2라운드: 소비자 에이전트 재호가 요청 → 가게들 조건 개선
    await sleep(1500);
    if (await haltIfPaused(reqId, L)) return;
    const minP = Math.min(...offers.map((o) => o.price1));
    const overBudget = budget > 0 && minP > budget;
    await postEvent(reqId, {
      who: "me", name: L.myAgent,
      text: await genLine(
        overBudget ? L.counterOver(budget, L.money) : L.counterOk(),
        { role: "consumer_counter", budget, lowestPrice: minP, requestText: req.text }, L),
    });

    for (let i = 0; i < offers.length; i++) {
      const o = offers[i];
      const disc = Math.min(30, Math.max(0, Number(o.m.maxDiscountPct) || 0));
      const perks = String(o.m.perks || "").split(",").map((s) => s.trim()).filter(Boolean);
      const hasImprove = disc > 0 || perks.length > 0;
      if (!hasImprove) continue;
      await sleep(1400);
      if (await haltIfPaused(reqId, L)) return;
      const useDisc = overBudget ? disc : Math.floor(disc / 2);
      const price2 = L.round(o.price1 * (1 - useDisc / 100));
      o.price = price2;
      o.perks = perks;
      await putOffer(reqId, o.m.id, { price: price2, origPrice: o.price1, perks, round: 2 });
      const perkTxt = perks.length ? L.perkJoin(perks[0]) : "";
      await postEvent(reqId, {
        who: "m", name: L.merchantAgent(o.m.name), merchantId: o.m.id, round: 2,
        text: await genLine(L.improve(perkTxt, price2, useDisc, L.money),
          { role: "merchant_improve", merchantName: o.m.name, price: price2, origPrice: o.price1, perks, budget }, L),
      });
    }

    // 4) 판정: 점수화 → 추천
    await sleep(1400);
    if (await haltIfPaused(reqId, L)) return;
    const cheapest = Math.min(...offers.map((o) => o.price));
    let best = null, bestScore = -1;
    for (const o of offers) {
      const rating = Number(o.m.rating) || 4.5;
      const within = budget > 0 ? (o.price <= budget ? 2 : 0) : 1;
      const score = within + rating + (o.perks?.length || 0) * 0.2 + (o.price === cheapest ? 1 : 0);
      if (score > bestScore) { bestScore = score; best = o; }
    }
    await putOffer(reqId, best.m.id, { best: true });
    const reasons = [
      budget > 0 && best.price <= budget ? L.reasons.budget : null,
      best.price === cheapest ? L.reasons.cheapest : null,
      (best.perks?.length || 0) > 0 ? L.reasons.perks : null,
      L.reasons.rating(Number(best.m.rating) || 4.5),
    ].filter(Boolean).join(" · ");
    await postEvent(reqId, {
      who: "me", name: L.myAgent,
      text: await genLine(L.decide(best.m.name, reasons),
        { role: "consumer_decide", merchantName: best.m.name, price: best.price, reasons }, L),
    });
    await updateDoc(reqRef, { status: "decided", recommendedOfferId: best.m.id });

    // 5) 운영자 자동승인 한도 검사 (관제탑 컨트롤) — 한도는 KRW 기준, USD 데모는 수동 승인만
    const s = await marketSettings();
    const limitN = Number(s.autoApproveLimit) || 0;
    if (limitN > 0 && L.currency === "KRW" && best.price <= limitN) {
      await sleep(900);
      await postEvent(reqId, { who: "sys", text: L.autoApprove(L.money(limitN)) });
      await approveOffer(reqId, req, { merchantId: best.m.id, merchantName: best.m.name, price: best.price }, req.ownerUid, true);
    }
  } finally {
    running.delete(reqId);
  }
}
