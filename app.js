const BASE = 'https://rzfan03-api.vercel.app';
let rawResponse = '';
let history = JSON.parse(localStorage.getItem('rz_api_history') || '[]');

// ─── Scroll reveal ───
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ─── Counter ───
const cobs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.count);
    if (isNaN(target)) return;
    let cur = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const iv = setInterval(() => { cur = Math.min(cur + step, target); el.textContent = cur; if (cur >= target) clearInterval(iv); }, 30);
    cobs.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => cobs.observe(el));

// ─── Mobile menu ───
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');

menuBtn?.addEventListener('click', () => {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
});
closeMenu?.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
});
mobileMenu?.addEventListener('click', (e) => {
  if (e.target === mobileMenu) {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ─── Feature card → doc tab ───
document.querySelectorAll('[data-doc-cat]').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    const cat = card.dataset.docCat;
    const tab = document.querySelector(`.doc-tab[data-cat="${cat}"]`);
    if (tab) {
      activateDocTab(tab);
      document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Doc tabs ───
function activateDocTab(tab) {
  document.querySelectorAll('.doc-tab').forEach(t => {
    t.classList.remove('active', 'bg-zz-accent/10', 'text-zz-accent');
    t.classList.add('text-zz-muted');
  });
  tab.classList.add('active', 'bg-zz-accent/10', 'text-zz-accent');
  tab.classList.remove('text-zz-muted');
  const cat = tab.dataset.cat;
  document.querySelectorAll('.doc-panel').forEach(p => p.classList.add('hidden'));
  document.querySelector(`.doc-panel[data-cat="${cat}"]`)?.classList.remove('hidden');
}

document.querySelectorAll('.doc-tab').forEach(tab => {
  tab.addEventListener('click', () => activateDocTab(tab));
});

// ─── Endpoint accordion ───
function toggleEp(btn) {
  const ep = btn.closest('.ep');
  const bodyEl = btn.nextElementSibling;
  if (!bodyEl) return;
  // Close siblings
  ep.parentElement.querySelectorAll('.ep').forEach(e => {
    if (e !== ep) { e.classList.remove('open'); }
  });
  ep.classList.toggle('open');
}

// ─── Endpoint search ───
const epSearch = document.getElementById('epSearch');
let searchTimeout;
epSearch?.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const q = epSearch.value.toLowerCase().trim();
    if (!q) {
      // Reset: show all, remove highlights
      document.querySelectorAll('.doc-panel').forEach(p => {
        p.querySelectorAll('.ep').forEach(ep => { ep.style.display = ''; });
      });
      document.querySelectorAll('.doc-tab').forEach(t => t.style.display = '');
      return;
    }
    // Search all panels
    let firstMatch = null;
    document.querySelectorAll('.doc-panel').forEach(panel => {
      const cat = panel.dataset.cat;
      const tab = document.querySelector(`.doc-tab[data-cat="${cat}"]`);
      let hasMatch = false;
      panel.querySelectorAll('.ep').forEach(ep => {
        const text = ep.textContent.toLowerCase();
        const match = text.includes(q);
        ep.style.display = match ? '' : 'none';
        if (match) hasMatch = true;
      });
      if (tab) tab.style.display = hasMatch ? '' : 'none';
      if (hasMatch && !firstMatch) {
        firstMatch = tab;
        activateDocTab(tab);
      }
    });
  }, 150);
});

// Ctrl+K to focus search
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    epSearch?.focus();
    epSearch?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// ─── Playground ───
const pgMethod = document.getElementById('pgMethod');
const pgUrl = document.getElementById('pgUrl');
const pgBody = document.getElementById('pgBody');
const pgOutput = document.getElementById('pgOutput');
const pgStatus = document.getElementById('pgStatus');
const pgTime = document.getElementById('pgTime');
const pgBodyWrap = document.getElementById('pgBodyWrap');
const sendBtn = document.getElementById('sendBtn');

pgMethod?.addEventListener('change', () => {
  pgBodyWrap.classList.toggle('hidden', pgMethod.value !== 'POST');
});

async function sendRequest() {
  const method = pgMethod.value;
  const path = pgUrl.value.trim();
  if (!path) return;

  sendBtn.innerHTML = '<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-dasharray="30 60"/></svg>Sending';
  pgOutput.innerHTML = '<span style="color:rgba(134,126,142,.7);">Loading...</span>';
  pgStatus.textContent = ''; pgStatus.style.cssText = 'padding:4px 8px;font-size:10px;font-weight:700;border-radius:4px;';
  pgTime.textContent = '';

  const opts = { method, headers: {} };
  if (method === 'POST') {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = pgBody.value;
    try { JSON.parse(opts.body); } catch {
      pgOutput.textContent = '// Invalid JSON body';
      pgStatus.textContent = '400';
      pgStatus.style.cssText = 'padding:4px 8px;font-size:10px;font-weight:700;border-radius:4px;background:rgba(255,68,102,.1);color:#FF4466;';
      sendBtn.innerHTML = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Send';
      return;
    }
  }

  const t0 = performance.now();
  try {
    const res = await fetch(BASE + path, opts);
    const ms = Math.round(performance.now() - t0);
    const data = await res.json();
    rawResponse = JSON.stringify(data, null, 2);
    pgOutput.textContent = rawResponse;
    pgStatus.textContent = res.status;
    if (res.ok) {
      pgStatus.style.cssText = 'padding:4px 8px;font-size:10px;font-weight:700;border-radius:4px;background:rgba(0,180,66,.1);color:#00B442;';
    } else {
      pgStatus.style.cssText = 'padding:4px 8px;font-size:10px;font-weight:700;border-radius:4px;background:rgba(255,68,102,.1);color:#FF4466;';
    }
    pgTime.textContent = ms + 'ms';
    addHistory(method, path, res.status, ms);
  } catch (err) {
    const ms = Math.round(performance.now() - t0);
    pgOutput.textContent = '// ' + err.message;
    pgStatus.textContent = 'ERR';
    pgStatus.style.cssText = 'padding:4px 8px;font-size:10px;font-weight:700;border-radius:4px;background:rgba(255,68,102,.1);color:#FF4466;';
    pgTime.textContent = ms + 'ms';
    addHistory(method, path, 'ERR', ms);
  }
  sendBtn.innerHTML = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Send';
}

function quickTry(method, path, body) {
  pgMethod.value = method;
  pgUrl.value = path;
  pgBodyWrap.classList.toggle('hidden', method !== 'POST');
  if (method === 'POST') {
    if (body) {
      pgBody.value = body;
    } else {
      const bodies = { qrcode: {text:'https://example.com'}, 'base64/encode': {text:'Hello'}, 'base64/decode': {encoded:'SGVsbG8='}, shorturl: {url:'https://google.com'} };
      const key = Object.keys(bodies).find(k => path.includes(k));
      pgBody.value = JSON.stringify(bodies[key] || {}, null, 2);
    }
  }
  sendRequest();
  document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function tryEndpoint(method, path) { quickTry(method, path); }

function copyResponse() { if (rawResponse) navigator.clipboard.writeText(rawResponse); }
function formatJSON() {
  if (!rawResponse) return;
  try { rawResponse = JSON.stringify(JSON.parse(rawResponse), null, 2); pgOutput.textContent = rawResponse; } catch {}
}

// ─── History ───
function addHistory(method, path, status, time) {
  history.unshift({ method, path, status, time, ts: Date.now() });
  if (history.length > 20) history = history.slice(0, 20);
  localStorage.setItem('rz_api_history', JSON.stringify(history));
  renderHistory();
}
function renderHistory() {
  const wrap = document.getElementById('pgHistory');
  const list = document.getElementById('pgHistoryList');
  if (!history.length) { wrap.classList.add('hidden'); return; }
  wrap.classList.remove('hidden');
  list.innerHTML = history.map((h, i) => {
    const isGet = h.method === 'GET';
    const statusColor = typeof h.status === 'number' && h.status < 400 ? '#00B442' : '#FF4466';
    return `
    <button class="flex items-center gap-2 rounded-zz-sm border border-zz-border bg-zz-surface text-left transition-colors hover:border-zz-muted/40" style="padding:8px 12px;" onclick="loadHistory(${i})">
      <span class="shrink-0 font-mono" style="padding:4px 8px;font-size:9px;font-weight:700;border-radius:4px;background:${isGet ? 'rgba(0,180,66,.1)' : 'rgba(234,179,8,.1)'};color:${isGet ? '#00B442' : '#EAB308'};">${h.method}</span>
      <code class="flex-1 truncate font-mono text-zz-muted" style="font-size:11px;">${h.path}</code>
      <span class="shrink-0 font-mono" style="font-size:10px;color:${statusColor};">${h.status}</span>
      <span class="shrink-0 font-mono text-zz-muted" style="font-size:10px;opacity:.6;">${h.time}ms</span>
    </button>`;
  }).join('');
}
function loadHistory(i) {
  const h = history[i];
  if (!h) return;
  pgMethod.value = h.method;
  pgUrl.value = h.path;
  pgBodyWrap.classList.toggle('hidden', h.method !== 'POST');
  sendRequest();
}
function clearHistory() {
  history = [];
  localStorage.removeItem('rz_api_history');
  renderHistory();
}
renderHistory();

// ─── Keyboard ───
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    sendRequest();
  }
});
