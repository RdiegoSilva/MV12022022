/* =========================================================
   ÁLBUM VIRTUAL — Marta & Diego
   As fotos ficam no arquivo fotos.js (lista FOTOS)
   ========================================================= */

const INICIO = new Date(2022, 1, 12);           // 12/02/2022
const $ = (id) => document.getElementById(id);

/* ---------- 1. MONTAR AS PÁGINAS DE FOTO ---------- */
const book = $('book');
const paginaFinal = book.querySelector('.leaf--end');

FOTOS.forEach((foto, i) => {
  const leaf = document.createElement('section');
  leaf.className = 'leaf leaf--photo';
  leaf.dataset.label = `Foto ${i + 1} de ${FOTOS.length}`;
  leaf.style.setProperty('--giro', `${i % 2 ? 1.8 : -1.8}deg`);
  leaf.innerHTML = `
    <figure class="frame">
      <div class="frame__photo"><img decoding="async" alt=""></div>
      <figcaption></figcaption>
    </figure>
    <span class="pageno">${i + 1} / ${FOTOS.length}</span>`;

  const img = leaf.querySelector('img');
  img.src = foto.src;
  img.alt = foto.legenda;
  img.addEventListener('error', () => leaf.querySelector('.frame').classList.add('is-empty'));
  leaf.querySelector('figcaption').textContent = foto.legenda;

  book.insertBefore(leaf, paginaFinal);
});

/* ---------- 2. NAVEGAÇÃO ENTRE AS PÁGINAS ---------- */
const leaves = [...book.querySelectorAll('.leaf')];
const ultimo = leaves.length - 1;
let atual = 0;                                   // página visível

leaves.forEach((l, i) => (l.style.zIndex = leaves.length - i));

function render(anterior) {
  // páginas que precisam virar (ou desvirar) agora
  const mudaram = leaves.filter((l, i) => l.classList.contains('is-turned') !== (i < atual));
  if (atual < anterior) mudaram.reverse();       // voltando: a última vira primeiro

  mudaram.forEach((l, k) => {
    l.style.transitionDelay = `${Math.min(k * 0.1, 0.9)}s`;
    l.classList.toggle('is-turned');
  });

  leaves.forEach((l, i) => l.setAttribute('aria-hidden', i !== atual));
  $('label').textContent = leaves[atual].dataset.label;
  $('bar').style.width = `${(atual / ultimo) * 100}%`;
  $('prev').disabled = atual === 0;
  $('next').disabled = atual === ultimo;
}

function ir(n) {
  n = Math.max(0, Math.min(ultimo, n));
  if (n === atual) return;
  const anterior = atual;
  atual = n;
  render(anterior);
  explodir(8);
}

$('next').addEventListener('click', () => ir(atual + 1));
$('prev').addEventListener('click', () => ir(atual - 1));
$('restart').addEventListener('click', () => ir(0));
leaves[0].addEventListener('click', () => atual === 0 && ir(1));   // tocar na capa abre

document.addEventListener('keydown', (e) => {
  if (bloqueado()) return;
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); ir(atual + 1); }
  if (e.key === 'ArrowLeft') ir(atual - 1);
});

// deslizar o dedo no celular
let x0 = null;
book.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
book.addEventListener('touchend', (e) => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  x0 = null;
  if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1));
});

render(0);

/* ---------- 3. CONTADOR ---------- */
function atualizarContador() {
  const agora = new Date();
  let anos = agora.getFullYear() - INICIO.getFullYear();
  let meses = agora.getMonth() - INICIO.getMonth();
  let dias = agora.getDate() - INICIO.getDate();

  if (dias < 0) {
    meses--;
    dias += new Date(agora.getFullYear(), agora.getMonth(), 0).getDate();
  }
  if (meses < 0) { anos--; meses += 12; }

  $('c-anos').textContent = anos;
  $('c-meses').textContent = meses;
  $('c-dias').textContent = dias;
  $('c-horas').textContent = agora.getHours();
  $('c-min').textContent = agora.getMinutes();
  $('c-seg').textContent = agora.getSeconds();
  $('c-total').textContent = Math.floor((agora - INICIO) / 86400000).toLocaleString('pt-BR');
}
atualizarContador();
setInterval(atualizarContador, 1000);

/* ---------- 4. CORAÇÕES ---------- */
const container = $('hearts');
const EMOJIS = ['💖', '💕', '❤️', '💗', '💘', '🌸'];
const sorteia = (lista) => lista[Math.floor(Math.random() * lista.length)];

// chuva contínua
function criarCoracao() {
  const h = document.createElement('span');
  h.className = 'heart';
  h.textContent = sorteia(EMOJIS);
  h.style.left = `${Math.random() * 100}vw`;
  h.style.fontSize = `${14 + Math.random() * 24}px`;
  h.style.setProperty('--vento', `${(Math.random() - 0.5) * 160}px`);
  const duracao = 5 + Math.random() * 6;
  h.style.animationDuration = `${duracao}s`;
  container.appendChild(h);
  setTimeout(() => h.remove(), duracao * 1000);
}
setInterval(criarCoracao, 400);

// explosãozinha de corações ao virar a página
function explodir(qtd) {
  const r = book.getBoundingClientRect();
  for (let i = 0; i < qtd; i++) {
    const h = document.createElement('span');
    h.className = 'burst';
    h.textContent = sorteia(EMOJIS);
    h.style.left = `${r.left + r.width / 2}px`;
    h.style.top = `${r.top + r.height / 2}px`;
    h.style.setProperty('--dx', `${(Math.random() - 0.5) * 320}px`);
    h.style.setProperty('--dy', `${-60 - Math.random() * 200}px`);
    container.appendChild(h);
    setTimeout(() => h.remove(), 1500);
  }
}

/* ---------- 5. SENHA DE ENTRADA ---------- */
const SENHA = '12022022';                         // ddmmaaaa
const bloqueado = () => document.body.classList.contains('locked');
const lock = $('lock');
const campo = $('lock-input');

$('lock-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const digitado = campo.value.replace(/\D/g, '');   // aceita também 12/02/2022

  if (digitado === SENHA) {
    document.body.classList.remove('locked');
    lock.classList.add('is-open');
    setTimeout(() => { explodir(14); lock.remove(); }, 1000);
  } else {
    const card = $('lock-form');
    $('lock-error').textContent = 'Senha incorreta 💔 tente de novo';
    card.classList.remove('shake');
    void card.offsetWidth;                          // reinicia a animação
    card.classList.add('shake');
    campo.select();
  }
});

campo.addEventListener('input', () => { $('lock-error').textContent = ''; });
campo.focus();
