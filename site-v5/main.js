(() => {
  "use strict";

  /* ---------------------------------------------------------------
     Correct in-page anchor landing on a hard page load with a #hash
     (e.g. a direct link to #tour). Two problems compound here:
     the browser's native jump-to-anchor races the page's images, and
     `loading="lazy"` images below the target don't block the `load`
     event at all — they keep fetching (and growing the page height)
     well after `load` fires. A single re-scroll isn't enough, so this
     keeps re-correcting until the target's position stops moving.
  --------------------------------------------------------------- */
  if (location.hash) {
    const hashTarget = document.querySelector(location.hash);
    if (hashTarget) {
      const html = document.documentElement;
      const prevScrollBehavior = html.style.scrollBehavior;
      // force instant jumps during correction — CSS scroll-behavior:smooth
      // would otherwise animate each attempt, so a check right after
      // calling scrollIntoView could catch it mid-flight and read a
      // "stable" position that isn't actually where it's headed
      html.style.scrollBehavior = "auto";
      let lastTop = null;
      let stableFor = 0;
      let tries = 0;
      const settle = () => {
        hashTarget.scrollIntoView({ behavior: "auto", block: "start" });
        const top = Math.round(hashTarget.getBoundingClientRect().top);
        stableFor = top === lastTop ? stableFor + 1 : 0;
        lastTop = top;
        tries++;
        if (stableFor < 3 && tries < 40) {
          window.setTimeout(settle, 50);
        } else {
          html.style.scrollBehavior = prevScrollBehavior;
        }
      };
      if (document.readyState === "complete") settle();
      else window.addEventListener("load", settle);
    }
  }

  /* ---------------------------------------------------------------
     Footer year
  --------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     Nav: scrolled state + scroll progress bar + active link
  --------------------------------------------------------------- */
  const nav = document.getElementById("siteNav");
  const progressFill = document.getElementById("progressFill");
  const navLinks = Array.from(document.querySelectorAll(".nav__links a, .mobile-menu a[href^='#']"));
  const sections = ["leistungen", "portfolio", "tour", "prozess", "kontakt"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = (doc.scrollHeight - doc.clientHeight) || 1;
      const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
      if (progressFill) progressFill.style.width = pct + "%";

      if (nav) nav.classList.toggle("is-scrolled", scrollTop > 40);

      let currentId = "";
      const probe = scrollTop + window.innerHeight * 0.32;
      sections.forEach((sec) => {
        if (probe >= sec.offsetTop) currentId = sec.id;
      });
      navLinks.forEach((a) => {
        const match = a.getAttribute("href") === "#" + currentId;
        a.classList.toggle("is-active", match);
      });

      ticking = false;
    });
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const menuBackdrop = document.getElementById("menuBackdrop");

  function closeMenu() {
    burger?.setAttribute("aria-expanded", "false");
    mobileMenu?.classList.remove("is-open");
    menuBackdrop?.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function openMenu() {
    burger?.setAttribute("aria-expanded", "true");
    mobileMenu?.classList.add("is-open");
    menuBackdrop?.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  burger?.addEventListener("click", () => {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });
  menuBackdrop?.addEventListener("click", closeMenu);
  mobileMenu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------------------------------------------------------------
     Smooth scroll for data-scroll-to triggers (hero orb button)
  --------------------------------------------------------------- */
  document.querySelectorAll("[data-scroll-to]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = document.querySelector(el.getAttribute("data-scroll-to"));
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------------- */
  const revealItems = document.querySelectorAll(".reveal");
  let revealObserver = null;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------
     Lightbox galleries
  --------------------------------------------------------------- */
  const GALLERIES = {
    produkt: {
      title: "Produktvisualisierung",
      images: [
        { src: "assets/img/product-grill.jpg", caption: "Kontaktgrill · Studio-Rendering", w: 1600, h: 893 },
        { src: "assets/img/product-shaver.jpg", caption: "Rasierer · Produktshot", w: 1200, h: 1200 },
        { src: "assets/img/product-shaver-detail.jpg", caption: "Rasierer · Detailansicht", w: 1200, h: 1200 },
        { src: "assets/img/product-barware.jpg", caption: "Barware-Set · Edelstahl", w: 1600, h: 800 },
        { src: "assets/img/product-controller.jpg", caption: "Controller · Flatlay", w: 1600, h: 1600 },
        { src: "assets/img/product-lamp.jpg", caption: "Infrarotlampe · Studioshot", w: 1200, h: 1200 },
        { src: "assets/img/product-weatherstation.jpg", caption: "Wetterstation · Ambiente", w: 1400, h: 1400 },
        { src: "assets/img/product-radio.jpg", caption: "Solar-Radio · Outdoor-Ambiente", w: 1600, h: 1600 },
        { src: "assets/img/product-alarmclock.jpg", caption: "Lern-Wecker · Kinderzimmer-Ambiente", w: 1600, h: 1600 },
        { src: "assets/img/product-heatblanket.jpg", caption: "Wärmedecke · Wohnzimmer-Ambiente", w: 1600, h: 893 },
        { src: "assets/img/product-ledmask.jpg", caption: "LED-Gesichtsmaske · Beauty-Ambiente", w: 1600, h: 1600 }
      ]
    },
    moebel: {
      title: "Möbelvisualisierung",
      images: [
        { src: "assets/img/furniture-beige.jpg", caption: "Wohnwand · Beige Serie", w: 1800, h: 1004 },
        { src: "assets/img/furniture-livingroom.jpg", caption: "Wohnzimmer · Loft-Setting", w: 1800, h: 1004 },
        { src: "assets/img/furniture-oak.jpg", caption: "Vitrine &amp; Sideboard · Eiche", w: 1800, h: 1004 },
        { src: "assets/img/furniture-blue.jpg", caption: "Wohnwand · Blau/Messing", w: 1800, h: 1004 },
        { src: "assets/img/furniture-table.jpg", caption: "Klapptisch · Ambiente", w: 1400, h: 1400 },
        { src: "assets/img/furniture-mirror.jpg", caption: "LED-Spiegel · Bad-Ambiente", w: 1400, h: 1400 }
      ]
    },
    immobilien: {
      title: "Immobilienvisualisierung",
      images: [
        { src: "assets/img/realestate-exterior.jpg", caption: "Mehrfamilienhaus · Außenansicht", w: 1800, h: 1004 },
        { src: "assets/img/realestate-loft.jpg", caption: "Loft-Interieur · Bergblick", w: 1600, h: 1777 }
      ]
    }
  };

  /* ---------------------------------------------------------------
     Portfolio: build the filterable masonry grid from GALLERIES.
     All images also live in one flat, cross-category list (ALL_IMAGES)
     so the slideshow can keep scrolling into the next category instead
     of stopping at the edge of the category you clicked into.
  --------------------------------------------------------------- */
  const CATEGORY_LABELS = { produkt: "Produkt", moebel: "Möbel", immobilien: "Immobilien" };
  const refGrid = document.getElementById("refGrid");
  const refFilters = document.getElementById("refFilters");

  const ALL_IMAGES = [];
  Object.keys(GALLERIES).forEach((cat) => {
    GALLERIES[cat].images.forEach((img, idx) => {
      ALL_IMAGES.push({ ...img, category: cat, categoryIndex: idx });
    });
  });

  function zoomIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>';
  }

  function buildRefGrid() {
    if (!refGrid) return;
    ALL_IMAGES.forEach((img, flatIndex) => {
      const cat = img.category, idx = img.categoryIndex;
      const tile = document.createElement("button");
      tile.className = "ref-tile reveal";
      tile.setAttribute("data-category", cat);
      tile.setAttribute("aria-label", `${CATEGORY_LABELS[cat]} — ${img.caption} öffnen`);
      tile.style.transitionDelay = (Math.min(flatIndex + 1, 10) * 0.04) + "s";
      tile.innerHTML = `
        <div class="ref-tile__frame">
          <img src="${img.src}" alt="${img.caption}" loading="lazy" width="${img.w}" height="${img.h}">
          <div class="ref-tile__scrim" aria-hidden="true"></div>
          <div class="ref-tile__label">
            <div><span>${String(idx + 1).padStart(2, "0")} · ${CATEGORY_LABELS[cat]}</span><h4>${img.caption}</h4></div>
            <span class="ref-tile__zoom">${zoomIconSvg()}</span>
          </div>
        </div>`;
      tile.addEventListener("click", () => openGalleryAt(flatIndex));
      refGrid.appendChild(tile);

      if ("IntersectionObserver" in window) revealObserver.observe(tile);
      else tile.classList.add("is-visible");
    });
  }

  function applyRefFilter(filter) {
    if (!refGrid) return;
    refGrid.querySelectorAll(".ref-tile").forEach((tile) => {
      const show = filter === "alle" || tile.getAttribute("data-category") === filter;
      tile.classList.toggle("is-hidden", !show);
    });
  }

  refFilters?.querySelectorAll(".ref-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      refFilters.querySelectorAll(".ref-filter").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      applyRefFilter(btn.getAttribute("data-filter"));
    });
  });

  buildRefGrid();

  const lightbox = document.getElementById("lightbox");
  const lbFrame = document.getElementById("lbFrame");
  const lbTitle = document.getElementById("lbTitle");
  const lbCount = document.getElementById("lbCount");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  const lbClose = document.getElementById("lbClose");

  let activeIndex = -1;

  function renderLightbox() {
    if (activeIndex < 0) return;
    const img = ALL_IMAGES[activeIndex];
    lbTitle.textContent = `${GALLERIES[img.category].title} — ${img.caption}`;
    lbCount.textContent = `${activeIndex + 1} / ${ALL_IMAGES.length}`;
    lbFrame.innerHTML = "";
    const imgEl = document.createElement("img");
    imgEl.src = img.src;
    imgEl.alt = img.caption;
    lbFrame.appendChild(imgEl);
    requestAnimationFrame(() => imgEl.classList.add("is-active"));
  }

  function openGalleryAt(flatIndex) {
    if (flatIndex < 0 || flatIndex >= ALL_IMAGES.length) return;
    activeIndex = flatIndex;
    renderLightbox();
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function openGalleryCategory(cat) {
    const flatIndex = ALL_IMAGES.findIndex((img) => img.category === cat);
    openGalleryAt(flatIndex === -1 ? 0 : flatIndex);
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    activeIndex = -1;
  }
  function step(dir) {
    if (activeIndex < 0) return;
    activeIndex = (activeIndex + dir + ALL_IMAGES.length) % ALL_IMAGES.length;
    renderLightbox();
  }

  document.querySelectorAll("[data-open-gallery]:not(.ref-tile)").forEach((el) => {
    el.addEventListener("click", (e) => {
      const key = el.getAttribute("data-open-gallery");
      if (GALLERIES[key]) {
        e.preventDefault();
        openGalleryCategory(key);
      }
    });
  });

  lbPrev?.addEventListener("click", () => step(-1));
  lbNext?.addEventListener("click", () => step(1));
  lbClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  /* ---------------------------------------------------------------
     Contact form -> mailto
  --------------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const service = form.service.value;
    const message = form.message.value.trim();
    if (!name || !email || !message) {
      formStatus.textContent = "Bitte Name, E-Mail und Nachricht ausfüllen.";
      return;
    }
    const subject = `Projektanfrage — ${service}`;
    const body = `Name: ${name}\nE-Mail: ${email}\nLeistung: ${service}\n\n${message}`;
    const mailto = `mailto:bastian.suchowinski@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    formStatus.textContent = "Ihr E-Mail-Programm öffnet sich mit der vorausgefüllten Nachricht …";
  });

  /* ---------------------------------------------------------------
     Circuit / "Platinen" hover effect — PCB-trace flickers that
     shoot outward from the cursor in 45° steps. Accent-coloured on
     hover; a single click flashes them outward in rainbow + white.
  --------------------------------------------------------------- */
  const canvas = document.getElementById("boltCanvas");
  const ctx = canvas?.getContext("2d");
  let traces = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ACCENT_RGB = [236, 98, 88];
  const WHITE_RGB = [255, 255, 255];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, .service-card, .ref-tile, .contact-card, .form-card, .nav, .mobile-menu, .lightbox, .ref-filter, .hero__stage, .tour-panel";

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }

  // 8 outward directions snapped to 45° steps
  const DIRS = [0, 45, 90, 135, 180, 225, 270, 315];

  /**
   * A trace is a short polyline that "shoots" outward from (x,y) along
   * angleDeg, kinking only in further 45° steps — reads as a PCB spark.
   */
  function spawnTrace(x, y, angleDeg, opts = {}) {
    const rgb = opts.rgb || ACCENT_RGB;
    const length = opts.length || 26 + Math.random() * 30;
    const segments = opts.segments || 2 + Math.floor(Math.random() * 2);
    const flash = !!opts.flash;
    const points = [{ x, y }];
    let dir = angleDeg;
    let cx = x, cy = y;
    const segLen = length / segments;
    for (let i = 0; i < segments; i++) {
      if (i > 0 && Math.random() < 0.45) dir += Math.random() < 0.5 ? 45 : -45;
      const rad = (dir * Math.PI) / 180;
      cx += Math.cos(rad) * segLen;
      cy += Math.sin(rad) * segLen;
      points.push({ x: cx, y: cy });
    }
    traces.push({
      points, life: 0,
      maxLife: opts.maxLife || (flash ? 30 + Math.random() * 12 : 40 + Math.random() * 18),
      width: opts.width || (flash ? 1.6 + Math.random() * 1.2 : 0.9 + Math.random() * 0.8),
      rgb, flash
    });
    if (traces.length > 90) traces.splice(0, traces.length - 90);
  }

  function snapAngle(dx, dy) {
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    return Math.round(deg / 45) * 45;
  }

  /* --- smooth hover trail: interpolate along the mouse path so fast
     movement still reads as a continuous trail instead of gaps --- */
  let lastPoint = null;
  const STEP = 26; // px between spawn points along the path

  function handleMove(e) {
    if (prefersReducedMotion) return;
    const target = e.target;
    if (target && target.closest && target.closest(INTERACTIVE_SELECTOR)) return;
    const x = e.clientX, y = e.clientY;

    if (!lastPoint) { lastPoint = { x, y }; return; }
    const dx = x - lastPoint.x, dy = y - lastPoint.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) return;

    if (isDown) {
      // while held, keep it flowing but let the interval handle the big bursts
      lastPoint = { x, y };
      return;
    }

    const angle = snapAngle(dx, dy);
    const steps = Math.min(Math.floor(dist / STEP), 6);
    for (let i = 1; i <= Math.max(steps, 1); i++) {
      const t = Math.min(i / Math.max(steps, 1), 1);
      const px = lastPoint.x + dx * t;
      const py = lastPoint.y + dy * t;
      if (Math.random() < 0.85) spawnTrace(px, py, angle);
    }
    lastPoint = { x, y };
  }
  window.addEventListener("mousemove", handleMove, { passive: true });
  window.addEventListener("mouseleave", () => { lastPoint = null; });

  /* --- click: a single rainbow + white starburst on mousedown. (Used to
     keep re-bursting with growing reach for as long as the button stayed
     held down — that repeat was removed; only the one-shot burst remains.) --- */
  let isDown = false;
  let holdPoint = null;

  function rainbowBurst(x, y, reach) {
    const t = performance.now() / 6;
    DIRS.forEach((angle, i) => {
      const white = i % 4 === 1;
      const rgb = white ? WHITE_RGB : hslToRgb(t + angle * 1.5, 1, 0.6);
      spawnTrace(x, y, angle, {
        rgb, flash: true,
        length: reach, segments: 3,
        width: 2 + Math.random() * 1.4,
        maxLife: 34 + Math.random() * 16
      });
    });
  }

  function startPress(x, y) {
    isDown = true;
    holdPoint = { x, y };
    rainbowBurst(x, y, 46);
  }
  function endPress() {
    isDown = false;
    holdPoint = null;
  }

  window.addEventListener("mousedown", (e) => {
    if (prefersReducedMotion) return;
    const target = e.target;
    if (target && target.closest && target.closest(INTERACTIVE_SELECTOR)) return;
    startPress(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", (e) => { if (isDown && holdPoint) holdPoint = { x: e.clientX, y: e.clientY }; }, { passive: true });
  window.addEventListener("mouseup", endPress);
  window.addEventListener("blur", endPress);

  function drawTraces() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    traces.forEach((t) => {
      t.life += 1;
      const p = t.life / t.maxLife;
      const alpha = p < 0.16 ? p / 0.16 : Math.max(0, 1 - (p - 0.16) / 0.84);
      if (alpha <= 0) return;
      const [r, g, b] = t.rgb;
      const a = alpha * (t.flash ? 0.85 : 0.55);
      ctx.save();
      ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
      ctx.shadowColor = `rgba(${r},${g},${b},${alpha * 0.7})`;
      ctx.shadowBlur = t.flash ? 12 : 7;
      ctx.lineWidth = t.width;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      t.points.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.stroke();
      ctx.fillStyle = `rgba(${Math.min(r + 20, 255)},${Math.min(g + 20, 255)},${Math.min(b + 20, 255)},${a})`;
      const first = t.points[0], last = t.points[t.points.length - 1];
      ctx.beginPath(); ctx.arc(first.x, first.y, t.flash ? 2.2 : 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(last.x, last.y, t.flash ? 2.2 : 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    traces = traces.filter((t) => t.life < t.maxLife);
    requestAnimationFrame(drawTraces);
  }
  if (!prefersReducedMotion) requestAnimationFrame(drawTraces);

})();
