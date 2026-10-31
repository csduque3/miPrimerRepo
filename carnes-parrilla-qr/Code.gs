/**
 * Carnes Parrilla · Pedidos por QR
 * Backend en Google Apps Script. El script debe estar VINCULADO
 * (contenedor) a un Google Sheet: Extensiones > Apps Script desde la
 * hoja de cálculo. Ese mismo Sheet es la base de datos.
 *
 * Ver README.md para los pasos de publicación.
 */

var HOJAS = {
  MENU: 'MENU',
  OPCIONES: 'OPCIONES',
  MESAS: 'MESAS',
  PEDIDOS: 'PEDIDOS',
  DETALLE: 'DETALLE',
  LLAMADOS: 'LLAMADOS',
  USUARIOS: 'USUARIOS',
  CONFIG: 'CONFIG'
};

var ENCABEZADOS = {
  MENU: ['id', 'categoria', 'nombre', 'descripcion', 'precio', 'urlImagen', 'disponible', 'orden'],
  OPCIONES: ['idProducto', 'grupo', 'opcion', 'tipo', 'obligatorio'],
  MESAS: ['numero', 'codigo', 'mesero', 'estado', 'horaApertura'],
  PEDIDOS: ['idPedido', 'mesa', 'codigo', 'cliente', 'horaEnvio', 'tomadoPor', 'estado'],
  DETALLE: ['idPedido', 'producto', 'cantidad', 'opciones', 'precioUnitario', 'subtotal'],
  LLAMADOS: ['mesa', 'tipo', 'hora', 'atendido'],
  USUARIOS: ['nombre', 'rol', 'pin'],
  CONFIG: ['clave', 'valor']
};

// ---------------------------------------------------------------------------
// Punto de entrada de la aplicación web
// ---------------------------------------------------------------------------

function doGet(e) {
  if (!licenciaActiva_()) {
    return HtmlService.createHtmlOutput(paginaLicenciaSuspendida_())
      .setTitle('Carnes Parrilla')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Carnes Parrilla')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------------------------------------------------------------------------
// Licencia / control de pago mensual
//
// Esto es para TI, el proveedor del servicio, no para el restaurante: se
// guarda en las "Propiedades del script" (Project Settings), que el
// administrador del restaurante NUNCA ve ni puede tocar desde la app ni
// desde el Sheet. Solo tú, abriendo este editor de Apps Script, puedes
// cambiarlo. Úsalo así cada mes:
//
//   1. El restaurante te paga la mensualidad.
//   2. Abres el proyecto de Apps Script de ESE restaurante.
//   3. En el menú de funciones (arriba, junto a "Ejecutar") eliges
//      "renovarLicenciaUnMes" y pulsas Ejecutar.
//
// Si no pagan, simplemente no renuevas: a los 30 días la licencia vence
// sola y la app muestra el aviso de servicio suspendido. También puedes
// suspenderla de inmediato con "suspenderLicencia".
// ---------------------------------------------------------------------------

function licenciaActiva_() {
  var props = PropertiesService.getScriptProperties();
  var activa = props.getProperty('LICENCIA_ACTIVA');
  if (activa === null) {
    // Primera vez que corre el script: se activa sola por 30 días para
    // que puedas hacer la demo/implementación sin bloquearte a ti mismo.
    renovarLicenciaUnMes();
    return true;
  }
  if (activa !== 'si') return false;

  var vencimiento = props.getProperty('LICENCIA_VENCE');
  if (vencimiento) {
    var hoy = new Date();
    var fechaVencimiento = new Date(vencimiento);
    if (hoy.getTime() > fechaVencimiento.getTime()) return false;
  }
  return true;
}

/** Ejecuta esta función (desde el editor) cuando el restaurante pague su mensualidad. */
function renovarLicenciaUnMes() {
  var props = PropertiesService.getScriptProperties();
  var vencimiento = new Date();
  vencimiento.setDate(vencimiento.getDate() + 30);
  props.setProperty('LICENCIA_ACTIVA', 'si');
  props.setProperty('LICENCIA_VENCE', vencimiento.toISOString());
  Logger.log('Licencia activa hasta: ' + vencimiento.toDateString());
}

/** Ejecuta esta función para cortar el acceso de inmediato (no pagó / baja del servicio). */
function suspenderLicencia() {
  PropertiesService.getScriptProperties().setProperty('LICENCIA_ACTIVA', 'no');
  Logger.log('Licencia suspendida. La app ahora muestra el aviso de servicio suspendido.');
}

/** Activa la licencia sin fecha de vencimiento (para casos especiales, úsalo con cuidado). */
function activarLicenciaSinVencimiento() {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('LICENCIA_ACTIVA', 'si');
  props.deleteProperty('LICENCIA_VENCE');
  Logger.log('Licencia activa sin fecha de vencimiento.');
}

function paginaLicenciaSuspendida_() {
  return '<!doctype html><html><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<style>body{font-family:Arial,sans-serif;background:#F4EBDD;color:#2B2523;' +
    'display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:20px;' +
    'text-align:center;}div{background:#fff;border-radius:16px;padding:30px;max-width:380px;' +
    'box-shadow:0 2px 10px rgba(43,37,35,.15);border:3px solid #D9772B;}' +
    'h1{color:#7A1E24;font-size:20px;}</style></head><body>' +
    '<div><h1>Servicio temporalmente suspendido</h1>' +
    '<p>Este restaurante tiene el servicio de pedidos por QR suspendido. ' +
    'Contacta a tu proveedor del servicio para reactivarlo.</p></div>' +
    '</body></html>';
}

// ---------------------------------------------------------------------------
// Utilidades de hoja de cálculo
// ---------------------------------------------------------------------------

function obtenerHoja_(nombre) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    throw new Error('Falta la hoja "' + nombre + '". Ejecuta la función crearBaseDatos() una vez desde el editor de Apps Script.');
  }
  return hoja;
}

function conBloqueo_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function leerFilas_(nombreHoja) {
  var hoja = obtenerHoja_(nombreHoja);
  var rango = hoja.getDataRange().getValues();
  var encabezados = rango.shift();
  var filas = [];
  for (var i = 0; i < rango.length; i++) {
    var fila = rango[i];
    var vacia = fila.every(function (c) { return c === '' || c === null; });
    if (vacia) continue;
    var obj = {};
    for (var j = 0; j < encabezados.length; j++) {
      obj[encabezados[j]] = fila[j];
    }
    obj._fila = i + 2; // +1 por encabezado, +1 porque las hojas inician en 1
    filas.push(obj);
  }
  return filas;
}

function agregarFila_(nombreHoja, objeto) {
  var hoja = obtenerHoja_(nombreHoja);
  var encabezados = ENCABEZADOS[nombreHoja];
  var fila = encabezados.map(function (h) {
    return objeto[h] !== undefined ? objeto[h] : '';
  });
  hoja.appendRow(fila);
  return hoja.getLastRow();
}

function actualizarFila_(nombreHoja, numeroFila, cambios) {
  var hoja = obtenerHoja_(nombreHoja);
  var encabezados = ENCABEZADOS[nombreHoja];
  for (var j = 0; j < encabezados.length; j++) {
    var h = encabezados[j];
    if (cambios[h] !== undefined) {
      hoja.getRange(numeroFila, j + 1).setValue(cambios[h]);
    }
  }
}

function esSi_(valor) {
  return String(valor || '').trim().toLowerCase().indexOf('s') === 0;
}

// ---------------------------------------------------------------------------
// Configuración del restaurante
// ---------------------------------------------------------------------------

function obtenerConfig() {
  var filas = leerFilas_(HOJAS.CONFIG);
  var cfg = {};
  filas.forEach(function (f) { cfg[f.clave] = f.valor; });
  return {
    nombreRestaurante: cfg.nombreRestaurante || 'Carnes Parrilla',
    impuestoConsumo: Number(cfg.impuestoConsumo || 0.08),
    propinaSugerida: Number(cfg.propinaSugerida || 0.10),
    mediosPago: String(cfg.mediosPago || 'Efectivo,Datáfono,Nequi,Daviplata,QR Bre-B,Transferencia')
      .split(',').map(function (s) { return s.trim(); }).filter(Boolean)
  };
}

function guardarConfig(cfg) {
  return conBloqueo_(function () {
    var hoja = obtenerHoja_(HOJAS.CONFIG);
    var filas = leerFilas_(HOJAS.CONFIG);
    var mapa = {};
    filas.forEach(function (f) { mapa[f.clave] = f._fila; });
    Object.keys(cfg).forEach(function (clave) {
      var valor = cfg[clave];
      if (Array.isArray(valor)) valor = valor.join(',');
      if (mapa[clave]) {
        hoja.getRange(mapa[clave], 2).setValue(valor);
      } else {
        hoja.appendRow([clave, valor]);
      }
    });
    return obtenerConfig();
  });
}

// ---------------------------------------------------------------------------
// Menú y opciones
// ---------------------------------------------------------------------------

function obtenerMenu() {
  return leerFilas_(HOJAS.MENU)
    .filter(function (f) { return esSi_(f.disponible); })
    .sort(function (a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); })
    .map(function (f) {
      return {
        id: f.id,
        categoria: f.categoria,
        nombre: f.nombre,
        descripcion: f.descripcion,
        precio: Number(f.precio) || 0,
        urlImagen: f.urlImagen,
        orden: Number(f.orden) || 0
      };
    });
}

function obtenerOpcionesProducto(idProducto) {
  var filas = leerFilas_(HOJAS.OPCIONES).filter(function (f) {
    return String(f.idProducto) === String(idProducto);
  });
  var grupos = {};
  var orden = [];
  filas.forEach(function (f) {
    if (!grupos[f.grupo]) {
      grupos[f.grupo] = { grupo: f.grupo, tipo: f.tipo, obligatorio: esSi_(f.obligatorio), opciones: [] };
      orden.push(f.grupo);
    }
    grupos[f.grupo].opciones.push(f.opcion);
  });
  return orden.map(function (g) { return grupos[g]; });
}

// ---------------------------------------------------------------------------
// Mesas y códigos
// ---------------------------------------------------------------------------

function obtenerTodasLasMesas() {
  return leerFilas_(HOJAS.MESAS).sort(function (a, b) { return Number(a.numero) - Number(b.numero); });
}

function validarCodigoMesa(numeroMesa, codigo) {
  var mesa = leerFilas_(HOJAS.MESAS).find(function (f) {
    return String(f.numero) === String(numeroMesa) && String(f.codigo) === String(codigo);
  });
  if (!mesa) throw new Error('Código de mesa incorrecto.');
  if (String(mesa.estado).toLowerCase() === 'libre') {
    throw new Error('Esta mesa aún no está abierta. Pide a tu mesero que la active.');
  }
  return { numero: mesa.numero, estado: mesa.estado, mesero: mesa.mesero };
}

function generarCodigoMesa(numeroMesa, nombreMesero) {
  return conBloqueo_(function () {
    var filas = leerFilas_(HOJAS.MESAS);
    var enUso = {};
    filas.forEach(function (f) {
      if (String(f.estado).toLowerCase() !== 'libre') enUso[String(f.codigo)] = true;
    });
    var codigo;
    do {
      codigo = String(Math.floor(1000 + Math.random() * 9000));
    } while (enUso[codigo]);

    var mesa = filas.find(function (f) { return String(f.numero) === String(numeroMesa); });
    if (!mesa) {
      agregarFila_(HOJAS.MESAS, { numero: numeroMesa, codigo: codigo, mesero: nombreMesero, estado: 'ocupada', horaApertura: new Date() });
    } else {
      if (String(mesa.estado).toLowerCase() !== 'libre') {
        throw new Error('Esa mesa ya está ocupada.');
      }
      actualizarFila_(HOJAS.MESAS, mesa._fila, { codigo: codigo, mesero: nombreMesero, estado: 'ocupada', horaApertura: new Date() });
    }
    return { numero: numeroMesa, codigo: codigo };
  });
}

function cerrarMesa(numeroMesa) {
  return conBloqueo_(function () {
    var mesa = leerFilas_(HOJAS.MESAS).find(function (f) { return String(f.numero) === String(numeroMesa); });
    if (!mesa) throw new Error('Mesa no encontrada.');
    actualizarFila_(HOJAS.MESAS, mesa._fila, { estado: 'libre', codigo: '', mesero: '' });
    return true;
  });
}

function solicitarCuentaMesa(numeroMesa) {
  return conBloqueo_(function () {
    var mesa = leerFilas_(HOJAS.MESAS).find(function (f) { return String(f.numero) === String(numeroMesa); });
    if (!mesa) throw new Error('Mesa no encontrada.');
    actualizarFila_(HOJAS.MESAS, mesa._fila, { estado: 'cuenta solicitada' });
    agregarFila_(HOJAS.LLAMADOS, { mesa: numeroMesa, tipo: 'pedir cuenta', hora: new Date(), atendido: 'no' });
    return true;
  });
}

function obtenerMesasDeMesero_(nombreMesero) {
  return leerFilas_(HOJAS.MESAS).filter(function (f) {
    return String(f.mesero) === String(nombreMesero) && String(f.estado).toLowerCase() !== 'libre';
  });
}

// ---------------------------------------------------------------------------
// Pedidos y detalle
// ---------------------------------------------------------------------------

function construirPedidosConDetalle_(pedidos) {
  var detalle = leerFilas_(HOJAS.DETALLE);
  return pedidos.map(function (p) {
    return {
      idPedido: p.idPedido,
      mesa: p.mesa,
      cliente: p.cliente,
      estado: p.estado,
      horaEnvio: p.horaEnvio,
      tomadoPor: p.tomadoPor,
      items: detalle.filter(function (d) { return d.idPedido === p.idPedido; }).map(function (d) {
        return {
          producto: d.producto,
          cantidad: Number(d.cantidad) || 0,
          opciones: d.opciones,
          precioUnitario: Number(d.precioUnitario) || 0,
          subtotal: Number(d.subtotal) || 0
        };
      })
    };
  });
}

/**
 * items: [{ nombre, cantidad, opciones: [texto], precioUnitario }]
 */
function crearPedido(mesa, codigo, cliente, tomadoPor, items) {
  if (!cliente) throw new Error('Falta el nombre del cliente.');
  if (!items || !items.length) throw new Error('El pedido está vacío.');
  return conBloqueo_(function () {
    validarCodigoMesa(mesa, codigo);
    var idPedido = Utilities.getUuid();
    agregarFila_(HOJAS.PEDIDOS, {
      idPedido: idPedido, mesa: mesa, codigo: codigo, cliente: cliente,
      horaEnvio: new Date(), tomadoPor: tomadoPor, estado: 'enviado'
    });
    items.forEach(function (it) {
      agregarFila_(HOJAS.DETALLE, {
        idPedido: idPedido,
        producto: it.nombre,
        cantidad: it.cantidad,
        opciones: (it.opciones || []).join(' | '),
        precioUnitario: it.precioUnitario,
        subtotal: Math.round(it.cantidad * it.precioUnitario * 100) / 100
      });
    });
    return idPedido;
  });
}

function obtenerPedidosMesa(mesa, codigo) {
  validarCodigoMesa(mesa, codigo);
  var pedidos = leerFilas_(HOJAS.PEDIDOS).filter(function (p) {
    return String(p.mesa) === String(mesa) && String(p.estado) !== 'anulado';
  });
  return construirPedidosConDetalle_(pedidos);
}

function anularPedido(idPedido) {
  return conBloqueo_(function () {
    var p = leerFilas_(HOJAS.PEDIDOS).find(function (f) { return f.idPedido === idPedido; });
    if (!p) throw new Error('Pedido no encontrado.');
    actualizarFila_(HOJAS.PEDIDOS, p._fila, { estado: 'anulado' });
    return true;
  });
}

// ---------------------------------------------------------------------------
// Cocina
// ---------------------------------------------------------------------------

function obtenerComandasCocina() {
  var pedidos = leerFilas_(HOJAS.PEDIDOS).filter(function (p) { return String(p.estado) === 'enviado'; });
  return construirPedidosConDetalle_(pedidos).sort(function (a, b) {
    return new Date(a.horaEnvio) - new Date(b.horaEnvio);
  });
}

function marcarPedidoListo(idPedido) {
  return conBloqueo_(function () {
    var p = leerFilas_(HOJAS.PEDIDOS).find(function (f) { return f.idPedido === idPedido; });
    if (!p) throw new Error('Pedido no encontrado.');
    actualizarFila_(HOJAS.PEDIDOS, p._fila, { estado: 'listo' });
    agregarFila_(HOJAS.LLAMADOS, { mesa: p.mesa, tipo: 'pedido listo', hora: new Date(), atendido: 'no' });
    return true;
  });
}

// ---------------------------------------------------------------------------
// Llamados (mesero, cuenta, pedido listo)
// ---------------------------------------------------------------------------

function registrarLlamado(mesa, tipo) {
  return conBloqueo_(function () {
    agregarFila_(HOJAS.LLAMADOS, { mesa: mesa, tipo: tipo, hora: new Date(), atendido: 'no' });
    return true;
  });
}

function obtenerLlamadosMesero_(nombreMesero) {
  var mesasMesero = {};
  obtenerMesasDeMesero_(nombreMesero).forEach(function (m) { mesasMesero[String(m.numero)] = true; });
  return leerFilas_(HOJAS.LLAMADOS).filter(function (l) {
    return mesasMesero[String(l.mesa)] && !esSi_(l.atendido);
  });
}

function atenderLlamado(numeroFila) {
  return conBloqueo_(function () {
    actualizarFila_(HOJAS.LLAMADOS, numeroFila, { atendido: 'si' });
    return true;
  });
}

// ---------------------------------------------------------------------------
// Sondeos agrupados (uno por pantalla, cada 5 segundos)
// ---------------------------------------------------------------------------

function sondeoCliente(mesa, codigo) {
  return {
    mesa: validarCodigoMesa(mesa, codigo),
    pedidos: obtenerPedidosMesa(mesa, codigo)
  };
}

function sondeoMesero(nombreMesero) {
  return {
    mesas: obtenerMesasDeMesero_(nombreMesero),
    llamados: obtenerLlamadosMesero_(nombreMesero)
  };
}

function sondeoCocina() {
  return obtenerComandasCocina();
}

// ---------------------------------------------------------------------------
// Cuenta
// ---------------------------------------------------------------------------

function obtenerCuenta(mesa, codigo) {
  validarCodigoMesa(mesa, codigo);
  return construirCuenta_(mesa);
}

/** Variante para el mesero: no exige el código de la mesa, solo el número. */
function obtenerCuentaMesero(mesa) {
  return construirCuenta_(mesa);
}

function construirCuenta_(mesa) {
  var cfg = obtenerConfig();
  var pedidos = construirPedidosConDetalle_(leerFilas_(HOJAS.PEDIDOS).filter(function (p) {
    return String(p.mesa) === String(mesa) && String(p.estado) !== 'anulado';
  }));

  var porPersona = {};
  var orden = [];
  pedidos.forEach(function (p) {
    if (!porPersona[p.cliente]) {
      porPersona[p.cliente] = { cliente: p.cliente, items: [], subtotal: 0 };
      orden.push(p.cliente);
    }
    p.items.forEach(function (it) {
      porPersona[p.cliente].items.push(it);
      porPersona[p.cliente].subtotal += it.subtotal;
    });
  });

  var personas = orden.map(function (c) { return porPersona[c]; });
  var totalConImpuesto = personas.reduce(function (s, p) { return s + p.subtotal; }, 0);
  var subtotalSinImpuesto = totalConImpuesto / (1 + cfg.impuestoConsumo);
  var impuesto = totalConImpuesto - subtotalSinImpuesto;

  return {
    restaurante: cfg.nombreRestaurante,
    mesa: mesa,
    personas: personas,
    subtotalSinImpuesto: Math.round(subtotalSinImpuesto * 100) / 100,
    impuesto: Math.round(impuesto * 100) / 100,
    impuestoPorcentaje: cfg.impuestoConsumo,
    totalSinPropina: Math.round(totalConImpuesto * 100) / 100,
    propinaSugeridaPorcentaje: cfg.propinaSugerida,
    mediosPago: cfg.mediosPago
  };
}

// ---------------------------------------------------------------------------
// Inicio de sesión por PIN (mesero, cocina, administrador)
// ---------------------------------------------------------------------------

function iniciarSesionPIN(pin) {
  var usuario = leerFilas_(HOJAS.USUARIOS).find(function (u) { return String(u.pin) === String(pin); });
  if (!usuario) throw new Error('PIN incorrecto.');
  return { nombre: usuario.nombre, rol: String(usuario.rol).toLowerCase() };
}

// ---------------------------------------------------------------------------
// Administración
// ---------------------------------------------------------------------------

function obtenerProductosAdmin() {
  return leerFilas_(HOJAS.MENU).sort(function (a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); });
}

function guardarProducto(producto) {
  return conBloqueo_(function () {
    var filas = leerFilas_(HOJAS.MENU);
    var existente = producto.id ? filas.find(function (f) { return String(f.id) === String(producto.id); }) : null;
    if (existente) {
      actualizarFila_(HOJAS.MENU, existente._fila, producto);
    } else {
      producto.id = 'P' + new Date().getTime();
      agregarFila_(HOJAS.MENU, producto);
    }
    return producto.id;
  });
}

function eliminarProducto(id) {
  return conBloqueo_(function () {
    var hoja = obtenerHoja_(HOJAS.MENU);
    var fila = leerFilas_(HOJAS.MENU).find(function (f) { return String(f.id) === String(id); });
    if (fila) hoja.deleteRow(fila._fila);
    // también borra sus opciones
    var hojaOp = obtenerHoja_(HOJAS.OPCIONES);
    leerFilas_(HOJAS.OPCIONES)
      .filter(function (f) { return String(f.idProducto) === String(id); })
      .sort(function (a, b) { return b._fila - a._fila; })
      .forEach(function (f) { hojaOp.deleteRow(f._fila); });
    return true;
  });
}

function obtenerOpcionesAdmin(idProducto) {
  return obtenerOpcionesProducto(idProducto);
}

/** grupos: [{ grupo, tipo, obligatorio: boolean, opciones: [texto] }] */
function guardarOpcionesProducto(idProducto, grupos) {
  return conBloqueo_(function () {
    var hoja = obtenerHoja_(HOJAS.OPCIONES);
    leerFilas_(HOJAS.OPCIONES)
      .filter(function (f) { return String(f.idProducto) === String(idProducto); })
      .sort(function (a, b) { return b._fila - a._fila; })
      .forEach(function (f) { hoja.deleteRow(f._fila); });
    grupos.forEach(function (g) {
      (g.opciones || []).forEach(function (op) {
        if (!String(op).trim()) return;
        agregarFila_(HOJAS.OPCIONES, {
          idProducto: idProducto, grupo: g.grupo, opcion: op,
          tipo: g.tipo, obligatorio: g.obligatorio ? 'si' : 'no'
        });
      });
    });
    return true;
  });
}

function obtenerUsuarios() {
  return leerFilas_(HOJAS.USUARIOS);
}

function guardarUsuario(usuario) {
  return conBloqueo_(function () {
    var existente = leerFilas_(HOJAS.USUARIOS).find(function (f) { return f.nombre === usuario.nombre; });
    if (existente) {
      actualizarFila_(HOJAS.USUARIOS, existente._fila, usuario);
    } else {
      agregarFila_(HOJAS.USUARIOS, usuario);
    }
    return true;
  });
}

function eliminarUsuario(nombre) {
  return conBloqueo_(function () {
    var hoja = obtenerHoja_(HOJAS.USUARIOS);
    var fila = leerFilas_(HOJAS.USUARIOS).find(function (f) { return f.nombre === nombre; });
    if (fila) hoja.deleteRow(fila._fila);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Creación de la base de datos (ejecutar UNA VEZ desde el editor)
// ---------------------------------------------------------------------------

function crearHojaConEncabezados_(ss, nombre, encabezados) {
  var hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
  }
  hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, encabezados.length).setFontWeight('bold').setBackground('#7A1E24').setFontColor('#FFFFFF');
  return hoja;
}

/**
 * Crea (o completa) todas las hojas necesarias en la hoja de cálculo
 * activa y la llena con datos de ejemplo si están vacías.
 * Ejecútala una sola vez desde el editor de Apps Script
 * (selecciona "crearBaseDatos" y pulsa Ejecutar).
 */
function crearBaseDatos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(HOJAS).forEach(function (clave) {
    crearHojaConEncabezados_(ss, HOJAS[clave], ENCABEZADOS[clave]);
  });

  var menu = obtenerHoja_(HOJAS.MENU);
  if (menu.getLastRow() === 1) {
    menu.getRange(2, 1, 9, 8).setValues([
      ['P001', 'Entradas', 'Chicharrones de cerdo', 'Chicharrón crocante con limón y ají', 18000, '', 'si', 1],
      ['P002', 'Entradas', 'Patacones con hogao', 'Patacón verde con hogao criollo', 15000, '', 'si', 2],
      ['P003', 'Carnes', 'Punta de anca', 'Punta de anca a la parrilla, 350 g', 42000, '', 'si', 3],
      ['P004', 'Carnes', 'Churrasco', 'Corte de res a la parrilla, 300 g', 48000, '', 'si', 4],
      ['P005', 'Carnes', 'Chuleta de cerdo', 'Chuleta de cerdo a la parrilla, 300 g', 36000, '', 'si', 5],
      ['P006', 'Acompañamientos', 'Papa criolla', 'Papa criolla salteada con cebolla', 9000, '', 'si', 6],
      ['P007', 'Acompañamientos', 'Arepa de choclo', 'Arepa de choclo con queso', 8000, '', 'si', 7],
      ['P008', 'Bebidas', 'Limonada de coco', 'Limonada natural de coco', 9000, '', 'si', 8],
      ['P009', 'Postres', 'Flan de café', 'Flan casero de café', 10000, '', 'si', 9]
    ]);
  }

  var opciones = obtenerHoja_(HOJAS.OPCIONES);
  if (opciones.getLastRow() === 1) {
    opciones.getRange(2, 1, 8, 5).setValues([
      ['P003', 'Término de la carne', 'Al punto', 'una sola', 'si'],
      ['P003', 'Término de la carne', 'Tres cuartos', 'una sola', 'si'],
      ['P003', 'Término de la carne', 'Bien asada', 'una sola', 'si'],
      ['P004', 'Término de la carne', 'Al punto', 'una sola', 'si'],
      ['P004', 'Término de la carne', 'Tres cuartos', 'una sola', 'si'],
      ['P004', 'Término de la carne', 'Bien asada', 'una sola', 'si'],
      ['P001', 'Quitar ingredientes', 'Sin limón', 'varias', 'no'],
      ['P002', 'Quitar ingredientes', 'Sin hogao', 'varias', 'no']
    ]);
  }

  var mesas = obtenerHoja_(HOJAS.MESAS);
  if (mesas.getLastRow() === 1) {
    var filasMesas = [];
    for (var i = 1; i <= 10; i++) filasMesas.push([i, '', '', 'libre', '']);
    mesas.getRange(2, 1, filasMesas.length, 5).setValues(filasMesas);
  }

  var usuarios = obtenerHoja_(HOJAS.USUARIOS);
  if (usuarios.getLastRow() === 1) {
    usuarios.getRange(2, 1, 3, 3).setValues([
      ['Administrador', 'administrador', '1234'],
      ['Mesero Demo', 'mesero', '1111'],
      ['Cocina Demo', 'cocina', '2222']
    ]);
  }

  var config = obtenerHoja_(HOJAS.CONFIG);
  if (config.getLastRow() === 1) {
    config.getRange(2, 1, 4, 2).setValues([
      ['nombreRestaurante', 'Carnes Parrilla'],
      ['impuestoConsumo', '0.08'],
      ['propinaSugerida', '0.10'],
      ['mediosPago', 'Efectivo,Datáfono,Nequi,Daviplata,QR Bre-B,Transferencia']
    ]);
  }

  ss.getSheets().forEach(function (hoja) { hoja.autoResizeColumns(1, hoja.getLastColumn()); });

  SpreadsheetApp.getUi().alert(
    'Base de datos lista. Usuarios de ejemplo -> Administrador: PIN 1234, Mesero Demo: PIN 1111, Cocina Demo: PIN 2222. Cámbialos antes de abrir al público.'
  );
}
