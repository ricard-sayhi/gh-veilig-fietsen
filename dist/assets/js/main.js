/* GH Veilig Fietsen: site behaviour. No dependencies. */
(() => {
  "use strict";
  const GH = window.GH;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("no-js");

  /* ---------------- Language ---------------- */
  let lang = "nl";
  try { lang = localStorage.getItem("gh-lang") === "en" ? "en" : "nl"; } catch (e) {}
  // Shareable links: ?lang=en / ?lang=nl overrides (and remembers) the choice
  const qLang = new URLSearchParams(location.search).get("lang");
  if (qLang === "en" || qLang === "nl") { lang = qLang; try { localStorage.setItem("gh-lang", lang); } catch (e) {} }
  const t = (nl, en) => (lang === "en" ? en : nl);
  const ATTRS = ["placeholder", "aria-label", "alt", "title", "content"];
  const renderers = [];
  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-en]").forEach((el) => {
      if (el.dataset.nl === undefined) el.dataset.nl = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.nl;
    });
    ATTRS.forEach((a) => {
      $$(`[data-en-${a}]`).forEach((el) => {
        const key = `nl${a.replace(/-./g, (m) => m[1].toUpperCase())}`;
        if (el.dataset[key] === undefined) el.dataset[key] = el.getAttribute(a) || "";
        el.setAttribute(a, lang === "en" ? el.getAttribute(`data-en-${a}`) : el.dataset[key]);
      });
    });
    const html = document.documentElement;
    if (!html.dataset.titleNl) html.dataset.titleNl = document.title;
    document.title = lang === "en" && html.dataset.titleEn ? html.dataset.titleEn : html.dataset.titleNl;
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    renderers.forEach((fn) => fn());
  }
  $$(".lang button").forEach((b) =>
    b.addEventListener("click", () => {
      lang = b.dataset.lang;
      try { localStorage.setItem("gh-lang", lang); } catch (e) {}
      applyLang();
    })
  );

  /* ---------------- Opening hours / status ---------------- */
  const DAYS = {
    nl: ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  };
  function nowAms() {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
        .formatToParts(new Date()).map((x) => [x.type, x.value])
    );
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    return { day, mins: (+p.hour % 24) * 60 + +p.minute };
  }
  const toMin = (s) => { const [h, m] = s.split(":"); return +h * 60 + +m; };
  function status() {
    const { day, mins } = nowAms();
    const today = GH.hours[day];
    if (today && mins >= toMin(today[0]) && mins < toMin(today[1]))
      return { open: true, text: t(`Nu open · tot ${today[1]}`, `Open now · until ${today[1]}`) };
    if (today && mins < toMin(today[0]))
      return { open: false, text: t(`Gesloten · opent om ${today[0]}`, `Closed · opens at ${today[0]}`) };
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7, h = GH.hours[d];
      if (h) {
        const when = i === 1 ? t("morgen", "tomorrow") : DAYS[lang][d].toLowerCase();
        return { open: false, text: t(`Gesloten · opent ${when} ${h[0]}`, `Closed · opens ${when} ${h[0]}`) };
      }
    }
    return { open: false, text: t("Gesloten", "Closed") };
  }
  function renderStatus() {
    const s = status();
    $$(".js-status").forEach((el) => {
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
      el.innerHTML = `<span class="dot" aria-hidden="true"></span><span>${s.text}</span>`;
    });
  }
  function renderHours() {
    const { day } = nowAms();
    const order = [1, 2, 3, 4, 5, 6, 0];
    $$(".js-hours").forEach((tbl) => {
      tbl.innerHTML = `<caption class="sr-only">${t("Openingstijden", "Opening hours")}</caption><tbody>${order
        .map((d) => {
          const h = GH.hours[d];
          return `<tr class="${d === day ? "is-today" : ""}"><th scope="row" data-today="${t("vandaag", "today")}">${DAYS[lang][d]}</th><td>${h ? `${h[0]} – ${h[1]}` : t("Gesloten", "Closed")}</td></tr>`;
        })
        .join("")}</tbody>`;
    });
  }
  renderers.push(renderStatus, renderHours);
  setInterval(renderStatus, 60000);

  /* ---------------- Header ---------------- */
  const header = $(".header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", scrollY > 30);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $(".burger"), nav = $(".nav"), scrim = $(".scrim");
  function setMenu(open) {
    if (!burger) return;
    burger.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    scrim.classList.toggle("is-on", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $("a", nav).focus();
  }
  burger && burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  scrim && scrim.addEventListener("click", () => setMenu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); } });
  matchMedia("(min-width: 1100px)").addEventListener("change", () => setMenu(false));

  /* ---------------- Reveal on scroll ---------------- */
  function observeReveals(root = document) {
    const els = $$(".reveal:not(.is-in)", root);
    if (reduceMotion || !("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("is-in"));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
  }
  $$(".reveal-stagger").forEach((p) => [...p.children].forEach((c, i) => c.style.setProperty("--i", i)));

  /* ---------------- Bikes ---------------- */
  const TYPES = {
    stadsfiets: ["Stadsfiets", "City bike"], omafiets: ["Omafiets", "Granny bike"], opafiets: ["Opafiets", "Granddad bike"],
    transportfiets: ["Transportfiets", "Transport bike"], ebike: ["E-bike", "E-bike"], kinderfiets: ["Kinderfiets", "Kids' bike"]
  };
  const COND = { new: ["Nieuw", "New"], likenew: ["Zo goed als nieuw", "Like new"], good: ["Goed", "Good"], used: ["Gebruikt", "Used"] };
  const fmt = (n) => n.toLocaleString("nl-NL");

  function bikeSVG(b) {
    const kid = b.type === "kinderfiets";
    const step = b.step, transport = b.type === "transportfiets", ebike = b.type === "ebike", rack = ["omafiets", "opafiets", "transportfiets", "ebike"].includes(b.type);
    const wheel = (cx) => `<g><circle cx="${cx}" cy="205" r="64" fill="none" stroke="#0d0d0d" stroke-width="9"/><circle cx="${cx}" cy="205" r="54" fill="none" stroke="#0d0d0d" stroke-width="1.5" opacity=".5"/>${[0, 30, 60, 90, 120, 150].map((a) => `<line x1="${cx + 54 * Math.cos((a * Math.PI) / 180)}" y1="${205 + 54 * Math.sin((a * Math.PI) / 180)}" x2="${cx - 54 * Math.cos((a * Math.PI) / 180)}" y2="${205 - 54 * Math.sin((a * Math.PI) / 180)}" stroke="#0d0d0d" stroke-width="1.2" opacity=".55"/>`).join("")}<circle cx="${cx}" cy="205" r="7" fill="#0d0d0d"/></g>`;
    const top = step ? `<path d="M262 138 C 230 150, 205 165, 196 200" />` : `<path d="M172 120 L266 116" />`;
    const body = `
      <g fill="none" stroke="#0d0d0d" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
        <path d="M196 205 L172 112" /> ${top}
        <path d="M196 205 L266 122" /><path d="M196 205 L110 205" /><path d="M174 122 L110 205" />
        <path d="M268 100 L290 205" />
        <path d="M268 100 L262 80 C 250 74, 236 76, 226 86" stroke-width="7"/>
        ${rack ? `<path d="M112 140 L182 140 M120 140 L112 205" stroke-width="5"/>` : ""}
        ${transport ? `<path d="M276 128 L322 128" stroke-width="5"/>` : ""}
      </g>
      ${transport ? `<rect x="272" y="96" width="62" height="32" fill="none" stroke="#0d0d0d" stroke-width="5"/><path d="M285 96v32M298 96v32M311 96v32M324 96v32" stroke="#0d0d0d" stroke-width="2"/>` : ""}
      ${ebike ? `<rect x="118" y="124" width="62" height="14" rx="4" fill="#0d0d0d"/><circle cx="196" cy="205" r="16" fill="#0d0d0d"/>` : `<circle cx="196" cy="205" r="12" fill="none" stroke="#0d0d0d" stroke-width="5"/>`}
      <path d="M152 104 L190 104 L184 114 L156 112 Z" fill="#0d0d0d"/>
      <path d="M222 82 l-10 6" stroke="#0d0d0d" stroke-width="10" stroke-linecap="round"/>
      ${["omafiets", "opafiets", "transportfiets"].includes(b.type) ? `<path d="M110 205 m-70 -24 a74 74 0 0 1 74 -48" fill="none" stroke="#0d0d0d" stroke-width="4"/><path d="M290 205 m-24 -70 a74 74 0 0 1 70 46" fill="none" stroke="#0d0d0d" stroke-width="4"/>` : ""}
      <circle cx="278" cy="112" r="6" fill="#ffffff" stroke="#0d0d0d" stroke-width="3"/>`;
    const g = `${wheel(110)}${wheel(290)}${body}`;
    return `<svg viewBox="0 0 400 300" role="img" aria-label="${t("Illustratie", "Illustration")}: ${TYPES[b.type][lang === "en" ? 1 : 0]}">
      <rect width="400" height="300" fill="#f2f2f2"/>
      <path d="M0 270 H400" stroke="#d9d9d9" stroke-width="2"/>
      <ellipse cx="200" cy="272" rx="150" ry="6" fill="#0d0d0d" opacity=".08"/>
      <g ${kid ? 'transform="translate(200 272) scale(.74) translate(-200 -268)"' : ""}>${g}</g>
    </svg>`;
  }

  const ICON = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
  function bikeCard(b) {
    const ty = TYPES[b.type][lang === "en" ? 1 : 0];
    const cond = COND[b.condition][lang === "en" ? 1 : 0];
    const size = b.type === "kinderfiets" ? `${b.frame}"` : `${b.frame} cm`;
    const msg = encodeURIComponent(t(`Hoi! Is de ${b.name} (${ty}, € ${fmt(b.price)}) nog beschikbaar? Ik wil hem graag reserveren.`, `Hi! Is the ${b.name} (${ty}, € ${fmt(b.price)}) still available? I'd like to reserve it.`));
    return `<article class="bike swing reveal">
      <div class="bike__media${b.photo && b.fit === "contain" ? " bike__media--cutout" : ""}">${b.photo ? `<img src="${b.photo}" alt="${b.name}, ${ty}" loading="lazy" width="800" height="600">` : bikeSVG(b)}
        ${b.photo && b.credit ? `<a class="bike__credit" href="${b.credit.url}" target="_blank" rel="noopener">${t("Voorbeeldfoto", "Example photo")} · ${b.credit.by} · ${b.credit.license}</a>` : ""}
        <span class="chip ${b.isNew ? "chip--red" : "chip--ink"} bike__cond">${cond}</span>
        <span class="sticker" aria-label="${t("Prijs", "Price")} € ${fmt(b.price)}"><span><small>${t("nu", "now")}</small><b><sup>€</sup>${fmt(b.price)}</b></span></span>
      </div>
      <div class="bike__body">
        <p class="bike__type">${ty} · ${b.isNew ? t("Nieuw", "New") : t("Tweedehands", "Secondhand")}</p>
        <h3>${b.name}</h3>
        <ul class="specs">
          <li>${ICON("frame")}${t("Frame", "Frame")} ${size}</li>
          <li>${ICON("gear")}${b.gears === 1 ? t("Geen versnellingen", "Single speed") : `${b.gears} ${t("versnellingen", "gears")}`}</li>
          <li>${ICON("check")}${t("Veiligheidscheck", "Safety checked")}</li>
        </ul>
        <div class="bike__actions">
          <a class="btn btn--red btn--sm" href="https://wa.me/${GH.whatsapp}?text=${msg}" target="_blank" rel="noopener">${ICON("whatsapp")}${t("Reserveer", "Reserve")}</a>
          <a class="btn btn--ghost btn--sm icon-btn" href="tel:${GH.phoneIntl}" aria-label="${t("Bel over", "Call about")} ${b.name}">${ICON("phone")}</a>
        </div>
      </div>
    </article>`;
  }

  // Featured on home
  const featured = $(".js-bikes-featured");
  if (featured) {
    renderers.push(() => {
      const n = +featured.dataset.limit || 4;
      featured.innerHTML = [...GH.bikes].sort((a, b) => a.price - b.price).slice(0, n).map(bikeCard).join("");
      observeReveals(featured);
    });
  }

  // Shop with filters
  const shop = $(".js-shop");
  if (shop) {
    const form = $(".js-filters");
    const grid = $(".js-shop-grid");
    const count = $(".js-shop-count");
    const priceIn = $("#f-price");
    const maxPrice = Math.ceil(Math.max(...GH.bikes.map((b) => b.price)) / 50) * 50;
    priceIn.max = maxPrice; priceIn.value = maxPrice;
    const params = new URLSearchParams(location.search);
    if (params.get("type")) { const el = form.querySelector(`[name="type"][value="${params.get("type")}"]`); if (el) el.checked = true; }

    function filtered() {
      const fd = new FormData(form);
      const types = fd.getAll("type"), state = fd.get("state"), size = fd.get("size"), gears = fd.get("gears"), max = +fd.get("price");
      let list = GH.bikes.filter((b) =>
        (!types.length || types.includes(b.type)) &&
        (state === "all" || (state === "new") === b.isNew) &&
        (size === "all" || (b.type === "kinderfiets" ? size === "kids" : size === "s" ? b.frame <= 50 : size === "m" ? b.frame > 50 && b.frame <= 56 : size === "l" ? b.frame > 56 && b.frame <= 59 : size === "xl" ? b.frame > 59 : false)) &&
        (gears === "all" || (gears === "1" ? b.gears === 1 : gears === "3" ? b.gears > 1 && b.gears <= 3 : b.gears > 3)) &&
        b.price <= max
      );
      const sort = $("#f-sort").value;
      list.sort((a, b) => (sort === "desc" ? b.price - a.price : sort === "new" ? Number(b.isNew) - Number(a.isNew) || a.price - b.price : a.price - b.price));
      return list;
    }
    function renderShop() {
      $(".js-price-out").textContent = `€ ${fmt(+priceIn.value)}`;
      const list = filtered();
      count.textContent = t(`${list.length} ${list.length === 1 ? "fiets" : "fietsen"} gevonden`, `${list.length} ${list.length === 1 ? "bike" : "bikes"} found`);
      grid.innerHTML = list.length
        ? list.map(bikeCard).join("")
        : `<div class="empty" style="grid-column:1/-1"><h3>${t("Geen match. Toch even vragen?", "No match. Still worth asking?")}</h3><p>${t("Onze voorraad wisselt elke dag. App ons wat je zoekt, dan houden we je op de hoogte.", "Our stock changes every day. WhatsApp us what you're after and we'll let you know.")}</p><a class="btn btn--red" href="https://wa.me/${GH.whatsapp}" target="_blank" rel="noopener">${ICON("whatsapp")}WhatsApp</a></div>`;
      observeReveals(grid);
    }
    form.addEventListener("input", renderShop);
    $("#f-sort").addEventListener("change", renderShop);
    form.addEventListener("reset", () => setTimeout(() => { priceIn.value = maxPrice; renderShop(); }));
    const tog = $(".filters__toggle");
    tog && tog.addEventListener("click", () => { const o = form.classList.toggle("is-open"); tog.setAttribute("aria-expanded", String(o)); });
    renderers.push(renderShop);
  }

  /* ---------------- Price lists ---------------- */
  const repairGrid = $(".js-repairs");
  repairGrid && renderers.push(() => {
    repairGrid.innerHTML = GH.repairs.map((r) => `<li class="fix">
        <h3 class="fix__name">${t(r.nl, r.en)}</h3>
        <ul class="fix__rows">${r.rows.map((row) => `<li>
          <span class="fix__label">${t(row.nl, row.en)}${row.note ? `<small>${t(row.note.nl, row.note.en)}</small>` : ""}</span>
          <span class="fix__price">${row.from ? `<small>${t("vanaf", "from")}</small>` : ""}<b>€ ${row.price}</b></span>
        </li>`).join("")}</ul>
        ${r.canFix ? `<p class="fix__canfix">${ICON("wrench")}${t("Repareren kan ook. We kijken eerst in de winkel.", "We can also repair yours. We check it in the shop first.")}</p>` : ""}
      </li>`).join("");
  });

  // Everything else we fix: self-scrolling carousel (marquee), no prices (quoted in the shop)
  const svcTrack = $(".js-services");
  if (svcTrack) {
    const box = svcTrack.closest(".svc-carousel");
    const toggle = $(".svc-carousel__toggle", box);
    let paused = false;
    renderers.push(() => {
      const wa = `https://wa.me/${GH.whatsapp}?text=${encodeURIComponent(t("Hoi! Kunnen jullie dit maken aan mijn fiets: ", "Hi! Can you fix this on my bike: "))}`;
      const items = GH.services.map((v) => `<li class="svc">${ICON(v.icon)}<span>${t(v.nl, v.en)}</span></li>`).join("") +
        `<li class="svc svc--more"><a href="${wa}" target="_blank" rel="noopener">${ICON("whatsapp")}<span>${t("Iets anders? Vraag het ons", "Something else? Ask us")}</span></a></li>`;
      svcTrack.innerHTML = items;
      if (!reduceMotion) {
        // second copy makes the loop seamless; hidden from screen readers and keyboard
        const clone = document.createElement("div");
        clone.innerHTML = items;
        [...clone.children].forEach((li) => { li.setAttribute("aria-hidden", "true"); li.querySelectorAll("a").forEach((x) => x.setAttribute("tabindex", "-1")); svcTrack.appendChild(li); });
        requestAnimationFrame(() => svcTrack.style.setProperty("--dur", `${Math.round(svcTrack.scrollWidth / 2 / 40)}s`)); // ~40px per second
      }
      toggle.setAttribute("aria-label", paused ? t("Afspelen", "Play") : t("Pauzeren", "Pause"));
    });
    if (reduceMotion) { box.classList.add("is-static"); toggle.hidden = true; }
    toggle.addEventListener("click", () => {
      paused = !paused;
      box.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? t("Afspelen", "Play") : t("Pauzeren", "Pause"));
    });
  }

  const rentalList = $(".js-rental");
  rentalList && renderers.push(() => {
    rentalList.innerHTML = GH.rental.map((r) => `<article class="card plan swing ${r.hot ? "plan--hot" : ""}">
      ${r.hot ? `<span class="chip chip--red">${t("Populair", "Popular")}</span>` : ""}
      <h3>${t("Per", "Per")} ${t(r.nl.toLowerCase(), r.en.toLowerCase())}</h3>
      <span class="sticker"><span><small>${t("per", "per")} ${t(r.nl.toLowerCase(), r.en.toLowerCase())}</small><b>${r.price.replace("€ ", "<sup>€</sup>")}</b></span></span>
      <p>${t(r.sub.nl, r.sub.en)}</p>
      <a class="btn btn--ghost btn--sm" href="#huuraanvraag">${t("Aanvragen", "Request")}</a>
    </article>`).join("");
  });

  /* ---------------- Reviews ---------------- */
  const reviewGrid = $(".js-reviews");
  reviewGrid && renderers.push(() => {
    const n = +reviewGrid.dataset.limit || 6;
    const real = GH.reviews.slice(0, n);
    reviewGrid.innerHTML = real.length
      ? real.map((r) => `<article class="review reveal"><div class="stars" aria-label="${r.stars} ${t("van 5 sterren", "out of 5 stars")}">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div><blockquote><p>${r.text}</p></blockquote><footer><span>${r.name}</span><span class="muted">Google</span></footer></article>`).join("")
      : Array.from({ length: Math.min(n, 3) }, () => `<article class="review review--slot"><p><strong>${t("Plek voor een echte Google-review", "Space for a real Google review")}</strong><br>${t("Wordt gevuld met reviews van klanten, met hun toestemming.", "To be filled with real customer reviews, with their permission.")}</p></article>`).join("");
    observeReveals(reviewGrid);
  });

  /* ---------------- Forms ---------------- */
  $$(".js-form").forEach((form) => {
    const msg = $(".form-msg", form);
    const fileInput = $('input[type="file"]', form);
    if (fileInput) fileInput.addEventListener("change", () => {
      const out = $(".js-file-names", form);
      out.textContent = fileInput.files.length ? [...fileInput.files].map((f) => f.name).join(", ") : "";
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const btn = $('button[type="submit"]', form);
      btn.classList.add("is-loading"); btn.disabled = true;
      const fd = new FormData(form);
      const lines = [`${form.dataset.subject}`];
      const seen = new Set();
      for (const [k, v] of fd.entries()) {
        if (v instanceof File || seen.has(k) || !v) continue;
        seen.add(k);
        const label = form.querySelector(`[name="${k}"]`)?.dataset.label || k;
        lines.push(`${label}: ${fd.getAll(k).join(", ")}`);
      }
      try {
        if (GH.formEndpoint) {
          const r = await fetch(GH.formEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
          if (!r.ok) throw new Error();
          msg.innerHTML = t("Bedankt! We hebben je aanvraag. Je hoort snel van ons, meestal binnen een uur tijdens openingstijden.", "Thanks! We've got your request. You'll hear from us soon, usually within the hour during opening hours.");
          form.reset();
        } else {
          const hasFiles = fileInput && fileInput.files.length;
          if (hasFiles) lines.push(t("(Foto's stuur ik hierna in deze chat.)", "(I'll send the photos in this chat next.)"));
          window.open(`https://wa.me/${GH.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
          msg.innerHTML = t(`WhatsApp is geopend met je bericht. Even op verzenden drukken${hasFiles ? " en daarna je foto's sturen" : ""}. Liever bellen? <a href="tel:${GH.phoneIntl}">${GH.phoneDisplay}</a>`, `WhatsApp opened with your message. Just hit send${hasFiles ? ", then send your photos" : ""}. Rather call? <a href="tel:${GH.phoneIntl}">${GH.phoneDisplay}</a>`);
        }
      } catch (err) {
        msg.innerHTML = t(`Er ging iets mis. Bel ons even op <a href="tel:${GH.phoneIntl}">${GH.phoneDisplay}</a>.`, `Something went wrong. Please call us on <a href="tel:${GH.phoneIntl}">${GH.phoneDisplay}</a>.`);
      }
      msg.classList.add("is-on");
      msg.setAttribute("tabindex", "-1"); msg.focus();
      btn.classList.remove("is-loading"); btn.disabled = false;
    });
  });
  // Minimum date for date inputs = today
  $$('input[type="date"]').forEach((i) => (i.min = new Date().toISOString().slice(0, 10)));

  /* ---------------- Map (loads on request: faster + no Google cookies until asked) ---------------- */
  $$(".js-map-load").forEach((b) =>
    b.addEventListener("click", () => {
      const box = b.closest(".map");
      b.classList.add("is-loading");
      const f = document.createElement("iframe");
      f.title = t("Kaart: GH Veilig Fietsen, Lange Jansstraat 26 Utrecht", "Map: GH Veilig Fietsen, Lange Jansstraat 26 Utrecht");
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.src = `https://www.google.com/maps?q=${encodeURIComponent(GH.mapsQuery)}&z=16&output=embed`;
      f.addEventListener("load", () => $(".map__ph", box)?.remove());
      box.appendChild(f);
    })
  );

  /* ---------------- Misc ---------------- */
  $$(".js-year").forEach((e) => (e.textContent = new Date().getFullYear()));

  applyLang();
  observeReveals();
})();
