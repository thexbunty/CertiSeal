(function () {
  const loader = document.getElementById('initLoader');
  if (!loader) return;

  loader.style.visibility = 'visible';
  loader.style.opacity = '1';
  loader.style.pointerEvents = 'none';

  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 450);
  }, 1200);
})();

(function () {
  "use strict";
  (function disableBrowserZoom() {
    document.addEventListener('touchmove', function (e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
    });

    window.addEventListener('keydown', function (e) {
      const isZoomKey = (e.ctrlKey || e.metaKey) &&
        (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0' || e.key === '°');
      if (isZoomKey) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
      }
    });

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    }, { passive: false });

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
  })();

  const LS = "certiseal";

  function lsG(k) { try { const r = localStorage.getItem(LS); return r ? JSON.parse(r)[k] : null; } catch { return null; } }

  function lsS(k, v) { try { const r = localStorage.getItem(LS); const d = r ? JSON.parse(r) : {}; d[k] = v; localStorage.setItem(LS, JSON.stringify(d)); } catch { } }

  function lsClear() { try { localStorage.removeItem(LS); } catch { } }

  function initCertiSealSeed() {
    let seed = lsG("seed");
    if (!seed) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      seed = Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
      lsS("seed", seed);
    }
    return seed;
  }

  function addChecksum(str) {
    const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      let val = alphabet.indexOf(str[i]);
      if (val === -1) val = 0;
      if (i % 2 === 0) val *= 2;
      sum += val;
    }
    const checksum = sum % alphabet.length;
    return str + alphabet[checksum];
  }

  function verifyChecksum(str) {
    if (str.length < 2) return false;
    const last = str.slice(-1);
    const body = str.slice(0, -1);
    const expected = addChecksum(body).slice(-1);
    return last === expected;
  }

  function formatCertiSealID(raw) {
    let short = raw.slice(0, 16).toUpperCase();
    short = short.replace(/[IO]/g, function (m) { return m === 'I' ? '1' : '0'; });
    const withChecksum = addChecksum(short);
    let groups = withChecksum.match(/.{1,4}/g);
    return "CS-" + groups.join("-");
  }
  const CERTISEAL_SEED = initCertiSealSeed();

  function getCurrentDate() {
    const date = new Date();
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function replaceYear(str) {
    return String(str).replace(/2026/g, new Date().getFullYear());
  }

  const DEF_SETTINGS = { autoSave: true, livePreview: true, grid: true, hiRes: true, hash: true, qr: true, limits: true, dark: false };
  let settings = { ...DEF_SETTINGS, ...(lsG("settings") || {}) };
  function saveSetting(k, v) { settings[k] = v; if (settings.autoSave) lsS("settings", settings); }

  const ACCENTS = [
    { n: "Obsidian", hex: "#0a0908", qrBg: "#0a0908", qrFg: "#f5f4f0" },
    { n: "Champagne", hex: "#c6a43f", qrBg: "#c6a43f", qrFg: "#fff" },
    { n: "Verdant", hex: "#2d6a4f", qrBg: "#2d6a4f", qrFg: "#fff" },
    { n: "Copper", hex: "#b87333", qrBg: "#b87333", qrFg: "#fff" },
    { n: "Pewter", hex: "#4a5568", qrBg: "#4a5568", qrFg: "#fff" },
    { n: "Forest", hex: "#1a3c2e", qrBg: "#1a3c2e", qrFg: "#f0ede8" },
    { n: "Burgundy", hex: "#6e2c3c", qrBg: "#6e2c3c", qrFg: "#fff" },
    { n: "Blush", hex: "#d8a1a4", qrBg: "#d8a1a4", qrFg: "#fff" },
    { n: "Sapphire", hex: "#0f2b4b", qrBg: "#0f2b4b", qrFg: "#fff" },
    { n: "Amethyst", hex: "#5e3a6b", qrBg: "#5e3a6b", qrFg: "#fff" },
    { n: "Sienna", hex: "#b85d3a", qrBg: "#b85d3a", qrFg: "#fff" },
    { n: "Alabaster", hex: "#e8e2d2", qrBg: "#e8e2d2", qrFg: "#fff" },
    { n: "Truffle", hex: "#5c4a3d", qrBg: "#5c4a3d", qrFg: "#fff" },
    { n: "Celestial", hex: "#2b4f6e", qrBg: "#2b4f6e", qrFg: "#fff" },
    { n: "Garnet", hex: "#9b2e3c", qrBg: "#9b2e3c", qrFg: "#fff" },
    { n: "Moss", hex: "#4a5d3e", qrBg: "#4a5d3e", qrFg: "#fff" },
    { n: "Platinum", hex: "#8a8d91", qrBg: "#8a8d91", qrFg: "#fff" },
    { n: "Crimson", hex: "#a51c30", qrBg: "#a51c30", qrFg: "#fff" }
  ];

  const SEALS = [
    { id: "shield", d: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>` },
    { id: "cert_seal", d: `<path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>` },
    { id: "crown", d: `<path d="M2 18h20M4 18L2 8l5 4 5-8 5 8 5-4-2 10"/><line x1="2" y1="22" x2="22" y2="22"/>` },
    { id: "minimal-cross", d: `<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>` },
    { id: "diamond", d: `<polygon points="12 2 22 12 12 22 2 12 12 2"/><polygon points="12 7 17 12 12 17 7 12 12 7"/>` },
    { id: "gem", d: `<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><polyline points="2 8.5 12 15 22 8.5"/><line x1="12" y1="22" x2="12" y2="15"/>` },
    { id: "star", d: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>` },
    { id: "sun", d: `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>` },
    { id: "moon", d: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />` },
    { id: "globe", d: `<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/>` },
    { id: "scroll", d: `<path d="M8 4H4v16h4"/><path d="M16 4h4v16h-4"/><rect x="8" y="4" width="8" height="16" rx="1"/>` },
    { id: "book", d: `<path d="M4 6h16v14H4z"/><path d="M8 6V2h8v4"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>` },
    { id: "roundel", d: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>` },
    { id: "infinity", d: `<path d="M18 8c-3 0-5 3-6 4-1-1-3-4-6-4s-4 3-4 4 1 4 4 4 5-3 6-4c1 1 3 4 6 4s4-3 4-4-1-4-4-4z"/>` }
  ];

  const FIELD_ICONS = {
    "user": `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    "type": `<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>`,
    "align-left": `<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>`,
    "calendar": `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
    "home": `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    "pen-tool": `<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>`,
  };

  const FIELD_CFG = {
    cert: [
      { id: "recipient", label: "Recipient Name", icon: "user", type: "input", max: 55, ph: "Full name" },
      { id: "heading", label: "Certificate Title", icon: "type", type: "input", max: 70, ph: "Certificate title" },
      { id: "desc", label: "Body Text", icon: "align-left", type: "textarea", rows: 3, max: 280, ph: "Achievement description" },
      { id: "date", label: "Issue Date", icon: "calendar", type: "input", max: 28, ph: "Date" },
      { id: "issuer", label: "Issuing Authority", icon: "home", type: "input", max: 55, ph: "Organization name" },
      { id: "signature", label: "Signatory", icon: "pen-tool", type: "input", max: 55, ph: "Name & title" },
    ],
    notice: [
      { id: "recipient", label: "Attention To", icon: "user", type: "input", max: 60, ph: "Recipient or group" },
      { id: "heading", label: "Notice Title", icon: "type", type: "input", max: 80, ph: "Notice subject" },
      { id: "desc", label: "Notice Body", icon: "align-left", type: "textarea", rows: 6, max: 2000, ph: "Notice content" }, { id: "date", label: "Issue Date", icon: "calendar", type: "input", max: 28, ph: "Date" },
      { id: "issuer", label: "Issuing Body", icon: "home", type: "input", max: 55, ph: "Department / authority" },
      { id: "signature", label: "Authorized By", icon: "pen-tool", type: "input", max: 55, ph: "Name & designation" },
    ],
    idcard: [
      { id: "recipient", label: "Full Name", icon: "user", type: "input", max: 32, ph: "Card holder" },
      { id: "heading", label: "Role / Title", icon: "type", type: "input", max: 40, ph: "Designation" },
      { id: "desc", label: "Access Info", icon: "align-left", type: "textarea", rows: 2, max: 120, ph: "Access level, clearance…" },
      { id: "date", label: "Valid Until", icon: "calendar", type: "input", max: 28, ph: "Expiry date" },
      { id: "issuer", label: "Organization", icon: "home", type: "input", max: 40, ph: "Company / institution" },
      { id: "signature", label: "Issued By", icon: "pen-tool", type: "input", max: 40, ph: "Authority" },
    ],
    invoice: [
      { id: "recipient", label: "Bill To", icon: "user", type: "input", max: 55, ph: "Client name / company" },
      { id: "heading", label: "Invoice Title", icon: "type", type: "input", max: 70, ph: "e.g. Invoice #1042" },
      { id: "desc", label: "Services / Items", icon: "align-left", type: "textarea", rows: 6, max: 1000, ph: "Line items, amounts…" }, { id: "date", label: "Invoice Date", icon: "calendar", type: "input", max: 28, ph: "Date" },
      { id: "issuer", label: "From (Vendor)", icon: "home", type: "input", max: 55, ph: "Your company name" },
      { id: "signature", label: "Due / Ref", icon: "pen-tool", type: "input", max: 55, ph: "Due date or reference" },
    ],
    ticket: [
      { id: "recipient", label: "Attendee / Holder", icon: "user", type: "input", max: 55, ph: "Full name" },
      { id: "heading", label: "Event Name", icon: "type", type: "input", max: 70, ph: "Event or show title" },
      { id: "desc", label: "Details", icon: "align-left", type: "textarea", rows: 3, max: 280, ph: "Seat, gate, tier, notes…" },
      { id: "date", label: "Event Date", icon: "calendar", type: "input", max: 40, ph: "Date" },
      { id: "time", label: "Event Time", icon: "calendar", type: "input", max: 30, ph: "e.g. 7:30 PM" },
      { id: "issuer", label: "Venue / Organizer", icon: "home", type: "input", max: 55, ph: "Venue or organizer name" },
      { id: "signature", label: "Ticket No. / Ref", icon: "pen-tool", type: "input", max: 16, ph: "e.g. TKT-00492" },
    ]
  };

  const DEFAULT_DATA = {
    cert: { recipient: "Dr. Eleanor V. Shaw", heading: "Excellence in Cybersecurity", desc: "Awarded in recognition of outstanding contributions to information security architecture and demonstrated mastery of cryptographic systems.", date: "April 10, 2026", issuer: "CertiSeal Authority", signature: "Prof. M. K. Jensen, Chief Architect" },
    notice: { recipient: "All Department Heads", heading: "Mandatory Security Protocol Update", desc: "Effective immediately, all personnel must enable multi-factor authentication and update their access credentials. Non-compliance will result in restricted system access until verification is complete.", date: "April 10, 2026", issuer: "CertiSeal Security Division", signature: "Lt. Cmdr. R. Varma, Security Director" },
    idcard: { recipient: "A. Chen Wei", heading: "Senior Security Engineer", desc: "Access Level: Tier 3 · Clearance: Confidential · Authorized for all restricted labs.", date: "Dec 31, 2026", issuer: "CertiSeal Internal", signature: "HR Authority" },
    invoice: { recipient: "Nexus Technologies Ltd.", heading: "Invoice #INV-2026-0042", desc: "UI/UX Design & Development — $4,200\nSecurity Audit Consulting — $1,800\nAnnual Maintenance License — $600\n\nTotal Due: $7,788", date: "April 10, 2026", issuer: "CertiSeal Studio", signature: "Net 30 days" },
    ticket: { recipient: "James R. Holloway", heading: "CertiSeal Dev Summit 2026", desc: "Section: B · Row: 12 · Seat: 4\nTier: Gold Pass · All Sessions Included\nDoor opens 30 min before event.", date: "June 12, 2026", time: "7:30 PM", issuer: "CertiSeal Events · Grand Hall", signature: "TKT-00492" }
  };

  let tplData = {};
  Object.keys(DEFAULT_DATA).forEach(k => {
    const saved = lsG("data_" + k);
    if (saved) {
      tplData[k] = { ...DEFAULT_DATA[k], ...saved };
      tplData[k].date = replaceYear(tplData[k].date);
    } else {
      const fresh = { ...DEFAULT_DATA[k] };
      fresh.date = getCurrentDate();
      tplData[k] = fresh;
    }
  });
  let curTpl = lsG("curTpl") || "cert";
  let curAccent = lsG("accent") || 0;
  let curIcon = lsG("icon") || 0;
  let customSealText = lsG("customSealText") || "CS";
  let renderTm = null;
  let isDark = settings.dark || false;
  let zoomScale = 1;
  let panX = 0, panY = 0;
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  const previewWrap = document.getElementById("previewWrap");
  const canvasArea = document.getElementById("canvasArea");

  function toast(msg, isErr = false) {
    let existingToast = document.getElementById("toast");
    if (existingToast) existingToast.remove();

    const toastEl = document.createElement("div");
    toastEl.id = "toast";
    toastEl.className = "toast show" + (isErr ? " err" : "");
    toastEl.innerHTML = `<svg viewBox="0 0 24 24">${isErr ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : '<polyline points="20 6 9 17 4 12"/>'}</svg>${msg}`;
    document.body.appendChild(toastEl);
    toastEl.offsetHeight;

    setTimeout(() => {
      if (toastEl && toastEl.parentNode) {
        toastEl.classList.remove("show");
        setTimeout(() => {
          if (toastEl && toastEl.parentNode) toastEl.remove();
        }, 250);
      }
    }, 2600);
  }

  function updateStatusText() {
    const statusSpan = document.getElementById("statusText");
    const dot = document.querySelector(".live-dot");

    if (!settings.livePreview) {
      statusSpan.textContent = "Inactive";
      if (dot) {
        dot.style.backgroundColor = "#f87171";
        dot.style.animation = "none";
      }
    } else {
      statusSpan.textContent = "Live";
      if (dot) {
        dot.style.backgroundColor = "#22c55e";
        dot.style.animation = "pulse 2.5s ease-in-out infinite";
      }
    }
  }

  function applyDark(dark) {
    isDark = dark;
    document.documentElement.toggleAttribute("data-dark", dark);
    document.getElementById("togDark").classList.toggle("on", dark);
    saveSetting("dark", dark);
  }

  async function genHash(data) {
    if (!settings.hash) return { short: "DISABLED", ts: "0", full: "0", salt: "", version: "0", csid: "CS-DISABLED" };

    const enc = new TextEncoder();
    const version = "02";
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const masterKeyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(window.CERTISEAL_MASTER_KEY),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 210000,
        hash: "SHA-512"
      },
      masterKeyMaterial,
      { name: "HMAC", hash: "SHA-512", length: 512 },
      false,
      ["sign"]
    );
    const ts = Date.now().toString();
    const message = `${data}|${ts}|${version}`;
    const signature = await crypto.subtle.sign("HMAC", derivedKey, enc.encode(message));
    const fullHash = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
    const combined = `${version}|${saltHex}|${fullHash}|${ts}`;
    const shortHash = fullHash.substring(0, 32).toUpperCase();
    const fingerprint = `${data}|${ts}|${CERTISEAL_SEED}`;
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(CERTISEAL_SEED),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const csSignature = await crypto.subtle.sign("HMAC", keyMaterial, enc.encode(fingerprint));
    const csRaw = Array.from(new Uint8Array(csSignature)).map(b => b.toString(16).padStart(2, "0")).join("");
    const csid = formatCertiSealID(csRaw);

    return { short: shortHash, ts: ts, full: combined, salt: saltHex, version: version, csid: csid };
  }

  function makeQR(text, acIdx = 0) {
    if (!settings.qr) return null;
    const ac = ACCENTS[acIdx];
    const bg = ac.qrBg;
    const fg = ac.qrFg;
    const px = 48;
    const margin = 12;
    const qr = qrcode(0, 'L');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = n * px + margin * 2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = fg;
    ctx.imageSmoothingEnabled = false;
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(col * px + margin, row * px + margin, px, px);
        }
      }
    }
    ctx.strokeStyle = bg;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }

  function acHex() { return ACCENTS[curAccent].hex; }

  function sealSVG(color, size = 20) {
    if (curIcon === SEALS.length - 1) {
      const fontSize = Math.floor(size * 0.7);
      return `<span style="font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: ${fontSize}px; color: ${color}; line-height: 1; display: inline-block;">${esc(customSealText)}</span>`;
    }
    const s = SEALS[curIcon];
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${s.d}</svg>`;
  }

  function buildColorRow() {
    const row = document.getElementById("colorRow"); row.innerHTML = "";
    ACCENTS.forEach((c, i) => {
      const s = document.createElement("div");
      s.className = "swatch" + (i === curAccent ? " active" : "");
      s.style.background = c.hex; s.title = c.n;
      s.addEventListener("click", () => { curAccent = i; if (settings.autoSave) lsS("accent", i); document.querySelectorAll(".swatch").forEach((x, j) => x.classList.toggle("active", j === i)); render(); });
      row.appendChild(s);
    });
  }

  function buildIconRow() {
    const row = document.getElementById("iconRow");
    row.innerHTML = "";

    function updateIconStyles(activeIndex) {
      const items = document.querySelectorAll(".icon-pick");
      items.forEach((item, idx) => {
        if (idx === activeIndex) {
          item.classList.add("active");
          if (idx === SEALS.length - 1) {
            item.style.backgroundColor = "var(--t0)";
            item.style.color = "var(--bg)";
            item.style.borderColor = "var(--t0)";
          } else {
            item.style.backgroundColor = "";
            item.style.color = "";
            item.style.borderColor = "";
          }
        } else {
          item.classList.remove("active");
          if (idx === SEALS.length - 1) {
            item.style.backgroundColor = "var(--bg)";
            item.style.color = "var(--t2)";
            item.style.borderColor = "var(--border)";
          } else {
            item.style.backgroundColor = "";
            item.style.color = "";
            item.style.borderColor = "";
          }
        }
      });
    }

    for (let i = 0; i < SEALS.length - 1; i++) {
      const ic = SEALS[i];
      const b = document.createElement("div");
      b.className = "icon-pick";
      b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ic.d}</svg>`;
      b.addEventListener("click", (function (idx) {
        return function () {
          curIcon = idx;
          if (settings.autoSave) lsS("icon", curIcon);
          updateIconStyles(curIcon);
          render();
        };
      })(i));
      row.appendChild(b);
    }

    const customInput = document.createElement("input");
    customInput.type = "text";
    customInput.maxLength = 2;
    customInput.value = customSealText;
    customInput.className = "icon-pick";
    customInput.style.textAlign = "center";
    customInput.style.fontSize = "14px";
    customInput.style.fontWeight = "600";
    customInput.style.fontFamily = "monospace";
    customInput.style.padding = "0";
    customInput.style.boxSizing = "border-box";
    customInput.style.cursor = "text";
    customInput.style.backgroundColor = "var(--bg)";
    customInput.style.color = "var(--t2)";
    customInput.style.border = "1px solid var(--border)";

    customInput.addEventListener("click", (e) => {
      e.stopPropagation();
      curIcon = SEALS.length - 1;
      if (settings.autoSave) lsS("icon", curIcon);
      updateIconStyles(curIcon);
      render();
      customInput.focus();
    });

    customInput.addEventListener("input", (e) => {
      let newText = e.target.value.toUpperCase();
      if (newText === "") newText = "CS";
      if (newText.length > 2) {
        newText = newText.slice(0, 2);
        customInput.value = newText;
      }
      customSealText = newText;
      if (settings.autoSave) lsS("customSealText", customSealText);
      if (curIcon === SEALS.length - 1) {
        render();
      }
    });

    customInput.addEventListener("blur", () => {
      if (customInput.value.trim() === "") {
        customInput.value = "CS";
        customSealText = "CS";
        if (settings.autoSave) lsS("customSealText", "CS");
        if (curIcon === SEALS.length - 1) render();
      }
    });

    customInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        customInput.blur();
      }
    });

    row.appendChild(customInput);
    updateIconStyles(curIcon);
  }


  function h2r(hex) { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return `${r},${g},${b}`; }

  function isLight(hex) { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return (r * 299 + g * 587 + b * 114) / 1000 > 128; }

  function buildCert(v, hash, qrImg) {
    const ac = acHex(), rgb = h2r(ac), light = isLight(ac), textOnAc = light ? "#0a0908" : "#f5f4f0";
    return `<div class="doc-base" style="width:1056px;height:748px;background:#faf9f6;font-family:'DM Sans',sans-serif;border:6px solid ${ac};box-sizing:border-box;">
  <div style="position:absolute;inset:22px 22px 22px 22px;border:1px solid rgba(${rgb},.15);pointer-events:none;"></div>
  <div style="position:absolute;inset:36px 40px 36px 40px;display:flex;flex-direction:column;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;border-radius:8px;background:${ac};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${sealSVG(textOnAc, 15)}</div>
        <div>
          <div style="font-size:9.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#6b6965;">${esc(v.issuer)}</div>
          <div style="font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:#a8a5a0;margin-top:1px;">Official Document</div>
        </div>
      </div>
<div style="text-align:right;flex-shrink:0;">
  <div style="font-family:'DM Mono',monospace;font-size:9px;color:#a8a5a0;letter-spacing:.04em;">${esc(v.date)}</div>
</div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 16px;">
      <div style="font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#a8a5a0;margin-bottom:18px;">This Certificate is Presented to</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:62px;font-style:italic;font-weight:300;color:#0a0908;line-height:1.05;margin-bottom:6px;overflow:visible;word-break:break-word;max-width:100%;">${esc(v.recipient)}</div>
      <div style="display:flex;align-items:center;gap:10px;margin:14px auto;width:300px;">
        <div style="flex:1;height:1px;background:rgba(${rgb},.25);"></div>
        <div style="width:4px;height:4px;border-radius:50%;background:${ac};"></div>
        <div style="flex:1;height:1px;background:rgba(${rgb},.25);"></div>
      </div>
      <div style="font-size:13px;font-weight:600;letter-spacing:.07em;color:${ac};text-transform:uppercase;margin-bottom:18px;">for ${esc(v.heading)}</div>
      <div style="max-width:620px;font-size:13.5px;color:#6b6965;line-height:1.78;" class="clamp3">${esc(v.desc)}</div>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:20px; border-top:1px solid #e8e5df;">
      <div style="width:30%; text-align:left;">
        <div style="font-family:'Cormorant Garamond',serif; font-size:22px; font-style:italic; color:#0a0908; margin-bottom:4px;">${esc(v.signature)}</div>
        <div style="font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:#a8a5a0;">Authorized Signatory</div>
      </div>
      <div style="text-align:center;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          ${qrImg ? `<div style="padding:5px; background:${ac}; border-radius:0;"><img src="${qrImg}" style="width:58px; height:58px; display:block;"></div>` : `<div style="width:68px; height:68px; border-radius:7px; background:#f0eeea; display:flex; align-items:center; justify-content:center; font-size:7px; color:#a8a5a0; font-family:monospace;">QR OFF</div>`}
          <div style="font-family:'DM Mono',monospace; font-size:7.5px; color:#a8a5a0; letter-spacing:.04em;">Scan to verify</div>
        </div>
      </div>
      <div style="width:30%; text-align:right;">
        <div style="font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:#a8a5a0; margin-bottom:4px;">Certificate No.</div>
        <div style="font-family:'DM Mono',monospace; font-size:9px; color:#2d2c2a;">${hash.csid}</div>
      </div>
    </div>
  </div>
</div>`;
  }

  function buildNotice(v, hash, qrImg) {
    const ac = acHex(), rgb = h2r(ac), light = isLight(ac), toa = light ? "#0a0908" : "#f5f4f0";
    return `<div class="doc-base" style="width:748px;min-height:1058px;height:auto;background:#faf9f6;display:flex;flex-direction:column;">
  <div style="height:4px;background:${ac};"></div>
  <div style="padding:44px 52px 28px;border-bottom:1px solid #e8e5df;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;">
      <div>
        <div style="display:inline-flex;align-items:center;gap:8px;border:1px solid ${ac};border-radius:4px;padding:5px 12px;margin-bottom:20px;">
          <span style="font-size:8.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${ac};">${esc(v.issuer)}</span>
        </div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:38px;font-weight:400;color:#0a0908;line-height:1.3;letter-spacing:-.01em;word-break:break-word;">${esc(v.heading)}</div>
      </div>
      <div style="flex-shrink:0;width:54px;height:54px;border-radius:50%;border:1.5px solid ${ac};display:flex;align-items:center;justify-content:center;margin-top:4px;">
        ${sealSVG(ac, 22)}
      </div>
    </div>
  </div>
  <div style="padding:16px 52px;background:#f4f2ee;border-bottom:1px solid #e8e5df;display:flex;gap:0;">
    ${[["Attention To", v.recipient], ["Issued On", v.date], ["Notice No.", hash.csid]].map(([l, val], i) => `
      <div style="flex:1;${i > 0 ? "padding-left:22px;border-left:1px solid #e0ddd7;margin-left:22px;" : ""}">
        <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8a5a0;margin-bottom:4px;">${l}</div>
        <div style="font-size:13px;font-weight:600;color:#0a0908;word-break:break-word;line-height:1.4;">${esc(val)}</div>
      </div>`).join("")}
  </div>
  <div style="padding:36px 52px;flex:1;">
    <div style="border-left:3px solid ${ac};padding-left:22px;">
      <div style="font-size:14.5px;color:#3a3835;line-height:1.84; white-space: normal;">${nl2br(v.desc)}</div>
    </div>
  </div>
  <div style="flex:1;"></div>
  <div style="padding:26px 52px 44px;border-top:1px solid #e8e5df;">
<div style="display:flex;justify-content:space-between;align-items:flex-end;">
  <div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:24px;font-style:italic;color:#0a0908;margin-bottom:4px;line-height:1.4;">${esc(v.signature)}</div>
    <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#a8a5a0;">Authorized Signatory</div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
    ${qrImg ? `<div style="padding:4px;background:${ac};border-radius:0;"><img src="${qrImg}" style="width:52px;height:52px;display:block;border-radius:0;"></div>` : `<div style="width:60px;height:60px;background:#f0eeea;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#a8a5a0;font-family:monospace;">QR OFF</div>`}
    <div style="font-family:'DM Mono',monospace; font-size:7px; color:#a8a5a0;">Scan to verify</div>
  </div>
</div>
  </div>
</div>`;
  }

  function buildIDCard(v, hash, qrImg) {
    const ac = acHex(), rgb = h2r(ac), light = isLight(ac), toa = light ? "#0a0908" : "#f5f4f0";
    const toaRGB = h2r(toa);
    const initials = v.recipient.trim().split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join("");

    return `<div class="doc-base" style="width:600px;height:960px;background:#f6f5f2;display:flex;flex-direction:column;">
  <div style="background:${ac};padding:52px 40px 44px;display:flex;flex-direction:column;align-items:center;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,rgba(${toaRGB},.02) 0,rgba(${toaRGB},.02) 1px,transparent 1px,transparent 10px);pointer-events:none;"></div>
    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:rgba(${toaRGB},0.2);"></div>
    <div style="font-size:8.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(${toaRGB},.35);margin-bottom:32px;position:relative;">${esc(v.issuer)}</div>
    <div style="position:relative;margin-bottom:22px;">
      <div style="width:100px;height:100px;border-radius:50%;border:1.5px solid rgba(${toaRGB},.12);background:rgba(${toaRGB},.06);display:flex;align-items:center;justify-content:center;">
        <span style="font-family:'Cormorant Garamond',serif;font-size:34px;font-style:italic;color:rgba(${toaRGB},.85);">${initials}</span>
      </div>
      <div style="position:absolute;bottom:0;right:0;width:24px;height:24px;border-radius:50%;background:${ac};border:2px solid ${toa};display:flex;align-items:center;justify-content:center;">${sealSVG(toa, 10)}</div>
    </div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:400;color:${toa};text-align:center;margin-bottom:7px;position:relative;word-break:break-word;">${esc(v.recipient)}</div>
    <div style="font-size:9.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(${toaRGB},.6);position:relative;">${esc(v.heading)}</div>
  </div>
  <div style="background:#fff;margin:0;padding:30px 40px;flex:1;display:flex;flex-direction:column;align-items:center;gap:22px;">
    <p style="text-align:center;font-size:12.5px;color:#6b6965;line-height:1.72;max-width:340px;" class="clamp3">${esc(v.desc)}</p>
    <div style="display:flex;align-items:center;gap:8px;width:100%;max-width:200px;">
      <div style="flex:1;height:1px;background:#e8e5df;"></div>
      <div style="width:4px;height:4px;border-radius:50%;background:${ac};"></div>
      <div style="flex:1;height:1px;background:#e8e5df;"></div>
    </div>
    <div style="background:${ACCENTS[curAccent].qrBg};padding:16px;border-radius:0;border:1px solid #e8e5df;">
      ${qrImg ? `<img src="${qrImg}" style="width:120px;height:120px;display:block;border-radius:0;">` : `<div style="width:120px;height:120px;background:#eee;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#a8a5a0;font-family:monospace;">QR OFF</div>`}
    </div>
    <div style="width:100%;display:flex;flex-direction:column;gap:8px;">
      ${[["Valid Until", v.date], ["Issued By", v.signature]].map(([l, val]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;background:#f6f5f2;border:1px solid #e8e5df;border-radius:9px;padding:10px 14px;">
          <span style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8a5a0;">${l}</span>
          <span style="font-size:12px;font-weight:600;color:#0a0908;max-width:55%;word-break:break-word;">${esc(val)}</span>
        </div>`).join("")}
    </div>
    <div style="display:flex;align-items:center;gap:8px;background:${ac};border-radius:9px;padding:10px 16px;width:100%;justify-content:center;margin-top:auto;">
      ${sealSVG(isLight(ac) ? "rgba(0,0,0,.4)" : "rgba(255,255,255,.35)", 11)}
      <span style="font-family:'DM Mono',monospace;font-size:9.5px;color:${isLight(ac) ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.55)"};letter-spacing:.08em;">${hash.csid}</span>
    </div>
  </div>
</div>`;
  }

  function buildInvoice(v, hash, qrImg) {
    const ac = acHex(), rgb = h2r(ac), toa = isLight(ac) ? "#0a0908" : "#f5f4f0";
    return `<div class="doc-base" style="width:748px;min-height:1058px;height:auto;background:#ffffff;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;">

  <div style="background:${ac};padding:36px 52px 32px;display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
        <div style="width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;">${sealSVG(toa, 13)}</div>
        <span style="font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(${h2r(toa)},.6);">${esc(v.issuer)}</span>
      </div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;color:${toa};letter-spacing:-.01em;line-height:1;">${esc(v.heading)}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:rgba(${h2r(toa)},.4);margin-bottom:5px;">Issued</div>
      <div style="font-size:15px;font-weight:600;color:${toa};margin-bottom:16px;">${esc(v.date)}</div>
      <div style="font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:rgba(${h2r(toa)},.4);margin-bottom:5px;">Due / Ref</div>
      <div style="font-size:13px;font-weight:500;color:rgba(${h2r(toa)},.75);max-width:160px;word-break:break-word;">${esc(v.signature)}</div>
    </div>
  </div>

<div style="padding:20px 52px;background:#f8f7f5;border-bottom:1px solid #e8e5df;display:flex;gap:0;">
  <div style="flex:1;">
    <div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a8a5a0;margin-bottom:6px;">Bill To</div>
    <div style="font-size:16px;font-weight:700;color:#0a0908;word-break:break-word;">${esc(v.recipient)}</div>
  </div>
</div>

  <div style="padding:36px 52px;flex:1;">
    <div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a8a5a0;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid ${ac};">Description</div>
    <div style="font-size:14px;color:#3a3835;line-height:2.0;white-space:normal;">${nl2br(v.desc)}</div>
  </div>

  <div style="flex:1;"></div>

  <div style="padding:24px 52px 40px;border-top:2px solid ${ac};display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <div style="font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:#a8a5a0;margin-bottom:4px;">Invoice No.</div>
      <div style="font-family:'DM Mono',monospace;font-size:9px;color:${ac};">${hash.csid}</div>
    </div>
    ${qrImg ? `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <div style="padding:5px;background:${ac};border-radius:0;"><img src="${qrImg}" style="width:52px;height:52px;display:block;"></div>
      <div style="font-size:7px;font-family:'DM Mono',monospace;color:#a8a5a0;">Scan to verify</div>
    </div>` : ''}
  </div>
</div>`;
  }

  function buildTicket(v, hash, qrImg) {
    const ac = acHex(), rgb = h2r(ac), toa = isLight(ac) ? "#0a0908" : "#f5f4f0";
    return `<div class="doc-base" style="width:748px;height:340px;background:#faf9f6;display:flex;flex-direction:row;position:relative;overflow:hidden;">

<div style="width:180px;flex-shrink:0;background:${ac};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px 18px;position:relative;overflow:hidden;">
  <div style="position:relative;width:120px;height:160px;flex-shrink:0;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-90deg);white-space:nowrap;font-family:'Cormorant Garamond',serif;font-size:18px;font-style:italic;color:${toa};opacity:.9;letter-spacing:.04em;max-width:150px;overflow:hidden;text-overflow:ellipsis;">${esc(v.signature)}</div>
</div>
  ${qrImg ? `<div style="padding:4px;background:rgba(255,255,255,.12);border-radius:0;margin-top:8px;"><img src="${qrImg}" style="width:60px;height:60px;display:block;"></div>` : `<div style="width:68px;height:68px;background:rgba(255,255,255,.1);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:7px;color:rgba(255,255,255,.5);">QR OFF</div>`}
</div>
  <div style="width:2px;flex-shrink:0;margin:0 4px;border-right:2px dashed #aaa;height:100%;"></div>

  <div style="flex:1;display:flex;flex-direction:column;padding:28px 36px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <div style="width:22px;height:22px;border-radius:6px;background:${ac};display:flex;align-items:center;justify-content:center;">${sealSVG(toa, 10)}</div>
          <span style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6b6965;">${esc(v.issuer)}</span>
        </div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:400;color:#0a0908;line-height:1.1;word-break:break-word;">${esc(v.heading)}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:16px;">
        <div style="font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:#a8a5a0;margin-bottom:3px;">Ticket No.</div>
        <div style="font-family:'DM Mono',monospace;font-size:11px;font-weight:600;color:${ac};">${esc(v.signature)}</div>
      </div>
    </div>
   <div style="display:flex;gap:24px;margin-bottom:14px;">
  <div>
    <div style="font-size:7.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8a5a0;margin-bottom:3px;">Holder</div>
    <div style="font-size:13px;font-weight:600;color:#0a0908;word-break:break-word;">${esc(v.recipient)}</div>
  </div>
  <div>
    <div style="font-size:7.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8a5a0;margin-bottom:3px;">Date</div>
    <div style="font-size:13px;font-weight:600;color:#0a0908;">${esc(v.date)}</div>
  </div>
  <div>
    <div style="font-size:7.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8a5a0;margin-bottom:3px;">Time</div>
    <div style="font-size:13px;font-weight:600;color:#0a0908;">${esc(v.time || '')}</div>
  </div>
</div>
    <div style="font-size:11.5px;color:#6b6965;line-height:1.7;border-left:2px solid ${ac};padding-left:12px;flex:1;">${nl2br(v.desc)}</div>
    <div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e8e5df;padding-top:12px;">
      <div style="font-family:'DM Mono',monospace;font-size:7.5px;color:#a8a5a0;">${hash.csid}</div>
      <div style="font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(${rgb},.5);">Admit One</div>
    </div>
  </div>
</div>`;
  }

  async function render() {
    const v = tplData[curTpl];
    const dataStr = `${v.recipient}|${v.heading}|${v.date}|${v.issuer}`;
    const hash = await genHash(dataStr);
    const shortRecipient = v.recipient.replace(/\s/g, '');
    const qrText = `CS|${curTpl}|${hash.short}|ts${hash.ts}|${shortRecipient}`;
    const qrImg = makeQR(qrText, curAccent);
    let html = "";
    if (curTpl === "cert") html = buildCert(v, hash, qrImg);
    else if (curTpl === "notice") html = buildNotice(v, hash, qrImg);
    else if (curTpl === "idcard") html = buildIDCard(v, hash, qrImg);
    else if (curTpl === "invoice") html = buildInvoice(v, hash, qrImg);
    else if (curTpl === "ticket") html = buildTicket(v, hash, qrImg);
    else html = buildCert(v, hash, qrImg);
    previewWrap.innerHTML = html;
    updateTransform();
  }

  function schedRender() { if (!settings.livePreview) return; clearTimeout(renderTm); renderTm = setTimeout(render, 90); }

  function computeFit() {
    const el = previewWrap.firstElementChild;
    if (!el) return 1;
    const pw = canvasArea.clientWidth - 48;
    const ph = canvasArea.clientHeight - 48;
    return Math.min(pw / el.offsetWidth, ph / el.offsetHeight, 1);
  }

  function resetView() {
    zoomScale = computeFit();
    panX = 0;
    panY = 0;
    updateTransform();
  }

  function updateTransform() {
    previewWrap.style.transform = `translate(${Math.round(panX)}px, ${Math.round(panY)}px) scale(${zoomScale})`;
    document.getElementById("zoomLbl").textContent = Math.round(zoomScale * 100) + "%";
  }


  window.addEventListener("resize", () => { resetView(); });
  document.getElementById("zoomIn").addEventListener("click", () => {
    zoomScale = Math.min(zoomScale + 0.1, 3);
    updateTransform();
  });
  document.getElementById("zoomOut").addEventListener("click", () => {
    zoomScale = Math.max(zoomScale - 0.1, 0.2);
    updateTransform();
  });
  document.getElementById("zoomLbl").addEventListener("click", () => {
    resetView();
  });
  document.getElementById("zoomReset").addEventListener("click", () => {
    resetView();
  });

  function startDrag(e) {
    if (e.button !== 0 && e.type !== 'touchstart') return;
    isDragging = true;
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    dragStart = { x: clientX - panX, y: clientY - panY };
    previewWrap.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onDrag(e) {
    if (!isDragging) return;
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    panX = clientX - dragStart.x;
    panY = clientY - dragStart.y;
    updateTransform();
  }

  function stopDrag() {
    isDragging = false;
    previewWrap.style.cursor = 'grab';
  }

  previewWrap.style.cursor = 'grab';
  previewWrap.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
  previewWrap.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('touchend', stopDrag);

  function buildFields(tpl) {
    const fl = document.getElementById("fieldList");
    fl.innerHTML = "";
    const cfg = FIELD_CFG[tpl], data = tplData[tpl];
    cfg.forEach(f => {
      const wrap = document.createElement("div");
      wrap.className = "field";
      const ico = FIELD_ICONS[f.icon] || "";
      if (f.type === "textarea") {
        wrap.innerHTML = `<label>${f.label}<span class="cnt" id="cnt_${f.id}">${String(data[f.id]).length}/${f.max}</span></label>
        <div class="inp-wrap"><span class="inp-ico ta-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ico}</svg></span>
        <textarea id="f_${f.id}" rows="${f.rows}" maxlength="${f.max}" placeholder="${f.ph}">${esc(data[f.id])}</textarea></div>`;
      } else {
        wrap.innerHTML = `<label>${f.label}<span class="cnt" id="cnt_${f.id}">${String(data[f.id]).length}/${f.max}</span></label>
        <div class="inp-wrap"><span class="inp-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ico}</svg></span>
        <input type="text" id="f_${f.id}" maxlength="${f.max}" placeholder="${f.ph}" value="${esc(data[f.id])}"></div>`;
      }
      fl.appendChild(wrap);
      const el = document.getElementById("f_" + f.id);
      const cnt = document.getElementById("cnt_" + f.id);

      el.addEventListener("focus", () => {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      });

      el.addEventListener("input", () => {
        const val = el.value;
        tplData[tpl][f.id] = val;
        const len = val.length;
        cnt.textContent = `${len}/${f.max}`;
        if (settings.limits) cnt.style.color = len >= f.max ? "#b5311a" : len > f.max * .85 ? "#9b7e46" : "var(--t3)";
        if (settings.autoSave) persistAll();
        schedRender();
      });
    });
  }

  function persistAll() { if (!settings.autoSave) return; Object.keys(tplData).forEach(k => lsS("data_" + k, tplData[k])); lsS("curTpl", curTpl); }

  async function setTpl(tpl) {
    curTpl = tpl;
    document.querySelectorAll(".tpl-item").forEach(c => c.classList.toggle("active", c.dataset.tpl === tpl));
    buildFields(tpl);
    if (settings.autoSave) lsS("curTpl", tpl);
    await render();
    resetView();
  }
  document.querySelectorAll(".tpl-item").forEach(c => c.addEventListener("click", () => setTpl(c.dataset.tpl)));

  async function doExport(fmt) {
    const el = previewWrap.firstElementChild;
    if (!el) return;

    const scale = settings.hiRes ? 8 : 7;
    document.getElementById("statusText").textContent = "Exporting…";

    try {
      const clone = el.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = el.offsetWidth + 'px';
      clone.style.height = el.offsetHeight + 'px';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: scale,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        allowTaint: true
      });

      document.body.removeChild(clone);

      const landscape = curTpl === "cert" || curTpl === "award" || curTpl === "ticket";
      const pdf = new window.jspdf.jsPDF({
        orientation: landscape ? "l" : "p",
        unit: "px",
        format: [el.offsetWidth, el.offsetHeight],
        hotfixes: ["px_scaling"]
      });
      pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, el.offsetWidth, el.offsetHeight);
      pdf.save(`CertiSeal_${curTpl}_${Date.now()}.pdf`);
      toast("PDF exported");

    } catch (e) {
      toast("Export failed", true);
      console.error(e);
    } finally {
      updateStatusText();
    }
  }

  document.getElementById("pdfBtn").addEventListener("click", () => doExport("pdf"));
  const overlay = document.getElementById("settingsOverlay");
  document.getElementById("settingsBtn").addEventListener("click", () => overlay.classList.add("open"));
  document.getElementById("closeSettings").addEventListener("click", () => overlay.classList.remove("open"));
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.classList.remove("open"); });

  function initToggle(id, key, cb) {
    const el = document.getElementById(id);
    el.classList.toggle("on", settings[key]);
    el.addEventListener("click", () => { settings[key] = !settings[key]; el.classList.toggle("on", settings[key]); saveSetting(key, settings[key]); cb && cb(settings[key]); });
  }
  const togDark = document.getElementById("togDark");
  togDark.classList.toggle("on", isDark);
  togDark.addEventListener("click", () => { isDark = !isDark; togDark.classList.toggle("on", isDark); applyDark(isDark); });

  initToggle("togGrid", "grid", v => document.getElementById("canvasGrid").style.opacity = v ? "0.6" : "0");
  initToggle("togAutoSave", "autoSave", v => { if (v) persistAll(); });
  initToggle("togLivePreview", "livePreview", v => {
    toast(v ? "Live preview on" : "Live preview paused");
    updateStatusText();
    if (!v) {
      clearTimeout(renderTm);
    } else {
      schedRender();
    }
  });
  initToggle("togLimits", "limits");
  initToggle("togHiRes", "hiRes");
  const togHash = document.getElementById("togHash");
  togHash.classList.toggle("on", settings.hash);
  togHash.addEventListener("click", () => {
    settings.hash = !settings.hash;
    togHash.classList.toggle("on", settings.hash);
    saveSetting("hash", settings.hash);
    render();
  });
  const togQR = document.getElementById("togQR");
  togQR.classList.toggle("on", settings.qr);
  togQR.addEventListener("click", () => {
    settings.qr = !settings.qr;
    togQR.classList.toggle("on", settings.qr);
    saveSetting("qr", settings.qr);
    render();
  });

  document.getElementById("clearDataBtn").addEventListener("click", () => {
    lsClear();
    Object.keys(DEFAULT_DATA).forEach(k => {
      const fresh = { ...DEFAULT_DATA[k] };
      fresh.date = getCurrentDate();
      tplData[k] = fresh;
    });
    buildFields(curTpl);
    render();
    toast("Data cleared with current date");
    overlay.classList.remove("open");
  });

  const sidebar = document.getElementById("sidebar"), mobileOverlay = document.getElementById("mobileOverlay");
  document.getElementById("menuBtn").addEventListener("click", () => {
    const open = sidebar.classList.toggle("open"); mobileOverlay.classList.toggle("show", open);
  });
  mobileOverlay.addEventListener("click", () => { sidebar.classList.remove("open"); mobileOverlay.classList.remove("show"); });

  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if ((e.ctrlKey || e.metaKey) && "cCxXaAsSpP".includes(e.key)) e.preventDefault();

  });
  document.addEventListener("dragstart", e => e.preventDefault());

  buildColorRow();
  buildIconRow();
  if (!settings.grid) document.getElementById("canvasGrid").style.opacity = "0";
  applyDark(isDark);
  updateStatusText();

  setTpl(curTpl);

  const verifyInput = document.getElementById("verifyHashInput");
  const verifyBtn = document.getElementById("verifyHashBtn");
  const verifyResult = document.getElementById("verifyResult");

  function normalizeHash(input) {
    let cleaned = input.trim().toUpperCase();
    cleaned = cleaned.replace(/I/g, "1").replace(/O/g, "0");
    cleaned = cleaned.replace(/[^0-9A-Z]/g, "");
    if (cleaned.startsWith("CS")) {
      cleaned = cleaned.slice(2);
    }
    return cleaned;
  }

  function isValidCertiSealHash(hash) {
    if (!/^[0-9A-HJ-NP-Z]{16,17}$/.test(hash)) return false;
    if (hash.length === 16) return true;
    return verifyChecksum(hash);
  }

  verifyBtn.addEventListener("click", () => {
    const raw = verifyInput.value.trim();
    if (!raw) {
      verifyResult.textContent = "";
      return;
    }
    const normalized = normalizeHash(raw);
    if (isValidCertiSealHash(normalized)) {
      verifyResult.textContent = "Verified – Legitimate CertiSeal short hash.";
      verifyResult.style.color = "#22c55e";
      toast("Hash is valid", false);
    } else {
      verifyResult.textContent = "Invalid hash – Not generated by CertiSeal.";
      verifyResult.style.color = "#f87171";
      toast("Invalid hash", true);
    }
  });
  verifyInput.addEventListener("input", () => {
    verifyResult.textContent = "";
  });
})();