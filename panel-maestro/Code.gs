/**
 * Panel Maestro · Carnes Parrilla
 *
 * Esta es una app de Apps Script SEPARADA de la de cada restaurante.
 * Es solo para TI, el proveedor del servicio: aquí ves todos los
 * restaurantes que vendes, los activas/renuevas cuando pagan, y los
 * suspendes cuando no. Cada restaurante conectado consulta este Panel
 * para saber si su licencia está activa (ver conectarConPanelMaestro()
 * en el Code.gs de carnes-parrilla-qr/).
 *
 * Debe estar VINCULADA a su propio Google Sheet (uno nuevo, exclusivo
 * de este panel, no el de ningún restaurante). Ver README.md.
 */

var HOJA_CLIENTES = 'CLIENTES';
var ENCABEZADOS_CLIENTES = ['idCliente', 'nombreRestaurante', 'urlWebApp', 'idHojaCliente', 'estado', 'fechaVencimiento', 'notas'];

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------

function doGet(e) {
  // Endpoint JSON público: lo consulta automáticamente cada app de
  // restaurante para saber si su licencia sigue activa.
  if (e && e.parameter && e.parameter.accion === 'estado') {
    return responderEstadoCliente_(e.parameter.idCliente || '');
  }
  // En cualquier otro caso, se muestra el panel (pide PIN antes de mostrar nada).
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Panel Maestro · Carnes Parrilla')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

function responderEstadoCliente_(idCliente) {
  var activo = false;
  try {
    var cliente = leerFilasClientes_().find(function (c) { return String(c.idCliente) === String(idCliente); });
    if (cliente) {
      activo = String(cliente.estado).toLowerCase() === 'activo';
      if (activo && cliente.fechaVencimiento) {
        if (new Date().getTime() > new Date(cliente.fechaVencimiento).getTime()) activo = false;
      }
    }
  } catch (err) {
    activo = false;
  }
  return ContentService.createTextOutput(JSON.stringify({ activo: activo }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// Utilidades de hoja
// ---------------------------------------------------------------------------

function obtenerHojaClientes_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(HOJA_CLIENTES);
  if (!hoja) throw new Error('Falta la hoja "CLIENTES". Ejecuta crearPanelMaestro() desde el editor de Apps Script.');
  return hoja;
}

function leerFilasClientes_() {
  var hoja = obtenerHojaClientes_();
  var rango = hoja.getDataRange().getValues();
  var encabezados = rango.shift();
  var filas = [];
  for (var i = 0; i < rango.length; i++) {
    var fila = rango[i];
    if (fila.every(function (c) { return c === '' || c === null; })) continue;
    var obj = {};
    encabezados.forEach(function (h, j) { obj[h] = fila[j]; });
    obj._fila = i + 2;
    filas.push(obj);
  }
  return filas;
}

function conBloqueoMaestro_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function columna_(nombre) {
  return ENCABEZADOS_CLIENTES.indexOf(nombre) + 1;
}

// ---------------------------------------------------------------------------
// PIN del operador (tú). Guardado en las Propiedades del script de ESTE
// proyecto; no tiene nada que ver con los PIN de cada restaurante.
// ---------------------------------------------------------------------------

function verificarPinMaestro_(pin) {
  var props = PropertiesService.getScriptProperties();
  var guardado = props.getProperty('PIN_MAESTRO');
  if (!guardado) {
    // Primera vez que se usa el panel: el primer PIN que escribas (4+
    // dígitos) queda guardado como tu PIN de acceso.
    if (!pin || String(pin).length < 4) {
      throw new Error('Define un PIN de al menos 4 dígitos la primera vez que entres.');
    }
    props.setProperty('PIN_MAESTRO', String(pin));
    return;
  }
  if (String(pin) !== guardado) throw new Error('PIN incorrecto.');
}

function iniciarSesionMaestro(pin) {
  verificarPinMaestro_(pin);
  return true;
}

/** Por si necesitas cambiar tu PIN del panel; ejecútala desde el editor. */
function cambiarPinMaestro(nuevoPin) {
  if (!nuevoPin || String(nuevoPin).length < 4) throw new Error('El PIN debe tener al menos 4 dígitos.');
  PropertiesService.getScriptProperties().setProperty('PIN_MAESTRO', String(nuevoPin));
  Logger.log('PIN del Panel Maestro actualizado.');
}

// ---------------------------------------------------------------------------
// Gestión de restaurantes (clientes)
// ---------------------------------------------------------------------------

function obtenerClientes(pin) {
  verificarPinMaestro_(pin);
  return leerFilasClientes_().sort(function (a, b) {
    return String(a.nombreRestaurante).localeCompare(String(b.nombreRestaurante));
  });
}

/** datos: { nombreRestaurante, urlWebApp, idHojaCliente, notas } */
function crearCliente(pin, datos) {
  verificarPinMaestro_(pin);
  if (!datos || !datos.nombreRestaurante) throw new Error('Falta el nombre del restaurante.');
  return conBloqueoMaestro_(function () {
    var idCliente = 'C' + new Date().getTime();
    var vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + 30);
    obtenerHojaClientes_().appendRow([
      idCliente, datos.nombreRestaurante, datos.urlWebApp || '', datos.idHojaCliente || '',
      'activo', vencimiento.toISOString(), datos.notas || ''
    ]);
    return idCliente;
  });
}

function renovarCliente(pin, idCliente, dias) {
  verificarPinMaestro_(pin);
  return conBloqueoMaestro_(function () {
    var cliente = leerFilasClientes_().find(function (c) { return String(c.idCliente) === String(idCliente); });
    if (!cliente) throw new Error('Cliente no encontrado.');
    var vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + (Number(dias) || 30));
    var hoja = obtenerHojaClientes_();
    hoja.getRange(cliente._fila, columna_('estado')).setValue('activo');
    hoja.getRange(cliente._fila, columna_('fechaVencimiento')).setValue(vencimiento.toISOString());
    return true;
  });
}

function suspenderCliente(pin, idCliente) {
  verificarPinMaestro_(pin);
  return conBloqueoMaestro_(function () {
    var cliente = leerFilasClientes_().find(function (c) { return String(c.idCliente) === String(idCliente); });
    if (!cliente) throw new Error('Cliente no encontrado.');
    obtenerHojaClientes_().getRange(cliente._fila, columna_('estado')).setValue('suspendido');
    return true;
  });
}

function eliminarCliente(pin, idCliente) {
  verificarPinMaestro_(pin);
  return conBloqueoMaestro_(function () {
    var cliente = leerFilasClientes_().find(function (c) { return String(c.idCliente) === String(idCliente); });
    if (!cliente) throw new Error('Cliente no encontrado.');
    obtenerHojaClientes_().deleteRow(cliente._fila);
    return true;
  });
}

function actualizarNotasCliente(pin, idCliente, notas) {
  verificarPinMaestro_(pin);
  return conBloqueoMaestro_(function () {
    var cliente = leerFilasClientes_().find(function (c) { return String(c.idCliente) === String(idCliente); });
    if (!cliente) throw new Error('Cliente no encontrado.');
    obtenerHojaClientes_().getRange(cliente._fila, columna_('notas')).setValue(notas);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Creación de la hoja CLIENTES (ejecutar UNA VEZ desde el editor)
// ---------------------------------------------------------------------------

function crearPanelMaestro() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(HOJA_CLIENTES);
  if (!hoja) hoja = ss.insertSheet(HOJA_CLIENTES);
  hoja.getRange(1, 1, 1, ENCABEZADOS_CLIENTES.length).setValues([ENCABEZADOS_CLIENTES]);
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, ENCABEZADOS_CLIENTES.length).setFontWeight('bold').setBackground('#7A1E24').setFontColor('#FFFFFF');
  hoja.autoResizeColumns(1, ENCABEZADOS_CLIENTES.length);
  SpreadsheetApp.getUi().alert(
    'Panel Maestro listo. Ahora: 1) Implementar → Nueva implementación → Aplicación web → ' +
    'acceso "Cualquier persona" (así cada restaurante puede consultar su estado). 2) Copia la URL /exec. ' +
    '3) En cada restaurante, ejecuta conectarConPanelMaestro(urlDeEstePanel, idClienteQueCreesAqui).'
  );
}
