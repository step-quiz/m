/* auth.js ── Portal d'accés · Departament de Matemàtiques · INS Miquel Tarradell
 * ════════════════════════════════════════════════════════════════════════════════
 * Carregat al final de <body> de repartiment.html.
 *
 * CONFIGURACIÓ
 * ┌──────────────────┬──────────────────────────────────────────────────────────┐
 * │ AUTH_HASH        │ SHA-256 de la contrasenya del departament.               │
 * │                  │ Contrasenya per defecte: mates2526                       │
 * │                  │ Per canviar-la:                                          │
 * │                  │   1. Obriu la consola (F12 → Console)                    │
 * │                  │   2. Executeu: authHash('nova-clau').then(console.log)   │
 * │                  │   3. Substituïu AUTH_HASH pel hash obtingut              │
 * ├──────────────────┼──────────────────────────────────────────────────────────┤
 * │ SESSION_DAYS     │ Dies que dura la sessió guardada al navegador. Def: 30.  │
 * └──────────────────┴──────────────────────────────────────────────────────────┘
 */
(function () {
  'use strict';

  /* ── CONFIGURACIÓ ────────────────────────────────────────────────── */
  const AUTH_HASH   = '047e2342bbaf7d084c196e0af378d1922192b99a4add497bb618cc6e9d540cf1';
  const SESSION_KEY  = 'dept-auth-token';
  const SESSION_DAYS = 30;

  /* ── HELPERS CRIPTOGRÀFICS ────────────────────────────────────────── */
  async function sha256 (str) {
    const buf = await crypto.subtle.digest(
      'SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }
  window.authHash = sha256; /* des de la consola: authHash('clau').then(console.log) */

  /* ── SESSIÓ ───────────────────────────────────────────────────────── */
  function getSession () {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (!s || Date.now() > s.expires) { localStorage.removeItem(SESSION_KEY); return null; }
      return s;
    } catch { return null; }
  }
  function storeSession () {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      expires: Date.now() + SESSION_DAYS * 86_400_000,
    }));
  }
  window.clearAuth = function () {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
  };

  /* ── CSS DEL BADGE (sempre injectat, independentment de la sessió) ── */
  /*    Separar del CSS de la porta evita que el badge surti sense estils
   *    en visites on ja hi ha sessió (la porta no es construeix i el CSS
   *    de la porta mai s'injectava).                                      */
  const badgeStyle = document.createElement('style');
  badgeStyle.textContent = `
.auth-session-ind {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 20px;
  border: 1px solid rgba(34,197,94,.45);
  background: rgba(34,197,94,.08); color: #166534;
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: background .12s; white-space: nowrap;
  font-family: inherit;
}
.auth-session-ind:hover { background: rgba(34,197,94,.2); }
.auth-session-ind svg { width: 13px; height: 13px; flex-shrink: 0; }
  `;
  document.head.appendChild(badgeStyle);

  /* ── SESSIÓ VÀLIDA → BADGE I SORTIR ──────────────────────────────── */
  if (getSession()) {
    document.documentElement.classList.remove('auth-locked');
    document.addEventListener('DOMContentLoaded', injectSessionBadge);
    return;
  }

  /* ── NO HI HA SESSIÓ → CONSTRUIR LA PORTA ────────────────────────── */
  document.addEventListener('DOMContentLoaded', buildGate);

  /* ══════════════════════════════════════════════════════════════════ */

  function buildGate () {
    const style = document.createElement('style');
    style.textContent = `
/* ── Fons: paper de quadrícula ─────────────────────────────────── */
#auth-gate {
  position: fixed; inset: 0; z-index: 9990;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  background-color: #eef2fd;
  background-image:
    linear-gradient(rgba(80,110,220,.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80,110,220,.18) 1px, transparent 1px),
    linear-gradient(rgba(80,110,220,.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80,110,220,.07) 1px, transparent 1px);
  background-size: 80px 80px, 80px 80px, 16px 16px, 16px 16px;
  background-position: -1px -1px;
}
/* ── Targeta ────────────────────────────────────────────────────── */
#ag-card {
  background: #fffef8;
  width: 100%; max-width: 360px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 6px 20px rgba(0,0,0,.10), 0 24px 60px rgba(0,0,0,.12);
  position: relative; overflow: hidden;
  animation: ag-drop .5s cubic-bezier(.34,1.45,.64,1) both;
}
.ag-holes {
  position: absolute; left: 0; top: 0; bottom: 0; width: 48px;
  display: flex; flex-direction: column; align-items: center;
  justify-content: space-evenly; pointer-events: none;
  background: #f3f2ed; border-right: 1px solid #e0ddd0;
}
.ag-hole {
  width: 18px; height: 18px; border-radius: 50%;
  background: #eef2fd; border: 1.5px solid #ccc9bb;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.18);
}
.ag-margin-line {
  position: absolute; left: 48px; top: 0; bottom: 0;
  width: 2px; background: rgba(220,40,40,.3); pointer-events: none;
}
/* ── Capçalera ──────────────────────────────────────────────────── */
.ag-header {
  background: #1f3a5f;
  padding: 18px 20px 14px 64px; position: relative;
}
.ag-dept-line {
  font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
  color: rgba(255,255,255,.5); margin-bottom: 3px; font-weight: 600;
}
.ag-page-title { font-size: 16px; font-weight: 800; color: #fff; line-height: 1.2; }
.ag-deco {
  position: absolute; right: 16px; top: 8px; font-size: 44px;
  font-family: Georgia, serif; color: rgba(255,255,255,.09);
  user-select: none; line-height: 1;
}
/* ── Cos ────────────────────────────────────────────────────────── */
.ag-body {
  padding: 20px 20px 16px 64px;
  background-image: repeating-linear-gradient(
    transparent, transparent 31px, rgba(180,190,220,.22) 31px, rgba(180,190,220,.22) 32px);
  background-position: 0 26px;
}
.ag-prompt { font-size: 13px; color: #5a5870; margin-bottom: 18px; }
.ag-key-icon { font-size: 28px; display: block; text-align: center; margin-bottom: 14px; }
.ag-label {
  display: block; font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .07em;
  color: #9090a0; margin-bottom: 6px;
}
.ag-input {
  width: 100%; padding: 5px 0;
  border: none; border-bottom: 2px solid #1f3a5f;
  border-radius: 0; background: transparent;
  font-size: 15px; color: #22262b; outline: none;
  transition: border-color .15s;
}
.ag-input:focus { border-bottom-color: #2e75b6; }
.ag-input::placeholder { color: #c0bedd; font-style: italic; }
/* ── Error ──────────────────────────────────────────────────────── */
.ag-error {
  display: flex; align-items: center; gap: 7px;
  font-size: 12.5px; color: #c82020; margin-top: 12px; line-height: 1.35;
}
.ag-error::before {
  content: '!'; flex-shrink: 0; width: 17px; height: 17px; border-radius: 50%;
  background: #dc2626; color: #fff; font-size: 11px; font-weight: 900;
  display: inline-flex; align-items: center; justify-content: center;
}
[hidden] { display: none !important; }
/* ── Botó ───────────────────────────────────────────────────────── */
.ag-submit {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; margin-top: 20px; padding: 11px 16px;
  background: #1f3a5f; color: #fff;
  font-size: 14px; font-weight: 700;
  border: none; border-radius: 4px; cursor: pointer;
  transition: background .15s, transform .1s;
}
.ag-submit:hover:not(:disabled) { background: #2e75b6; }
.ag-submit:active:not(:disabled) { transform: scale(.98); }
.ag-submit:disabled { opacity: .6; cursor: not-allowed; }
.ag-submit-arrow { width: 18px; height: 18px; flex-shrink: 0; transition: transform .15s; }
.ag-submit:hover:not(:disabled) .ag-submit-arrow { transform: translateX(3px); }
/* ── Peu ────────────────────────────────────────────────────────── */
.ag-footer {
  padding: 9px 20px 10px 64px;
  font-size: 11px; color: #aeacbe;
  border-top: 1px solid #e8e5da; background: #faf9f3;
}
/* ── Animacions ─────────────────────────────────────────────────── */
@keyframes ag-drop {
  from { transform: translateY(-40px) scale(.97); opacity: 0; }
  to   { transform: none; opacity: 1; }
}
@keyframes ag-shake {
  0%,100% { transform: none; }
  15%  { transform: translateX(-10px) rotate(-1deg); }
  35%  { transform: translateX(10px) rotate(.8deg); }
  55%  { transform: translateX(-7px); }
  75%  { transform: translateX(7px); }
  90%  { transform: translateX(-3px); }
}
@keyframes ag-fly-out {
  from { transform: none; opacity: 1; }
  to   { transform: translateY(-70px) scale(.93); opacity: 0; }
}
#ag-card.ag-shake   { animation: ag-shake .4s ease; }
#ag-card.ag-success { animation: ag-fly-out .5s cubic-bezier(.4,0,1,1) forwards; }
    `;
    document.head.appendChild(style);

    const gate = document.createElement('div');
    gate.id = 'auth-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-label', 'Identificació del professorat');
    gate.innerHTML = `
    <div id="ag-card">
      <div class="ag-holes">
        <div class="ag-hole"></div>
        <div class="ag-hole"></div>
        <div class="ag-hole"></div>
      </div>
      <div class="ag-margin-line"></div>
      <header class="ag-header">
        <div class="ag-dept-line">INS Miquel Tarradell</div>
        <div class="ag-page-title">Departament de Matemàtiques</div>
        <div class="ag-deco" aria-hidden="true">∑</div>
      </header>
      <div class="ag-body">
        <p class="ag-prompt">Identifiqueu-vos per continuar:</p>
        <span class="ag-key-icon" aria-hidden="true">🔑</span>
        <label class="ag-label" for="ag-pass">Contrasenya del departament</label>
        <input class="ag-input" id="ag-pass" type="password"
               autocomplete="current-password" placeholder="••••••••">
        <div class="ag-error" id="ag-error" hidden role="alert"></div>
        <button class="ag-submit" id="ag-submit" type="button">
          <span id="ag-submit-txt">Entrar</span>
          <svg class="ag-submit-arrow" viewBox="0 0 20 20" fill="none"
               stroke="currentColor" stroke-width="2.2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 10h12M11 5l5 5-5 5"/>
          </svg>
        </button>
      </div>
      <footer class="ag-footer">La sessió es desa ${SESSION_DAYS} dies al navegador.</footer>
    </div>`;
    document.body.appendChild(gate);
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.remove('auth-locked');
    setTimeout(() => document.getElementById('ag-pass')?.focus(), 120);

    /* ── Events ──────────────────────────────────────────────────── */
    function setError (msg) {
      const el = document.getElementById('ag-error');
      el.textContent = msg; el.hidden = !msg;
      if (msg) {
        const card = document.getElementById('ag-card');
        card.classList.remove('ag-shake');
        void card.offsetWidth;
        card.classList.add('ag-shake');
      }
    }
    function setLoading (on) {
      document.getElementById('ag-submit').disabled = on;
      document.getElementById('ag-submit-txt').textContent = on ? 'Verificant…' : 'Entrar';
    }
    async function tryAuth () {
      const pass = document.getElementById('ag-pass').value || '';
      if (!pass) { setError('Introduïu la contrasenya.'); return; }
      setError(''); setLoading(true);
      try {
        const hash = await sha256(pass);
        if (hash !== AUTH_HASH) throw new Error('Contrasenya incorrecta.');
        storeSession();
        document.getElementById('ag-card').classList.add('ag-success');
        setTimeout(() => {
          const el = document.getElementById('auth-gate');
          el.style.transition = 'opacity .35s';
          el.style.opacity = '0';
          setTimeout(() => {
            el.remove();
            document.body.style.overflow = '';
            injectSessionBadge();
          }, 350);
        }, 480);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    gate.addEventListener('click', e => {
      if (e.target.closest('#ag-submit')) tryAuth();
    });
    gate.addEventListener('keydown', e => {
      if (e.key === 'Enter') tryAuth();
    });
  }

  /* ── BADGE DE SESSIÓ AL TOPBAR ────────────────────────────────────── */
  function injectSessionBadge () {
    const topbar = document.querySelector('.topbar, header.topbar');
    if (!topbar || topbar.querySelector('.auth-session-ind')) return;
    const badge = document.createElement('button');
    badge.className = 'auth-session-ind';
    badge.title = 'Sessió activa · Clic per tancar la sessió';
    badge.innerHTML = `
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8" cy="5.5" r="2.8"/>
        <path d="M2 14c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5"/>
      </svg>
      Sessió activa`;
    badge.addEventListener('click', () => {
      if (confirm('Voleu tancar la sessió?')) window.clearAuth();
    });
    topbar.appendChild(badge);
  }

})();
