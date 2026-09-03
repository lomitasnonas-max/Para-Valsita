// =====================================================
//   birthday.js — modo cumpleaños completamente aislado
//   No modifica app.js ni styles.css
//   Se auto-activa el día de COUNTDOWN_DATE
// =====================================================

(function() {
  'use strict';

  // ── Detectar si hoy es el cumpleaños ─────────────
  function isBirthday() {
    const now = new Date();
    let targetMonth, targetDay;
    if (typeof COUNTDOWN_DATE !== 'undefined' && COUNTDOWN_DATE) {
      const parts = COUNTDOWN_DATE.split('-');
      targetMonth = parseInt(parts[1]) - 1; // 0-indexed
      targetDay   = parseInt(parts[2]);
    } else {
      targetMonth = 8; // septiembre (0-indexed)
      targetDay   = 3;
    }
    return now.getMonth() === targetMonth && now.getDate() === targetDay;
  }

  // MODO PRUEBA: siempre activo — cambiar a isBirthday() el día del cumple
  if (false) return;

  // ── Aplicar clase al body INMEDIATAMENTE ─────────
  // Así el login y la bienvenida ya se ven de cumpleaños
  document.documentElement.classList.add('bday-mode');
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('bday-mode');
    launchPageConfetti(); // confeti flotando en toda la página
  });

  // ── Esperar a que el DOM esté listo ──────────────
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function() {
    buildBdayScreen();
    buildBdayModal();
    buildBdayFab();
    hookEnterMain();
  });

  // ── Construir pantalla de bienvenida ─────────────
  function buildBdayScreen() {
    const screen = document.createElement('div');
    screen.id = 'bday-screen';
    screen.innerHTML = `
      <div id="bday-confetti"></div>
      <div class="bday-inner">
        <div class="bday-top-emojis">
          <span>🎊</span><span>⭐</span><span>🎉</span><span>⭐</span><span>🎊</span>
        </div>
        <span class="bday-cake">🎂</span>
        <div class="bday-feliz">¡Feliz</div>
        <div class="bday-cumple">Cumpleaños!</div>
        <div class="bday-nombre">Ñalñita 🩷</div>
        <div class="bday-divider">
          <span class="bday-divider-txt">✦ ✧ ✦</span>
        </div>
        <div class="bday-welcome-text" id="bday-welcome-text"></div>
        <button class="bday-enter-btn" id="bday-enter-btn">
          ¡Ábrela hermana! 🩷
        </button>
        <div class="bday-bottom-emojis">🩷 🌸 ✨ 🌸 🩷</div>
      </div>
    `;
    document.body.appendChild(screen);

    // Llenar mensaje
    const msgEl = document.getElementById('bday-welcome-text');
    if (msgEl && typeof BDAY_WELCOME_MSG !== 'undefined') {
      const raw = BDAY_WELCOME_MSG.trim();
      const lines = raw.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
      msgEl.textContent = lines.length ? lines.join(' ') : '¡Hoy es tu día especial! 🎂';
    }

    // Lanzar confeti
    launchConfetti();

    // Botón entrar
    document.getElementById('bday-enter-btn').addEventListener('click', openBdayPauloModal);
  }

  // ── Confeti flotando en TODA la página (login, welcome, main) ──
  function launchPageConfetti() {
    const container = document.createElement('div');
    container.id = 'bday-page-confetti';
    container.style.cssText = `
      position: fixed; inset: 0;
      pointer-events: none; overflow: hidden;
      z-index: 9; /* encima del fondo pero debajo del contenido */
    `;
    document.body.appendChild(container);

    const items = ['🎂','🎈','🎉','⭐','🩷','✨','🌸','💜','🎊','🎁','💖','🌟','🩷','⭐'];
    for (let i = 0; i < 55; i++) {
      const el = document.createElement('div');
      el.className = 'bday-piece';
      el.textContent = items[Math.floor(Math.random() * items.length)];
      const size = 0.6 + Math.random() * 1.1;
      const dur  = 4 + Math.random() * 6;
      el.style.cssText = `
        position: absolute;
        top: -40px;
        left: ${Math.random() * 100}%;
        font-size: ${size}rem;
        animation: bdayFall ${dur}s linear ${Math.random() * dur}s infinite;
        opacity: 0.85;
      `;
      container.appendChild(el);
    }
  }

  // ── Confeti personalizado ─────────────────────────
  function launchConfetti() {
    const container = document.getElementById('bday-confetti');
    if (!container) return;
    const items = ['🎂','🎈','🎉','⭐','🩷','✨','🌸','💜','🎊','🎁','💖','🌟'];
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.className = 'bday-piece';
      el.textContent = items[Math.floor(Math.random() * items.length)];
      const size = 0.8 + Math.random() * 1.2;
      const dur  = 2.5 + Math.random() * 4;
      el.style.cssText = `
        left: ${Math.random() * 100}%;
        font-size: ${size}rem;
        animation-duration: ${dur}s;
        animation-delay: ${Math.random() * dur}s;
      `;
      container.appendChild(el);
    }
  }

  // ── Cerrar pantalla y arrancar música ────────────
  function closeBdayScreen() {
    const screen = document.getElementById('bday-screen');
    if (!screen) return;
    screen.style.transition = 'opacity .7s, transform .7s';
    screen.style.opacity    = '0';
    screen.style.transform  = 'scale(1.05)';
    setTimeout(() => { screen.style.display = 'none'; }, 700);

    // Confeti de corazones
    if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(40);
    if (typeof spawnConfetti      === 'function') spawnConfetti(50);

    // Reproducir canción de cumpleaños
    setTimeout(playBdaySong, 500);
  }

  function playBdaySong() {
    if (typeof BDAY_SONG === 'undefined' || !BDAY_SONG) return;
    const aud = document.getElementById('aud');
    if (!aud) return;
    // Buscar el personaje con esa canción
    if (typeof characters !== 'undefined' && typeof openCardByIndex === 'function') {
      const idx = characters.findIndex(c => c.song === BDAY_SONG);
      if (idx !== -1) {
        openCardByIndex(idx);
        if (typeof showToast === 'function') showToast('🎂 ¡canción especial de cumpleaños!');
        return;
      }
    }
    // Fallback: reproducir directamente
    aud.src = BDAY_SONG;
    aud.play().catch(() => {});
    if (typeof showToast === 'function') showToast('🎂 ¡feliz cumpleaños Ñalñita!');
  }

  // ── Construir modal de carta ──────────────────────
  function buildBdayModal() {
    const modal = document.createElement('div');
    modal.id = 'bday-modal';
    modal.innerHTML = `
      <div class="bday-modal-back" id="bday-modal-back"></div>
      <div class="bday-modal-box">
        <div class="bday-modal-particles" id="bday-modal-particles"></div>
        <button class="bday-modal-close" id="bday-modal-close">✕</button>

        <!-- Header -->
        <div class="bday-modal-hdr">
          <div class="bday-modal-ornament-top">✦ ✧ ✦ ✧ ✦</div>
          <span class="bday-modal-cake-icon">🎂</span>
          <div class="bday-modal-title-txt" id="bday-modal-title">Feliz Cumpleaños</div>
          <div class="bday-modal-ornament-bottom">✦ ✧ ✦</div>
        </div>

        <!-- Imagen (solo si hay) -->
        <div class="bday-modal-img-section" id="bday-modal-img-section">
          <div class="bday-polaroid">
            <div class="bday-polaroid-tape"></div>
            <img class="bday-polaroid-img" id="bday-polaroid-img" src="" alt="">
            <div class="bday-polaroid-caption">🩷 hoy es tu día</div>
          </div>
        </div>

        <!-- Carta -->
        <div class="bday-modal-body">
          <div class="bday-modal-letter-txt" id="bday-modal-letter"></div>
          <div class="bday-modal-sig">— con cariño, tu hermano Ñoñas 🩷</div>
        </div>

        <!-- Footer -->
        <div class="bday-modal-footer">
          <button class="bday-modal-close-btn" id="bday-modal-close-btn">¡Gracias! 🩷</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Eventos de cierre
    document.getElementById('bday-modal-back').addEventListener('click', closeBdayModal);
    document.getElementById('bday-modal-close').addEventListener('click', closeBdayModal);
    document.getElementById('bday-modal-close-btn').addEventListener('click', closeBdayModal);

    // Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeBdayModal();
    });
  }

  function openBdayModal() {
    const modal = document.getElementById('bday-modal');
    if (!modal) return;

    // Título
    const titleEl = document.getElementById('bday-modal-title');
    if (titleEl && typeof BDAY_LETTER_TITLE !== 'undefined') {
      titleEl.textContent = BDAY_LETTER_TITLE;
    }

    // Imagen
    const imgSection = document.getElementById('bday-modal-img-section');
    const img = document.getElementById('bday-polaroid-img');
    if (imgSection && img && typeof BDAY_IMG !== 'undefined' && BDAY_IMG.trim()) {
      img.src = BDAY_IMG;
      img.onload = () => imgSection.classList.add('has-img');
      img.onerror = () => imgSection.classList.remove('has-img');
    } else if (imgSection) {
      imgSection.classList.remove('has-img');
    }

    // Carta con párrafos animados
    const letterEl = document.getElementById('bday-modal-letter');
    if (letterEl) {
      letterEl.innerHTML = '';
      const raw = (typeof BDAY_LETTER !== 'undefined' ? BDAY_LETTER : '').trim();
      const paragraphs = raw
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p && !p.startsWith('//'));

      if (!paragraphs.length) {
        const p = document.createElement('p');
        p.textContent = '✨ pon tu carta en data.js → BDAY_LETTER 🎂';
        p.style.animationDelay = '.4s';
        letterEl.appendChild(p);
      } else {
        paragraphs.forEach((txt, i) => {
          const p = document.createElement('p');
          p.textContent = txt;
          p.style.animationDelay = (0.4 + i * 0.3) + 's';
          letterEl.appendChild(p);
        });
      }
    }

    // Partículas flotantes dentro del modal
    const particles = document.getElementById('bday-modal-particles');
    if (particles) {
      particles.innerHTML = '';
      const items = ['✦','✧','⭐','⋆','·','🌟','✨','💛'];
      for (let i = 0; i < 18; i++) {
        const s = document.createElement('span');
        s.className = 'bday-modal-particle';
        s.textContent = items[Math.floor(Math.random() * items.length)];
        s.style.cssText = `
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          font-size: ${7 + Math.random() * 13}px;
          animation-delay: ${Math.random() * 3}s;
          animation-duration: ${2 + Math.random() * 3}s;
        `;
        particles.appendChild(s);
      }
    }

    modal.classList.add('on');
    document.body.style.overflow = 'hidden';

    // Confeti al abrir
    if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(20);
    if (typeof playSparkle === 'function') playSparkle();
  }

  function closeBdayModal() {
    const modal = document.getElementById('bday-modal');
    if (!modal) return;
    modal.classList.remove('on');
    document.body.style.overflow = '';
  }

  // Exponer al scope global para el botón onclick
  window.openBdayModal  = openBdayModal;
  window.closeBdayModal = closeBdayModal;

  // ── Construir botón flotante 🎂 ──────────────────
  function buildBdayFab() {
    const fab = document.createElement('button');
    fab.id = 'bday-fab';
    fab.title = 'Mi carta de cumpleaños 🎂';
    fab.innerHTML = `🎂<span id="bday-fab-label">¡carta de cumpleaños!</span>`;
    fab.addEventListener('click', openBdayModal);
    document.body.appendChild(fab);
  }

  // ── Activar modo cumpleaños en la app ────────────
  function activateBdayMode() {
    document.body.classList.add('bday-mode');
    // Mostrar botón flotante
    const fab = document.getElementById('bday-fab');
    if (fab) {
      fab.classList.add('on');
    }
  }

  // ── Hook: esperar a que enterMain termine ─────────
  // Usamos MutationObserver para detectar cuando #main aparece
  // Sin tocar app.js
  function hookEnterMain() {
    // Mostrar pantalla de cumpleaños al entrar al main
    const main = document.getElementById('main');
    if (!main) return;

    const observer = new MutationObserver(() => {
      if (main.classList.contains('show')) {
        observer.disconnect();
        // Pequeño delay para que el main termine de aparecer
        setTimeout(() => {
          activateBdayMode();
          // Mostrar pantalla de cumpleaños
          const screen = document.getElementById('bday-screen');
          if (screen) screen.classList.add('show');
        }, 1100);
      }
    });
    observer.observe(main, { attributes: true, attributeFilter: ['class'] });
  }

})(); // Fin del IIFE — nada se filtra al scope global excepto openBdayModal y closeBdayModal

  // ── Modal especial Paulo Londra — La Ciudad Me Asfixia ──
  function buildPauloModal() {
    const modal = document.createElement('div');
    modal.id = 'bday-paulo-modal';
    modal.innerHTML = `
      <div class="bday-paulo-back" id="bday-paulo-back"></div>
      <div class="bday-paulo-box">
        <div class="bday-paulo-bg" id="bday-paulo-bg"></div>
        <div class="bday-paulo-overlay"></div>

        <div class="bday-paulo-inner">
          <div class="bday-paulo-badge">👑 Paulo Londra</div>
          <div class="bday-paulo-title">La Ciudad Me Asfixia</div>
          <div class="bday-paulo-sub">una canción para tu cumpleaños 🩷</div>

          <div class="bday-paulo-player">
            <div class="bday-paulo-disc" id="bday-paulo-disc">👑</div>
            <div class="bday-paulo-player-info">
              <div class="bday-paulo-song">La Ciudad Me Asfixia</div>
              <div class="bday-paulo-status" id="bday-paulo-status">toca ▶ para escuchar</div>
            </div>
            <button class="bday-paulo-btn" id="bday-paulo-btn" onclick="toggleBdayPaulo()">▶</button>
          </div>

          <div class="bday-paulo-msg" id="bday-paulo-msg"></div>

          <button class="bday-paulo-close-btn" onclick="closeBdayPauloModal()">
            Ver mi regalo completo 🎁
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('bday-paulo-back').addEventListener('click', closeBdayPauloModal);
  }

  window.openBdayPauloModal = function() {
    // Ocultar pantalla de cumpleaños
    const screen = document.getElementById('bday-screen');
    if (screen) {
      screen.style.transition = 'opacity .5s';
      screen.style.opacity = '0';
      setTimeout(() => { screen.style.display = 'none'; }, 500);
    }

    const modal = document.getElementById('bday-paulo-modal');
    if (!modal) return;

    // Imagen de fondo
    const bg = document.getElementById('bday-paulo-bg');
    if (bg && typeof BDAY_PAULO_IMG !== 'undefined' && BDAY_PAULO_IMG) {
      bg.style.backgroundImage = `url("${BDAY_PAULO_IMG}")`;
    }

    // Mensaje
    const msgEl = document.getElementById('bday-paulo-msg');
    if (msgEl && typeof BDAY_PAULO_MESSAGE !== 'undefined') {
      const raw = BDAY_PAULO_MESSAGE.trim();
      const lines = raw.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
      if (lines.length) {
        msgEl.textContent = lines.join('\n');
        msgEl.style.display = 'block';
      }
    }

    // Reproducir canción automáticamente
    const aud = document.getElementById('bday-paulo-aud');
    if (aud && typeof BDAY_PAULO_SONG !== 'undefined' && BDAY_PAULO_SONG) {
      aud.src = BDAY_PAULO_SONG;
      aud.volume = 0;
      aud.play().catch(() => {});
      let v = 0;
      const fi = setInterval(() => {
        v = Math.min(v + 0.05, .85); aud.volume = v;
        if (v >= .85) clearInterval(fi);
      }, 80);
      document.getElementById('bday-paulo-btn').textContent = '⏸';
      document.getElementById('bday-paulo-status').textContent = 'reproduciendo';
      const disc = document.getElementById('bday-paulo-disc');
      if (disc) disc.classList.add('spinning');
    }

    modal.classList.add('on');

    // Confeti al abrir
    if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(30);
    if (typeof spawnConfetti === 'function') spawnConfetti(40);
  };

  window.toggleBdayPaulo = function() {
    const aud = document.getElementById('bday-paulo-aud');
    const disc = document.getElementById('bday-paulo-disc');
    const btn  = document.getElementById('bday-paulo-btn');
    const status = document.getElementById('bday-paulo-status');
    if (!aud) return;
    if (aud.paused) {
      aud.play().catch(() => {});
      if (disc) disc.classList.add('spinning');
      if (btn) btn.textContent = '⏸';
      if (status) status.textContent = 'reproduciendo';
    } else {
      aud.pause();
      if (disc) disc.classList.remove('spinning');
      if (btn) btn.textContent = '▶';
      if (status) status.textContent = 'pausado';
    }
  };

  window.closeBdayPauloModal = function() {
    const modal = document.getElementById('bday-paulo-modal');
    if (modal) modal.classList.remove('on');
    // Parar audio con fade
    const aud = document.getElementById('bday-paulo-aud');
    if (aud) {
      let v = aud.volume;
      const fo = setInterval(() => {
        v = Math.max(v - 0.07, 0); aud.volume = v;
        if (v <= 0) { clearInterval(fo); aud.pause(); }
      }, 50);
    }
    // Ahora sí ir al gallery
    closeBdayScreen();
  };

  // Construir modal y audio al cargar
  ready(function() {
    buildPauloModal();
    // Agregar elemento de audio
    const aud = document.createElement('audio');
    aud.id = 'bday-paulo-aud';
    aud.volume = .85;
    document.body.appendChild(aud);
  });

