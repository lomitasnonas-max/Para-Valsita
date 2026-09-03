// =====================================================
//   app.js
// =====================================================

const $ = id => document.getElementById(id);
const aud = $('aud');
const dedicaAud = $('dedica-aud');
aud.volume = .75;
dedicaAud.volume = .85;

let currentIdx = null;
let currentCard = null;
let isAdmin = false;
let lyricsTimer = null;
let lpTimer = null;
let dedicaLyricsTimer = null;
let loginRole = null;
let toastTimer = null;

// ════════════════════════════════════════════════════
//   LOGIN
// ════════════════════════════════════════════════════
function selectRole(role) {
  loginRole = role;
  document.querySelectorAll('.login-card').forEach(c => c.classList.remove('sel'));
  document.querySelectorAll('.login-card')[role === 'guest' ? 0 : 1].classList.add('sel');
  $('login-pass').classList.add('on');
  setTimeout(() => $('login-input').focus(), 300);
  $('login-err').classList.remove('on');
}

function doLogin() {
  const val = $('login-input').value;
  const ok = loginRole === 'admin' ? val === ADMIN_PASS : val === GUEST_PASS;
  if (!ok) {
    $('login-err').classList.add('on');
    $('login-input').value = '';
    return;
  }
  isAdmin = loginRole === 'admin';
  $('login').classList.add('out');
  const h = new Date().getHours();
  let saludo = 'esto lo hice pensando en ti 🩷';
  if (h >= 5  && h < 12) saludo = 'buenos días Ñalñita ☀️';
  else if (h >= 12 && h < 19) saludo = 'buenas tardes Ñalñita 🌸';
  else if (h >= 19 && h < 23) saludo = 'buenas noches Ñalñita 🌙';
  else saludo = '¿qué haces despierta? ve a descansar 💤';
  setTimeout(() => {
    $('login').style.display = 'none';
    const tagEl = document.querySelector('.w-tag');
    if (tagEl) tagEl.textContent = saludo;
    $('welcome').classList.add('show');
  }, 700);
}

function enterMain() {
  $('welcome').classList.add('out');
  spawnConfetti(60);
  if (typeof spawnHeartConfetti === 'function') setTimeout(() => spawnHeartConfetti(20), 800);
  setTimeout(() => {
    $('welcome').style.display = 'none';
    $('main').classList.add('show');
    renderGallery();
    setTimeout(() => $('msg-fab').classList.add('on'), 300);
    setTimeout(() => $('dedica-fab').classList.add('on'), 500);
    setTimeout(() => { const ff = $('final-fab'); if (ff) ff.classList.add('on'); }, 1200);
    setTimeout(() => { const pl = $('playlist-fab-card'); if (pl) pl.classList.add('on'); }, 700);
  }, 800);
}

// ════════════════════════════════════════════════════
//   GALERÍA
// ════════════════════════════════════════════════════
function renderGallery() {
  const g = $('gallery');
  g.innerHTML = '';
  const sorted = [
    ...characters.map((c, i) => ({ c, i })).filter(({ c }) => c.cat === 'paulo'),
    ...characters.map((c, i) => ({ c, i })).filter(({ c }) => c.cat !== 'paulo')
  ];
  const catLabel = { paulo: '👑 Paulo', kirby: 'Kirby', peach: '🍑 Peach', otro: '' };

  const catEmoji = { paulo: '👑', kirby: '🌸', peach: '🍑', otro: '✨' };

  sorted.forEach(({ c, i }, idx) => {
    const card = document.createElement('div');
    card.className = 'card' + (c.cat === 'paulo' ? ' paulo' : '');
    card.style.animationDelay = (idx * 0.07) + 's';
    const emoji = { paulo:'👑', kirby:'🌸', peach:'👸', otro:'🎵' }[c.cat] || '🎵';
    const badgeEmoji = catEmoji[c.cat] || '✨';
    // Mostrar solo el nombre sin números (Paulo 5 → Paulo, Kirby 3 → Kirby, etc.)
    const displayName = c.name.replace(/\s*\d+$/, '').trim();
    card.innerHTML = `
      <img src="${c.img}" alt="${displayName}"
           onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="card-fallback" style="display:none">
        <span class="card-fallback-emoji">${emoji}</span>
        <span class="card-fallback-name">${displayName}</span>
      </div>
      <div class="card-shine"></div>
      <div class="card-ov">
        <div class="card-name">${displayName}</div>
        <div class="card-song">🎵 ${c.songName}</div>
      </div>
      <div class="card-badge cat-${c.cat}">${badgeEmoji} ${displayName}</div>
      <div class="card-note">${c.cat === 'paulo' ? '👑' : '🎵'}</div>
    `;
    card.addEventListener('click', () => openCard(card, i));
    g.appendChild(card);
  });
}

// ════════════════════════════════════════════════════
//   ABRIR PERSONAJE
// ════════════════════════════════════════════════════
function openCard(card, i) {
  const ch = characters[i];

  if (currentCard) currentCard.classList.remove('playing');
  currentCard = card;
  currentIdx = i;
  card.classList.add('playing');

  dedicaAud.pause();
  $('dedica-btn').textContent = '▶';

  const isOniChan = (ch.song && ch.song.toLowerCase().includes('oni-chan')) ||
                    (ch.series && ch.series.toLowerCase().includes('oni-chan'));

  const hdrInner = document.querySelector('.modal-hdr-inner');
  const hdrBg = $('modal-hdr-bg');

  // SIEMPRE limpiar el fondo primero para evitar imágenes "fantasma" del personaje anterior
  hdrBg.style.backgroundImage = 'none';
  hdrBg.style.background = 'linear-gradient(135deg, rgba(40,15,55,.95), rgba(20,9,32,.95))';

  if (isOniChan) {
    $('modal-img').style.display = 'none';
    $('modal-video').style.display = 'block';
    $('modal-video-src').src = 'bochi.mp4';
    $('modal-video').load();
    $('modal-video').play().catch(() => {});
    hdrBg.style.background = 'linear-gradient(135deg, rgba(255,126,179,.15), rgba(217,126,245,.1))';
    if (hdrInner) hdrInner.classList.remove('has-img');
  } else {
    $('modal-img').style.display = 'block';
    $('modal-video').style.display = 'none';
    $('modal-video').pause();
    $('modal-img').src = ch.img;
    $('modal-img').onerror = () => $('modal-img').src = `https://via.placeholder.com/400/1c0d2e/ff7eb3?text=${encodeURIComponent(ch.name[0])}`;
    // Verificar que la imagen existe antes de ponerla de fondo
    const testImg = new Image();
    testImg.onload = () => {
      hdrBg.style.backgroundImage = `url("${ch.img}")`;
    };
    testImg.onerror = () => {
      // si la imagen no carga, dejar el degradado por defecto
      hdrBg.style.backgroundImage = 'none';
    };
    testImg.src = ch.img;
    if (hdrInner) hdrInner.classList.add('has-img');
  }

  $('modal-name').textContent = ch.name.replace(/\s*\d+$/, '').trim();
  $('modal-series').textContent = ch.series;
  $('m-song').textContent = ch.songName;

  renderCharMsg(ch.mensaje || '');

  $('lyrics-admin').style.display = isAdmin ? 'flex' : 'none';
  $('fetch-artist').value = ch.series || '';
  $('fetch-status').textContent = '';
  $('fetch-status').className = 'fetch-status';
  $('fetch-ic').textContent = '🔍';

  const cachedLyrics = JSON.parse(localStorage.getItem('nd-lyrics') || '{}');
  if (cachedLyrics[i]) {
    renderLyrics(cachedLyrics[i]);
  } else if (ch.lyrics && ch.lyrics.length) {
    renderLyrics(ch.lyrics);
  } else if (ch.songName && ch.series) {
    $('modal-lyrics').innerHTML = '<span style="color:rgba(255,255,255,.2);font-size:.78rem">🎵 buscando letras...</span>';
    fetchLyrics(ch.songName, ch.series).then(lyrics => {
      if (lyrics && lyrics.length) {
        cachedLyrics[i] = lyrics;
        localStorage.setItem('nd-lyrics', JSON.stringify(cachedLyrics));
        renderLyrics(lyrics);
      } else {
        $('modal-lyrics').innerHTML = '<span style="color:rgba(255,255,255,.18);font-size:.78rem">sin letras disponibles</span>';
      }
    });
  } else {
    renderLyrics(null);
  }

  $('modal').classList.add('on');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    aud.src = ch.song;
    aud.play().then(() => {
      $('p-btn').textContent = '⏸';
    }).catch(() => {
      // Móvil bloqueó autoplay — mostrar botón de play
      $('p-btn').textContent = '▶';
      $('p-img').classList.remove('go');
      $('p-wave').classList.remove('go');
    });
    // Aplicar tema de color según categoría
    if (typeof applyCharTheme === 'function') applyCharTheme(ch.cat);
    // Iniciar visualizador
    if (typeof startViz === 'function') startViz();
    $('p-img').src = ch.img;
    $('p-name').textContent = ch.name.replace(/\s*\d+$/, '').trim();
    $('p-song').textContent = '🎵 ' + ch.songName;
    $('p-img').classList.add('go');
    $('p-wave').classList.add('go');
    $('p-btn').textContent = '⏸';
    $('player').classList.add('on');
  }, 450);
}

function closeModal() {
  $('modal').classList.remove('on');
  document.body.style.overflow = '';
  $('modal-video').pause();
  if (typeof clearCharTheme === 'function') clearCharTheme();
  if (typeof stopViz === 'function') stopViz();
}

function togglePlay() {
  if (aud.paused) {
    aud.play();
    $('p-btn').textContent = '⏸';
    $('p-img').classList.add('go');
    $('p-wave').classList.add('go');
  } else {
    aud.pause();
    $('p-btn').textContent = '▶';
    $('p-img').classList.remove('go');
    $('p-wave').classList.remove('go');
  }
}

// ════════════════════════════════════════════════════
//   MENSAJES
// ════════════════════════════════════════════════════
function renderCharMsg(raw) {
  const box = $('char-msg');
  box.innerHTML = '';
  const text = (raw || '').trim();
  if (!text || text.startsWith('//')) {
    box.innerHTML = '<div class="msg-empty">pronto habrá algo aquí 🌸</div>';
    return;
  }
  text.split('\n').forEach((line, i) => {
    const p = document.createElement('p');
    p.className = 'msg-line';
    p.textContent = line;
    p.style.animationDelay = (i * 0.12) + 's';
    box.appendChild(p);
  });
}

// ════════════════════════════════════════════════════
//   LETRAS
// ════════════════════════════════════════════════════
function renderLyrics(lyrics) {
  clearInterval(lyricsTimer);
  clearInterval(lpTimer);
  const box = $('modal-lyrics');
  const panel = $('lyrics-panel');
  const ul = $('lp-lines');
  box.innerHTML = '';
  ul.innerHTML = '';

  if (!lyrics || !lyrics.length) {
    panel.classList.remove('on');
    return;
  }

  lyrics.forEach(l => {
    const d = document.createElement('div');
    d.className = 'lyric-line';
    d.textContent = l[1]; d.dataset.t = l[0];
    box.appendChild(d);
  });

  panel.classList.add('on');

  lyricsTimer = setInterval(() => {
    const t = aud.currentTime || 0;
    const lines = box.querySelectorAll('.lyric-line');
    let cur = -1;
    lines.forEach((l, i) => { if (t >= parseFloat(l.dataset.t)) cur = i; });
    lines.forEach((l, i) => {
      l.classList.toggle('cur', i === cur);
      l.classList.toggle('done', i < cur);
    });
    if (cur >= 0) lines[cur].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, 250);

  let lastCur = -1;
  function showWindow(cur) {
    ul.innerHTML = '';
    const start = Math.max(0, cur - 2);
    const end = Math.min(lyrics.length - 1, cur + 2);
    for (let i = start; i <= end; i++) {
      const li = document.createElement('li');
      li.textContent = lyrics[i][1];
      const d = i - cur;
      if (d === 0) li.className = 'active';
      else if (d === -1) li.className = 'prev1';
      else if (d === -2) li.className = 'prev2';
      else if (d === 1) li.className = 'next1';
      else if (d === 2) li.className = 'next2';
      ul.appendChild(li);
    }
  }
  showWindow(0);
  lpTimer = setInterval(() => {
    const t = aud.currentTime || 0;
    let cur = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (t >= lyrics[i][0]) cur = i;
    }
    if (cur === lastCur || cur < 0) return;
    lastCur = cur;
    showWindow(cur);
  }, 200);
}

// ════════════════════════════════════════════════════
//   LRCLIB
// ════════════════════════════════════════════════════
function parseLRC(raw) {
  const lines = [];
  raw.split('\n').forEach(line => {
    const m = line.match(/\[(\d+):(\d+\.?\d*)\](.*)/);
    if (m) {
      const secs = parseInt(m[1]) * 60 + parseFloat(m[2]);
      const text = m[3].trim();
      if (text) lines.push([secs, text]);
    }
  });
  return lines;
}

async function fetchLyrics(track, artist) {
  try {
    const q = encodeURIComponent(track + ' ' + artist);
    const res = await fetch(`https://lrclib.net/api/search?q=${q}`);
    const data = await res.json();
    if (!data.length) return null;
    const synced = data.find(d => d.syncedLyrics && d.artistName.toLowerCase().includes(artist.toLowerCase()))
                || data.find(d => d.syncedLyrics) || data[0];
    if (synced.syncedLyrics) return parseLRC(synced.syncedLyrics);
    if (synced.plainLyrics) {
      return synced.plainLyrics.split('\n').filter(l => l.trim()).map((l, i) => [i * 3, l]);
    }
  } catch (e) { console.log('lyrics error:', e); }
  return null;
}

async function adminFetchLyrics() {
  if (currentIdx === null) return;
  const ch = characters[currentIdx];
  const artist = $('fetch-artist').value || ch.series || '';
  const btn = document.querySelector('.fetch-btn');
  btn.disabled = true;
  $('fetch-ic').textContent = '⟳';
  $('fetch-status').textContent = 'buscando...';
  $('fetch-status').className = 'fetch-status';
  const result = await fetchLyrics(ch.songName, artist);
  btn.disabled = false;
  if (result && result.length) {
    const cached = JSON.parse(localStorage.getItem('nd-lyrics') || '{}');
    cached[currentIdx] = result;
    localStorage.setItem('nd-lyrics', JSON.stringify(cached));
    renderLyrics(result);
    $('fetch-ic').textContent = '✓';
    $('fetch-status').textContent = `${result.length} líneas 🩷`;
    $('fetch-status').className = 'fetch-status ok';
    showToast('🎵 letras guardadas');
  } else {
    $('fetch-ic').textContent = '✕';
    $('fetch-status').textContent = 'no encontrada';
    $('fetch-status').className = 'fetch-status fail';
  }
}

// ════════════════════════════════════════════════════
//   MENSAJES MODAL (FAB 💌)
// ════════════════════════════════════════════════════
function openMemModal() {
  const body = $('mem-body');
  const raw = (typeof GENERAL_MESSAGE !== 'undefined' ? GENERAL_MESSAGE : '').trim();
  body.innerHTML = '';
  if (!raw || raw.startsWith('//')) {
    body.innerHTML = '<div class="mem-empty">💌 pronto habrá algo bonito para ti 🌸</div>';
  } else {
    raw.split('\n').forEach((line, i) => {
      const p = document.createElement('p');
      p.className = 'msg-line';
      p.textContent = line;
      p.style.animationDelay = (i * 0.12) + 's';
      body.appendChild(p);
    });
  }
  $('mem-modal').classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeMemModal() {
  $('mem-modal').classList.remove('on');
  document.body.style.overflow = '';
}

// ════════════════════════════════════════════════════
//   DEDICATORIA
// ════════════════════════════════════════════════════
function openDedica() {
  aud.pause();
  $('p-btn').textContent = '▶';
  $('p-img').classList.remove('go');
  $('p-wave').classList.remove('go');

  $('dedica-img').src = 'Val.png';
  $('dedica-hdr-bg').style.backgroundImage = 'url(Val.png)';

  const carta = $('dedica-carta');
  const raw = (typeof DEDICA_MESSAGE !== 'undefined' ? DEDICA_MESSAGE : '').trim();
  carta.innerHTML = '';
  if (!raw || raw.startsWith('//')) {
    carta.innerHTML = '<span style="opacity:.4">pronto habrá algo aquí 🌸</span>';
  } else {
    raw.split('\n').forEach((line, i) => {
      const p = document.createElement('p');
      p.className = 'msg-line';
      p.textContent = line;
      p.style.animationDelay = (0.5 + i * 0.12) + 's';
      carta.appendChild(p);
    });
  }

  dedicaAud.src = 'Linkin Park - The Messenger.mp3';
  dedicaAud.volume = 0;

  $('dedica-modal').classList.add('on');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    dedicaAud.play().catch(() => {});
    $('dedica-btn').textContent = '⏸';
    let v = 0;
    const fade = setInterval(() => {
      v = Math.min(v + 0.05, 0.85);
      dedicaAud.volume = v;
      if (v >= 0.85) clearInterval(fade);
    }, 50);
    fetchLyrics('The Messenger', 'Linkin Park').then(lyrics => {
      if (lyrics && lyrics.length) renderDedicaLyrics(lyrics);
    });
  }, 500);
}

function closeDedica() {
  $('dedica-modal').classList.remove('on');
  document.body.style.overflow = '';
  const fade = setInterval(() => {
    if (dedicaAud.volume > 0.06) dedicaAud.volume -= 0.06;
    else { dedicaAud.pause(); dedicaAud.volume = 0.85; clearInterval(fade); }
  }, 40);
  $('dedica-btn').textContent = '▶';
  clearInterval(dedicaLyricsTimer);
}

function toggleDedica() {
  if (dedicaAud.paused) {
    aud.pause();
    dedicaAud.play();
    $('dedica-btn').textContent = '⏸';
  } else {
    dedicaAud.pause();
    $('dedica-btn').textContent = '▶';
  }
}

function renderDedicaLyrics(lyrics) {
  const box = $('dedica-lyrics');
  box.innerHTML = '';
  lyrics.forEach(l => {
    const d = document.createElement('div');
    d.className = 'd-lyric-line';
    d.textContent = l[1]; d.dataset.t = l[0];
    box.appendChild(d);
  });
  clearInterval(dedicaLyricsTimer);
  dedicaLyricsTimer = setInterval(() => {
    const t = dedicaAud.currentTime || 0;
    const lines = box.querySelectorAll('.d-lyric-line');
    let cur = -1;
    lines.forEach((l, i) => { if (t >= parseFloat(l.dataset.t)) cur = i; });
    lines.forEach((l, i) => {
      l.classList.toggle('cur', i === cur);
      l.classList.toggle('done', i < cur);
    });
    if (cur >= 0) lines[cur].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, 250);
}

// ════════════════════════════════════════════════════
//   PARTÍCULAS / CONFETI
// ════════════════════════════════════════════════════
const EMOJIS = ['🩷', '⭐', '✨', '💫', '🌸', '🎵', '💜'];
function spawnEP() {
  const p = document.createElement('div');
  p.className = 'ep';
  p.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const sz = 12 + Math.random() * 14;
  const dur = 9 + Math.random() * 8;
  p.style.cssText = `left:${Math.random()*100}vw;font-size:${sz}px;animation-duration:${dur}s;animation-delay:${Math.random()*dur}s`;
  $('particles').appendChild(p);
  setTimeout(() => p.remove(), (dur + 3) * 1000);
}
setInterval(spawnEP, 1000);
for (let i = 0; i < 10; i++) setTimeout(spawnEP, i * 100);

const CONF = ['#ff7eb3', '#d97ef5', '#ffaed0', '#ffd6ea', '#f5c842', '#a855f7'];
function spawnConfetti(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      const sz = 6 + Math.random() * 8;
      c.style.cssText = `position:fixed;z-index:9998;pointer-events:none;left:${Math.random()*100}vw;top:-20px;width:${sz}px;height:${sz}px;background:${CONF[Math.floor(Math.random()*CONF.length)]};border-radius:${Math.random()>.5?'50%':'2px'};animation:confF ${2+Math.random()*2}s linear forwards`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4500);
    }, i * 30);
  }
}
const style = document.createElement('style');
style.textContent = `@keyframes confF { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }`;
document.head.appendChild(style);

function showToast(msg) {
  $('toast').textContent = msg;
  $('toast').classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('on'), 2800);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeMemModal();
    closeDedica();
    if (typeof closeBook === 'function') closeBook();
    if (typeof closePlaylist === 'function') closePlaylist();
    if (typeof closeFechaEvidencia === 'function') closeFechaEvidencia();
    if (typeof closeFinal === 'function') closeFinal();
    if (typeof closeGame === 'function') closeGame();
    if (typeof closeSecret === 'function') closeSecret();
  }
  // Flechas para el libro si está abierto
  if ($('book-modal') && $('book-modal').classList.contains('on')) {
    if (e.key === 'ArrowRight') bookNext();
    if (e.key === 'ArrowLeft') bookPrev();
  }
});

// INIT
// ════════════════════════════════════════════════════
//   FRASE RANDOM EN BIENVENIDA
// ════════════════════════════════════════════════════
if (typeof RANDOM_PHRASES !== 'undefined' && RANDOM_PHRASES.length) {
  const phrase = RANDOM_PHRASES[Math.floor(Math.random() * RANDOM_PHRASES.length)];
  const tagEl = document.querySelector('.w-tag');
  if (tagEl) tagEl.textContent = phrase;
}

// ════════════════════════════════════════════════════
//   CONTADOR DE AMISTAD EN TIEMPO REAL
// ════════════════════════════════════════════════════
function updateCounter() {
  if (typeof FRIENDSHIP_START === 'undefined') return;
  const start = new Date(FRIENDSHIP_START).getTime();
  const now = new Date().getTime();
  const diff = Math.max(0, now - start);

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins  = Math.floor((diff / (1000 * 60)) % 60);
  const secs  = Math.floor((diff / 1000) % 60);

  const setN = (id, val) => {
    const el = $(id);
    if (!el) return;
    if (el.textContent !== String(val)) {
      el.classList.remove('flip');
      void el.offsetWidth;
      el.classList.add('flip');
      el.textContent = val;
    }
  };
  setN('fc-days', days);
  setN('fc-hours', hours);
  setN('fc-mins', mins);
  setN('fc-secs', secs);
}
setInterval(updateCounter, 1000);
updateCounter();

// ════════════════════════════════════════════════════
//   CORAZÓN SECRETO — easter egg 5 taps
// ════════════════════════════════════════════════════
let heartTaps = 0;
let heartTimer = null;
function tapHeart() {
  heartTaps++;
  const heart = $('secret-heart');
  heart.classList.remove('tapped');
  void heart.offsetWidth;
  heart.classList.add('tapped');

  clearTimeout(heartTimer);
  heartTimer = setTimeout(() => { heartTaps = 0; }, 3000);

  if (heartTaps >= 5) {
    heartTaps = 0;
    openSecret();
  }
}

function openSecret() {
  const carta = $('secret-letter');
  const raw = (typeof SECRET_CARD !== 'undefined' ? SECRET_CARD : '').trim();
  carta.innerHTML = '';
  if (!raw || raw.startsWith('//')) {
    carta.innerHTML = '<span style="opacity:.4">pon tu carta secreta en data.js 🌸</span>';
  } else {
    raw.split('\n').forEach((line, i) => {
      const p = document.createElement('p');
      p.className = 'msg-line';
      p.textContent = line;
      p.style.animationDelay = (1 + i * 0.12) + 's';
      carta.appendChild(p);
    });
  }

  // Reset envelope
  const env = $('secret-env');
  env.classList.remove('opening', 'opened');
  $('secret-content').classList.remove('show');

  $('secret-modal').classList.add('on');
  document.body.style.overflow = 'hidden';

  // Confetti
  spawnConfetti(40);

  // Click envelope to open
  env.onclick = () => {
    env.classList.add('opening');
    setTimeout(() => {
      env.classList.add('opened');
      $('secret-content').classList.add('show');
      spawnConfetti(60);
    }, 600);
  };
}

function closeSecret() {
  $('secret-modal').classList.remove('on');
  document.body.style.overflow = '';
}

// ════════════════════════════════════════════════════
//   DESPEDIDA AL CERRAR PESTAÑA
// ════════════════════════════════════════════════════
window.addEventListener('beforeunload', () => {
  // intento de mostrar despedida — solo se ve un momento
  $('bye-screen').classList.add('on');
});

// INIT
$('w-name').textContent = FRIEND_NAME;

// ════════════════════════════════════════════════════
//   MEJORAS PREMIUM v2
// ════════════════════════════════════════════════════

// ── Cursor glow que sigue el mouse (solo escritorio) ──
(function() {
  if (window.matchMedia('(hover: none)').matches || window.innerWidth < 769) return;
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  let raf = null;
  document.addEventListener('mousemove', e => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }, { passive: true });
})();

// ── Corazones que suben en la bienvenida ──
(function() {
  const cont = document.getElementById('welcome-hearts');
  if (!cont) return;
  const hearts = ['🩷', '💜', '🌸', '✨', '💗'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    const dur = 6 + Math.random() * 6;
    s.style.cssText = `left:${Math.random()*100}%;font-size:${0.9+Math.random()*1.2}rem;animation-duration:${dur}s;animation-delay:${Math.random()*dur}s`;
    cont.appendChild(s);
  }
})();

// ── Barra de progreso del reproductor ──
(function() {
  const bar = document.getElementById('player-progress');
  if (!bar) return;
  setInterval(() => {
    if (aud.duration && !isNaN(aud.duration)) {
      const pct = (aud.currentTime / aud.duration) * 100;
      bar.style.width = pct + '%';
    }
  }, 250);
})();

// ── Tilt 3D sutil en tarjetas al mover el mouse ──
(function() {
  if (window.matchMedia('(hover: none)').matches) return;
  let activeCard = null;
  function reset(card) {
    if (!card) return;
    card.classList.remove('tilting');
    card.style.transform = '';
  }
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.card');
    if (!card) {
      if (activeCard) { reset(activeCard); activeCard = null; }
      return;
    }
    if (card.classList.contains('playing')) return;
    if (activeCard !== card) {
      if (activeCard) reset(activeCard);
      activeCard = card;
      card.classList.add('tilting');
    }
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    card.style.transform = `scale(1.06) translateY(-6px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg)`;
  }, { passive: true });
})();

// ── Confeti de corazones (extra) ──
function spawnHeartConfetti(n) {
  const hearts = ['🩷', '💜', '💗', '🌸', '✨'];
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'heart-confetti';
      h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      h.style.cssText = `left:${Math.random()*100}vw;top:-30px;font-size:${0.9+Math.random()*1.1}rem;animation-duration:${2.5+Math.random()*2}s`;
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 5000);
    }, i * 40);
  }
}

// Confeti de corazones disponible globalmente para easter eggs


// ════════════════════════════════════════════════════
//   NAVEGACIÓN ENTRE CANCIONES (prev / next / autoplay)
// ════════════════════════════════════════════════════

// Orden visible de la galería (Paulo primero, igual que renderGallery)
function getOrderedIndices() {
  const paulo = characters.map((c, i) => i).filter(i => characters[i].cat === 'paulo');
  const rest  = characters.map((c, i) => i).filter(i => characters[i].cat !== 'paulo');
  return [...paulo, ...rest];
}

function gotoOffset(offset) {
  if (currentIdx === null) return;
  const order = getOrderedIndices();
  const pos = order.indexOf(currentIdx);
  if (pos === -1) return;
  const next = (pos + offset + order.length) % order.length;
  openCardByIndex(order[next]);
}

function openCardByIndex(i) {
  const cards = document.querySelectorAll('.card');
  const order = getOrderedIndices();
  const pos = order.indexOf(i);
  if (pos >= 0 && cards[pos]) {
    openCard(cards[pos], i);
  }
}

function prevSong() { gotoOffset(-1); }
function nextSong() {
  // Si está reproduciendo "Mi Lista", pasar a la siguiente de esa lista
  if (typeof myListPlaying !== 'undefined' && myListPlaying && myListPlaying.length) {
    const pos = myListPlaying.indexOf(currentIdx);
    if (pos !== -1 && pos < myListPlaying.length - 1) {
      openCardByIndex(myListPlaying[pos + 1]);
      return;
    } else if (pos === myListPlaying.length - 1) {
      // Termina la lista
      myListPlaying = null;
      showToast('✨ lista terminada');
      return;
    }
  }
  gotoOffset(1);
}

// Autoplay: al terminar una canción, pasar a la siguiente
aud.addEventListener('ended', () => {
  if (currentIdx !== null && $('modal').classList.contains('on')) {
    nextSong();
  }
});

// Teclas de flecha para navegar
document.addEventListener('keydown', e => {
  if (!$('modal').classList.contains('on')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); nextSong(); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); prevSong(); }
});

// ════════════════════════════════════════════════════
//   MODO DÍA / NOCHE
// ════════════════════════════════════════════════════
function applyThemeByHour() {
  const h = new Date().getHours();
  // Día: 7am - 7pm
  const isDay = h >= 7 && h < 19;
  document.body.classList.toggle('day-mode', isDay);
  updateThemeIcon();
}
function toggleTheme() {
  document.body.classList.toggle('day-mode');
  updateThemeIcon();
}
function updateThemeIcon() {
  const btn = $('theme-toggle');
  if (btn) btn.textContent = document.body.classList.contains('day-mode') ? '☀️' : '🌙';
}
applyThemeByHour();

// ════════════════════════════════════════════════════
//   LIBRO DE RECUERDOS
// ════════════════════════════════════════════════════
let bookIndex = 0;
function openBook() {
  bookIndex = 0;
  renderBookPage();
  $('book-modal').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeBook() {
  $('book-modal').classList.remove('on');
  document.body.style.overflow = '';
}
function renderBookPage(direction) {
  if (typeof MEMORIES_BOOK === 'undefined' || !MEMORIES_BOOK.length) {
    $('book-page-text').textContent = 'pronto habrá recuerdos aquí 🌸';
    $('book-counter').textContent = '0 / 0';
    return;
  }
  const page = MEMORIES_BOOK[bookIndex];
  const imgEl = $('book-page-img');
  const txtEl = $('book-page-text');
  const dateEl = $('book-page-date');

  // imagen con zoom al tocar
  imgEl.classList.remove('has-img');
  imgEl.style.backgroundImage = '';

  imgEl.onclick = null;
  const testImg = new Image();
  testImg.onload = () => {
    imgEl.style.backgroundImage = `url("${page.img}")`;
    imgEl.classList.add('has-img');



  };
  testImg.src = page.img;

  // fecha
  if (dateEl) {
    dateEl.textContent = page.fecha || '';
    dateEl.style.display = page.fecha ? 'block' : 'none';
  }

  // texto
  const raw = (page.text || '').trim();
  txtEl.textContent = (!raw || raw.startsWith('//')) ? '✨ pon aquí este recuerdo 🌸' : raw;

  $('book-counter').textContent = `${bookIndex + 1} / ${MEMORIES_BOOK.length}`;

  // puntos indicadores
  renderBookDots();

  // animación de voltear página según dirección
  const pg = $('book-page-front');
  if (pg) {
    pg.classList.remove('flip-next', 'flip-prev');
    void pg.offsetWidth;
    if (direction === 'next') pg.classList.add('flip-next');
    else if (direction === 'prev') pg.classList.add('flip-prev');
  }
}

function renderBookDots() {
  const dots = $('book-dots');
  if (!dots) return;
  dots.innerHTML = '';
  MEMORIES_BOOK.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'book-dot' + (i === bookIndex ? ' active' : '');
    d.addEventListener('click', () => {
      if (i === bookIndex) return;
      const dir = i > bookIndex ? 'next' : 'prev';
      bookIndex = i;
      renderBookPage(dir);
    });
    dots.appendChild(d);
  });
}
function bookNext() {
  if (typeof MEMORIES_BOOK === 'undefined' || !MEMORIES_BOOK.length) return;
  bookIndex = (bookIndex + 1) % MEMORIES_BOOK.length;
  renderBookPage('next');
}
function bookPrev() {
  if (typeof MEMORIES_BOOK === 'undefined' || !MEMORIES_BOOK.length) return;
  bookIndex = (bookIndex - 1 + MEMORIES_BOOK.length) % MEMORIES_BOOK.length;
  renderBookPage('prev');
}

// ════════════════════════════════════════════════════
//   MINI-JUEGO MEMORAMA
// ════════════════════════════════════════════════════
let gameCards = [];
let gameFlipped = [];
let gameMatched = 0;
let gameMoves = 0;
let gameLock = false;

function openGame() {
  $('game-modal').classList.add('on');
  document.body.style.overflow = 'hidden';
  startGame();
}
function closeGame() {
  $('game-modal').classList.remove('on');
  document.body.style.overflow = '';
}

function startGame() {
  // Usar imágenes de los personajes (elige 8 al azar de la galería)
  const withImg = characters.filter(c => c.img && c.img.trim() !== '');
  const shuffledChars = shuffleArray(withImg).slice(0, 8);

  // Si no hay suficientes con imagen, completar con emojis de respaldo
  const emojiBackup = ['🩷','⭐','🌸','🎵','💜','✨','👑','🍑'];
  const faces = [];
  for (let i = 0; i < 8; i++) {
    if (shuffledChars[i]) {
      faces.push({ type: 'img', val: shuffledChars[i].img, id: 'c' + i });
    } else {
      faces.push({ type: 'emoji', val: emojiBackup[i], id: 'e' + i });
    }
  }

  const pairs = [...faces, ...faces];
  // shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  gameCards = pairs;
  gameFlipped = [];
  gameMatched = 0;
  gameMoves = 0;
  gameLock = false;

  $('game-moves').textContent = '0';
  $('game-pairs').textContent = '0';
  $('game-total').textContent = faces.length;
  $('game-win').classList.remove('show');
  $('game-grid').style.display = 'grid';

  const grid = $('game-grid');
  grid.innerHTML = '';
  pairs.forEach((face, i) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.face = face.id;  // comparar por id de pareja
    card.dataset.idx = i;

    let frontContent;
    if (face.type === 'img') {
      frontContent = `<img class="game-card-img" src="${face.val}" alt=""
        onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('span'),{textContent:'🩷',style:'font-size:1.8rem'}))">`;
    } else {
      frontContent = `<span style="font-size:1.8rem">${face.val}</span>`;
    }

    card.innerHTML = `
      <div class="game-card-face game-card-back">?</div>
      <div class="game-card-face game-card-front">${frontContent}</div>
    `;
    card.addEventListener('click', () => flipCard(card));
    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (gameLock) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  gameFlipped.push(card);

  if (gameFlipped.length === 2) {
    gameMoves++;
    $('game-moves').textContent = gameMoves;
    gameLock = true;

    const [a, b] = gameFlipped;
    if (a.dataset.face === b.dataset.face) {
      // pareja
      setTimeout(() => {
        a.classList.add('matched');
        b.classList.add('matched');
        gameFlipped = [];
        gameLock = false;
        gameMatched++;
        $('game-pairs').textContent = gameMatched;
        if (gameMatched === 8) winGame();
      }, 500);
    } else {
      // no pareja
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        gameFlipped = [];
        gameLock = false;
      }, 900);
    }
  }
}

function winGame() {
  spawnConfetti(80);
  if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(30);
  $('game-grid').style.display = 'none';
  $('game-win-msg').textContent = `Te quiero mucho Hermana Ñalñita 🩷`;
  $('game-win').classList.add('show');
}

// ════════════════════════════════════════════════════
//   CUENTA REGRESIVA
// ════════════════════════════════════════════════════
function updateCountdown() {
  if (typeof COUNTDOWN_DATE === 'undefined') return;
  const target = new Date(COUNTDOWN_DATE).getTime();
  const now = new Date().getTime();
  let diff = target - now;

  const cd = $('countdown');
  if (diff <= 0) {
    // Ya llegó la fecha
    if ($('cd-label')) $('cd-label').textContent = '🎉 ¡hoy es tu día! 🎉';
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => { if($(id)) $(id).textContent = '0'; });
    return;
  }

  const days  = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff / (1000*60*60)) % 24);
  const mins  = Math.floor((diff / (1000*60)) % 60);
  const secs  = Math.floor((diff / 1000) % 60);

  if ($('cd-days'))  $('cd-days').textContent = days;
  if ($('cd-hours')) $('cd-hours').textContent = hours;
  if ($('cd-mins'))  $('cd-mins').textContent = mins;
  if ($('cd-secs'))  $('cd-secs').textContent = secs;

  if ($('cd-label') && typeof COUNTDOWN_LABEL !== 'undefined') {
    $('cd-label').textContent = '⏳ faltan para ' + COUNTDOWN_LABEL;
  }
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ════════════════════════════════════════════════════
//   SONIDO AL TOCAR (Web Audio API — sin archivos)
// ════════════════════════════════════════════════════
let soundOn = true;
let audioCtx = null;

function initAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playPop() {
  if (!soundOn) return;
  initAudioCtx();
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.frequency.value = 420;
  o.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.08);
  g.gain.setValueAtTime(0.12, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
  o.start();
  o.stop(audioCtx.currentTime + 0.12);
}

function playSparkle() {
  if (!soundOn) return;
  initAudioCtx();
  if (!audioCtx) return;
  [880, 1320, 1760].forEach((freq, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    const t = audioCtx.currentTime + i * 0.05;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.start(t);
    o.stop(t + 0.25);
  });
}

function toggleSound() {
  soundOn = !soundOn;
  const btn = $('sound-toggle');
  if (btn) {
    btn.textContent = soundOn ? '🔊' : '🔇';
    btn.classList.toggle('muted', !soundOn);
  }
  if (soundOn) playSparkle();
}

// Sonidos en interacciones
document.addEventListener('click', e => {
  const card = e.target.closest('.card');
  const fab  = e.target.closest('#msg-fab, #dedica-fab, #book-fab, #game-fab, .w-btn');
  const small = e.target.closest('.login-card, .modal-x, .book-arrow, .game-card, .p-nav');
  if (card || fab) playPop();
  else if (small) playSparkle();
}, { passive: true });

// ════════════════════════════════════════════════════
//   TEMA DE COLOR POR PERSONAJE
// ════════════════════════════════════════════════════
function applyCharTheme(cat) {
  document.body.classList.remove('theme-paulo', 'theme-kirby', 'theme-peach', 'theme-otro');
  if (cat) document.body.classList.add('theme-' + cat);
}
function clearCharTheme() {
  document.body.classList.remove('theme-paulo', 'theme-kirby', 'theme-peach', 'theme-otro');
}

// ════════════════════════════════════════════════════
//   VISUALIZADOR DE MÚSICA
// ════════════════════════════════════════════════════
let vizCanvas, vizCtx, vizAnalyser, vizData, vizRAF, vizSource;
let vizSetup = false;

function setupVisualizer() {
  if (vizSetup) return;
  vizCanvas = $('viz-canvas');
  if (!vizCanvas) return;
  vizCtx = vizCanvas.getContext('2d');
  resizeViz();
  window.addEventListener('resize', resizeViz);
  // NOTA: visualizador deshabilitado para que el audio funcione siempre.
  // createMediaElementSource(aud) secuestra el audio a través del AudioContext,
  // y si el contexto está suspendido (común en navegadores) el audio no suena.
  vizSetup = false;
}

function resizeViz() {
  if (!vizCanvas) return;
  vizCanvas.width = window.innerWidth;
  vizCanvas.height = window.innerHeight;
}

function drawViz() {
  if (!vizSetup || !vizAnalyser) return;
  vizRAF = requestAnimationFrame(drawViz);
  vizAnalyser.getByteFrequencyData(vizData);

  vizCtx.clearRect(0, 0, vizCanvas.width, vizCanvas.height);

  const cx = vizCanvas.width / 2;
  const cy = vizCanvas.height / 2;
  const bars = vizData.length;
  const step = (Math.PI * 2) / bars;

  // Color según tema actual
  const styles = getComputedStyle(document.body);
  const rose = styles.getPropertyValue('--rose').trim() || '#ff7eb3';
  const lila = styles.getPropertyValue('--lila').trim() || '#d97ef5';

  for (let i = 0; i < bars; i++) {
    const v = vizData[i] / 255;
    const barH = v * 120;
    const angle = step * i;
    const r1 = 140;
    const r2 = r1 + barH;
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;

    const grad = vizCtx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, rose);
    grad.addColorStop(1, lila);
    vizCtx.strokeStyle = grad;
    vizCtx.lineWidth = 3;
    vizCtx.globalAlpha = 0.4 + v * 0.6;
    vizCtx.beginPath();
    vizCtx.moveTo(x1, y1);
    vizCtx.lineTo(x2, y2);
    vizCtx.stroke();
  }
  vizCtx.globalAlpha = 1;
}

function startViz() {
  setupVisualizer();
  if (!vizSetup) return;
  $('viz-canvas').classList.add('on');
  if (!vizRAF) drawViz();
}
function stopViz() {
  $('viz-canvas').classList.remove('on');
}

// ════════════════════════════════════════════════════
//   MOTOR DE EFECTOS VISUALES (un solo canvas)
// ════════════════════════════════════════════════════
(function() {
  const canvas = $('fx-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isMobile = window.matchMedia('(hover: none)').matches || window.innerWidth < 769;

  let W, H;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Pétalos cayendo (siempre) ──
  const petals = [];
  const PETAL_COUNT = isMobile ? 8 : 16;
  const petalColors = ['#ff7eb3', '#ffaed0', '#d97ef5', '#ffd6ea', '#ffb7a0'];

  function makePetal(y) {
    return {
      x: Math.random() * W,
      y: y !== undefined ? y : Math.random() * -H,
      size: 6 + Math.random() * 8,
      speedY: 0.5 + Math.random() * 1.2,
      speedX: (Math.random() - 0.5) * 0.8,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.02,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      opacity: 0.4 + Math.random() * 0.4
    };
  }
  for (let i = 0; i < PETAL_COUNT; i++) petals.push(makePetal());

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    // forma de pétalo (elipse)
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Ondas al tocar ──
  const ripples = [];
  function addRipple(x, y) {
    ripples.push({ x, y, r: 0, maxR: 80 + Math.random() * 40, opacity: 0.5 });
  }

  // ── Destellos siguiendo el dedo/cursor ──
  const sparkles = [];
  let lastSparkle = 0;
  const sparkleShapes = ['circle', 'circle', 'star', 'heart'];
  function addSparkle(x, y) {
    const now = Date.now();
    if (now - lastSparkle < 40) return; // 25fps cap
    lastSparkle = now;
    // Cap absoluto para no acumular partículas en memoria
    if (sparkles.length > 60) return;
    // Emitir 2 partículas para la estela bonita
    for (let k = 0; k < 2; k++) {
      sparkles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8 - 0.3,
        size: 2 + Math.random() * 4,
        life: 1,
        decay: 0.025 + Math.random() * 0.025,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.18,
        shape: sparkleShapes[Math.floor(Math.random() * sparkleShapes.length)],
        color: petalColors[Math.floor(Math.random() * petalColors.length)]
      });
    }
  }

  // dibujar formas de destello
  function drawStar(cx, cy, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = rot + (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x1 = cx + Math.cos(a) * r;
      const y1 = cy + Math.sin(a) * r;
      ctx.lineTo(x1, y1);
      const a2 = a + Math.PI / 5;
      ctx.lineTo(cx + Math.cos(a2) * r * 0.45, cy + Math.sin(a2) * r * 0.45);
    }
    ctx.closePath();
    ctx.fill();
  }
  function drawHeart(cx, cy, r, rot) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(r / 12, r / 12);
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-6, -4, -10, 2, 0, 9);
    ctx.bezierCurveTo(10, 2, 6, -4, 0, 3);
    ctx.fill();
    ctx.restore();
  }

  // Eventos de toque/movimiento
  if (!isMobile) {
    document.addEventListener('mousemove', e => addSparkle(e.clientX, e.clientY), { passive: true });
    document.addEventListener('click', e => addRipple(e.clientX, e.clientY), { passive: true });
  } else {
    document.addEventListener('touchmove', e => {
      for (let i = 0; i < e.touches.length; i++) {
        addSparkle(e.touches[i].clientX, e.touches[i].clientY);
      }
    }, { passive: true });
    document.addEventListener('touchstart', e => {
      const t = e.touches[0];
      if (t) { addRipple(t.clientX, t.clientY); addSparkle(t.clientX, t.clientY); }
    }, { passive: true });
  }

  // ── Loop principal ──
  function loop() {
    ctx.clearRect(0, 0, W, H);

    // pétalos
    petals.forEach(p => {
      p.sway += p.swaySpeed;
      p.x += p.speedX + Math.sin(p.sway) * 0.5;
      p.y += p.speedY;
      p.rot += p.rotSpeed;
      if (p.y > H + 20) {
        Object.assign(p, makePetal(-20));
      }
      drawPetal(p);
    });
    ctx.globalAlpha = 1;

    // ondas
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += 3;
      rp.opacity -= 0.012;
      if (rp.opacity <= 0) { ripples.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,126,179,${rp.opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // destellos
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.02; // gravedad leve
      s.rot += s.rotSpeed;
      s.life -= s.decay;
      if (s.life <= 0) { sparkles.splice(i, 1); continue; }
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 0; // shadow blur quitado por rendimiento
      const sz = s.size * s.life;
      if (s.shape === 'star') {
        drawStar(s.x, s.y, sz * 1.6, s.rot);
      } else if (s.shape === 'heart') {
        drawHeart(s.x, s.y, sz * 1.8, s.rot);
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Pausa cuando la pestaña está oculta (ahorra batería y CPU)
    if (!document.hidden) requestAnimationFrame(loop);
    else setTimeout(loop, 500);
  }
  loop();
})();

// ════════════════════════════════════════════════════
//   CARDS HOLOGRÁFICAS — reflejo de luz
// ════════════════════════════════════════════════════
(function() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty('--shine-x', x + '%');
    card.style.setProperty('--shine-y', y + '%');
  }, { passive: true });
})();

// ════════════════════════════════════════════════════
//   PANTALLA DE CARGA
// ════════════════════════════════════════════════════
window.addEventListener('load', () => {
  setTimeout(() => {
    const ld = $('loader');
    if (ld) {
      ld.classList.add('out');
      setTimeout(() => { ld.style.display = 'none'; }, 600);
    }
  }, 800);
});
// Fallback por si load tarda
setTimeout(() => {
  const ld = $('loader');
  if (ld && !ld.classList.contains('out')) {
    ld.classList.add('out');
    setTimeout(() => { ld.style.display = 'none'; }, 600);
  }
}, 3000);

// ════════════════════════════════════════════════════
//   RAZONES POR LAS QUE TE QUIERO
// ════════════════════════════════════════════════════
let razonIdx = 0;
let razonOrder = [];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function openRazones() {
  if (typeof RAZONES === 'undefined' || !RAZONES.length) return;
  razonOrder = shuffleArray(RAZONES);
  razonIdx = 0;
  showCurrentRazon();
  $('razones-modal').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeRazones() {
  $('razones-modal').classList.remove('on');
  document.body.style.overflow = '';
}
function showCurrentRazon() {
  const txt = $('razones-text');
  const counter = $('razones-counter');
  if (!txt || !counter) return;
  txt.classList.remove('changing');
  void txt.offsetWidth;
  txt.classList.add('changing');
  setTimeout(() => {
    typeWriter(txt, razonOrder[razonIdx]);
    counter.textContent = `razón #${razonIdx + 1}`;
  }, 220);
}
function nextRazon() {
  razonIdx = (razonIdx + 1) % razonOrder.length;
  showCurrentRazon();
  if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(5);
}

// ════════════════════════════════════════════════════
//   MÁQUINA DE ESCRIBIR
// ════════════════════════════════════════════════════
function typeWriter(el, text, speed) {
  speed = speed || 35;
  el.textContent = '';
  el.classList.add('typing');
  let i = 0;
  function tick() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    } else {
      setTimeout(() => el.classList.remove('typing'), 800);
    }
  }
  tick();
}

// ════════════════════════════════════════════════════
//   GLOBOS PARA REVENTAR
// ════════════════════════════════════════════════════
let globoSpawnTimer = null;
const GLOBO_EMOJIS = ['🎈', '🎈', '🎈', '🩷', '💜', '💖'];

function openGlobos() {
  $('globo-message').classList.remove('show');
  $('globo-message').textContent = '';
  $('globos-stage').innerHTML = '';
  $('globos-modal').classList.add('on');
  document.body.style.overflow = 'hidden';
  startGloboSpawner();
}
function closeGlobos() {
  $('globos-modal').classList.remove('on');
  document.body.style.overflow = '';
  stopGloboSpawner();
}
function startGloboSpawner() {
  spawnGlobo();
  spawnGlobo();
  globoSpawnTimer = setInterval(spawnGlobo, 1400);
}
function stopGloboSpawner() {
  if (globoSpawnTimer) clearInterval(globoSpawnTimer);
  globoSpawnTimer = null;
}
function spawnGlobo() {
  const stage = $('globos-stage');
  if (!stage) return;
  const g = document.createElement('div');
  g.className = 'globo';

  // 70% probabilidad: imagen de personaje. 30%: emoji decorativo
  if (Math.random() < 0.7 && typeof characters !== 'undefined' && characters.length) {
    const ch = characters[Math.floor(Math.random() * characters.length)];
    const img = document.createElement('img');
    img.src = ch.img;
    img.alt = '';
    img.className = 'globo-img';
    // si falla la imagen, mostrar emoji de respaldo
    img.onerror = () => {
      g.textContent = GLOBO_EMOJIS[Math.floor(Math.random() * GLOBO_EMOJIS.length)];
    };
    g.appendChild(img);
  } else {
    g.textContent = GLOBO_EMOJIS[Math.floor(Math.random() * GLOBO_EMOJIS.length)];
  }

  const stageRect = stage.getBoundingClientRect();
  const x = Math.random() * (stageRect.width - 60);
  const dur = 4 + Math.random() * 3;
  g.style.left = x + 'px';
  // Sobrescribir duración para que use el random (la "sway" se queda en 2s desde CSS)
  g.style.setProperty('animation-duration', dur + 's, 2s', 'important');
  g.addEventListener('click', () => popGlobo(g));
  stage.appendChild(g);
  setTimeout(() => { if (g.parentNode) g.remove(); }, dur * 1000);
}
function popGlobo(g) {
  if (g.classList.contains('popping')) return;
  g.classList.add('popping');
  // mensaje aleatorio
  const msg = GLOBO_MESSAGES[Math.floor(Math.random() * GLOBO_MESSAGES.length)];
  const msgEl = $('globo-message');
  msgEl.textContent = msg;
  msgEl.classList.remove('show');
  void msgEl.offsetWidth;
  msgEl.classList.add('show');
  // confeti
  if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(8);
  setTimeout(() => g.remove(), 400);
}

// ════════════════════════════════════════════════════
//   CONSTELACIONES DE FONDO (estrellas conectadas)
// ════════════════════════════════════════════════════
(function() {
  // Solo en escritorio para no pesar en móvil
  if (window.matchMedia('(hover: none)').matches || window.innerWidth < 769) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.5';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const STARS = 40;
  const stars = [];
  for (let i = 0; i < STARS; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: 1 + Math.random() * 1.5,
      twinkle: Math.random() * Math.PI * 2
    });
  }

  let mouseX = W / 2, mouseY = H / 2;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
  }, { passive: true });

  function loop() {
    ctx.clearRect(0, 0, W, H);

    // mover estrellas
    stars.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      s.twinkle += 0.04;
      if (s.x < 0 || s.x > W) s.vx *= -1;
      if (s.y < 0 || s.y > H) s.vy *= -1;
      // Atracción suave hacia el mouse
      const dx = mouseX - s.x;
      const dy = mouseY - s.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 200) {
        s.x += (dx / dist) * 0.3;
        s.y += (dy / dist) * 0.3;
      }
    });

    // dibujar líneas entre estrellas cercanas
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 130) {
          ctx.strokeStyle = `rgba(255,126,179,${(1 - d/130) * 0.18})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    // dibujar estrellas
    stars.forEach(s => {
      const alpha = 0.5 + Math.sin(s.twinkle) * 0.3;
      ctx.fillStyle = `rgba(255,200,230,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(loop);
  }
  loop();
})();

// ════════════════════════════════════════════════════
//   FRASCO DE CUMPLIDOS
// ════════════════════════════════════════════════════
function openFrasco() {
  $('frasco-papel').classList.remove('show');
  $('frasco-papel-text').textContent = '';
  $('frasco-modal').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeFrasco() {
  $('frasco-modal').classList.remove('on');
  document.body.style.overflow = '';
}
function sacarCumplido() {
  if (typeof CUMPLIDOS === 'undefined' || !CUMPLIDOS.length) return;
  const cumplido = CUMPLIDOS[Math.floor(Math.random() * CUMPLIDOS.length)];
  const papel = $('frasco-papel');
  const txt = $('frasco-papel-text');
  papel.classList.remove('show');
  setTimeout(() => {
    txt.textContent = cumplido;
    papel.classList.add('show');
    if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(6);
  }, 150);
}

// ════════════════════════════════════════════════════
//   SALUDO SEGÚN LA HORA — actualiza WELCOME_MSG
// ════════════════════════════════════════════════════
(function() {
  const h = new Date().getHours();
  let saludo = '';
  if (h >= 5 && h < 12) saludo = 'buenos días Ñalñita ☀️';
  else if (h >= 12 && h < 19) saludo = 'buenas tardes Ñalñita 🌸';
  else if (h >= 19 && h < 23) saludo = 'buenas noches Ñalñita 🌙';
  else saludo = '¿qué haces despierta? ve a descansar 💤';

  // Solo actualizar si la frase actual está vacía o es la genérica
  const tagEl = document.querySelector('.w-tag');
  if (tagEl) {
    // 50% probabilidad de usar saludo de hora vs frase random ya cargada
    if (Math.random() > 0.5) {
      tagEl.textContent = saludo;
    }
  }
})();

// ════════════════════════════════════════════════════
//   SORPRÉNDEME — elige un personaje al azar
// ════════════════════════════════════════════════════
function surpriseMe() {
  const btn = $('surprise-fab');
  if (btn) {
    btn.classList.remove('rolling');
    void btn.offsetWidth;
    btn.classList.add('rolling');
  }
  if (typeof playSparkle === 'function') playSparkle();

  setTimeout(() => {
    const order = getOrderedIndices();
    const randomIdx = order[Math.floor(Math.random() * order.length)];
    openCardByIndex(randomIdx);
    if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(15);
    showToast('🎲 ¡sorpresa para ti!');
  }, 600);
}

// ════════════════════════════════════════════════════
//   EVIDENCIA — modal con foto del día que empezó la amistad
// ════════════════════════════════════════════════════
function openFechaEvidencia() {
  const modal = $('fecha-modal');
  if (!modal) return;
  modal.classList.add('on');
  document.body.style.overflow = 'hidden';
  if (typeof playPop === 'function') playPop();
}
function closeFechaEvidencia() {
  const modal = $('fecha-modal');
  if (!modal) return;
  modal.classList.remove('on');
  document.body.style.overflow = '';
}

// ════════════════════════════════════════════════════
//   PLAYLIST — lista, favoritos, mi lista
// ════════════════════════════════════════════════════
let currentPlTab = 'todas';

function getPlData() {
  let favs = []; let mia = [];
  try { favs = JSON.parse(localStorage.getItem('nd-favs') || '[]'); } catch(e){}
  try { mia  = JSON.parse(localStorage.getItem('nd-mia')  || '[]'); } catch(e){}
  return { favs, mia };
}
function savePlData(favs, mia) {
  try { localStorage.setItem('nd-favs', JSON.stringify(favs)); } catch(e){}
  try { localStorage.setItem('nd-mia',  JSON.stringify(mia));  } catch(e){}
}

function openPlaylist() {
  currentPlTab = 'todas';
  document.querySelectorAll('.pl-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'todas'));
  renderPlaylist();
  $('playlist-modal').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closePlaylist() {
  $('playlist-modal').classList.remove('on');
  document.body.style.overflow = '';
}

function switchPlaylistTab(tab) {
  currentPlTab = tab;
  document.querySelectorAll('.pl-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  renderPlaylist();
}

function renderPlaylist() {
  const body = $('playlist-body');
  const info = $('playlist-info');
  const actions = $('playlist-actions');
  if (!body) return;
  body.innerHTML = '';
  actions.classList.add('hidden');
  actions.innerHTML = '';

  const { favs, mia } = getPlData();

  // Determinar qué canciones mostrar
  let indices = [];
  if (currentPlTab === 'todas') {
    indices = getOrderedIndices();
    info.textContent = `${indices.length} canciones`;
  } else if (currentPlTab === 'favs') {
    indices = favs.filter(i => characters[i]);
    info.textContent = indices.length ? `${indices.length} favoritas ❤️` : '';
  } else if (currentPlTab === 'mia') {
    indices = mia.filter(i => characters[i]);
    info.textContent = indices.length ? `${indices.length} en tu lista ⭐` : '';
    // Mostrar botones de acción si hay canciones
    if (indices.length) {
      actions.classList.remove('hidden');
      actions.innerHTML = `
        <button class="pl-act-btn" onclick="playMyList()">▶ Reproducir todas</button>
        <button class="pl-act-btn secondary" onclick="clearMyList()">🗑 Limpiar lista</button>
      `;
    }
  }

  // Vacío
  if (!indices.length) {
    const msgs = {
      todas: { ico: '🎵', txt: 'no hay canciones' },
      favs:  { ico: '💔', txt: 'aún no tienes favoritas<br>toca el ❤️ en una canción para guardarla' },
      mia:   { ico: '⭐', txt: 'tu lista está vacía<br>toca el ➕ en las canciones que quieras' }
    };
    const m = msgs[currentPlTab];
    body.innerHTML = `
      <div class="playlist-empty">
        <span class="pe-icon">${m.ico}</span>
        ${m.txt}
      </div>
    `;
    return;
  }

  // Pintar items
  indices.forEach((idx, pos) => {
    const ch = characters[idx];
    if (!ch) return;
    const displayName = ch.name.replace(/\s*\d+$/, '').trim();
    const isFav = favs.includes(idx);
    const inMia = mia.includes(idx);
    const isPlaying = currentIdx === idx;

    const item = document.createElement('div');
    item.className = 'pl-item' + (inMia ? ' in-mylist' : '') + (isPlaying ? ' playing-now' : '');
    item.style.animationDelay = (pos * 0.04) + 's';
    item.innerHTML = `
      <img class="pl-item-img" src="${ch.img}" alt=""
           onerror="this.style.background='linear-gradient(135deg,var(--rose),var(--lila))';this.removeAttribute('src');">
      <div class="pl-item-info">
        <div class="pl-item-title">${ch.songName}<span class="pl-cat-chip ${ch.cat}">${displayName}</span></div>
        <div class="pl-item-artist">${ch.series}</div>
      </div>
      <div class="pl-item-actions">
        <button class="pl-action fav ${isFav?'active':''}" title="Favorito" data-act="fav">${isFav?'❤️':'🤍'}</button>
        <button class="pl-action add ${inMia?'active':''}" title="Mi lista" data-act="add">${inMia?'✓':'＋'}</button>
        <button class="pl-action play" title="Reproducir" data-act="play">▶</button>
      </div>
    `;

    // Click en el item completo (excepto en botones) = reproducir
    item.addEventListener('click', e => {
      const btn = e.target.closest('button.pl-action');
      if (btn) {
        const act = btn.dataset.act;
        if (act === 'fav') toggleFav(idx);
        else if (act === 'add') toggleMia(idx);
        else if (act === 'play') { closePlaylist(); openCardByIndex(idx); }
        return;
      }
      // click en cualquier otra parte: reproducir
      closePlaylist();
      openCardByIndex(idx);
    });

    body.appendChild(item);
  });
}

function toggleFav(idx) {
  const { favs, mia } = getPlData();
  const pos = favs.indexOf(idx);
  if (pos === -1) favs.push(idx);
  else favs.splice(pos, 1);
  savePlData(favs, mia);
  renderPlaylist();
  if (typeof playSparkle === 'function') playSparkle();
}

function toggleMia(idx) {
  const { favs, mia } = getPlData();
  const pos = mia.indexOf(idx);
  if (pos === -1) mia.push(idx);
  else mia.splice(pos, 1);
  savePlData(favs, mia);
  renderPlaylist();
  if (typeof playSparkle === 'function') playSparkle();
}

function clearMyList() {
  const { favs } = getPlData();
  savePlData(favs, []);
  renderPlaylist();
  showToast('🗑 lista limpiada');
}

let myListPlaying = null;
function playMyList() {
  const { mia } = getPlData();
  if (!mia.length) return;
  myListPlaying = [...mia];
  closePlaylist();
  openCardByIndex(myListPlaying[0]);
  showToast(`▶ reproduciendo ${myListPlaying.length} canciones`);
}

// ════════════════════════════════════════════════════
//   CARTA FINAL — cierre del regalo
// ════════════════════════════════════════════════════
function openFinal() {
  const title = $('final-title');
  const letter = $('final-letter');
  if (!letter) return;

  if (title && typeof FINAL_LETTER_TITLE !== 'undefined') {
    title.textContent = FINAL_LETTER_TITLE;
  }

  // Renderizar carta como párrafos con animación escalonada
  letter.innerHTML = '';
  const raw = (typeof FINAL_LETTER !== 'undefined' ? FINAL_LETTER : '').trim();
  if (!raw || raw.startsWith('//')) {
    letter.innerHTML = '<p>(pon aquí tu carta final en data.js 🩷)</p>';
  } else {
    const paragraphs = raw.split(/\n\s*\n/).filter(p => p.trim());
    paragraphs.forEach((p, i) => {
      const el = document.createElement('p');
      el.textContent = p.trim();
      el.style.animationDelay = (0.5 + i * 0.35) + 's';
      letter.appendChild(el);
    });
  }

  // Generar estrellitas dentro del modal
  const starsEl = $('final-stars');
  if (starsEl) {
    starsEl.innerHTML = '';
    const stars = ['✦', '✧', '⋆', '·', '•'];
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('span');
      s.className = 'final-star';
      s.textContent = stars[Math.floor(Math.random() * stars.length)];
      const sz = 8 + Math.random() * 14;
      const dur = 2 + Math.random() * 3;
      s.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        font-size: ${sz}px;
        animation-duration: ${dur}s;
        animation-delay: ${Math.random() * dur}s;
      `;
      starsEl.appendChild(s);
    }
  }

  $('final-modal').classList.add('on');
  document.body.style.overflow = 'hidden';

  // Confeti emocional
  if (typeof spawnHeartConfetti === 'function') {
    spawnHeartConfetti(40);
    setTimeout(() => spawnHeartConfetti(30), 1500);
  }
  if (typeof spawnConfetti === 'function') {
    spawnConfetti(50);
  }
  if (typeof playSparkle === 'function') playSparkle();
}

function closeFinal() {
  $('final-modal').classList.remove('on');
  document.body.style.overflow = '';
  if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(15);
}

// Mostrar el botón final después de que entre al main
const _origEnter = window.enterMain;
if (typeof _origEnter === 'function') {
  // Ya está activo, pero hagamos algo más simple:
}

// ════════════════════════════════════════════════════════════════════
//   ANIMACIONES JS PREMIUM v3
// ════════════════════════════════════════════════════════════════════

// ── Corazones que vuelan al hacer clic en tarjetas ────────────────
(function() {
  let lastClick = 0;
  document.addEventListener('click', e => {
    // Throttle: no más de un efecto cada 400ms (evita spam de clicks)
    const now = Date.now();
    if (now - lastClick < 400) return;

    const card = e.target.closest('.card');
    const fab = e.target.closest('#msg-fab, #dedica-fab, #final-fab, .w-btn');
    if (!card && !fab) return;
    lastClick = now;

    const target = card || fab;
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const hearts = ['🩷', '💜', '💗', '✨'];
    // Reducido de 6 a 4 corazones para mejor rendimiento
    for (let i = 0; i < 4; i++) {
      const h = document.createElement('div');
      h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      h.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        z-index: 9997;
        pointer-events: none;
        font-size: ${0.9 + Math.random() * 0.5}rem;
        transform: translate(-50%, -50%);
        will-change: transform, opacity;
      `;
      document.body.appendChild(h);

      const angle = (Math.PI * 2 * i / 4) + Math.random() * 0.5;
      const dist = 50 + Math.random() * 40;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 25;

      h.animate([
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * 0.3}px), calc(-50% + ${dy * 0.3}px)) scale(1.1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.6)`, opacity: 0 }
      ], {
        duration: 800,
        easing: 'cubic-bezier(.34,1.56,.64,1)'
      });

      setTimeout(() => h.remove(), 900);
    }
  }, { passive: true });
})();

// ── Parallax del header DESACTIVADO por rendimiento ─────────
// (causaba layout recalc en cada scroll)

// ── Tilt del modal y shine dinámico DESACTIVADOS por rendimiento ─
// (los recálculos de transform en cada mousemove causaban jank)
// Si quieres recuperarlos en escritorio potente, descomenta abajo:
/*
(function() {
  if (window.matchMedia('(hover: none)').matches) return;
  let lastTilt = 0;
  document.addEventListener('mousemove', e => {
    const now = performance.now();
    if (now - lastTilt < 33) return;
    lastTilt = now;
    const modal = document.querySelector('.modal.on .modal-box');
    if (!modal) return;
    const r = modal.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    modal.style.transform = `perspective(1500px) rotateY(${dx * 1.5}deg) rotateX(${-dy * 1.5}deg)`;
  }, { passive: true });
})();
*/

// ════════════════════════════════════════════════════════════════════
//   FIN OPTIMIZACIONES
// ════════════════════════════════════════════════════════════════════

// ── Counter por minuto desactivado para mejor rendimiento ─────

// ── Efecto de "ondas" al hacer scroll ─────────────────────────────
(function() {
  if (window.matchMedia('(hover: none)').matches) return;
  let scrollTimer = null;
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScroll < 200) return;
    lastScroll = now;
    // En cada scroll fuerte, agregar un mini destello al lado de la pantalla
  }, { passive: true });
})();

// ── Mensajes random según ciertos eventos ─────────────────────────
let actionCount = 0;
const ACTION_MESSAGES = [
  '🌸 ¡seguiste explorando!',
  '✨ qué curiosa estás hoy',
  '🩷 me alegra que estés aquí',
  '💜 sigue descubriendo',
  '⭐ hay más sorpresas, no te detengas'
];
document.addEventListener('click', e => {
  const target = e.target.closest('#msg-fab, #dedica-fab, #book-fab, #game-fab, #razones-fab, #globos-fab, #frasco-fab, #surprise-fab');
  if (!target) return;
  actionCount++;
  if (actionCount % 7 === 0 && typeof showToast === 'function') {
    const msg = ACTION_MESSAGES[Math.floor(Math.random() * ACTION_MESSAGES.length)];
    showToast(msg);
  }
}, { passive: true });

// ── Aparición elegante de elementos al cargar ─────────────────────
(function() {
  // Se ejecuta cuando se muestra el main
  const observer = new MutationObserver(() => {
    const main = document.getElementById('main');
    if (main && main.classList.contains('show')) {
      const elements = main.querySelectorAll('.header, .gallery');
      elements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
          el.style.transition = 'opacity .8s ease, transform .8s cubic-bezier(.34,1.56,.64,1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 100 + i * 200);
      });
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('main'), { attributes: true, attributeFilter: ['class'] });
})();

// ════════════════════════════════════════════════════════════════════
//   ACTIVAR ESTADO body.is-playing para activar animaciones CSS
// ════════════════════════════════════════════════════════════════════
aud.addEventListener('play', () => {
  document.body.classList.add('is-playing');
});
aud.addEventListener('pause', () => {
  document.body.classList.remove('is-playing');
});
aud.addEventListener('ended', () => {
  document.body.classList.remove('is-playing');
});

// ════════════════════════════════════════════════════════════════════
//   APLICAR TEMA DE COLOR del personaje al modal
// ════════════════════════════════════════════════════════════════════
function applyCharTheme(cat) {
  document.body.classList.remove('theme-paulo', 'theme-kirby', 'theme-peach', 'theme-otro');
  if (cat) document.body.classList.add('theme-' + cat);
}
function clearCharTheme() {
  document.body.classList.remove('theme-paulo', 'theme-kirby', 'theme-peach', 'theme-otro');
}

// Hook al abrir personaje
(function() {
  const origOpenCard = window.openCard;
  if (typeof origOpenCard === 'function') {
    window.openCard = function(card, i) {
      const ch = characters[i];
      if (ch && ch.cat) applyCharTheme(ch.cat);
      origOpenCard.call(this, card, i);
    };
  }
  const origCloseModal = window.closeModal;
  if (typeof origCloseModal === 'function') {
    window.closeModal = function() {
      clearCharTheme();
      origCloseModal.call(this);
    };
  }
})();

// ════════════════════════════════════════════════════════════════════
//   CONSTELACIONES — estrellas que se conectan al mover el mouse
//   (extra effect para escritorio)
// ════════════════════════════════════════════════════════════════════
(function() {
  if (window.matchMedia('(hover: none)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'constellation-canvas';
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.35;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let stars = [];
  let mouse = { x: -100, y: -100 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    const count = Math.min(20, Math.floor(canvas.width * canvas.height / 70000));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mover estrellas
    stars.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
      if (s.y < 0 || s.y > canvas.height) s.vy *= -1;
    });

    // Conectar estrellas cercanas al mouse
    stars.forEach((s, i) => {
      const dxm = s.x - mouse.x;
      const dym = s.y - mouse.y;
      const distM = Math.sqrt(dxm * dxm + dym * dym);

      if (distM < 200) {
        const alpha = 1 - distM / 200;
        ctx.strokeStyle = `rgba(255, 126, 179, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      // Dibujar estrella
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Cap a 30fps + pausa si pestaña oculta
    setTimeout(() => {
      if (!document.hidden) requestAnimationFrame(loop);
      else setTimeout(loop, 500);
    }, 33);
  }
  loop();
})();

// ════════════════════════════════════════════════════════════════════
//   AUDIO REACTIVO en CSS — agrega clase rítmica al body
// ════════════════════════════════════════════════════════════════════
(function() {
  // Cada compás (aprox 500ms) hacemos un "pulse"
  let interval = null;
  aud.addEventListener('play', () => {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      if (!aud.paused) {
        document.body.classList.add('beat');
        setTimeout(() => document.body.classList.remove('beat'), 100);
      }
    }, 500);
  });
  aud.addEventListener('pause', () => {
    if (interval) clearInterval(interval);
  });
  aud.addEventListener('ended', () => {
    if (interval) clearInterval(interval);
  });
})();

// ════════════════════════════════════════════════════════════════════
//   IDLE — si no hay actividad por mucho rato, spawn cosas bonitas
// ════════════════════════════════════════════════════════════════════
(function() {
  let idleTimer = null;
  function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      // Después de 30 segundos sin actividad
      if (typeof spawnHeartConfetti === 'function' && !document.querySelector('.modal.on')) {
        spawnHeartConfetti(5);
      }
    }, 30000);
  }
  ['click', 'mousemove', 'touchstart', 'scroll'].forEach(ev => {
    document.addEventListener(ev, resetIdle, { passive: true });
  });
  resetIdle();
})();

// ════════════════════════════════════════════════════════════════════
//   DETECTAR CUANDO LA VENTANA VUELVE AL FOCO
// ════════════════════════════════════════════════════════════════════
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // La pestaña volvió a estar visible: mostrar pequeño wow
    if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(8);
  }
});

// ════════════════════════════════════════════════════════════════════
//   CARD KEYBOARD NAVIGATION — usar flechas para navegar cards
// ════════════════════════════════════════════════════════════════════
(function() {
  document.addEventListener('keydown', e => {
    // Solo si no hay un modal abierto y no estamos en input
    if (document.querySelector('.modal.on')) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

    const cards = Array.from(document.querySelectorAll('.card'));
    if (!cards.length) return;
    const focused = document.activeElement;
    let idx = cards.indexOf(focused);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      idx = idx === -1 ? 0 : Math.min(cards.length - 1, idx + 1);
      cards[idx].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      idx = idx === -1 ? 0 : Math.max(0, idx - 1);
      cards[idx].focus();
    } else if (e.key === 'Enter' && idx !== -1) {
      cards[idx].click();
    }
  });

  // Hacer cards focuseables
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.card').forEach(c => {
      if (!c.hasAttribute('tabindex')) c.setAttribute('tabindex', '0');
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// ════════════════════════════════════════════════════════════════════
//   OPTIMIZACIÓN DE RENDIMIENTO — pausar cuando no es visible
// ════════════════════════════════════════════════════════════════════
(function() {
  let isHidden = false;

  document.addEventListener('visibilitychange', () => {
    isHidden = document.hidden;
    document.body.classList.toggle('tab-hidden', isHidden);
  });

  // Throttle de los listeners de mousemove (muy frecuentes)
  let lastMouseMove = 0;
  const origAddEventListener = window.EventTarget.prototype.addEventListener;
  // NOTA: no overrideamos, mejor en cada listener específico

  // Detectar dispositivos lentos por user agent / cores
  const isSlowDevice = (() => {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 4;
    return cores <= 4 && mem <= 4;
  })();

  if (isSlowDevice) {
    document.body.classList.add('low-power');
  }
})();

// ════════════════════════════════════════════════════════════════════
//   OPTIMIZACIÓN DE MOUSEMOVE — solo el sparkle queda, los demás OFF
// ════════════════════════════════════════════════════════════════════
// (El tilt 3D del modal y el shine dinámico de cards se quitan para
//  no recalcular layout en cada movimiento del mouse)

// ════════════════════════════════════════════════════
//   CARTAS DEDICATORIAS DERECHA
// ════════════════════════════════════════════════════
const dedica2Aud = $('dedica2-aud');
const dedica3Aud = $('dedica3-aud');
if (dedica2Aud) dedica2Aud.volume = .85;
if (dedica3Aud) dedica3Aud.volume = .85;
let d2Timer = null, d3Timer = null;

// Letras en inglés sincronizadas
const D2_LYRICS = [
  {t:0,l:""},
  {t:27,l:"Should've stayed, were there signs, I ignored?"},
  {t:32,l:"Can I help you, not to hurt, anymore?"},
  {t:37,l:"We saw brilliance, when the world, was asleep"},
  {t:42,l:"There are things that we can have, but can't keep"},
  {t:47,l:""},
  {t:49,l:"If they say"},
  {t:52,l:"Who cares if one more light goes out?"},
  {t:57,l:"In a sky of a million stars"},
  {t:61,l:"It flickers, flickers"},
  {t:63,l:"Who cares when someone's time runs out?"},
  {t:68,l:"If a moment is all we are"},
  {t:72,l:"We're quicker, quicker"},
  {t:74,l:"Who cares if one more light goes out?"},
  {t:78,l:"Well I do"},
  {t:80,l:""},
  {t:82,l:"The reminders pull the floor from your feet"},
  {t:87,l:"In the kitchen one more chair than you need"},
  {t:92,l:"Oh, and you're angry, and you should be"},
  {t:96,l:"It's not fair"},
  {t:98,l:""},
  {t:100,l:"Just 'cause you can't see it"},
  {t:104,l:"Doesn't mean it, isn't there"},
  {t:107,l:""},
  {t:109,l:"Who cares if one more light goes out?"},
  {t:114,l:"In a sky of a million stars"},
  {t:118,l:"It flickers, flickers"},
  {t:120,l:"Who cares when someone's time runs out?"},
  {t:125,l:"If a moment is all we are"},
  {t:129,l:"We're quicker, quicker"},
  {t:131,l:"Who cares if one more light goes out?"},
  {t:135,l:"Well I do"},
  {t:137,l:""},
  {t:140,l:"Yo, I was in the waiting room"},
  {t:143,l:"Before I knew, that's where I'd be"},
  {t:146,l:"Midnight, talking to the moon"},
  {t:149,l:"But who was listening?"},
  {t:151,l:""},
  {t:153,l:"Pulling out our hair, it's hard enough"},
  {t:156,l:"To put up such a guard against each other"},
  {t:160,l:"When we're caught up in a wave"},
  {t:163,l:"Out in the midst of the ocean"},
  {t:166,l:"Miles away from where we started"},
  {t:169,l:"Back before we were broken"},
  {t:171,l:""},
  {t:173,l:"Before I knew life took turns"},
  {t:176,l:"Was somebody's son, somebody's daughter"},
  {t:179,l:"Left alone in the dark, scared of being forgotten"},
  {t:183,l:""},
  {t:185,l:"Who cares if one more light goes out?"},
  {t:190,l:"In a sky of a million stars"},
  {t:194,l:"It flickers, flickers"},
  {t:196,l:"Who cares when someone's time runs out?"},
  {t:201,l:"If a moment is all we are"},
  {t:205,l:"We're quicker, quicker"},
  {t:207,l:"Who cares if one more light goes out?"},
  {t:211,l:"Well I do"},
  {t:213,l:"I do"},
  {t:216,l:""},
  {t:219,l:"Who cares if one more light goes out?"},
  {t:224,l:"In a sky of a million stars"},
  {t:228,l:"It flickers, flickers"},
  {t:230,l:"Who cares when someone's time runs out?"},
  {t:235,l:"If a moment is all we are"},
  {t:239,l:"We're quicker, quicker"},
  {t:241,l:"Who cares if one more light goes out?"},
  {t:245,l:"Well I do"},
  {t:247,l:"I do 🧡"}
];

// Always With Me — English, empieza desde el inicio
const D3_LYRICS = [
  {t:4,l:""},{t:9,l:"Somewhere, a voice calls in the depths of my heart"},
  {t:15,l:"May I always be dreaming"},
  {t:20,l:"The dreams that move my heart"},{t:25,l:""},
  {t:27,l:"Faraway, the echoes of a farewell resound"},
  {t:33,l:"Through the years, distance fades"},
  {t:38,l:"Your voice still reaches me"},{t:42,l:""},
  {t:44,l:"Always, always with me"},
  {t:48,l:"Always, always with me"},{t:52,l:""},
  {t:54,l:"Across the years, across the miles"},
  {t:59,l:"Two hearts, one dream"},
  {t:63,l:"Nothing can tear us apart"},{t:67,l:""},
  {t:69,l:"In the water, clear reflections of the sky"},
  {t:75,l:"In the mirror, your gentle smile"},
  {t:80,l:"Looking back at me"},{t:84,l:""},
  {t:86,l:"Always, always with me"},
  {t:90,l:"Always, always with me"},{t:94,l:""},
  {t:96,l:"I close my eyes and I can see"},
  {t:101,l:"Your face so dear to me"},
  {t:105,l:"I know you're always there"},{t:109,l:""},
  {t:112,l:"Always, always with me"},
  {t:116,l:"Always, always with me"},{t:120,l:""},
  {t:122,l:"Somewhere, that voice calls"},
  {t:127,l:"Across the years"},
  {t:131,l:"Always with me 🌸"}
];

// Mostrar cartas cuando entre al main
(function() {
  const obs = new MutationObserver(() => {
    const main = $('main');
    if (main && main.classList.contains('show')) {
      obs.disconnect();
      setTimeout(() => {
        const f2 = $('dedica2-fab'); if (f2) f2.classList.add('on');
        const f3 = $('dedica3-fab'); if (f3) f3.classList.add('on');
      }, 1000);
    }
  });
  const main = $('main');
  if (main) obs.observe(main, { attributes: true, attributeFilter: ['class'] });
})();

function renderDLyrics(data, el, cls) {
  if (!el || !data) return;
  el.innerHTML = data.map((l,i) =>
    `<span class="${cls}" data-i="${i}">${l.l||'♪'}</span>`
  ).join('');
}
function startDSync(aud, data, el, cls, ref) {
  if (ref.v) { clearInterval(ref.v); ref.v=null; }
  if (!data||!aud||!el) return;
  ref.v = setInterval(() => {
    if (aud.paused) return;
    const ct = aud.currentTime;
    let active = 0;
    for (let i=0;i<data.length;i++) if(data[i].t<=ct) active=i;
    const lines = el.querySelectorAll('.'+cls);
    lines.forEach((l,i) => l.classList.toggle('active', i===active));
    if (lines[active]) lines[active].scrollIntoView({behavior:'smooth',block:'center'});
  }, 300);
}
function fadInAud(aud) {
  aud.volume=0; aud.play().catch(()=>{});
  let v=0;
  const fi=setInterval(()=>{ v=Math.min(v+0.06,.85); aud.volume=v; if(v>=.85)clearInterval(fi); },80);
}
function fadOutAud(aud, cb) {
  let v=aud.volume;
  const fo=setInterval(()=>{ v=Math.max(v-0.07,0); aud.volume=v; if(v<=0){clearInterval(fo);aud.pause();if(cb)cb();} },50);
}

// ── One More Light ───────────────────────────────
async function openDedica2() {
  const modal = $('dedica2-modal'); if(!modal) return;
  modal.classList.add('on'); document.body.style.overflow='hidden';
  const lyricsEl = $('dedica2-lyrics');
  if(lyricsEl) lyricsEl.innerHTML='<span style="color:var(--muted);font-size:.8rem">buscando letra...</span>';

  const whyEl=$('dedica2-why'), whyTxt=$('dedica2-why-text');
  if(whyEl&&whyTxt&&typeof DEDICA2_WHY!=='undefined'){
    const raw=DEDICA2_WHY.trim();
    const lines=raw.split('\n').filter(l=>l.trim()&&!l.trim().startsWith('//'));
    if(lines.length){ whyTxt.textContent=lines.join(' '); whyEl.classList.add('show'); }
  }
  const cartaEl=$('dedica2-carta');
  if(cartaEl&&typeof DEDICA2_MESSAGE!=='undefined'){
    const raw=DEDICA2_MESSAGE.trim();
    const lines=raw.split('\n').filter(l=>l.trim()&&!l.trim().startsWith('//'));
    if(lines.length){ cartaEl.textContent=lines.join('\n'); cartaEl.classList.add('show'); }
  }

  if(dedica2Aud&&typeof DEDICA2_SONG!=='undefined'&&DEDICA2_SONG){
    dedica2Aud.src=DEDICA2_SONG; fadInAud(dedica2Aud);
    $('dedica2-btn').textContent='⏸'; $('dedica2-now').textContent='reproduciendo';
    const disc=$('dedica2-disc'); if(disc) disc.classList.add('spinning');
  }

  let data=null;
  try {
    const cache=JSON.parse(localStorage.getItem('nd-lyrics-dedica')||'{}');
    if(cache['oml']){ data=cache['oml']; }
    else {
      data=await fetchLyrics('One More Light','Linkin Park');
      if(data){ cache['oml']=data; localStorage.setItem('nd-lyrics-dedica',JSON.stringify(cache)); }
    }
  } catch(e){}

  if(data&&data.length&&lyricsEl){
    renderDLyrics(data,lyricsEl,'d2-line');
    const ref={v:null}; d2Timer=ref;
    startDSync(dedica2Aud,data,lyricsEl,'d2-line',ref);
  } else if(lyricsEl){
    lyricsEl.innerHTML='<span style="color:var(--muted);font-size:.8rem">letra no encontrada</span>';
  }
  if(typeof playSparkle==='function') playSparkle();
}
function closeDedica2() {
  const modal=$('dedica2-modal'); if(!modal) return;
  modal.classList.remove('on'); document.body.style.overflow='';
  if(dedica2Aud) fadOutAud(dedica2Aud);
  if(d2Timer){clearInterval(d2Timer.v);d2Timer=null;}
  const disc=$('dedica2-disc'); if(disc) disc.classList.remove('spinning');
  $('dedica2-btn').textContent='▶'; $('dedica2-now').textContent='toca ▶ para escuchar';
}
function toggleDedica2() {
  if(!dedica2Aud) return;
  const disc=$('dedica2-disc'),btn=$('dedica2-btn'),now=$('dedica2-now');
  if(dedica2Aud.paused){
    dedica2Aud.play().catch(()=>{});
    if(disc) disc.classList.add('spinning');
    if(btn) btn.textContent='⏸'; if(now) now.textContent='reproduciendo';
    const ref={v:null}; d2Timer=ref;
    startDSync(dedica2Aud,null,$('dedica2-lyrics'),'d2-line',ref);
  } else {
    dedica2Aud.pause();
    if(disc) disc.classList.remove('spinning');
    if(btn) btn.textContent='▶'; if(now) now.textContent='pausado';
    if(d2Timer){clearInterval(d2Timer.v);}
  }
}

// ── Always With Me ───────────────────────────────
async function openDedica3() {
  const modal=$('dedica3-modal'); if(!modal) return;
  modal.classList.add('on'); document.body.style.overflow='hidden';
  const lyricsEl=$('dedica3-lyrics');
  if(lyricsEl) lyricsEl.innerHTML='<span style="color:var(--muted);font-size:.8rem">buscando letra...</span>';

  const cartaEl=$('dedica3-carta');
  if(cartaEl&&typeof DEDICA3_MESSAGE!=='undefined'){
    const raw=DEDICA3_MESSAGE.trim();
    const lines=raw.split('\n').filter(l=>l.trim()&&!l.trim().startsWith('//'));
    if(lines.length){ cartaEl.textContent=lines.join('\n'); cartaEl.classList.add('show'); }
  }

  if(dedica3Aud&&typeof DEDICA3_SONG!=='undefined'&&DEDICA3_SONG){
    dedica3Aud.src=DEDICA3_SONG; fadInAud(dedica3Aud);
    $('dedica3-btn').textContent='⏸'; $('dedica3-now').textContent='reproduciendo';
    const disc=$('dedica3-disc'); if(disc) disc.classList.add('spinning');
  }

  let data=null;
  try {
    const cache=JSON.parse(localStorage.getItem('nd-lyrics-dedica')||'{}');
    if(cache['awm']){ data=cache['awm']; }
    else {
      data=await fetchLyrics('Always With Me','Joe Hisaishi');
      if(!data||!data.length) data=await fetchLyrics('Itsumo Nando Demo','Joe Hisaishi');
      if(data){ cache['awm']=data; localStorage.setItem('nd-lyrics-dedica',JSON.stringify(cache)); }
    }
  } catch(e){}

  if(data&&data.length&&lyricsEl){
    renderDLyrics(data,lyricsEl,'d3-line');
    const ref={v:null}; d3Timer=ref;
    startDSync(dedica3Aud,data,lyricsEl,'d3-line',ref);
  } else if(lyricsEl){
    lyricsEl.innerHTML='<span style="color:var(--muted);font-size:.8rem">letra no encontrada</span>';
  }
  if(typeof playSparkle==='function') playSparkle();
}
function closeDedica3() {
  const modal=$('dedica3-modal'); if(!modal) return;
  modal.classList.remove('on'); document.body.style.overflow='';
  if(dedica3Aud) fadOutAud(dedica3Aud);
  if(d3Timer){clearInterval(d3Timer.v);d3Timer=null;}
  const disc=$('dedica3-disc'); if(disc) disc.classList.remove('spinning');
  $('dedica3-btn').textContent='▶'; $('dedica3-now').textContent='toca ▶ para escuchar';
}
function toggleDedica3() {
  if(!dedica3Aud) return;
  const disc=$('dedica3-disc'),btn=$('dedica3-btn'),now=$('dedica3-now');
  if(dedica3Aud.paused){
    dedica3Aud.play().catch(()=>{});
    if(disc) disc.classList.add('spinning');
    if(btn) btn.textContent='⏸'; if(now) now.textContent='reproduciendo';
    const ref={v:null}; d3Timer=ref;
    startDSync(dedica3Aud,null,$('dedica3-lyrics'),'d3-line',ref);
  } else {
    dedica3Aud.pause();
    if(disc) disc.classList.remove('spinning');
    if(btn) btn.textContent='▶'; if(now) now.textContent='pausado';
    if(d3Timer){clearInterval(d3Timer.v);}
  }
}

// ── Botones búsqueda manual de letras ────────────
async function searchDedica2Lyrics() {
  const lyricsEl = $('dedica2-lyrics');
  const track  = ($('d2-track')  && $('d2-track').value.trim())  || 'One More Light';
  const artist = ($('d2-artist') && $('d2-artist').value.trim()) || 'Linkin Park';
  if (lyricsEl) lyricsEl.innerHTML = '<span style="color:var(--muted);font-size:.8rem">buscando...</span>';
  const data = await fetchLyrics(track, artist);
  if (data && data.length && lyricsEl) {
    lyricsEl.innerHTML = '';
    data.forEach(l => {
      const span = document.createElement('span');
      span.className = 'd2-line';
      span.textContent = l[1];
      span.dataset.t = l[0];
      lyricsEl.appendChild(span);
    });
    try {
      const cache = JSON.parse(localStorage.getItem('nd-lyrics-dedica') || '{}');
      cache['oml'] = data;
      localStorage.setItem('nd-lyrics-dedica', JSON.stringify(cache));
    } catch(e) {}
    if (d2Timer) clearInterval(d2Timer.v);
    const ref = { v: null }; d2Timer = ref;
    ref.v = setInterval(() => {
      if (!dedica2Aud || dedica2Aud.paused) return;
      const ct = dedica2Aud.currentTime;
      const lines = lyricsEl.querySelectorAll('.d2-line');
      let cur = -1;
      lines.forEach((l, i) => { if (ct >= parseFloat(l.dataset.t)) cur = i; });
      lines.forEach((l, i) => l.classList.toggle('active', i === cur));
      if (cur >= 0) lines[cur].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 250);
  } else if (lyricsEl) {
    lyricsEl.innerHTML = '<span style="color:var(--muted);font-size:.8rem">no encontrada, prueba otro nombre 😕</span>';
  }
}

async function searchDedica3Lyrics() {
  const lyricsEl = $('dedica3-lyrics');
  const track  = ($('d3-track')  && $('d3-track').value.trim())  || 'Itsumo Nando Demo';
  const artist = ($('d3-artist') && $('d3-artist').value.trim()) || 'Joe Hisaishi';
  if (lyricsEl) lyricsEl.innerHTML = '<span style="color:var(--muted);font-size:.8rem">buscando...</span>';
  let data = await fetchLyrics(track, artist);
  if (!data || !data.length) data = await fetchLyrics('Itsumo Nando Demo', 'Joe Hisaishi');
  if (!data || !data.length) data = await fetchLyrics('Always With Me', '');
  if (data && data.length && lyricsEl) {
    lyricsEl.innerHTML = '';
    data.forEach(l => {
      const span = document.createElement('span');
      span.className = 'd3-line';
      span.textContent = l[1];
      span.dataset.t = l[0];
      lyricsEl.appendChild(span);
    });
    try {
      const cache = JSON.parse(localStorage.getItem('nd-lyrics-dedica') || '{}');
      cache['awm'] = data;
      localStorage.setItem('nd-lyrics-dedica', JSON.stringify(cache));
    } catch(e) {}
    if (d3Timer) clearInterval(d3Timer.v);
    const ref = { v: null }; d3Timer = ref;
    ref.v = setInterval(() => {
      if (!dedica3Aud || dedica3Aud.paused) return;
      const ct = dedica3Aud.currentTime;
      const lines = lyricsEl.querySelectorAll('.d3-line');
      let cur = -1;
      lines.forEach((l, i) => { if (ct >= parseFloat(l.dataset.t)) cur = i; });
      lines.forEach((l, i) => l.classList.toggle('active', i === cur));
      if (cur >= 0) lines[cur].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 250);
  } else if (lyricsEl) {
    lyricsEl.innerHTML = '<span style="color:var(--muted);font-size:.8rem">no encontrada, prueba otro nombre 😕</span>';
  }
}

// Escape handler
document.addEventListener('keydown', e => {
  if(e.key!=='Escape') return;
  if($('dedica2-modal')?.classList.contains('on')) closeDedica2();
  if($('dedica3-modal')?.classList.contains('on')) closeDedica3();
});

// ════════════════════════════════════════════════════
//   PAULO LONDRA NUEVO — esquina superior derecha
// ════════════════════════════════════════════════════
const pauloNewAud = $('paulo-new-aud');
if (pauloNewAud) pauloNewAud.volume = .85;

// Mostrar fab cuando entre al main
(function() {
  const obs = new MutationObserver(() => {
    const main = $('main');
    if (main && main.classList.contains('show')) {
      obs.disconnect();
      setTimeout(() => {
        const fab = $('paulo-new-fab');
        if (fab) fab.classList.add('on');
      }, 600);
    }
  });
  const main = $('main');
  if (main) obs.observe(main, { attributes: true, attributeFilter: ['class'] });
})();

function openPauloNew() {
  const modal = $('paulo-new-modal'); if (!modal) return;

  // Mensaje
  const msgEl = $('paulo-new-msg');
  if (msgEl && typeof BDAY_PAULO_MESSAGE !== 'undefined') {
    const raw = BDAY_PAULO_MESSAGE.trim();
    const lines = raw.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
    if (lines.length) { msgEl.textContent = lines.join('\n'); msgEl.classList.add('show'); }
  }

  // Audio — nombre exacto del archivo
  const song = typeof BDAY_PAULO_SONG !== 'undefined' && BDAY_PAULO_SONG
    ? BDAY_PAULO_SONG
    : 'Paulo Londra me asfixia LA CIUDAD.mp3';
  if (pauloNewAud && song) {
    pauloNewAud.src = song;
    pauloNewAud.volume = 0;
    pauloNewAud.play().catch(() => {});
    let v = 0;
    const fi = setInterval(() => { v = Math.min(v+0.06,.85); pauloNewAud.volume=v; if(v>=.85) clearInterval(fi); }, 80);
    $('paulo-new-btn').textContent = '⏸';
    $('paulo-new-status').textContent = 'reproduciendo';
    const disc = $('paulo-new-disc'); if (disc) disc.classList.add('spinning');
  }

  modal.classList.add('on');
  document.body.style.overflow = 'hidden';
  if (typeof spawnHeartConfetti === 'function') spawnHeartConfetti(15);
  if (typeof playSparkle === 'function') playSparkle();
}

function closePauloNew() {
  const modal = $('paulo-new-modal'); if (!modal) return;
  modal.classList.remove('on');
  document.body.style.overflow = '';
  if (pauloNewAud) {
    let v = pauloNewAud.volume;
    const fo = setInterval(() => { v=Math.max(v-0.07,0); pauloNewAud.volume=v; if(v<=0){clearInterval(fo);pauloNewAud.pause();} }, 50);
  }
  const disc = $('paulo-new-disc'); if (disc) disc.classList.remove('spinning');
  $('paulo-new-btn').textContent = '▶';
  $('paulo-new-status').textContent = 'toca ▶ para escuchar';
}

function togglePauloNew() {
  if (!pauloNewAud) return;
  const disc=$('paulo-new-disc'), btn=$('paulo-new-btn'), status=$('paulo-new-status');
  if (pauloNewAud.paused) {
    pauloNewAud.play().catch(() => {});
    if (disc) disc.classList.add('spinning');
    if (btn) btn.textContent = '⏸';
    if (status) status.textContent = 'reproduciendo';
  } else {
    pauloNewAud.pause();
    if (disc) disc.classList.remove('spinning');
    if (btn) btn.textContent = '▶';
    if (status) status.textContent = 'pausado';
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('paulo-new-modal')?.classList.contains('on')) closePauloNew();
});
