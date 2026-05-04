// =====================================================
//   app.js
// =====================================================

let currentIdx  = null;
let currentCard = null;
let isAdmin     = false;
let lyricsTimer = null;
let lpTimer     = null;
let toastTimer  = null;
let loginRole   = null;   // 'guest' | 'admin'
let pendingMemImg = null;

const localFiles = {};
const aud = document.getElementById('aud');
aud.volume = 0.75;

const $  = id => document.getElementById(id);
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ── storage ── */
function loadDedicas() { return JSON.parse(localStorage.getItem('nd-dedicas') || '{}'); }
function saveDedicaStore(idx, msgs) {
  const all = loadDedicas(); all[idx] = msgs;
  localStorage.setItem('nd-dedicas', JSON.stringify(all));
}
function loadMemories() { return JSON.parse(localStorage.getItem('nd-memories') || '[]'); }
function saveMemories(arr) { localStorage.setItem('nd-memories', JSON.stringify(arr)); }

/* ════════════════════════════════════════════════
   LOGIN
════════════════════════════════════════════════ */
function selectRole(role) {
  loginRole = role;
  document.querySelectorAll('.login-card').forEach(c => c.classList.remove('selected'));
  $('card-' + role).classList.add('selected');
  const wrap = $('login-pass-wrap');
  wrap.classList.add('on');
  $('login-pass-label').textContent = role === 'admin' ? 'contraseña del creador' : 'contraseña de Ñalñita';
  $('login-pass-err').classList.remove('on');
  $('login-pass-input').value = '';
  setTimeout(() => $('login-pass-input').focus(), 350);
}

function confirmLogin() {
  const val  = $('login-pass-input').value;
  const ok   = loginRole === 'admin' ? val === ADMIN_PASS : val === GUEST_PASS;
  if (!ok) { $('login-pass-err').classList.add('on'); $('login-pass-input').value = ''; return; }

  isAdmin = loginRole === 'admin';

  // Ocultar login, mostrar bienvenida
  $('login-screen').classList.add('out');
  setTimeout(() => {
    $('login-screen').style.display = 'none';
    const w = $('welcome');
    w.style.display = 'flex';
    // pequeña pausa para que el display:flex tome efecto antes de animar
    requestAnimationFrame(() => requestAnimationFrame(() => {
      w.style.opacity = '1';
    }));
  }, 800);

  // Mostrar botón agregar si es admin
  if (isAdmin) $('add-card-btn').style.display = '';

  // Mostrar main solo después de que bienvenida desaparezca
  setTimeout(() => {
    $('main').style.visibility = 'visible';
    $('main').style.transition = 'opacity .5s ease';
    $('main').style.opacity = '1';
  }, 1900);
}

/* ════════════════════════════════════════════════
   BIENVENIDA
════════════════════════════════════════════════ */
function buildStars(containerId) {
  const sf = $(containerId);
  if (!sf) return;
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = 1 + Math.random() * 2.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-duration:${1.5+Math.random()*3}s;animation-delay:${Math.random()*4}s`;
    sf.appendChild(s);
  }
}
function buildGlowLines(selector) {
  const wbg = document.querySelector(selector);
  if (!wbg) return;
  for (let i = 0; i < 5; i++) {
    const l = document.createElement('div');
    l.className = 'glow-line';
    const w = 120 + Math.random() * 280;
    l.style.cssText = `width:${w}px;left:${Math.random()*100}%;animation-duration:${9+Math.random()*10}s;animation-delay:${Math.random()*9}s;transform:rotate(${-25+Math.random()*12}deg)`;
    wbg.appendChild(l);
  }
}

function enterGallery() {
  $('welcome').classList.add('out');
  spawnConfetti(70);
  setTimeout(() => { $('welcome').style.display = 'none'; }, 1000);
}

/* ════════════════════════════════════════════════
   CURSOR
════════════════════════════════════════════════ */
function initCursor() {
  const c  = $('cursor'), cd = $('cursor-dot');
  document.addEventListener('mousemove', e => {
    c.style.left = e.clientX+'px'; c.style.top = e.clientY+'px';
    setTimeout(() => { cd.style.left = e.clientX+'px'; cd.style.top = e.clientY+'px'; }, 80);
  });
  document.addEventListener('mouseover', e => {
    const over = e.target.closest('button,.char-card,.add-card,.login-card,.fpill,input,textarea,select,.file-drop,.mem-img-drop,.saved-card-del,.mem-card-del');
    c.classList.toggle('big', !!over);
  });
}

/* ════════════════════════════════════════════════
   PARTÍCULAS
════════════════════════════════════════════════ */
const EMOJIS = ['🩷','⭐','✨','💫','🌸','🎵','🎶','💜','🌟','🎀'];
function spawnEP() {
  const p = document.createElement('div');
  p.className = 'ep';
  p.textContent = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
  const sz = 11+Math.random()*14, dur = 8+Math.random()*10;
  p.style.cssText = `left:${Math.random()*100}vw;font-size:${sz}px;animation-duration:${dur}s;animation-delay:${Math.random()*dur}s`;
  $('ep-container').appendChild(p);
  setTimeout(() => p.remove(), (dur+3)*1000);
}
setInterval(spawnEP, 700);
for (let i = 0; i < 14; i++) setTimeout(spawnEP, i*90);

/* ════════════════════════════════════════════════
   CONFETI
════════════════════════════════════════════════ */
const CONF = ['#ff7eb3','#d97ef5','#ffaed0','#ffd6ea','#ffb7a0','#ead5ff'];
function spawnConfetti(n=40) {
  for (let i=0;i<n;i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.style.cssText = `left:${Math.random()*100}vw;background:${CONF[Math.floor(Math.random()*CONF.length)]};animation-duration:${2+Math.random()*2.2}s;animation-delay:${Math.random()*.4}s;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>.5?'50%':'2px'}`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4500);
    }, i*28);
  }
}

/* ════════════════════════════════════════════════
   FILE PREVIEW (personajes)
════════════════════════════════════════════════ */
let pendingImg = null, pendingSong = null;

function previewFile(inputId, previewId, dropId, type) {
  const file = $(inputId).files[0]; if (!file) return;
  const drop = $(dropId), preview = $(previewId);
  drop.classList.add('has-file');
  if (type === 'image') {
    pendingImg = file;
    preview.innerHTML = `<div class="file-drop-img-wrap"><img src="${URL.createObjectURL(file)}" alt="preview"></div><div class="file-drop-img-name">${file.name}</div>`;
  }
  if (type === 'audio') {
    pendingSong = file;
    const mb = (file.size/1024/1024).toFixed(1);
    preview.innerHTML = `<div class="file-drop-audio"><span class="file-drop-audio-icon">🎵</span><div class="file-drop-audio-info"><div class="file-drop-audio-name">${file.name}</div><div class="file-drop-audio-size">${mb} MB</div></div><span class="file-drop-change">cambiar</span></div>`;
  }
}

/* ════════════════════════════════════════════════
   RENDER TARJETAS
════════════════════════════════════════════════ */
function catLabel(cat) {
  return {paulo:'Paulo',alondra:'Alondra',kirby:'Kirby',peach:'🍑 Peach',fav:'⭐',otro:''}[cat]||'';
}
function getImg(ch,idx)  { return (localFiles[idx]&&localFiles[idx].imgURL)  ? localFiles[idx].imgURL  : ch.img; }
function getSong(ch,idx) { return (localFiles[idx]&&localFiles[idx].songURL) ? localFiles[idx].songURL : ch.song; }

function renderCards() {
  const g   = $('gallery');
  const add = $('add-card-btn');
  g.querySelectorAll('.char-card').forEach(c => c.remove());

  // Paulo primero, luego el resto en orden original
  const sorted = [
    ...characters.map((ch,i) => ({ch,i})).filter(({ch}) => ch.cat === 'paulo'),
    ...characters.map((ch,i) => ({ch,i})).filter(({ch}) => ch.cat !== 'paulo'),
  ];

  sorted.forEach(({ch, i}, sortedIdx) => {
    const imgSrc = getImg(ch, i);
    const isPaulo = ch.cat === 'paulo';
    const card = document.createElement('div');
    card.className = [
      'char-card',
      isPaulo ? 'cat-paulo' : '',
      currentIdx === i ? 'playing' : ''
    ].filter(Boolean).join(' ');
    card.style.animationDelay = (sortedIdx * 0.07) + 's';
    card.dataset.idx = i;

    const noteEmoji = isPaulo ? '👑' : '🎵';
    const badgeLabel = isPaulo
      ? '<span style="font-size:.7rem">👑</span> Paulo'
      : catLabel(ch.cat);

    // placeholder si no hay imagen todavía
    const placeholderEmoji = {paulo:'👑',kirby:'🌸',peach:'👸',alondra:'🎵',otro:'✨',fav:'⭐'}[ch.cat]||'🎵';

    card.innerHTML = `
      ${imgSrc
        ? `<img src="${imgSrc}" alt="${ch.name}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="card-placeholder" style="${imgSrc?'display:none':''}">
        <span class="card-placeholder-icon">${placeholderEmoji}</span>
        <span class="card-placeholder-text">${ch.name}</span>
      </div>
      <div class="card-glow"></div>
      <div class="card-ov">
        <div class="ov-name">${ch.name}</div>
        <div class="ov-song">🎵 ${ch.songName}</div>
      </div>
      <div class="note-badge">${noteEmoji}</div>
      <div class="cat-badge">${badgeLabel}</div>
    `;
    card.addEventListener('click', () => handleClick(card, i));
    g.insertBefore(card, add);
  });
}

/* ════════════════════════════════════════════════
   CLICK TARJETA
════════════════════════════════════════════════ */
function handleClick(card, idx) {
  clickPop(card);
  openModal(idx);
  setTimeout(() => playChar(idx, card), 460);
}

function clickPop(card) {
  const r = card.getBoundingClientRect();
  const cx = r.left+r.width/2, cy = r.top+r.height/2;
  ['✨','🩷','⭐','🎵','💫'].forEach((em,i) => {
    const p = document.createElement('div');
    p.style.cssText = `position:fixed;z-index:9999;pointer-events:none;left:${cx}px;top:${cy}px;font-size:${14+Math.random()*14}px;transform:translate(-50%,-50%);transition:all .65s cubic-bezier(0,.9,.57,1);opacity:1`;
    p.textContent = em; document.body.appendChild(p);
    const ang=(i/5)*Math.PI*2, d=55+Math.random()*55;
    setTimeout(()=>{ p.style.left=(cx+Math.cos(ang)*d)+'px'; p.style.top=(cy+Math.sin(ang)*d)+'px'; p.style.opacity='0'; p.style.transform='translate(-50%,-50%) scale(0)'; },10);
    setTimeout(()=>p.remove(),700);
  });
}

/* ════════════════════════════════════════════════
   AUDIO
════════════════════════════════════════════════ */
function playChar(idx, card) {
  const ch = characters[idx], songSrc = getSong(ch,idx);
  if (currentCard) currentCard.classList.remove('playing');
  currentCard=card; currentIdx=idx; card.classList.add('playing');
  if (songSrc) { aud.src=songSrc; aud.play().catch(()=>{}); }
  else { aud.pause(); aud.src=''; }
  const imgSrc=getImg(ch,idx), pi=$('p-img');
  pi.src=imgSrc; pi.onerror=()=>pi.src=`https://via.placeholder.com/50/1e1130/ff7eb3?text=${ch.name[0]}`;
  $('p-name').textContent=ch.name; $('p-song').textContent='🎵 '+ch.songName;
  pi.classList.add('go'); $('p-wave').classList.add('go');
  $('player').classList.add('on'); $('btn-pp').textContent='⏸';
  startLyricsPanel(ch.lyrics||[]);
}

function togglePlay() {
  if (aud.paused) { aud.play(); $('btn-pp').textContent='⏸'; $('p-img').classList.add('go'); $('p-wave').classList.add('go'); }
  else            { aud.pause(); $('btn-pp').textContent='▶'; $('p-img').classList.remove('go'); $('p-wave').classList.remove('go'); }
}
on($('p-vol'),'input',e=>aud.volume=e.target.value);

/* ════════════════════════════════════════════════
   LETRAS
════════════════════════════════════════════════ */
function startLyricsPanel(lyrics) {
  clearInterval(lpTimer);
  const panel = $('lyrics-panel');
  const ul    = $('lp-lines');
  ul.innerHTML = '';

  if (!lyrics.length) { panel.classList.remove('on'); return; }
  panel.classList.add('on');

  // Solo renderizar 5 líneas visibles a la vez — no toda la lista
  let currentVisible = []; // índices actualmente en el DOM
  let lastCur = -1;

  function showWindow(cur) {
    ul.innerHTML = '';
    // Ventana: 2 antes, activa, 2 después
    const start = Math.max(0, cur - 2);
    const end   = Math.min(lyrics.length - 1, cur + 2);

    for (let i = start; i <= end; i++) {
      const li = document.createElement('li');
      li.textContent = lyrics[i][1];
      const dist = i - cur;
      if      (dist ===  0) li.className = 'active';
      else if (dist === -1) li.className = 'prev1';
      else if (dist === -2) li.className = 'prev2';
      else if (dist ===  1) li.className = 'next1';
      else if (dist ===  2) li.className = 'next2';
      ul.appendChild(li);
    }
  }

  // Mostrar estado inicial (próxima línea)
  showWindow(0);

  lpTimer = setInterval(() => {
    const t   = aud.currentTime || 0;
    let cur   = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (t >= lyrics[i][0]) cur = i;
    }
    if (cur === lastCur) return;
    lastCur = cur;
    if (cur < 0) return;
    showWindow(cur);
  }, 200);
}

/* ════════════════════════════════════════════════
   MODAL PERSONAJE
════════════════════════════════════════════════ */
function openModal(idx) {
  const ch=characters[idx], imgSrc=getImg(ch,idx);
  currentIdx=idx;
  const mi=$('modal-img'); mi.src=imgSrc;
  mi.onerror=()=>mi.src=`https://via.placeholder.com/400/1e1130/ff7eb3?text=${encodeURIComponent(ch.name[0])}`;
  $('modal-name').textContent=ch.name; $('modal-series').textContent=ch.series||'';
  $('modal-back-img').style.backgroundImage=`url(${imgSrc})`;
  $('modal-hdr-bg').style.backgroundImage=`url(${imgSrc})`;
  $('m-song').textContent=ch.songName;
  renderModalLyrics(ch.lyrics||[]);
  ['mwb1','mwb2','mwb3','mwb4'].forEach(id=>$(id).classList.toggle('go',!!getSong(ch,idx)&&!aud.paused));
  renderSavedMsgs(idx);
  $('dedica-ta').value=''; $('save-ok').classList.remove('on');

  // Mostrar/ocultar área de escribir según rol
  const footer = document.querySelector('.dedica-footer');
  const ta = $('dedica-ta');
  if (footer) footer.style.display = isAdmin ? 'flex' : 'none';
  if (ta)     ta.style.display     = isAdmin ? 'block' : 'none';

  // Mostrar barra de importar letras solo a admin
  const adminBar = $('lyrics-admin-bar');
  if (adminBar) {
    adminBar.style.display = isAdmin ? 'flex' : 'none';
    // Pre-rellenar artista con el campo series del personaje
    const fetchArtist = $('fetch-artist');
    if (fetchArtist) fetchArtist.value = ch.series && ch.series !== '—' ? ch.series : '';
    $('fetch-status').textContent = '';
    $('fetch-status').className = 'fetch-status';
    $('btn-fetch').disabled = false;
    $('fetch-icon').textContent = '🔍';
    $('fetch-icon').className = '';
  }

  $('modal').classList.add('on'); document.body.style.overflow='hidden';
}
function closeModal() { $('modal').classList.remove('on'); document.body.style.overflow=''; clearInterval(lyricsTimer); }

/* ── parsear formato LRC  "[mm:ss.xx] texto" ── */
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

/* ── buscar letras manual desde admin (botón) ── */
async function adminFetchLyrics() {
  if (currentIdx === null) return;
  const ch       = characters[currentIdx];
  const artist   = ($('fetch-artist').value || ch.series || '').trim();
  const songName = ch.songName || '';

  if (!songName) { $('fetch-status').textContent = 'pon el nombre de la canción en data.js'; $('fetch-status').className='fetch-status fail'; return; }

  // UI de cargando
  const btn = $('btn-fetch');
  const icon = $('fetch-icon');
  const status = $('fetch-status');
  btn.disabled = true;
  icon.textContent = '⟳'; icon.className = 'spin';
  status.textContent = 'buscando...'; status.className = 'fetch-status';

  const result = await fetchLyrics(songName, artist);

  icon.className = ''; btn.disabled = false;

  if (result && result.length) {
    // Guardar en el personaje permanentemente
    ch.lyrics = result;
    ch._cachedLyrics = result;
    // Guardar también en localStorage para persistencia
    const saved = JSON.parse(localStorage.getItem('nd-lyrics') || '{}');
    saved[currentIdx] = result;
    localStorage.setItem('nd-lyrics', JSON.stringify(saved));
    // Mostrar en modal y panel
    renderModalLyrics(result);
    startLyricsPanel(result);
    icon.textContent = '✓';
    status.textContent = `${result.length} líneas guardadas 🩷`;
    status.className = 'fetch-status ok';
    showToast('🎵 letras importadas y guardadas');
  } else {
    icon.textContent = '✕';
    status.textContent = 'no encontrada — prueba otro artista';
    status.className = 'fetch-status fail';
  }
}

/* ── buscar letras en LRCLIB ── */
async function fetchLyrics(trackName, artistName) {
  try {
    // Intentar primero con artista + título exacto
    const q = encodeURIComponent(trackName + ' ' + artistName);
    const res = await fetch(`https://lrclib.net/api/search?q=${q}`);
    const data = await res.json();
    if (!data.length) return null;

    // Preferir resultado con syncedLyrics del artista correcto
    const synced = data.find(d =>
      d.syncedLyrics &&
      d.artistName.toLowerCase().includes(artistName.toLowerCase())
    ) || data.find(d => d.syncedLyrics) || data[0];

    if (synced.syncedLyrics) return parseLRC(synced.syncedLyrics);
    if (synced.plainLyrics) {
      return synced.plainLyrics.split('\n')
        .filter(l => l.trim())
        .map((l, i) => [i * 3, l]);
    }
  } catch(e) {}
  return null;
}

function renderModalLyrics(lyrics) {
  const box = $('modal-lyrics');
  box.innerHTML = '';
  if (!lyrics || !lyrics.length) {
    box.innerHTML = '<span style="color:rgba(255,255,255,.2);font-size:.8rem;font-weight:700;">sin letras aún</span>';
    return;
  }
  lyrics.forEach(l => {
    const d = document.createElement('div');
    d.className = 'lyric-line'; d.textContent = l[1]; d.dataset.t = l[0];
    box.appendChild(d);
  });
  clearInterval(lyricsTimer);
  lyricsTimer = setInterval(() => {
    const t = aud.currentTime || 0;
    const lines = box.querySelectorAll('.lyric-line'); let cur = -1;
    lines.forEach((l,i) => { if (t >= parseFloat(l.dataset.t)) cur = i; });
    lines.forEach((l,i) => { l.classList.toggle('cur',i===cur); l.classList.toggle('done',i<cur); });
    if (cur >= 0) lines[cur].scrollIntoView({block:'nearest',behavior:'smooth'});
  }, 250);
}

function renderSavedMsgs(idx) {
  const msgs=(loadDedicas()[idx]||[]), cont=$('saved-cards');
  cont.innerHTML='';
  msgs.forEach((m,mi)=>{
    const card=document.createElement('div'); card.className='saved-card'; card.style.animationDelay=(mi*.07)+'s';
    card.innerHTML=`<div class="saved-card-date">${m.date}</div><div>${m.text}</div>${isAdmin?`<button class="saved-card-del" onclick="deleteMsg(${idx},${mi})" title="Borrar">✕</button>`:''}`;
    cont.appendChild(card);
  });
}
function deleteMsg(idx,mi) {
  const all=loadDedicas(), msgs=all[idx]||[]; msgs.splice(mi,1);
  saveDedicaStore(idx,msgs); renderSavedMsgs(idx); showToast('mensaje eliminado');
}
function saveDedica() {
  if (currentIdx===null) return;
  const text=$('dedica-ta').value.trim(); if (!text) return;
  const all=loadDedicas(), msgs=all[currentIdx]||[];
  const date=new Date().toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  msgs.push({text,date}); saveDedicaStore(currentIdx,msgs);
  $('dedica-ta').value=''; renderSavedMsgs(currentIdx);
  $('save-ok').classList.add('on'); setTimeout(()=>$('save-ok').classList.remove('on'),3000);
  spawnConfetti(28); showToast('🩷 mensaje guardado');
}

/* ════════════════════════════════════════════════
   MODAL MENSAJES / RECUERDOS
════════════════════════════════════════════════ */
function openMemModal() {
  renderMemories();
  // Solo admin ve el formulario para escribir
  $('mem-form').style.display = isAdmin ? 'flex' : 'none';
  if (isAdmin) $('mem-form').style.flexDirection = 'column';
  $('mem-modal').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeMemModal() { $('mem-modal').classList.remove('on'); document.body.style.overflow=''; }

function renderMemories() {
  const list = $('mem-list'), mems = loadMemories();
  list.innerHTML = '';

  // Actualizar badge y subtítulo
  const badge = $('msg-fab-badge');
  badge.textContent = mems.length;
  badge.classList.toggle('on', mems.length > 0);
  $('mem-count').textContent = mems.length === 0 ? 'sin mensajes aún' : `${mems.length} mensaje${mems.length>1?'s':''}`;

  if (!mems.length) {
    list.innerHTML = '<div class="mem-empty"><span class="mem-empty-icon">💌</span>aún no hay mensajes<br><span style="font-size:.8rem;opacity:.6">pronto habrá algo bonito para ti 🌸</span></div>';
    return;
  }

  // Mostrar del más nuevo al más viejo
  [...mems].reverse().forEach((m, ri) => {
    const realIdx = mems.length - 1 - ri;
    const card = document.createElement('div');
    card.className = 'mem-card'; card.style.animationDelay = (ri*.07)+'s';
    card.innerHTML = `
      ${m.imgURL ? `<img class="mem-card-img" src="${m.imgURL}" alt="recuerdo">` : ''}
      <div class="mem-card-body">
        <div class="mem-card-date">${m.date}</div>
        <div class="mem-card-text">${m.text}</div>
      </div>
      <div class="mem-card-footer">
        <span class="mem-card-heart">🩷</span>
        ${isAdmin ? `<button class="mem-card-del" onclick="deleteMemory(${realIdx})">borrar</button>` : ''}
      </div>
    `;
    list.appendChild(card);
  });
}

function previewMemImg() {
  const file = $('mem-fi').files[0]; if (!file) return;
  pendingMemImg = file;
  const url = URL.createObjectURL(file);
  const drop = $('mem-img-drop');
  drop.classList.add('has-img');
  drop.innerHTML = `
    <div class="mem-img-preview-wrap">
      <img src="${url}" alt="preview">
    </div>
    <div class="mem-img-preview-name">${file.name}</div>
  `;
}

function addMemory() {
  const text = $('mem-text').value.trim();
  if (!text) { showToast('⚠️ escribe algo primero'); return; }
  const mems = loadMemories();
  const date = new Date().toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const imgURL = pendingMemImg ? URL.createObjectURL(pendingMemImg) : '';
  mems.push({ text, date, imgURL });
  saveMemories(mems);
  $('mem-text').value = '';
  pendingMemImg = null;
  // reset imagen drop
  $('mem-img-drop').classList.remove('has-img');
  $('mem-img-drop').innerHTML = `<div class="mem-img-placeholder"><span class="mem-img-placeholder-icon">🖼</span><span class="mem-img-placeholder-text">Agregar imagen (opcional)</span></div>`;
  $('mem-fi').value = '';
  renderMemories();
  spawnConfetti(35);
  showToast('🩷 mensaje enviado');
}

function deleteMemory(idx) {
  const mems = loadMemories(); mems.splice(idx,1); saveMemories(mems);
  renderMemories(); showToast('mensaje eliminado');
}

/* ════════════════════════════════════════════════
   AGREGAR PERSONAJE
════════════════════════════════════════════════ */
function openAdd() { pendingImg=null; pendingSong=null;
  $('img-preview').innerHTML=`<span class="file-drop-icon">🖼</span><span class="file-drop-text">Toca para elegir imagen</span><span class="file-drop-hint">.jpg .png .webp .gif</span>`;
  $('song-preview').innerHTML=`<span class="file-drop-icon">🎵</span><span class="file-drop-text">Toca para elegir canción</span><span class="file-drop-hint">.mp3 .ogg .wav</span>`;
  $('img-drop').classList.remove('has-file'); $('song-drop').classList.remove('has-file');
  $('add-modal').classList.add('on'); document.body.style.overflow='hidden'; }
function closeAdd() { $('add-modal').classList.remove('on'); document.body.style.overflow=''; }

function addChar() {
  const name=$('fn').value.trim(); if (!name) { showToast('⚠️ escribe un nombre'); return; }
  const series=$('fseries').value.trim()||'—', cat=$('fcat').value, sname=$('fsn').value.trim()||'sin título';
  const rawLyrics=$('fly').value.trim();
  const lyrics=[];
  if(rawLyrics) rawLyrics.split('\n').forEach(line=>{ const m=line.match(/^(\d+):(\d{1,2})\s+(.+)/); if(m) lyrics.push([parseInt(m[1])*60+parseInt(m[2]),m[3].trim()]); });
  const imgURL=pendingImg?URL.createObjectURL(pendingImg):'';
  const songURL=pendingSong?URL.createObjectURL(pendingSong):'';
  const newIdx=characters.length;
  localFiles[newIdx]={imgURL,songURL};
  characters.push({ name,series,cat, img:pendingImg?`imagenes/${pendingImg.name}`:'', song:pendingSong?`canciones/${pendingSong.name}`:'', songName:sname,lyrics,fav:false });
  renderCards(); closeAdd(); spawnConfetti(45); showToast(`🩷 ${name} agregado`);
  ['fn','fseries','fsn','fly'].forEach(id=>$(id).value=''); $('fcat').value='kirby'; $('fi').value=''; $('fa').value=''; pendingImg=null; pendingSong=null;
}

/* ════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════ */
function showToast(msg) {
  const t=$('toast'); t.innerHTML=`<span class="t-dot"></span>${msg}`; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('on'),2800);
}

/* ════════════════════════════════════════════════
   TECLADO
════════════════════════════════════════════════ */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeModal();closeAdd();closeMemModal();}
  if(e.key===' '&&$('player').classList.contains('on')&&document.activeElement.tagName!=='TEXTAREA'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();togglePlay();}
});

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
// Ocultar main y bienvenida hasta que el login esté listo
const wEl = $('welcome');
wEl.style.opacity = '0';
wEl.style.transition = 'opacity .6s ease';
$('main').style.visibility = 'hidden';
$('main').style.opacity = '0';

/* ════════════════════════════════════════════════
   MODALES DEDICATORIA
════════════════════════════════════════════════ */
const dedicaConfig = {
  2: {
    song:   'Linkin Park - The Messenger.mp3',
    artist: 'Linkin Park',
    sname:  'The Messenger',
    img:    'Val.png'
  }
};

const dedicaAud  = [null, new Audio(), new Audio()];
let   dedicaLyricsTimer = [null, null, null];

function openDedica(n) {
  const cfg = dedicaConfig[n];
  const modal = $('dedica-modal-' + n);

  // Imagen de fondo y portada
  const img = $('dm'+n+'-img');
  img.src = cfg.img;
  img.onerror = () => img.src = `https://via.placeholder.com/220/1e1130/${n===1?'a855f7':'6366f1'}?text=🎵`;
  $('dm'+n+'-bg').style.backgroundImage = `url(${cfg.img})`;

  modal.classList.add('on');
  document.body.style.overflow = 'hidden';

  // Pausar audio principal de la galería
  aud.pause();
  $('btn-pp').textContent = '▶';
  $('p-img').classList.remove('go');
  $('p-wave').classList.remove('go');

  // Cargar y reproducir automáticamente
  const a = dedicaAud[n];
  a.src = cfg.song;
  a.volume = 0;

  // Esperar animación del modal (500ms) y luego reproducir con fade in
  setTimeout(() => {
    a.play().catch(() => {});
    $('dm'+n+'-btn').textContent = '⏸';
    const playerEl = $('dm'+n+'-btn').closest('.dedica-player');
    if (playerEl) playerEl.classList.add('playing');
    // Fade in del volumen
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.05, 0.85);
      a.volume = vol;
      if (vol >= 0.85) clearInterval(fadeIn);
    }, 50);
  }, 520);

  // Buscar letras si no las tiene
  const linesDiv = $('dm'+n+'-lines');
  if (!linesDiv.children.length) {
    linesDiv.innerHTML = '<span style="color:rgba(255,255,255,.2);font-size:.8rem;font-weight:700;">buscando letras...</span>';
    fetchLyrics(cfg.sname, cfg.artist).then(lyrics => {
      if (lyrics && lyrics.length) {
        renderDedicaLyrics(n, lyrics, a);
        // Iniciar sync de letras si ya está sonando
        setTimeout(() => {
          const lines = linesDiv.querySelectorAll('.dedica-lyric-line');
          if (lines.length && !a.paused) startDedicaSync(n, a, lines);
        }, 600);
      } else {
        linesDiv.innerHTML = '<span style="color:rgba(255,255,255,.18);font-size:.8rem;">sin letras disponibles</span>';
      }
    });
  } else {
    // Ya tiene letras — iniciar sync
    setTimeout(() => {
      const lines = linesDiv.querySelectorAll('.dedica-lyric-line');
      if (lines.length) startDedicaSync(n, a, lines);
    }, 600);
  }
}

function closeDedica(n) {
  $('dedica-modal-' + n).classList.remove('on');
  document.body.style.overflow = '';
  // Fade out antes de pausar
  const a = dedicaAud[n];
  const fadeOut = setInterval(() => {
    if (a.volume > 0.06) { a.volume = Math.max(0, a.volume - 0.06); }
    else { a.pause(); a.volume = 0.85; clearInterval(fadeOut); }
  }, 40);
  $('dm'+n+'-btn').textContent = '▶';
  const playerEl = $('dm'+n+'-btn') && $('dm'+n+'-btn').closest('.dedica-player');
  if (playerEl) playerEl.classList.remove('playing');
  clearInterval(dedicaLyricsTimer[n]);
}

function toggleDedica(n) {
  const a   = dedicaAud[n];
  const btn = $('dm'+n+'-btn');
  // Pausar el audio principal si está sonando
  if (!a.paused) {
    a.pause(); btn.textContent = '▶';
    clearInterval(dedicaLyricsTimer[n]);
    const playerEl2 = btn.closest('.dedica-player');
    if (playerEl2) playerEl2.classList.remove('playing');
  } else {
    aud.pause(); // pausa galería
    // pausar el otro modal también
    const other = n === 1 ? 2 : 1;
    dedicaAud[other].pause();
    $('dm'+other+'-btn').textContent = '▶';
    a.play().catch(()=>{});
    btn.textContent = '⏸';
    // Agregar clase playing al reproductor
    const playerEl = btn.closest('.dedica-player');
    if (playerEl) playerEl.classList.add('playing');
    // sincronizar letras
    const linesDiv = $('dm'+n+'-lines');
    const lines = linesDiv.querySelectorAll('.dedica-lyric-line');
    if (lines.length) startDedicaSync(n, a, lines);
  }
}

function renderDedicaLyrics(n, lyrics, audioEl) {
  const box = $('dm'+n+'-lines');
  box.innerHTML = '';
  lyrics.forEach(l => {
    const d = document.createElement('div');
    d.className = 'dedica-lyric-line';
    d.textContent = l[1]; d.dataset.t = l[0];
    box.appendChild(d);
  });
}

function startDedicaSync(n, audioEl, lines) {
  clearInterval(dedicaLyricsTimer[n]);
  const box = $('dm'+n+'-lyrics');
  dedicaLyricsTimer[n] = setInterval(() => {
    const t = audioEl.currentTime || 0;
    let cur = -1;
    lines.forEach((l,i) => { if (t >= parseFloat(l.dataset.t)) cur = i; });
    lines.forEach((l,i) => {
      l.classList.toggle('cur',  i === cur);
      l.classList.toggle('done', i <  cur);
    });
    if (cur >= 0) lines[cur].scrollIntoView({ block:'nearest', behavior:'smooth' });
  }, 250);
}

/* ════════════════════════════════════════════════
   ESTRELLAS FUGACES
════════════════════════════════════════════════ */
function spawnShootingStar() {
  const s  = document.createElement('div');
  s.className = 'shooting-star';
  const startX = Math.random() * window.innerWidth;
  const startY = Math.random() * window.innerHeight * 0.5;
  const angle  = 30 + Math.random() * 20; // diagonal hacia abajo
  const dist   = 150 + Math.random() * 200;
  const rad    = angle * Math.PI / 180;
  s.style.cssText = `
    left:${startX}px; top:${startY}px;
    --dx:${Math.cos(rad)*dist}px; --dy:${Math.sin(rad)*dist}px;
    animation-duration:${0.8+Math.random()*0.6}s;
    animation-delay:0s;
    width:${2+Math.random()*2}px; height:${2+Math.random()*2}px;
  `;
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 1500);
}
setInterval(spawnShootingStar, 2800);

$('welcome-name').textContent  = FRIEND_NAME;
if ($('welcome-name2')) $('welcome-name2').textContent = FRIEND_NAME;
$('welcome-msg').textContent   = WELCOME_MSG;

// Cargar letras guardadas por admin
const _savedLyrics = JSON.parse(localStorage.getItem('nd-lyrics') || '{}');
Object.keys(_savedLyrics).forEach(idx => {
  if (characters[idx]) {
    characters[idx].lyrics = _savedLyrics[idx];
    characters[idx]._cachedLyrics = _savedLyrics[idx];
  }
});

buildStars('login-stars');
buildStars('star-field');
buildGlowLines('.login-bg');
buildGlowLines('.wbg');
initCursor();
renderCards();
renderMemories(); // Para actualizar el badge del FAB
