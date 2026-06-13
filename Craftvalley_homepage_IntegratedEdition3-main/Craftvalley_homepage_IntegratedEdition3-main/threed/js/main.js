// ================================================================
// CRAFTVALLEY — STYLISH VERSION — MAIN JS
// ================================================================

(function () {
  "use strict";

  // ── Language ──────────────────────────────────────────────────
  window.CV_LANG = localStorage.getItem("cv_lang") || "en";

  function setLang(lang) {
    window.CV_LANG = lang;
    localStorage.setItem("cv_lang", lang);
    applyTranslations();
    updateLangToggle();
    document.documentElement.lang = lang;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = getT(key);
      if (val !== undefined && val !== key) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      var val = getT(key);
      if (val !== undefined && val !== key) el.innerHTML = val;
    });
  }

  function getT(key) {
    if (typeof T === "undefined") return key;
    var lang = window.CV_LANG;
    var parts = key.split(".");
    var val = T[lang];
    for (var i = 0; i < parts.length; i++) {
      if (val == null) return key;
      val = val[parts[i]];
    }
    return val != null ? val : key;
  }

  function updateLangToggle() {
    document.querySelectorAll(".nav-lang, .mobile-lang").forEach(function (btn) {
      btn.textContent = window.CV_LANG === "en" ? "日本語" : "English";
      btn.setAttribute("data-current-lang", window.CV_LANG);
    });
  }

  // ── Navigation ────────────────────────────────────────────────
  function initNav() {
    var nav = document.querySelector(".nav");
    var hamburger = document.querySelector(".nav-hamburger");
    var mobileNav = document.querySelector(".nav-mobile");

    // Scroll → add .scrolled class
    function onScroll() {
      if (window.scrollY > 40) {
        nav && nav.classList.add("scrolled");
      } else {
        nav && nav.classList.remove("scrolled");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Hamburger toggle
    if (hamburger && mobileNav) {
      hamburger.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        hamburger.classList.toggle("open", open);
        document.body.style.overflow = open ? "hidden" : "";
      });
      // Close on link click
      mobileNav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          mobileNav.classList.remove("open");
          hamburger.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
    }

    // Active nav link
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      if (a.getAttribute("href") === currentPage) a.classList.add("active");
    });
  }

  // ── Language toggle buttons ───────────────────────────────────
  function initLangToggle() {
    document.querySelectorAll(".nav-lang, .mobile-lang").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(window.CV_LANG === "en" ? "ja" : "en");
      });
    });
  }

  // ── Scroll animations ─────────────────────────────────────────
  function initScrollAnimations() {
    var items = document.querySelectorAll(".fade-in");
    if (!items.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(function (el) { observer.observe(el); });
  }

  // ── Product / News filter ─────────────────────────────────────
  function initFilters() {
    document.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.closest("[data-filter-group]");
        if (!group) return;
        var cat = btn.getAttribute("data-filter");
        group.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        group.querySelectorAll("[data-category]").forEach(function (item) {
          var itemCat = item.getAttribute("data-category");
          item.style.display = (cat === "all" || itemCat === cat) ? "" : "none";
        });
      });
    });
  }

  // ── Event tabs (upcoming / past preview) ─────────────────────
  function initEventTabs() {
    var tabs = document.querySelectorAll(".event-tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        tabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        document.querySelectorAll(".tab-pane").forEach(function (pane) {
          pane.style.display = pane.getAttribute("data-pane") === target ? "" : "none";
        });
      });
    });
  }

  // ── Calendar ──────────────────────────────────────────────────
  function initCalendar() {
    var calWrap = document.getElementById("cv-calendar");
    if (!calWrap) return;

    var today = new Date();
    var current = { year: today.getFullYear(), month: today.getMonth() };

    var allEvents = [];
    if (typeof CV_DATA !== "undefined") {
      CV_DATA.events.upcoming.forEach(function (e) { allEvents.push({ date: e.date, title: window.CV_LANG === "ja" ? e.titleJa : e.titleEn, type: "upcoming" }); });
      CV_DATA.events.past.forEach(function (e) { allEvents.push({ date: e.date, title: window.CV_LANG === "ja" ? e.titleJa : e.titleEn, type: "past" }); });
    }

    function render() {
      var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      var monthNamesJa = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
      var dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      var dayNamesJa = ["日","月","火","水","木","金","土"];
      var lang = window.CV_LANG;

      var firstDay = new Date(current.year, current.month, 1).getDay();
      var daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

      var monthLabel = lang === "ja"
        ? current.year + "年 " + monthNamesJa[current.month]
        : monthNames[current.month] + " " + current.year;

      calWrap.querySelector(".cal-month-title").textContent = monthLabel;

      var grid = calWrap.querySelector(".cal-grid");
      grid.innerHTML = "";

      // Day headers
      var days = lang === "ja" ? dayNamesJa : dayNames;
      days.forEach(function (d) {
        var cell = document.createElement("div");
        cell.className = "cal-header-cell";
        cell.textContent = d;
        grid.appendChild(cell);
      });

      // Empty cells
      for (var i = 0; i < firstDay; i++) {
        var empty = document.createElement("div");
        empty.className = "cal-cell empty";
        grid.appendChild(empty);
      }

      // Day cells
      for (var day = 1; day <= daysInMonth; day++) {
        var dateStr = current.year + "-" + pad(current.month + 1) + "-" + pad(day);
        var eventsOnDay = allEvents.filter(function (e) { return e.date === dateStr; });
        var isToday = today.getFullYear() === current.year && today.getMonth() === current.month && today.getDate() === day;

        var cell = document.createElement("div");
        cell.className = "cal-cell";
        if (isToday) cell.classList.add("today");
        if (eventsOnDay.some(function (e) { return e.type === "past"; })) cell.classList.add("has-past-event");
        if (eventsOnDay.some(function (e) { return e.type === "upcoming"; })) cell.classList.add("has-upcoming-event");

        cell.textContent = day;

        eventsOnDay.forEach(function (e) {
          var dot = document.createElement("div");
          dot.className = "cal-event-dot " + (e.type === "past" ? "dot-past" : "dot-upcoming");
          cell.appendChild(dot);
        });

        if (eventsOnDay.length) {
          (function (ev) {
            cell.addEventListener("click", function () {
              var popup = calWrap.querySelector(".cal-event-popup");
              popup.classList.add("visible");
              popup.innerHTML = ev.map(function (e) {
                return '<p style="margin-bottom:8px"><strong style="color:var(--gold)">' + e.date + '</strong> — ' + e.title + '</p>';
              }).join("");
            });
          })(eventsOnDay);
        }

        grid.appendChild(cell);
      }
    }

    function pad(n) { return n < 10 ? "0" + n : n; }

    calWrap.querySelector(".cal-prev").addEventListener("click", function () {
      current.month--;
      if (current.month < 0) { current.month = 11; current.year--; }
      render();
    });
    calWrap.querySelector(".cal-next").addEventListener("click", function () {
      current.month++;
      if (current.month > 11) { current.month = 0; current.year++; }
      render();
    });

    render();
    // Re-render on language switch
    document.addEventListener("cv-lang-change", render);
  }

  // ── Contact form ──────────────────────────────────────────────
  function initContactForm() {
    var form = document.getElementById("cv-contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".form-message");
      // Simulate submit (replace with real endpoint)
      setTimeout(function () {
        msg.textContent = getT("contact.success");
        msg.className = "form-message success visible";
        form.reset();
      }, 600);
    });
  }

  // ── Newsletter form ───────────────────────────────────────────
  function initNewsletterForm() {
    document.querySelectorAll(".footer-newsletter-form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = form.querySelector("button");
        btn.textContent = "✓";
        setTimeout(function () {
          btn.textContent = getT("footer.newsletterBtn");
          form.reset();
        }, 2000);
      });
    });
  }

  // ── Populate dynamic data ─────────────────────────────────────
  function populateProducers() {
    var grid = document.getElementById("producers-grid");
    if (!grid || typeof CV_DATA === "undefined") return;
    grid.innerHTML = "";
    var lang = window.CV_LANG;
    CV_DATA.producers.forEach(function (p, idx) {
      var card = document.createElement("a");
      card.href = "producer-detail.html?id=" + p.id;
      card.className = "producer-card fade-in fade-in-delay-" + (idx % 3 + 1);
      card.innerHTML =
        '<div class="producer-card-img">' +
          '<div class="image-placeholder"><span class="image-placeholder-label">🏔️</span>' +
          '<div class="image-placeholder-note">' + p.image + '</div></div>' +
        '</div>' +
        '<div class="producer-card-body">' +
          '<p class="producer-craft">' + (lang === "ja" ? p.craftJa : p.craftEn) + '</p>' +
          '<h3 class="producer-name">' + (lang === "ja" ? p.nameJa : p.nameEn) + '</h3>' +
          '<p class="producer-name-ja">' + (lang === "ja" ? p.nameEn : p.nameJa) + '</p>' +
          '<p class="producer-city">' + (lang === "ja" ? p.cityJa : p.city) + '</p>' +
        '</div>' +
        '<div class="producer-card-footer">' +
          '<span class="producer-card-link" data-i18n="producers.viewProfile">' + getT("producers.viewProfile") + '</span>' +
        '</div>';
      grid.appendChild(card);
    });
    initScrollAnimations();
  }

  function populateProducts() {
    var grid = document.getElementById("products-grid");
    if (!grid || typeof CV_DATA === "undefined") return;
    grid.innerHTML = "";
    var lang = window.CV_LANG;
    CV_DATA.products.forEach(function (p, idx) {
      var card = document.createElement("a");
      card.href = "product-detail.html?id=" + p.id;
      card.className = "product-card fade-in fade-in-delay-" + (idx % 3 + 1);
      card.setAttribute("data-category", p.category);
      card.innerHTML =
        '<div class="product-card-img">' +
          '<div class="image-placeholder"><span class="image-placeholder-label">🎁</span>' +
          '<div class="image-placeholder-note">' + p.image + '</div></div>' +
        '</div>' +
        '<div class="product-card-body">' +
          '<p class="product-category">' + p.category + '</p>' +
          '<h3 class="product-name">' + (lang === "ja" ? p.nameJa : p.nameEn) + '</h3>' +
          '<p class="product-name-ja">' + (lang === "ja" ? p.nameEn : p.nameJa) + '</p>' +
          '<p class="product-price">$' + p.price + ' <span>USD</span></p>' +
        '</div>';
      grid.appendChild(card);
    });
    initScrollAnimations();
  }

  function populateEventsPreview() {
    var upcomingList = document.getElementById("upcoming-events-list");
    var pastList = document.getElementById("past-events-list");
    if (!upcomingList || typeof CV_DATA === "undefined") return;

    var lang = window.CV_LANG;

    function renderEventItem(e, isPast) {
      var d = new Date(e.date);
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      var monthsJa = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
      var item = document.createElement("div");
      item.className = "event-item fade-in";
      item.innerHTML =
        '<div class="event-date-box">' +
          '<div class="event-month">' + (lang === "ja" ? monthsJa[d.getMonth()] : months[d.getMonth()]) + '</div>' +
          '<div class="event-day">' + d.getDate() + '</div>' +
          '<div class="event-year">' + d.getFullYear() + '</div>' +
        '</div>' +
        '<div class="event-info">' +
          '<p class="event-type">' + e.type + '</p>' +
          '<h3 class="event-title">' + (lang === "ja" ? e.titleJa : e.titleEn) + '</h3>' +
          '<p class="event-location">' + (lang === "ja" ? e.locationJa : e.locationEn) + '</p>' +
        '</div>' +
        '<span class="event-cta">' + (isPast ? (lang === "ja" ? "詳細" : "Details") : (lang === "ja" ? "詳細 →" : "Details →")) + '</span>';
      return item;
    }

    CV_DATA.events.upcoming.slice(0, 3).forEach(function (e) {
      upcomingList.appendChild(renderEventItem(e, false));
    });
    if (pastList) {
      CV_DATA.events.past.slice(0, 3).forEach(function (e) {
        pastList.appendChild(renderEventItem(e, true));
      });
    }
    initScrollAnimations();
  }

  function populateNewsPreview() {
    var grid = document.getElementById("news-grid");
    if (!grid || typeof CV_DATA === "undefined") return;
    var lang = window.CV_LANG;
    CV_DATA.news.slice(0, 4).forEach(function (n, idx) {
      var card = document.createElement("a");
      card.href = "news.html#" + n.id;
      card.className = "news-card fade-in fade-in-delay-" + (idx % 2 + 1);
      card.innerHTML =
        '<div class="news-card-img">' +
          '<div class="image-placeholder"><span class="image-placeholder-label">📰</span>' +
          '<div class="image-placeholder-note">' + n.image + '</div></div>' +
        '</div>' +
        '<div class="news-card-body">' +
          '<p class="news-cat">' + n.category + '</p>' +
          '<h3 class="news-title">' + (lang === "ja" ? n.titleJa : n.titleEn) + '</h3>' +
          '<p class="news-date">' + n.date + '</p>' +
        '</div>';
      grid.appendChild(card);
    });
    initScrollAnimations();
  }

  // ── Producer Detail page ──────────────────────────────────────
  function populateProducerDetail() {
    var wrap = document.getElementById("producer-detail-content");
    if (!wrap || typeof CV_DATA === "undefined") return;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var producer = CV_DATA.producers.find(function (p) { return p.id === id; });
    if (!producer) { wrap.innerHTML = "<p>Producer not found.</p>"; return; }
    var lang = window.CV_LANG;

    // Update page title
    document.title = (lang === "ja" ? producer.nameJa : producer.nameEn) + " — Craftvalley";

    // Related products
    var relatedProducts = CV_DATA.products.filter(function (p) { return producer.products.indexOf(p.id) > -1; });

    wrap.innerHTML =
      '<div class="producer-detail-grid">' +
        '<div class="producer-detail-img">' +
          '<div class="image-placeholder"><span class="image-placeholder-label">🏔️</span>' +
          '<div class="image-placeholder-note">' + producer.image + '</div></div>' +
        '</div>' +
        '<div class="producer-detail-info">' +
          '<span class="ja-label">' + (lang === "ja" ? producer.craftJa : producer.craftEn) + '</span>' +
          '<h1 class="section-heading">' + (lang === "ja" ? producer.nameJa : producer.nameEn) + '</h1>' +
          '<p style="color:var(--textm);font-size:18px;font-style:italic;margin-bottom:24px">' + (lang === "ja" ? producer.nameEn : producer.nameJa) + '</p>' +
          '<p style="color:var(--textm);font-size:16px;line-height:1.9;margin-bottom:24px">' + (lang === "ja" ? producer.bioJa : producer.bioEn) + '</p>' +
          '<div class="producer-meta">' +
            '<div class="meta-item"><p class="meta-label">' + getT("producers.established") + '</p><p class="meta-value">' + producer.established + '</p></div>' +
            '<div class="meta-item"><p class="meta-label">' + getT("producers.generation") + '</p><p class="meta-value">' + producer.generation + (lang === "ja" ? "代目" : "th Gen") + '</p></div>' +
            '<div class="meta-item"><p class="meta-label">Artisan</p><p class="meta-value">' + (lang === "ja" ? producer.artisanJa : producer.artisanEn) + '</p></div>' +
            '<div class="meta-item"><p class="meta-label">Location</p><p class="meta-value">' + (lang === "ja" ? producer.cityJa : producer.city) + '</p></div>' +
          '</div>' +
          '<div class="access-box">' +
            '<h4>' + getT("producers.access") + '</h4>' +
            '<p>' + (lang === "ja" ? producer.accessJa : producer.accessEn) + '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<h2 class="section-heading fade-in" style="margin-bottom:32px">' + getT("producers.products") + '</h2>' +
      '<div class="products-grid" id="producer-products-grid"></div>';

    var prodGrid = wrap.querySelector("#producer-products-grid");
    relatedProducts.forEach(function (p) {
      var card = document.createElement("a");
      card.href = "product-detail.html?id=" + p.id;
      card.className = "product-card";
      card.innerHTML =
        '<div class="product-card-img"><div class="image-placeholder"><span class="image-placeholder-label">🎁</span>' +
        '<div class="image-placeholder-note">' + p.image + '</div></div></div>' +
        '<div class="product-card-body"><p class="product-name">' + (lang === "ja" ? p.nameJa : p.nameEn) + '</p>' +
        '<p class="product-price">$' + p.price + '</p></div>';
      prodGrid.appendChild(card);
    });

    initScrollAnimations();
  }

  // ── Product Detail page ───────────────────────────────────────
  function populateProductDetail() {
    var wrap = document.getElementById("product-detail-content");
    if (!wrap || typeof CV_DATA === "undefined") return;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var product = CV_DATA.products.find(function (p) { return p.id === id; });
    if (!product) { wrap.innerHTML = "<p>Product not found.</p>"; return; }
    var lang = window.CV_LANG;
    var producer = CV_DATA.producers.find(function (p) { return p.id === product.producerId; });

    document.title = (lang === "ja" ? product.nameJa : product.nameEn) + " — Craftvalley";

    wrap.innerHTML =
      '<div class="product-detail-grid">' +
        '<div class="product-detail-img">' +
          '<div class="image-placeholder" style="aspect-ratio:1;min-height:400px">' +
          '<span class="image-placeholder-label">🎁</span>' +
          '<div class="image-placeholder-note">' + product.image + '</div></div>' +
        '</div>' +
        '<div class="product-detail-info">' +
          '<span class="ja-label">' + product.category + '</span>' +
          '<h1 class="section-heading">' + (lang === "ja" ? product.nameJa : product.nameEn) + '</h1>' +
          '<p style="color:var(--textm);font-size:16px;font-style:italic;margin-bottom:8px">' + (lang === "ja" ? product.nameEn : product.nameJa) + '</p>' +
          '<p class="product-detail-price">$' + product.price + ' <span style="font-size:14px;color:var(--textm)">USD</span></p>' +
          '<p class="product-detail-desc">' + (lang === "ja" ? product.descJa : product.descEn) + '</p>' +
          (producer ? '<p style="font-size:14px;color:var(--textm)">By <a href="producer-detail.html?id=' + producer.id + '" style="color:var(--gold)">' + (lang === "ja" ? producer.nameJa : producer.nameEn) + '</a></p>' : '') +
          '<div class="product-specs">' +
            '<div class="spec-row"><span class="spec-label">Material</span><span>' + (lang === "ja" ? product.materialJa : product.material) + '</span></div>' +
            '<div class="spec-row"><span class="spec-label">Dimensions</span><span>' + product.dimensions + '</span></div>' +
            '<div class="spec-row"><span class="spec-label">Weight</span><span>' + product.weight + '</span></div>' +
            '<div class="spec-row"><span class="spec-label">Stock</span><span style="color:var(--sage)">' + (product.inStock ? (lang === "ja" ? "在庫あり" : "In Stock") : "Out of Stock") + '</span></div>' +
          '</div>' +
          '<button class="btn-buy" data-i18n="products.buyNow">' + getT("products.buyNow") + '</button>' +
        '</div>' +
      '</div>';
  }

  // ── Full Events pages ──────────────────────────────────────────
  function populateFullEvents(type) {
    var list = document.getElementById("full-events-list");
    if (!list || typeof CV_DATA === "undefined") return;
    var lang = window.CV_LANG;
    var events = type === "upcoming" ? CV_DATA.events.upcoming : CV_DATA.events.past;
    list.innerHTML = "";
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var monthsJa = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

    events.forEach(function (e, idx) {
      var d = new Date(e.date);
      if (type === "upcoming") {
        var card = document.createElement("div");
        card.className = "event-card fade-in";
        card.innerHTML =
          '<div class="event-card-date">' +
            '<div class="month">' + (lang === "ja" ? monthsJa[d.getMonth()] : months[d.getMonth()]) + '</div>' +
            '<div class="day">' + d.getDate() + '</div>' +
            '<div class="year">' + d.getFullYear() + '</div>' +
          '</div>' +
          '<div class="event-card-info">' +
            '<span class="event-type-badge">' + e.type + '</span>' +
            '<h2 class="event-card-title">' + (lang === "ja" ? e.titleJa : e.titleEn) + '</h2>' +
            '<p class="event-card-location">📍 ' + (lang === "ja" ? e.locationJa : e.locationEn) + '</p>' +
            '<p class="event-card-desc">' + (lang === "ja" ? e.descJa : e.descEn) + '</p>' +
          '</div>' +
          '<div><a href="' + (e.registerUrl || "#") + '" class="event-register-btn" data-i18n="events.register">' + getT("events.register") + '</a></div>';
        list.appendChild(card);
      } else {
        var card2 = document.createElement("div");
        card2.className = "past-event-card fade-in";
        card2.innerHTML =
          '<div class="event-card-date">' +
            '<div class="month">' + (lang === "ja" ? monthsJa[d.getMonth()] : months[d.getMonth()]) + '</div>' +
            '<div class="day" style="font-size:28px">' + d.getDate() + '</div>' +
            '<div class="year">' + d.getFullYear() + '</div>' +
          '</div>' +
          '<div>' +
            '<h3 style="font-size:18px;margin-bottom:6px">' + (lang === "ja" ? e.titleJa : e.titleEn) + '</h3>' +
            '<p style="font-size:13px;color:var(--textm)">📍 ' + (lang === "ja" ? e.locationJa : e.locationEn) + '</p>' +
            '<p style="font-size:14px;color:var(--textm);margin-top:8px">' + (lang === "ja" ? e.descJa : e.descEn) + '</p>' +
          '</div>' +
          '<span class="past-summary-badge">' + (lang === "ja" ? (e.summaryJa || "") : (e.summary || "")) + '</span>';
        list.appendChild(card2);
      }
    });
    initScrollAnimations();
  }

  // ── News full page ─────────────────────────────────────────────
  function populateNewsPage() {
    var grid = document.getElementById("news-full-grid");
    if (!grid || typeof CV_DATA === "undefined") return;
    var lang = window.CV_LANG;
    CV_DATA.news.forEach(function (n) {
      var card = document.createElement("a");
      card.href = "#" + n.id;
      card.id = n.id;
      card.className = "news-full-card fade-in";
      card.setAttribute("data-category", n.category);
      card.innerHTML =
        '<div class="news-full-img"><div class="image-placeholder"><span class="image-placeholder-label">📰</span>' +
        '<div class="image-placeholder-note">' + n.image + '</div></div></div>' +
        '<div class="news-full-body">' +
          '<p class="news-cat">' + n.category + '</p>' +
          '<h2 class="news-title" style="font-size:22px;margin-bottom:10px">' + (lang === "ja" ? n.titleJa : n.titleEn) + '</h2>' +
          '<p style="font-size:14px;color:var(--textm);line-height:1.8;margin-bottom:12px">' + (lang === "ja" ? n.summaryJa : n.summaryEn) + '</p>' +
          '<p class="news-date">' + n.date + '</p>' +
          '<span class="news-read-more">' + getT("news.readMore") + ' →</span>' +
        '</div>';
      grid.appendChild(card);
    });
    initScrollAnimations();
  }

  // ── Init ───────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initLangToggle();
    applyTranslations();
    updateLangToggle();
    initScrollAnimations();
    initFilters();
    initEventTabs();
    initCalendar();
    initContactForm();
    initNewsletterForm();

    // Page-specific population
    populateProducers();
    populateProducts();
    populateEventsPreview();
    populateNewsPreview();
    populateProducerDetail();
    populateProductDetail();

    // Detect events page type
    var evType = document.body.getAttribute("data-page-type");
    if (evType === "events-upcoming") populateFullEvents("upcoming");
    if (evType === "events-past") populateFullEvents("past");
    if (evType === "news") populateNewsPage();

    document.documentElement.lang = window.CV_LANG;
  });

})();
