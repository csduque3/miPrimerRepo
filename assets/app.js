/**
 * App de aprendizaje acelerado: contabilidad tributaria colombiana.
 * Métodos aplicados: repetición espaciada (SM-2 simplificado), intercalado
 * (interleaving) de módulos, recuerdo activo (flashcards) y técnica Feynman.
 * Persistencia: localStorage (los datos quedan solo en este navegador).
 */

const STORAGE_KEY = "tributaria90_v1";
const TOTAL_DIAS = 90;

const state = {
  startDate: null,
  cards: {},      // id -> {interval, reps, ef, due, lapsos, aciertos, historial}
  feynman: {},    // moduloId -> [{fecha, texto}]
  log: {},        // fecha (YYYY-MM-DD) -> {revisadas, correctas, feynman:boolean}
};

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function diffInDays(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.floor(ms / 86400000);
}

function cardId(moduloId, idx) {
  return `${moduloId}:${idx}`;
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      Object.assign(state, JSON.parse(raw));
    } catch (e) {
      console.warn("No se pudo leer el progreso guardado, se reinicia.", e);
    }
  }
  if (!state.startDate) {
    state.startDate = todayStr();
  }
  TEMARIO.forEach((mod) => {
    mod.conceptos.forEach((_, idx) => {
      const id = cardId(mod.id, idx);
      if (!state.cards[id]) {
        state.cards[id] = {
          interval: 0,
          reps: 0,
          ef: 2.5,
          due: todayStr(),
          aciertos: 0,
          lapsos: 0,
        };
      }
    });
  });
  save();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function diaActual() {
  return Math.min(TOTAL_DIAS, diffInDays(state.startDate, todayStr()) + 1);
}

function semanaActual() {
  return Math.min(13, Math.ceil(diaActual() / 7));
}

/**
 * Un módulo queda "desbloqueado" para intercalar desde una semana antes de su
 * semanaFoco (para poder mezclarlo con lo nuevo) hasta el final del plan,
 * de forma que en las últimas semanas se intercalan todos los módulos vistos.
 */
function modulosDesbloqueados() {
  const semana = semanaActual();
  return TEMARIO.filter((m) => m.semanaFoco <= semana);
}

// ---------- SM-2 simplificado ----------
// grade: 0 = otra vez, 3 = difícil, 4 = bien, 5 = fácil
function aplicarSM2(card, grade) {
  if (grade < 3) {
    card.reps = 0;
    card.interval = 1;
    card.lapsos += 1;
  } else {
    card.ef = Math.max(1.3, card.ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
    card.reps += 1;
    if (card.reps === 1) card.interval = 1;
    else if (card.reps === 2) card.interval = 3;
    else card.interval = Math.round(card.interval * card.ef);
    card.aciertos += 1;
  }
  card.due = todayStr(card.interval);
}

// ---------- Sesión diaria ----------
function tarjetasParaHoy(limite = 18) {
  const hoy = todayStr();
  const disponibles = modulosDesbloqueados();
  let pool = [];
  disponibles.forEach((mod) => {
    mod.conceptos.forEach((c, idx) => {
      const id = cardId(mod.id, idx);
      const card = state.cards[id];
      if (card.due <= hoy) {
        pool.push({ id, moduloId: mod.id, moduloNombre: mod.nombre, ...c });
      }
    });
  });
  // Intercalado: mezclamos y evitamos que dos tarjetas seguidas sean del mismo módulo
  pool = shuffle(pool);
  pool = intercalar(pool);
  return pool.slice(0, limite);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function intercalar(pool) {
  const porModulo = {};
  pool.forEach((c) => {
    porModulo[c.moduloId] = porModulo[c.moduloId] || [];
    porModulo[c.moduloId].push(c);
  });
  const colas = Object.values(porModulo);
  const resultado = [];
  let lastModulo = null;
  while (colas.some((q) => q.length)) {
    let candidatas = colas.filter((q) => q.length && (q[0].moduloId !== lastModulo || colas.every((qq) => qq[0]?.moduloId === lastModulo)));
    if (!candidatas.length) candidatas = colas.filter((q) => q.length);
    const q = candidatas[Math.floor(Math.random() * candidatas.length)];
    const item = q.shift();
    resultado.push(item);
    lastModulo = item.moduloId;
  }
  return resultado;
}

function promptFeynmanDeHoy() {
  const disponibles = modulosDesbloqueados();
  if (!disponibles.length) return null;
  const dia = diaActual();
  const mod = disponibles[(dia - 1) % disponibles.length];
  return mod;
}

function registrarRevision(correcta) {
  const hoy = todayStr();
  if (!state.log[hoy]) state.log[hoy] = { revisadas: 0, correctas: 0, feynman: false };
  state.log[hoy].revisadas += 1;
  if (correcta) state.log[hoy].correctas += 1;
  save();
}

function registrarFeynman(moduloId, texto) {
  const hoy = todayStr();
  state.feynman[moduloId] = state.feynman[moduloId] || [];
  state.feynman[moduloId].push({ fecha: hoy, texto });
  if (!state.log[hoy]) state.log[hoy] = { revisadas: 0, correctas: 0, feynman: false };
  state.log[hoy].feynman = true;
  save();
}

// ---------- Métricas ----------
function calcularRacha() {
  let racha = 0;
  for (let i = 0; i < TOTAL_DIAS; i++) {
    const fecha = todayStr(-i);
    const registro = state.log[fecha];
    if (registro && (registro.revisadas > 0 || registro.feynman)) {
      racha += 1;
    } else if (i === 0) {
      continue; // hoy aún puede no tener actividad
    } else {
      break;
    }
  }
  return racha;
}

function calcularRetencion() {
  let rev = 0;
  let ok = 0;
  Object.values(state.log).forEach((r) => {
    rev += r.revisadas;
    ok += r.correctas;
  });
  return rev ? Math.round((ok / rev) * 100) : 0;
}

function tarjetasMaduras() {
  return Object.values(state.cards).filter((c) => c.interval >= 21).length;
}

function totalTarjetas() {
  return Object.keys(state.cards).length;
}
