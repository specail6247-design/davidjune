/* AINEMA — AI 시네마 큐레이션 앱 */
(function () {
  const $ = (sel) => document.querySelector(sel);
  const isDesktop = () => window.matchMedia("(min-width: 900px)").matches;

  const thumb = (v) =>
    v.thumb || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
  const thumbHi = (v) =>
    v.thumb || `https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`;

  const PLAY_SVG =
    '<svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>';
  const CHEV_L =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const CHEV_R =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg>';

  /* ---------- Splash (세션당 1회) ---------- */
  function runSplash() {
    const splash = $("#splash");
    if (!splash) return;
    if (sessionStorage.getItem("ainema-splash")) { splash.remove(); return; }
    sessionStorage.setItem("ainema-splash", "1");
    splash.hidden = false;
    setTimeout(() => {
      splash.classList.add("out");
      setTimeout(() => splash.remove(), 700);
    }, 1500);
  }

  /* ---------- Hero ---------- */
  function renderHero(video) {
    const hero = $("#hero");
    if (!video) { hero.style.display = "none"; return; }
    hero.style.backgroundImage = `url(${thumbHi(video)})`;
    hero.innerHTML = `
      <div class="hero-video" id="heroVideo" aria-hidden="true"></div>
      <div class="hero-content">
        <span class="hero-badge">오늘의 AI 픽</span>
        <h1>${video.title}</h1>
        <p class="hero-desc">${video.desc || ""}</p>
        <p class="hero-meta">${video.creator} · ${video.tool} · ${video.year || ""}</p>
        <div class="hero-actions">
          <button class="btn-play" data-id="${video.id}">${PLAY_SVG} 재생</button>
        </div>
      </div>`;
    hero.querySelector(".btn-play").addEventListener("click", () => openPlayer(video));

    // maxres 썸네일이 없는 영상은 hq로 폴백
    const probe = new Image();
    probe.onload = () => { if (probe.naturalWidth < 300) hero.style.backgroundImage = `url(${thumb(video)})`; };
    probe.src = thumbHi(video);

    // 데스크톱: 넷플릭스처럼 히어로에서 예고편이 음소거 자동 재생
    if (isDesktop()) {
      setTimeout(() => {
        const wrap = document.getElementById("heroVideo");
        if (!wrap) return;
        wrap.innerHTML = `
          <iframe
            src="https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.videoId}&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1"
            title="" tabindex="-1"
            allow="autoplay; encrypted-media"
            referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
        setTimeout(() => wrap.classList.add("on"), 1200);
      }, 900);
    }
  }

  /* ---------- Cards ---------- */
  function cardHTML(v) {
    const isNew = (v.year || 0) >= 2026;
    return `
      <div class="card" data-id="${v.id}" title="${v.title}" role="button" tabindex="0" aria-label="${v.title} 재생">
        ${isNew ? '<span class="new-badge">NEW</span>' : ""}
        <img class="card-thumb" loading="lazy" src="${thumb(v)}" alt="${v.title}">
        <div class="card-play">${PLAY_SVG}</div>
        <div class="card-overlay">
          <div class="card-title">${v.title}</div>
          <div class="card-sub"><span>${v.creator}</span><span class="tool-badge">${v.tool}</span></div>
        </div>
      </div>`;
  }

  function rankCardHTML(v, i) {
    return `
      <div class="rank-card">
        <span class="rank-num" aria-hidden="true">${i + 1}</span>
        <div class="card" data-id="${v.id}" title="${v.title}" role="button" tabindex="0" aria-label="TOP ${i + 1} ${v.title} 재생">
          <img class="card-thumb" loading="lazy" src="${thumb(v)}" alt="${v.title}">
          <div class="card-play">${PLAY_SVG}</div>
          <div class="card-overlay">
            <div class="card-title">${v.title}</div>
            <div class="card-sub"><span>${v.creator}</span><span class="tool-badge">${v.tool}</span></div>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Row scroll arrows ---------- */
  function addArrows(rowEl) {
    const scroller = rowEl.querySelector(".row-scroll");
    if (!scroller) return;
    const mk = (dir, svg) => {
      const b = document.createElement("button");
      b.className = `row-nav row-nav-${dir}`;
      b.innerHTML = svg;
      b.setAttribute("aria-label", dir === "l" ? "이전 작품" : "다음 작품");
      b.addEventListener("click", () => {
        scroller.scrollBy({ left: (dir === "l" ? -1 : 1) * scroller.clientWidth * 0.85, behavior: "smooth" });
      });
      return b;
    };
    rowEl.appendChild(mk("l", CHEV_L));
    rowEl.appendChild(mk("r", CHEV_R));
  }

  /* ---------- Rows ---------- */
  function renderRows(videos, withTop10) {
    const rowsEl = $("#rows");
    rowsEl.innerHTML = "";
    if (!videos.length) {
      rowsEl.innerHTML = '<p class="empty-note">검색 결과가 없어요. 다른 키워드로 찾아보세요.</p>';
      return;
    }

    // 오늘의 TOP 10 (넷플릭스 스타일 랭킹)
    if (withTop10 && typeof TOP10 !== "undefined") {
      const top = TOP10.map((id) => CATALOG.find((v) => v.id === id)).filter(Boolean);
      if (top.length) {
        const row = document.createElement("section");
        row.className = "row row-top10";
        row.id = "cat-top10";
        row.innerHTML = `
          <h2 class="row-title">오늘 전 세계 TOP 10 AI 시네마</h2>
          <div class="row-scroll">${top.map(rankCardHTML).join("")}</div>`;
        rowsEl.appendChild(row);
        addArrows(row);
      }
    }

    CATEGORIES.forEach((cat) => {
      const items = videos.filter((v) => v.category === cat.key);
      if (!items.length) return;
      const row = document.createElement("section");
      row.className = "row";
      row.id = `cat-${cat.key}`;
      row.innerHTML = `
        <h2 class="row-title">${cat.label}</h2>
        <div class="row-scroll">${items.map(cardHTML).join("")}</div>`;
      rowsEl.appendChild(row);
      addArrows(row);
    });

    rowsEl.querySelectorAll(".card").forEach((el) => {
      const play = () => {
        const v = CATALOG.find((x) => x.id === el.dataset.id);
        if (v) openPlayer(v);
      };
      el.addEventListener("click", play);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); }
      });
    });
  }

  /* ---------- Nav ---------- */
  function renderNav() {
    $("#nav").innerHTML =
      '<a href="#cat-top10">TOP 10</a>' +
      CATEGORIES.map((c) => `<a href="#cat-${c.key}">${c.label}</a>`).join("");
  }

  /* ---------- Player modal ---------- */
  function openPlayer(v) {
    $("#playerWrap").innerHTML = `
      <iframe
        src="https://www.youtube-nocookie.com/embed/${v.videoId}?autoplay=1&rel=0"
        title="${v.title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    $("#modalMeta").innerHTML = `
      <h3>${v.title}</h3>
      <p>${v.desc || ""}</p>
      <div class="meta-line">
        <span class="tool-badge">${v.tool}</span>
        <span style="color:var(--text-dim);font-size:13px;">${v.creator} · ${v.year || ""}</span>
        <a class="yt-link" href="https://www.youtube.com/watch?v=${v.videoId}" target="_blank" rel="noopener">재생이 안 되면 YouTube에서 보기 ↗</a>
      </div>`;
    $("#modal").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closePlayer() {
    $("#modal").hidden = true;
    $("#playerWrap").innerHTML = "";
    document.body.style.overflow = "";
  }

  /* ---------- Search ---------- */
  function applySearch(q) {
    q = q.trim().toLowerCase();
    if (!q) { renderRows(CATALOG, true); return; }
    const hits = CATALOG.filter((v) =>
      [v.title, v.creator, v.tool, v.desc, v.category]
        .join(" ").toLowerCase().includes(q)
    );
    renderRows(hits, false);
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    runSplash();
    const featured = CATALOG.find((v) => v.featured) || CATALOG[0];
    renderNav();
    renderHero(featured);
    renderRows(CATALOG, true);

    $("#modalClose").addEventListener("click", closePlayer);
    $("#modalBackdrop").addEventListener("click", closePlayer);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#modal").hidden) closePlayer();
    });
    $("#search").addEventListener("input", (e) => applySearch(e.target.value));
    window.addEventListener("scroll", () => {
      $("#header").classList.toggle("scrolled", window.scrollY > 40);
    });
  });
})();
