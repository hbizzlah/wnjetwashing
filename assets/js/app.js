/* =========================================================================
   WNJetWashing — interactions
   Vanilla JS, no dependencies. All motion respects prefers-reduced-motion.
   ========================================================================= */
(function () {
  'use strict';

  // Anti-clickjacking: if we've been framed by another origin, break out.
  try { if (window.top !== window.self) { window.top.location = window.self.location.href; } } catch (_) {}

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // HTML-escape any dynamic string before it ever touches innerHTML (defense in depth).
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* ===== BOOKING: WhatsApp =================================================
     Replace WHATSAPP_NUMBER with WNJetWashing's real number in international
     format — digits only, no "+", spaces or "00". A UK mobile 07123 456789
     becomes 447123456789. This single constant powers every "Book your quote"
     button, the basket's "Request your quote", and the footer/float links.   */
  const WHATSAPP_NUMBER = '447926999623'; // WNJetWashing WhatsApp (07926 999623 → intl format)
  const SERVICES = ['Decking Revitalisation', 'Patio Revitalisation', 'Driveway Revitalisation'];

  /* ----------------------------------------------------------- year */
  const yEl = $('[data-year]');
  if (yEl) yEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------- smooth scroll for data-scroll + hash links */
  function scrollToTarget(sel) {
    const el = $(sel);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-scroll]');
    if (s) { e.preventDefault(); scrollToTarget(s.getAttribute('data-scroll')); }
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1 && !a.hasAttribute('data-scroll')) {
      const id = a.getAttribute('href');
      if ($(id)) { e.preventDefault(); scrollToTarget(id); closeMobile(); }
    }
  });

  /* ----------------------------------------------------------- sticky masthead state */
  const masthead = $('[data-masthead]');
  const onScroll = () => { if (masthead) masthead.classList.toggle('is-stuck', window.pageYOffset > 80); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------- mobile menu */
  const burger = $('[data-burger]');
  function closeMobile() {
    if (!burger) return;
    burger.setAttribute('aria-expanded', 'false');
    masthead.classList.remove('menu-open');
  }
  if (burger) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      masthead.classList.toggle('menu-open', !open);
    });
  }

  /* ----------------------------------------------------------- WhatsApp booking */
  function whatsappMessage() {
    if (basket && basket.length) {
      // basket-aware: pre-fill exactly the services they picked
      const lines = basket.map((s) => '• ' + s).join('\n');
      return "Hi WNJetWashing! 👋 I'd love a free quote for:\n" + lines +
             "\n\nWhen are you next free to pop round? My postcode is ___";
    }
    // default: present the three services as a 1 / 2 / 3 selection
    return "Hi WNJetWashing! 👋 I'd love a free quote.\n\nWhich service shall we book in?\n" +
           "1️⃣ Decking Revitalisation\n2️⃣ Patio Revitalisation\n3️⃣ Driveway Revitalisation\n\n" +
           "Just reply 1, 2 or 3 (or tell us what you need) and your postcode 🙂";
  }
  function openBooking() {
    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(whatsappMessage());
    // open in a new tab; if the popup is blocked, fall back to navigating this tab
    const w = window.open(url, '_blank');
    if (!w || w.closed || typeof w.closed === 'undefined') { window.location.href = url; }
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-book]')) { e.preventDefault(); openBooking(); }
  });

  /* ----------------------------------------------------------- QUOTE BASKET */
  const STORE_KEY = 'wnj_basket_v1';
  let basket = [];
  // Only ever trust known service names from storage (prevents tampered localStorage from injecting markup).
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    basket = Array.isArray(stored) ? stored.filter((x) => SERVICES.includes(x)) : [];
  } catch (_) { basket = []; }

  const countEl     = $('[data-basket-count]');
  const drawer      = $('[data-drawer]');
  const scrim       = $('[data-scrim]');
  const drawerList  = $('[data-drawer-list]');
  const drawerEmpty = $('[data-drawer-empty]');
  const requestBtn  = $('[data-drawer-request]');
  const summaryList = $('[data-summary-list]');
  const summaryEmpty= $('[data-summary-empty]');

  function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(basket)); } catch (_) {} }

  function renderBasket(bump) {
    const n = basket.length;
    // nav badge
    if (countEl) {
      countEl.textContent = n;
      countEl.hidden = n === 0;
      if (bump && n > 0) { countEl.classList.remove('bump'); void countEl.offsetWidth; countEl.classList.add('bump'); }
    }
    // drawer list
    if (drawerList) {
      drawerList.innerHTML = '';
      basket.forEach((name, i) => {
        const li = document.createElement('li');
        li.className = 'drawer__item';
        li.innerHTML =
          '<span class="drawer__item-name">' + esc(name) +
          '<span class="drawer__item-sub">Quote-based · free visit</span></span>' +
          '<button class="drawer__remove" data-remove="' + i + '" aria-label="Remove ' + esc(name) + '">&times;</button>';
        drawerList.appendChild(li);
      });
      if (drawerEmpty) drawerEmpty.style.display = n ? 'none' : '';
    }
    if (requestBtn) requestBtn.disabled = n === 0;
    // final-cta summary
    if (summaryList) {
      summaryList.innerHTML = '';
      basket.forEach((name) => {
        const li = document.createElement('li');
        li.innerHTML = '<span>' + esc(name) + '</span><span>Quote-based</span>';
        summaryList.appendChild(li);
      });
      if (summaryEmpty) summaryEmpty.style.display = n ? 'none' : '';
    }
  }

  function addToBasket(name, sourceBtn) {
    if (!SERVICES.includes(name)) return; // never add anything but a known service
    if (basket.includes(name)) {
      toast('Already in your quote — <strong>' + esc(name) + '</strong>');
      openDrawer();
      return;
    }
    basket.push(name);
    persist();
    renderBasket(true);
    toast('Added — <strong>' + esc(name) + '</strong>');
    if (sourceBtn && !REDUCED) flyDroplet(sourceBtn);
  }

  function removeFromBasket(i) { basket.splice(i, 1); persist(); renderBasket(false); }

  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) { addToBasket(add.getAttribute('data-add'), add); return; }
    const rm = e.target.closest('[data-remove]');
    if (rm) { removeFromBasket(parseInt(rm.getAttribute('data-remove'), 10)); }
  });

  /* drawer open/close + focus trap */
  let lastFocus = null;
  if (drawer) drawer.inert = true; // closed: keep its controls out of the tab order
  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.inert = false;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    if (scrim) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('show')); }
    document.body.style.overflow = 'hidden';
    const f = drawer.querySelector('button, [href], input');
    if (f) f.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    if (scrim) { scrim.classList.remove('show'); setTimeout(() => { scrim.hidden = true; }, 300); }
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-basket]')) { e.preventDefault(); openDrawer(); }
    if (e.target.closest('[data-close-basket]')) { closeDrawer(); }
    if (e.target === scrim) closeDrawer();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeDrawer();
    // focus trap
    if (e.key === 'Tab' && drawer && drawer.classList.contains('open')) {
      const f = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', drawer).filter(el => !el.disabled && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  renderBasket(false);

  /* ----------------------------------------------------------- toast */
  let toastTimer;
  const toastEl = $('[data-toast]');
  function toast(html) {
    if (!toastEl) return;
    toastEl.innerHTML = html;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => { toastEl.hidden = true; }, 300);
    }, 2600);
  }

  /* ----------------------------------------------------------- flying droplet to basket icon */
  const flyEl = $('[data-fly-drop]');
  function flyDroplet(fromBtn) {
    const target = $('.basket-btn');
    if (!flyEl || !target) return;
    const a = fromBtn.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const sx = a.left + a.width / 2, sy = a.top + a.height / 2;
    const ex = b.left + b.width / 2, ey = b.top + b.height / 2;
    flyEl.style.transition = 'none';
    flyEl.style.left = sx + 'px'; flyEl.style.top = sy + 'px';
    flyEl.style.opacity = '1'; flyEl.style.transform = 'translate(-50%,-50%) rotate(45deg) scale(1)';
    requestAnimationFrame(() => {
      flyEl.style.transition = 'left 0.6s cubic-bezier(0.5,0,0.75,0.3), top 0.6s cubic-bezier(0.3,0.6,0.4,1), opacity 0.6s, transform 0.6s';
      flyEl.style.left = ex + 'px'; flyEl.style.top = ey + 'px';
      flyEl.style.opacity = '0'; flyEl.style.transform = 'translate(-50%,-50%) rotate(45deg) scale(0.4)';
    });
  }

  /* ----------------------------------------------------------- WIPE SLIDERS */
  $$('[data-wipe]').forEach((wipe) => {
    const handle  = $('[data-wipe-handle]', wipe);
    let pos = 50, dragging = false, rippleLock = false;

    function apply(p, ripple) {
      pos = Math.max(0, Math.min(100, p));
      wipe.style.setProperty('--pos', pos + '%');
      if (handle) handle.setAttribute('aria-valuenow', Math.round(pos));
      if (ripple && !REDUCED && !rippleLock) spawnRipple();
    }
    function spawnRipple() {
      rippleLock = true; setTimeout(() => { rippleLock = false; }, 90);
      const r = document.createElement('span');
      r.className = 'wipe__ripple';
      const rect = wipe.getBoundingClientRect();
      r.style.left = pos + '%';
      r.style.top = (40 + Math.random() * 20) + '%';
      wipe.appendChild(r);
      setTimeout(() => r.remove(), 650);
    }
    function fromClientX(clientX) {
      const rect = wipe.getBoundingClientRect();
      apply(((clientX - rect.left) / rect.width) * 100, true);
    }

    function down(e) {
      dragging = true; wipe.classList.add('dragging', 'touched');
      try { wipe.setPointerCapture(e.pointerId); } catch (_) {}
      fromClientX(e.clientX); e.preventDefault();
    }
    function move(e) { if (!dragging) return; fromClientX(e.clientX); }
    function up()   { dragging = false; wipe.classList.remove('dragging'); }

    // single pointerdown on the wipe (handle is inside it) — pointer capture keeps move/up reliable
    wipe.addEventListener('pointerdown', down);
    wipe.addEventListener('pointermove', move);
    wipe.addEventListener('pointerup', up);
    wipe.addEventListener('pointercancel', up);
    wipe.addEventListener('lostpointercapture', up);

    if (handle) {
      handle.addEventListener('keydown', (e) => {
        if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)) wipe.classList.add('touched');
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown')  { apply(pos - 4, true); e.preventDefault(); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   { apply(pos + 4, true); e.preventDefault(); }
        if (e.key === 'Home') { apply(0, true); e.preventDefault(); }
        if (e.key === 'End')  { apply(100, true); e.preventDefault(); }
      });
    }
    apply(REDUCED ? 50 : 58, false); // start slightly toward "before" so the effect reads

    // one-time auto-demo: swipe the slider when it scrolls into view, to show it's interactive
    if (wipe.hasAttribute('data-wipe-demo') && !REDUCED) {
      let ran = false;
      const demo = () => {
        if (ran || wipe.classList.contains('touched')) return;
        ran = true;
        const keys = [[0, 58], [650, 26], [1350, 74], [2000, 50]];
        const t0 = performance.now();
        const step = (now) => {
          if (wipe.classList.contains('touched')) return;
          const t = now - t0;
          let i = 0; while (i < keys.length - 1 && t > keys[i + 1][0]) i++;
          if (i >= keys.length - 1) { apply(50, false); return; }
          const [t1, p1] = keys[i], [t2, p2] = keys[i + 1];
          const k = Math.max(0, Math.min(1, (t - t1) / (t2 - t1)));
          apply(p1 + (p2 - p1) * (1 - Math.pow(1 - k, 3)), false);
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      const io = new IntersectionObserver((ents) => {
        ents.forEach((en) => { if (en.isIntersecting) { demo(); io.disconnect(); } });
      }, { threshold: 0.5 });
      io.observe(wipe);
    }
  });

  /* ----------------------------------------------------------- STAT COUNTERS */
  const statsWrap = $('[data-stats]');
  if (statsWrap) {
    const run = () => {
      $$('.stats__num', statsWrap).forEach((el) => {
        const target = parseFloat(el.getAttribute('data-count'));
        const dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const suffix = el.getAttribute('data-suffix') || '';
        if (REDUCED) { el.textContent = target.toFixed(dec) + suffix; return; }
        const dur = 1100, t0 = performance.now();
        const tick = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 3);
          el.textContent = (target * eased).toFixed(dec) + suffix;
          if (k < 1) requestAnimationFrame(tick); else el.textContent = target.toFixed(dec) + suffix;
        };
        requestAnimationFrame(tick);
      });
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.5 });
    io.observe(statsWrap);
  }

  /* ----------------------------------------------------------- SECTION + ROW REVEALS */
  const revealIO = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach((el) => revealIO.observe(el));
  // service rows also flip is-active for the index + media reveal on mobile
  $$('.svc-row').forEach((row) => {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.35 });
    io.observe(row);
  });

  /* ----------------------------------------------------------- PROCESS TIMELINE scroll-fill */
  const line = $('[data-timeline-line]');
  const timeline = $('[data-timeline]');
  if (line && timeline && !REDUCED) {
    const onScrollFill = () => {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = (vh * 0.7 - rect.top) / rect.height;
      line.style.setProperty('--fill', String(Math.max(0, Math.min(1, progress))));
    };
    window.addEventListener('scroll', onScrollFill, { passive: true });
    onScrollFill();
  } else if (line) {
    line.style.setProperty('--fill', '1');
  }

  /* ----------------------------------------------------------- STAR RATING INPUT (radiogroup) */
  const starWrap = $('[data-star-input]');
  const starVal  = $('[data-star-value]');
  let setStars = null; // shared entry point so other code (e.g. form reset) can sync state
  if (starWrap) {
    const stars = $$('button', starWrap);
    let current = 5;
    function paint(n) { stars.forEach((s, i) => s.classList.toggle('on', i < n)); }
    function set(n) {
      current = n;
      if (starVal) starVal.value = String(n);
      paint(n);
      // maintain radio semantics: nth radio checked, roving tabindex
      stars.forEach((s, i) => {
        const sel = (i + 1) === n;
        s.setAttribute('aria-checked', sel ? 'true' : 'false');
        s.tabIndex = sel ? 0 : -1;
      });
    }
    setStars = set;
    stars.forEach((s) => {
      const n = parseInt(s.getAttribute('data-star'), 10);
      s.addEventListener('mouseenter', () => paint(n));
      s.addEventListener('focus', () => paint(n));
      s.addEventListener('click', () => set(n));
    });
    starWrap.addEventListener('mouseleave', () => paint(current));
    starWrap.addEventListener('blur', () => paint(current), true);
    starWrap.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '5') { set(parseInt(e.key, 10)); stars[parseInt(e.key,10)-1].focus(); }
      if (e.key === 'ArrowLeft')  { set(Math.max(1, current - 1)); stars[current-1].focus(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(Math.min(5, current + 1)); stars[current-1].focus(); e.preventDefault(); }
    });
    set(5);
  }

  /* Form delivery. Leave FORM_ENDPOINT empty to just show the on-page
     confirmation (current setup — submissions are not captured server-side).
     To capture submissions, set FORM_ENDPOINT to a form-backend URL:
       • Netlify Forms:  '/'            (deploy on Netlify; forms already tagged)
       • FormSubmit:     'https://formsubmit.co/ajax/YOUR-EMAIL'
       • Formspree:      'https://formspree.io/f/XXXX'
     The visitor always sees the friendly confirmation regardless. */
  const FORM_ENDPOINT = '';
  function postForm(form) {
    if (!FORM_ENDPOINT) return;
    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body }).catch(function () {});
    } catch (_) {}
  }

  /* ----------------------------------------------------------- REVIEW FORM */
  const reviewForm = $('[data-review-form]');
  if (reviewForm) {
    const note = $('[data-review-note]');
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#rv-name').value.trim();
      const msg  = $('#rv-msg').value.trim();
      if (!name || !msg) {
        note.textContent = 'Please add your name and a short review.';
        note.classList.add('is-error');
        return;
      }
      note.classList.remove('is-error');
      const rating = (starVal && starVal.value) || '5';
      postForm(reviewForm); // capture values before reset
      note.textContent = 'Thank you, ' + name + '! Your ' + rating + '-star review has been submitted for approval. 💧';
      reviewForm.reset();
      if (setStars) setStars(5); // keep internal state, value + aria in sync
    });
  }

  /* ----------------------------------------------------------- NEWSLETTER */
  const nlForm = $('[data-newsletter]');
  if (nlForm) {
    const note = $('[data-newsletter-note]');
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#nl-email').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        note.textContent = 'Please enter a valid email address.';
        note.classList.add('is-error');
        return;
      }
      note.classList.remove('is-error');
      postForm(nlForm);
      note.textContent = "You're on the list — we'll be in touch with seasonal reminders. 💧";
      nlForm.reset();
    });
  }
})();
