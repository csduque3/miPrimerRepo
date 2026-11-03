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
  TIPOS_MENU: 'TIPOS_MENU',
  MESAS: 'MESAS',
  PEDIDOS: 'PEDIDOS',
  DETALLE: 'DETALLE',
  LLAMADOS: 'LLAMADOS',
  USUARIOS: 'USUARIOS',
  CONFIG: 'CONFIG'
};

var ENCABEZADOS = {
  MENU: ['id', 'categoria', 'nombre', 'descripcion', 'precio', 'urlImagen', 'disponible', 'orden', 'tipoMenu'],
  OPCIONES: ['idProducto', 'grupo', 'opcion', 'tipo', 'obligatorio'],
  TIPOS_MENU: ['id', 'nombre', 'orden', 'activo'],
  MESAS: ['numero', 'codigo', 'mesero', 'estado', 'horaApertura'],
  PEDIDOS: ['idPedido', 'mesa', 'codigo', 'cliente', 'horaEnvio', 'tomadoPor', 'estado', 'mesero'],
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
  var urlPanel = props.getProperty('URL_PANEL_MAESTRO');
  var idCliente = props.getProperty('ID_CLIENTE');
  if (urlPanel && idCliente) {
    return licenciaActivaRemota_(props, urlPanel, idCliente);
  }
  return licenciaActivaLocal_(props);
}

function licenciaActivaLocal_(props) {
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

/**
 * Cuando este restaurante está dado de alta en el Panel Maestro (ver la
 * carpeta panel-maestro/), la licencia ya no se controla aquí: se le
 * pregunta al Panel Maestro. El resultado se cachea 1 hora para no
 * perder velocidad ni depender de la red en cada clic, y si el Panel
 * Maestro no responde se usa el último estado conocido (o "activo" si
 * nunca se pudo consultar) para no tumbar el restaurante por un
 * problema de red pasajero.
 */
function licenciaActivaRemota_(props, urlPanel, idCliente) {
  var CACHE_MS = 60 * 60 * 1000; // 1 hora
  var cache = props.getProperty('LICENCIA_CACHE');
  var cacheHora = Number(props.getProperty('LICENCIA_CACHE_HORA') || 0);
  var ahora = new Date().getTime();

  if (cache && (ahora - cacheHora) < CACHE_MS) {
    return cache === 'si';
  }
  try {
    var resp = UrlFetchApp.fetch(
      urlPanel + (urlPanel.indexOf('?') >= 0 ? '&' : '?') + 'accion=estado&idCliente=' + encodeURIComponent(idCliente),
      { muteHttpExceptions: true }
    );
    var datos = JSON.parse(resp.getContentText());
    var activo = !!datos.activo;
    props.setProperty('LICENCIA_CACHE', activo ? 'si' : 'no');
    props.setProperty('LICENCIA_CACHE_HORA', String(ahora));
    return activo;
  } catch (err) {
    return cache ? cache === 'si' : true;
  }
}

/**
 * Ejecuta esto UNA VEZ por restaurante, después de registrarlo en el
 * Panel Maestro, para que la licencia de este proyecto la controle el
 * Panel Maestro en vez del interruptor local de aquí abajo.
 * urlPanelMaestro: la URL /exec del Panel Maestro publicado.
 * idCliente: el id que te dio el Panel Maestro al crear este restaurante.
 */
function conectarConPanelMaestro(urlPanelMaestro, idCliente) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('URL_PANEL_MAESTRO', urlPanelMaestro);
  props.setProperty('ID_CLIENTE', idCliente);
  props.deleteProperty('LICENCIA_CACHE');
  props.deleteProperty('LICENCIA_CACHE_HORA');
  Logger.log('Conectado al Panel Maestro. idCliente=' + idCliente);
}

/** Si quieres volver al interruptor local (dejar de usar el Panel Maestro). */
function desconectarDePanelMaestro() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('URL_PANEL_MAESTRO');
  props.deleteProperty('ID_CLIENTE');
  props.deleteProperty('LICENCIA_CACHE');
  props.deleteProperty('LICENCIA_CACHE_HORA');
  Logger.log('Desconectado del Panel Maestro. Ahora se usa el interruptor local.');
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
    logoUrl: cfg.logoUrl || '',
    colorVino: cfg.colorVino || '#7A1E24',
    colorCarbon: cfg.colorCarbon || '#2B2523',
    colorCrema: cfg.colorCrema || '#F4EBDD',
    colorBrasa: cfg.colorBrasa || '#D9772B',
    colorDorado: cfg.colorDorado || '#C9A45C',
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

/**
 * idTipoMenu es opcional: si se pasa, solo se devuelven los productos de
 * ese tipo de menú (Desayuno, Almuerzo, Carta, etc.) más los que no
 * tienen tipo asignado (para que productos viejos sigan apareciendo).
 * Si se omite, se devuelve el menú completo sin filtrar.
 */
function obtenerMenu(idTipoMenu) {
  return leerFilas_(HOJAS.MENU)
    .filter(function (f) { return esSi_(f.disponible); })
    .filter(function (f) { return !idTipoMenu || !f.tipoMenu || String(f.tipoMenu) === String(idTipoMenu); })
    .sort(function (a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); })
    .map(function (f) {
      return {
        id: f.id,
        categoria: f.categoria,
        nombre: f.nombre,
        descripcion: f.descripcion,
        precio: Number(f.precio) || 0,
        urlImagen: f.urlImagen,
        orden: Number(f.orden) || 0,
        tipoMenu: f.tipoMenu || ''
      };
    });
}

// ---------------------------------------------------------------------------
// Tipos de menú (Desayuno, Almuerzo, Carta, Menú del día, etc.)
// ---------------------------------------------------------------------------

function obtenerTiposMenu() {
  return leerFilas_(HOJAS.TIPOS_MENU)
    .filter(function (f) { return esSi_(f.activo); })
    .sort(function (a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); })
    .map(function (f) { return { id: f.id, nombre: f.nombre, orden: Number(f.orden) || 0 }; });
}

function obtenerTiposMenuAdmin() {
  return leerFilas_(HOJAS.TIPOS_MENU).sort(function (a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); });
}

function guardarTipoMenu(tipo) {
  return conBloqueo_(function () {
    var filas = leerFilas_(HOJAS.TIPOS_MENU);
    var existente = tipo.id ? filas.find(function (f) { return String(f.id) === String(tipo.id); }) : null;
    if (existente) {
      actualizarFila_(HOJAS.TIPOS_MENU, existente._fila, tipo);
    } else {
      tipo.id = 'TM' + new Date().getTime();
      agregarFila_(HOJAS.TIPOS_MENU, tipo);
    }
    return tipo.id;
  });
}

function eliminarTipoMenu(id) {
  return conBloqueo_(function () {
    var productosConEseTipo = leerFilas_(HOJAS.MENU).filter(function (f) { return String(f.tipoMenu) === String(id); });
    if (productosConEseTipo.length) {
      throw new Error('No puedes eliminar este tipo de menú: ' + productosConEseTipo.length +
        ' producto(s) todavía lo usan. Reasígnalos a otro tipo primero.');
    }
    var hoja = obtenerHoja_(HOJAS.TIPOS_MENU);
    var fila = leerFilas_(HOJAS.TIPOS_MENU).find(function (f) { return String(f.id) === String(id); });
    if (fila) hoja.deleteRow(fila._fila);
    return true;
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

/** El administrador crea el número físico de la mesa (sin código: eso lo genera el mesero al abrirla). */
function crearMesa(numero) {
  return conBloqueo_(function () {
    if (!numero) throw new Error('Falta el número de mesa.');
    var yaExiste = leerFilas_(HOJAS.MESAS).some(function (f) { return String(f.numero) === String(numero); });
    if (yaExiste) throw new Error('Ya existe una mesa con ese número.');
    agregarFila_(HOJAS.MESAS, { numero: numero, codigo: '', mesero: '', estado: 'libre', horaApertura: '' });
    return true;
  });
}

function eliminarMesa(numero) {
  return conBloqueo_(function () {
    var mesa = leerFilas_(HOJAS.MESAS).find(function (f) { return String(f.numero) === String(numero); });
    if (!mesa) throw new Error('Mesa no encontrada.');
    if (String(mesa.estado).toLowerCase() !== 'libre') {
      throw new Error('No puedes eliminar una mesa ocupada. Pide al mesero que la cierre primero.');
    }
    obtenerHoja_(HOJAS.MESAS).deleteRow(mesa._fila);
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
      mesero: p.mesero || '',
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
    var mesaInfo = validarCodigoMesa(mesa, codigo);
    var idPedido = Utilities.getUuid();
    agregarFila_(HOJAS.PEDIDOS, {
      // "mesero" queda fijo al mesero responsable de la mesa en el momento del
      // pedido, así se le puede atribuir la venta aunque el pedido lo haya
      // enviado el cliente directamente (no solo cuando lo toma el mesero).
      idPedido: idPedido, mesa: mesa, codigo: codigo, cliente: cliente,
      horaEnvio: new Date(), tomadoPor: tomadoPor, estado: 'enviado', mesero: mesaInfo.mesero || ''
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
// Estadísticas (ventas, propinas estimadas, productos más vendidos)
// ---------------------------------------------------------------------------

function dentroDeRango_(fechaValor, desdeF, hastaF) {
  var f = new Date(fechaValor);
  if (desdeF && f.getTime() < desdeF.getTime()) return false;
  if (hastaF && f.getTime() > hastaF.getTime()) return false;
  return true;
}

function aArregloOrdenado_(mapa) {
  return Object.keys(mapa)
    .map(function (clave) { return { etiqueta: clave, valor: Math.round(mapa[clave] * 100) / 100 }; })
    .sort(function (a, b) { return b.valor - a.valor; });
}

/**
 * desde/hasta: texto 'YYYY-MM-DD' (ambos incluidos). Si se omiten, se
 * calculan sobre todo el histórico. La propina siempre es "estimada":
 * esta app no cobra en línea, así que no hay forma de saber cuánta
 * propina pagó cada mesa en la realidad; se calcula como
 * ventas × propina sugerida configurada, solo como referencia.
 */
function obtenerEstadisticas(desde, hasta) {
  var cfg = obtenerConfig();
  var zonaHoraria = Session.getScriptTimeZone() || 'America/Bogota';
  var desdeF = desde ? new Date(desde + 'T00:00:00') : null;
  var hastaF = hasta ? new Date(hasta + 'T23:59:59') : null;

  var detallePorPedido = {};
  leerFilas_(HOJAS.DETALLE).forEach(function (d) {
    (detallePorPedido[d.idPedido] = detallePorPedido[d.idPedido] || []).push(d);
  });

  var todosLosPedidos = leerFilas_(HOJAS.PEDIDOS);
  var pedidosAnuladosEnRango = 0;
  var pedidosValidos = [];
  todosLosPedidos.forEach(function (p) {
    var enRango = dentroDeRango_(p.horaEnvio, desdeF, hastaF);
    if (!enRango) return;
    if (String(p.estado) === 'anulado') { pedidosAnuladosEnRango++; return; }
    pedidosValidos.push(p);
  });

  var ventasTotales = 0;
  var ventasPorMesero = {};
  var ventasPorDia = {};
  var ventasPorProducto = {};
  var cantidadPorProducto = {};

  pedidosValidos.forEach(function (p) {
    var items = detallePorPedido[p.idPedido] || [];
    var totalPedido = items.reduce(function (s, it) { return s + (Number(it.subtotal) || 0); }, 0);
    ventasTotales += totalPedido;

    var mesero = p.mesero || (String(p.tomadoPor) === 'cliente' ? 'Pedido directo del cliente' : p.tomadoPor) || 'Sin asignar';
    ventasPorMesero[mesero] = (ventasPorMesero[mesero] || 0) + totalPedido;

    var dia = Utilities.formatDate(new Date(p.horaEnvio), zonaHoraria, 'yyyy-MM-dd');
    ventasPorDia[dia] = (ventasPorDia[dia] || 0) + totalPedido;

    items.forEach(function (it) {
      ventasPorProducto[it.producto] = (ventasPorProducto[it.producto] || 0) + (Number(it.subtotal) || 0);
      cantidadPorProducto[it.producto] = (cantidadPorProducto[it.producto] || 0) + (Number(it.cantidad) || 0);
    });
  });

  var porMesero = aArregloOrdenado_(ventasPorMesero).map(function (m) {
    return {
      mesero: m.etiqueta,
      ventas: m.valor,
      pedidos: pedidosValidos.filter(function (p) {
        var mesero = p.mesero || (String(p.tomadoPor) === 'cliente' ? 'Pedido directo del cliente' : p.tomadoPor) || 'Sin asignar';
        return mesero === m.etiqueta;
      }).length,
      propinaEstimada: Math.round(m.valor * cfg.propinaSugerida * 100) / 100
    };
  });

  var topProductos = aArregloOrdenado_(ventasPorProducto).slice(0, 8).map(function (x) {
    return { producto: x.etiqueta, ventas: x.valor, cantidad: cantidadPorProducto[x.etiqueta] || 0 };
  });

  return {
    desde: desde || '', hasta: hasta || '',
    ventasTotales: Math.round(ventasTotales * 100) / 100,
    numPedidos: pedidosValidos.length,
    ticketPromedio: pedidosValidos.length ? Math.round((ventasTotales / pedidosValidos.length) * 100) / 100 : 0,
    propinaEstimadaTotal: Math.round(ventasTotales * cfg.propinaSugerida * 100) / 100,
    pedidosAnulados: pedidosAnuladosEnRango,
    porMesero: porMesero,
    porDia: Object.keys(ventasPorDia).sort().map(function (d) { return { dia: d, ventas: Math.round(ventasPorDia[d] * 100) / 100 }; }),
    topProductos: topProductos
  };
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

  var tiposMenu = obtenerHoja_(HOJAS.TIPOS_MENU);
  if (tiposMenu.getLastRow() === 1) {
    tiposMenu.getRange(2, 1, 1, 4).setValues([
      ['TM1', 'Carta', 1, 'si']
    ]);
  }

  var menu = obtenerHoja_(HOJAS.MENU);
  if (menu.getLastRow() === 1) {
    menu.getRange(2, 1, 9, 9).setValues([
      ['P001', 'Entradas', 'Chicharrones de cerdo', 'Chicharrón crocante con limón y ají', 18000, '', 'si', 1, 'TM1'],
      ['P002', 'Entradas', 'Patacones con hogao', 'Patacón verde con hogao criollo', 15000, '', 'si', 2, 'TM1'],
      ['P003', 'Carnes', 'Punta de anca', 'Punta de anca a la parrilla, 350 g', 42000, '', 'si', 3, 'TM1'],
      ['P004', 'Carnes', 'Churrasco', 'Corte de res a la parrilla, 300 g', 48000, '', 'si', 4, 'TM1'],
      ['P005', 'Carnes', 'Chuleta de cerdo', 'Chuleta de cerdo a la parrilla, 300 g', 36000, '', 'si', 5, 'TM1'],
      ['P006', 'Acompañamientos', 'Papa criolla', 'Papa criolla salteada con cebolla', 9000, '', 'si', 6, 'TM1'],
      ['P007', 'Acompañamientos', 'Arepa de choclo', 'Arepa de choclo con queso', 8000, '', 'si', 7, 'TM1'],
      ['P008', 'Bebidas', 'Limonada de coco', 'Limonada natural de coco', 9000, '', 'si', 8, 'TM1'],
      ['P009', 'Postres', 'Flan de café', 'Flan casero de café', 10000, '', 'si', 9, 'TM1']
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
    config.getRange(2, 1, 10, 2).setValues([
      ['nombreRestaurante', 'Carnes Parrilla'],
      ['logoUrl', ''],
      ['colorVino', '#7A1E24'],
      ['colorCarbon', '#2B2523'],
      ['colorCrema', '#F4EBDD'],
      ['colorBrasa', '#D9772B'],
      ['colorDorado', '#C9A45C'],
      ['impuestoConsumo', '0.08'],
      ['propinaSugerida', '0.10'],
      ['mediosPago', 'Efectivo,Datáfono,Nequi,Daviplata,QR Bre-B,Transferencia']
    ]);
  }

  ss.getSheets().forEach(function (hoja) {
    // La hoja "Hoja 1" en blanco que Google crea por defecto no tiene
    // columnas con datos (getLastColumn() da 0), y autoResizeColumns(1, 0)
    // lanza "Esas columnas están fuera de los límites".
    if (hoja.getLastColumn() > 0) hoja.autoResizeColumns(1, hoja.getLastColumn());
  });

  SpreadsheetApp.getUi().alert(
    'Base de datos lista. Usuarios de ejemplo -> Administrador: PIN 1234, Mesero Demo: PIN 1111, Cocina Demo: PIN 2222. Cámbialos antes de abrir al público.'
  );
}
