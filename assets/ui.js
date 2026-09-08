let sesionHoy = [];
let indiceSesion = 0;
let correctasSesion = 0;

document.addEventListener("DOMContentLoaded", () => {
  load();
  document.querySelectorAll("nav.tabs button").forEach((btn) => {
    btn.addEventListener("click", () => cambiarVista(btn.dataset.vista));
  });
  render();
});

function cambiarVista(vista) {
  document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.toggle("activo", b.dataset.vista === vista));
  document.querySelectorAll(".vista").forEach((v) => v.classList.toggle("activa", v.id === `vista-${vista}`));
  if (vista === "recall") iniciarSesion();
  if (vista === "feynman") renderFeynman();
  if (vista === "plan") renderPlan();
  if (vista === "dashboard") renderDashboard();
}

function render() {
  renderDashboard();
  renderPlan();
  renderFeynman();
  iniciarSesion();
}

// ---------- Dashboard ----------
function renderDashboard() {
  const dia = diaActual();
  const semana = semanaActual();
  const pct = Math.round((dia / TOTAL_DIAS) * 100);
  document.getElementById("stat-dia").textContent = `${dia} / ${TOTAL_DIAS}`;
  document.getElementById("stat-semana").textContent = semana;
  document.getElementById("stat-racha").textContent = calcularRacha();
  document.getElementById("stat-retencion").textContent = `${calcularRetencion()}%`;
  document.getElementById("barra-dias").style.width = `${pct}%`;
  document.getElementById("resumen-tarjetas").textContent =
    `${tarjetasMaduras()} de ${totalTarjetas()} conceptos consolidados (repaso ≥ 21 días)`;

  const hoy = tarjetasParaHoy(9999).length;
  const modHoy = promptFeynmanDeHoy();
  document.getElementById("resumen-hoy").innerHTML = `
    <p><strong>${hoy}</strong> tarjetas listas para repasar hoy (recuerdo activo intercalado).</p>
    <p>Feynman de hoy: <strong>${modHoy ? modHoy.nombre : "aún no hay módulo desbloqueado"}</strong></p>
  `;
}

// ---------- Plan semanal ----------
function renderPlan() {
  const semana = semanaActual();
  const cuerpo = document.getElementById("cuerpo-plan");
  cuerpo.innerHTML = "";
  TEMARIO.forEach((mod) => {
    const tr = document.createElement("tr");
    if (mod.semanaFoco === semana) tr.classList.add("semana-actual");
    tr.innerHTML = `
      <td><span class="badge-modulo">Semana ${mod.semanaFoco}</span></td>
      <td>${mod.nombre}</td>
      <td>${mod.conceptos.length} conceptos + 1 reto Feynman</td>
      <td>${mod.semanaFoco <= semana ? "🔓 activo (se intercala)" : "🔒 aún no inicia"}</td>
    `;
    cuerpo.appendChild(tr);
  });
}

// ---------- Recuerdo activo ----------
function iniciarSesion() {
  sesionHoy = tarjetasParaHoy(18);
  indiceSesion = 0;
  correctasSesion = 0;
  mostrarTarjetaActual();
}

function mostrarTarjetaActual() {
  const cont = document.getElementById("contenedor-flash");
  const progreso = document.getElementById("progreso-sesion");
  if (indiceSesion >= sesionHoy.length) {
    cont.innerHTML = `<div class="sin-tarjetas">
      <p>🎉 Terminaste el repaso de hoy (${sesionHoy.length} tarjetas, intercaladas entre varios módulos).</p>
      <p>Vuelve mañana para el siguiente repaso o revisa el reto Feynman del día.</p>
    </div>`;
    progreso.textContent = "";
    return;
  }
  const item = sesionHoy[indiceSesion];
  progreso.textContent = `Tarjeta ${indiceSesion + 1} de ${sesionHoy.length} · Módulo: ${item.moduloNombre}`;
  cont.innerHTML = `
    <div class="flash" id="flash">
      <div class="cara-a">${item.q}</div>
      <div class="cara-b">${item.a}</div>
    </div>
    <div class="botones-grado" id="botones-grado">
      <button class="btn-otra-vez" data-g="0">Otra vez</button>
      <button class="btn-dificil" data-g="3">Difícil</button>
      <button class="btn-bien" data-g="4">Bien</button>
      <button class="btn-facil" data-g="5">Fácil</button>
    </div>
  `;
  document.getElementById("flash").addEventListener("click", () => {
    document.getElementById("flash").classList.add("volteada");
    document.getElementById("botones-grado").classList.add("visible");
  });
  document.querySelectorAll("#botones-grado button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const grado = Number(btn.dataset.g);
      const card = state.cards[item.id];
      aplicarSM2(card, grado);
      registrarRevision(grado >= 4);
      save();
      indiceSesion += 1;
      mostrarTarjetaActual();
      renderDashboard();
    });
  });
}

// ---------- Feynman ----------
function renderFeynman() {
  const mod = promptFeynmanDeHoy();
  const cont = document.getElementById("panel-feynman");
  if (!mod) {
    cont.innerHTML = `<p>Aún no hay módulos desbloqueados para el reto Feynman.</p>`;
    return;
  }
  const historial = state.feynman[mod.id] || [];
  cont.innerHTML = `
    <span class="pill">Módulo ${mod.id} · Semana foco ${mod.semanaFoco}</span>
    <h2>${mod.nombre}</h2>
    <p><strong>Reto de hoy:</strong> ${mod.feynman}</p>
    <p class="fuentes"><strong>Fuentes para verificar antes de explicar:</strong>
      <ul>${mod.fuentes.map((f) => `<li>${f}</li>`).join("")}</ul>
    </p>
    <textarea id="texto-feynman" placeholder="Escribe aquí tu explicación en lenguaje simple, como si le hablaras a alguien sin formación contable..."></textarea>
    <div class="checklist">
      <label><input type="checkbox" id="chk1"> Usé palabras simples, sin jerga técnica innecesaria.</label>
      <label><input type="checkbox" id="chk2"> Incluí un ejemplo concreto (no solo la definición).</label>
      <label><input type="checkbox" id="chk3"> Identifiqué qué parte no pude explicar bien (esa es tu laguna real).</label>
      <label><input type="checkbox" id="chk4"> Verifiqué en la fuente oficial cualquier cifra o vigencia mencionada.</label>
    </div>
    <button class="principal" id="guardar-feynman">Guardar explicación de hoy</button>
    <h3 style="margin-top:26px;">Historial de este módulo (${historial.length})</h3>
    ${historial.length ? historial.map((h) => `<div class="card-panel" style="margin-bottom:10px;"><strong>${h.fecha}</strong><p>${h.texto}</p></div>`).join("") : "<p>Todavía no tienes explicaciones guardadas para este módulo.</p>"}
  `;
  document.getElementById("guardar-feynman").addEventListener("click", () => {
    const texto = document.getElementById("texto-feynman").value.trim();
    if (!texto) return;
    registrarFeynman(mod.id, texto);
    renderFeynman();
    renderDashboard();
  });
}
