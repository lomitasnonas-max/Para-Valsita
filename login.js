// =====================================================
//   login.js — lógica de login y bienvenida
//   Carga rápida: solo estas ~100 líneas
// =====================================================

const $ = id => document.getElementById(id);
let loginRole = null;
let toastTimer = null;

// ── Pétalos ligeros para el login (pocos) ──────────
(function() {
  const canvas = $('fx-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, { passive: true });

  const petals = [];
  const colors = ['#ff7eb3','#ffaed0','#d97ef5','#ffd6ea'];
  for (let i = 0; i < 8; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 3 + Math.random() * 4,
      vy: 0.4 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      op: 0.3 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => {
      p.y += p.vy; p.x += p.vx;
      if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
      ctx.globalAlpha = p.op;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (!document.hidden) requestAnimationFrame(loop);
    else setTimeout(loop, 500);
  }
  loop();
})();

// ── Mostrar login al cargar ────────────────────────
window.addEventListener('load', () => {
  const loader = $('loader');
  setTimeout(() => {
    loader.classList.add('out');
    setTimeout(() => {
      loader.style.display = 'none';
      $('login').classList.add('show');
    }, 500);
  }, 600);
});

// ── Login ──────────────────────────────────────────
function selectRole(role) {
  loginRole = role;
  document.querySelectorAll('.login-card').forEach(c => c.classList.remove('sel'));
  document.querySelectorAll('.login-card')[role === 'guest' ? 0 : 1].classList.add('sel');
  $('login-pass').classList.add('on');
  setTimeout(() => $('login-input').focus(), 300);
  $('login-err').classList.remove('on');
}

function doLogin() {
  const val = $('login-input').value.trim();
  const ok = loginRole === 'admin' ? val === ADMIN_PASS : val === GUEST_PASS;
  if (!ok) {
    $('login-err').classList.add('on');
    $('login-input').value = '';
    return;
  }
  // Guardar sesión y rol
  sessionStorage.setItem('nd-role', loginRole);
  sessionStorage.setItem('nd-auth', '1');

  $('login').classList.add('out');
  setTimeout(() => {
    $('login').style.display = 'none';
    // Ajustar saludo según hora
    const h = new Date().getHours();
    let saludo = 'esto lo hice pensando en ti 🩷';
    if (h >= 5 && h < 12) saludo = 'buenos días Ñalñita ☀️';
    else if (h >= 12 && h < 19) saludo = 'buenas tardes Ñalñita 🌸';
    else if (h >= 19 && h < 23) saludo = 'buenas noches Ñalñita 🌙';
    else saludo = '¿qué haces despierta? ve a descansar 💤';
    const tagEl = $('w-tag');
    if (tagEl) tagEl.textContent = saludo;
    $('welcome').classList.add('show');
  }, 700);
}

// ── Entrar al main ─────────────────────────────────
function enterMain() {
  $('welcome').classList.add('out');
  // Pequeño confeti rápido antes de redirigir
  spawnSimpleConfetti();
  setTimeout(() => {
    window.location.href = 'main.html';
  }, 600);
}

// ── Confeti simple para la transición ─────────────
function spawnSimpleConfetti() {
  const colors = ['#ff7eb3','#d97ef5','#ffaed0','#f5c842','#ffb7a0'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: -10px;
      width: ${4 + Math.random() * 6}px;
      height: ${4 + Math.random() * 6}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(el);
    el.animate([
      { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
      { transform: `translateY(${40 + Math.random() * 60}vh) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
    ], { duration: 800 + Math.random() * 400, easing: 'ease-in' });
    setTimeout(() => el.remove(), 1300);
  }
}
