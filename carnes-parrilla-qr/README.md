# Carnes Parrilla · Pedidos por QR

Aplicación web real construida con **Google Apps Script** (backend) y
**Google Sheets** (base de datos), pensada para que los clientes pidan
desde el celular escaneando un QR en la mesa.

## Archivos de este proyecto

| Archivo | Contenido |
|---|---|
| `Code.gs` | Backend: lectura/escritura en el Sheet, lógica de negocio, `LockService` |
| `Index.html` | Frontend único (una sola página web) con las 4 vistas: Cliente, Mesero, Cocina, Administrador |
| `appsscript.json` | Manifiesto del proyecto (zona horaria, permisos de la web app) |

## 1. Crear el Google Sheet y el proyecto de Apps Script

1. Entra a [sheets.google.com](https://sheets.google.com) y crea una hoja de cálculo nueva.
   Nómbrala, por ejemplo, **"Carnes Parrilla – Base de datos"**.
2. En el menú ve a **Extensiones → Apps Script**. Se abrirá el editor con un
   proyecto vinculado a esa hoja (así el script siempre sabe cuál es su base de datos).
3. Borra el contenido del archivo `Código.gs`/`Code.gs` que viene por defecto
   y pega allí el contenido de `Code.gs` de este repositorio.
4. En el editor, pulsa el ícono **+** junto a "Archivos" → **HTML** → nómbralo
   `Index` (sin extensión, Apps Script la agrega sola) y pega el contenido de
   `Index.html` de este repositorio.
5. Pulsa el ícono de engranaje ⚙️ **Configuración del proyecto** y activa
   "Mostrar el archivo de manifiesto `appsscript.json` en el editor". Luego
   abre ese archivo y reemplaza su contenido por el de `appsscript.json` de
   este repositorio.
6. Guarda todo (Ctrl/Cmd + S).

## 2. Crear las hojas y los datos de ejemplo

1. En el editor de Apps Script, en el selector de funciones (arriba, junto
   al botón "Ejecutar"), elige **`crearBaseDatos`**.
2. Pulsa **Ejecutar**. La primera vez te pedirá autorizar permisos:
   "Avanzado" → "Ir a (nombre del proyecto) (no seguro)" → "Permitir".
   Esto es normal porque el script es tuyo y aún no está publicado en el
   Marketplace de Google.
3. Verás un mensaje de confirmación con los PIN de ejemplo:
   - Administrador → PIN `1234`
   - Mesero Demo → PIN `1111`
   - Cocina Demo → PIN `2222`
4. Vuelve a la hoja de cálculo: ahora tiene las pestañas `MENU`, `OPCIONES`,
   `MESAS`, `PEDIDOS`, `DETALLE`, `LLAMADOS`, `USUARIOS` y `CONFIG`, con un
   menú de ejemplo y 10 mesas libres.
5. **Importante por seguridad:** entra a la pestaña `USUARIOS` y cambia los
   PIN de ejemplo antes de abrir la aplicación al público. También puedes
   agregar allí a tus meseros y personal de cocina reales (uno por fila).

## 3. Publicar la aplicación web

1. En el editor de Apps Script, pulsa **Implementar → Nueva implementación**.
2. En "Selecciona el tipo", elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier persona
4. Pulsa **Implementar** y autoriza de nuevo si te lo solicita.
5. Copia la **URL de la aplicación web** que te entrega Google (termina en
   `/exec`). Esa es la URL que abrirán tus clientes, meseros, cocina y
   administrador. Guárdala: la necesitas para generar los QR.

### Cuando actualices el código

Cada vez que edites `Code.gs` o `Index.html`, debes crear una **nueva
versión** de la implementación para que los cambios se vean:
**Implementar → Gestionar implementaciones → ✏️ (editar) → Versión: Nueva
versión → Implementar**. La URL no cambia.

## 4. Generar el código QR de cada mesa

El cliente siempre entra a la **misma URL** de la aplicación web (no hace
falta una URL distinta por mesa); lo que identifica su mesa es el **código
de 4 dígitos** que le entrega el mesero al sentarse. Por eso basta con un
solo QR que apunte a la URL del paso anterior, impreso y laminado una vez
por mesa (puedes poner el número de mesa al lado del QR solo como
referencia visual para tu personal).

Para generarlo sin instalar nada, usa un generador de QR gratuito, por
ejemplo:

```
https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PEGA_AQUI_TU_URL_DE_LA_APP
```

Reemplaza `PEGA_AQUI_TU_URL_DE_LA_APP` por la URL `/exec` del paso 3,
abre ese enlace en el navegador y descarga la imagen PNG resultante.
Repite (o simplemente copia el mismo PNG) para cada mesa del restaurante.

## 5. Flujo de uso en el restaurante

1. El **mesero** entra a la app, elige "Soy mesero", ingresa su PIN y pulsa
   **"+ Abrir mesa"** (o el botón "Abrir" sobre una mesa libre) cuando llega
   un nuevo grupo de clientes. La app genera un código de 4 dígitos.
2. El mesero le dice ese código a la mesa (o lo anota en un cartón junto al QR).
3. Los **clientes** escanean el QR, eligen "Soy cliente", escriben el código
   y su nombre, y ya pueden pedir.
4. La **cocina** entra con su PIN y ve las comandas en tiempo casi real
   (la app consulta cada 5 segundos); al terminar un plato pulsa **"Listo"**.
5. El **mesero** recibe aviso con sonido y vibración cuando lo llaman, cuando
   la cocina marca un pedido listo, o cuando una de sus mesas pide la cuenta.
6. Al terminar, el mesero pulsa **"Cerrar mesa"**: la mesa queda libre y el
   código deja de servir, listo para el siguiente grupo.
7. El **administrador** entra con su PIN y puede personalizar todo el
   negocio desde las pestañas de su panel (ver sección siguiente).

## 5.1 Lo que puede personalizar el Administrador

El rol Administrador tiene 7 pestañas:

| Pestaña | Para qué sirve |
|---|---|
| **Productos** | Crear, editar, ocultar/mostrar (disponible) y eliminar platos; a cada uno se le asigna un tipo de menú, categoría, precio, imagen y orden. |
| **Tipos de menú** | Crear varios menús (por ejemplo "Desayuno", "Almuerzo", "Carta", "Menú del día"). Si solo hay uno, el cliente no ve ningún selector; si hay más de uno activo, el cliente ve pestañas para cambiar entre ellos. Cada producto de la pestaña "Productos" se asigna a uno de estos tipos. |
| **Mesas** | Agregar o eliminar los números de mesa que existen físicamente en el restaurante (no confundir con "abrir" una mesa para un cliente, que sigue siendo tarea del mesero desde su pantalla). Solo se puede eliminar una mesa que esté libre. |
| **Personal** | Crear, editar y eliminar meseros, cocineros y otros administradores, cada uno con su nombre y PIN. |
| **Marca** | Nombre del restaurante, logo (URL de una imagen cuadrada liviana) y los 5 colores de la marca (principal, oscuro, fondo, acento, detalle). Se aplican de inmediato a toda la app, para todos los roles. |
| **Configuración** | Impuesto al consumo, propina sugerida y medios de pago que se muestran en la pre-cuenta. |
| **Estadísticas** | Gráficas de ventas y propinas. Ver detalle abajo. |

Cualquier cambio en productos o tipos de menú borra automáticamente la
copia del menú que el navegador del cliente tiene guardada
(`localStorage`), así que el cliente ve el cambio en su próxima visita
sin que tengas que hacer nada más.

### Estadísticas

La pestaña "Estadísticas" deja elegir un rango (Hoy, 7 días, Este mes,
30 días, Todo, o Personalizado con fechas exactas) y muestra, sobre los
pedidos de ese rango (sin contar los anulados):

- **Tarjetas resumen:** ventas totales, número de pedidos, ticket
  promedio, propina estimada total y pedidos anulados.
- **Ventas por mesero:** a cada pedido se le atribuye el mesero
  responsable de esa mesa en el momento en que se envió (aunque el
  pedido lo haya enviado el cliente directamente desde su celular, no
  solo cuando el mesero lo toma por él); los pedidos que un cliente hizo
  en una mesa sin mesero asignado aparecen agrupados como "Pedido directo
  del cliente".
- **Propina estimada por mesero:** `ventas del mesero × propina sugerida
  configurada`. Es una estimación, no un cobro real: esta app no procesa
  pagos en línea, así que no existe manera de saber cuánta propina pagó
  cada mesa en efectivo o datáfono. Úsala como referencia para repartir
  propinas, no como un valor exacto.
- **Ventas por día:** para ver la tendencia dentro del rango elegido.
- **Productos más vendidos:** por valor de ventas, con la cantidad
  vendida de cada uno.

Si ya tenías un restaurante funcionando antes de esta actualización,
abre su Google Sheet y ejecuta de nuevo `crearBaseDatos()` una vez desde
el editor de Apps Script: eso agrega la columna `mesero` que falta en la
hoja `PEDIDOS` sin borrar ningún pedido existente (los pedidos anteriores
a la actualización simplemente no tendrán mesero atribuido en las
estadísticas).

## 6. Notas importantes

- **Impuesto y propina:** los precios del `MENU` ya incluyen el impuesto al
  consumo. La app lo discrimina matemáticamente en la pre-cuenta
  (`precio con impuesto ÷ (1 + impuesto)`), no se vuelve a sumar aparte.
- **No hay cobro en línea:** los medios de pago (efectivo, datáfono, Nequi,
  Daviplata, QR Bre-B, transferencia) solo se muestran como referencia; el
  cobro real se hace en caja, donde se entrega la factura electrónica.
- **Rendimiento con mala señal:** el menú se descarga una sola vez y se
  guarda en el navegador (`localStorage`); si el envío de un pedido falla
  por falta de señal, la app reintenta automáticamente hasta 3 veces antes
  de avisar al cliente, sin duplicar el pedido (cada intento usa el mismo
  pedido, se crea solo si el intento tiene éxito).
- **Imágenes del menú:** usa imágenes livianas (idealmente WebP, menos de
  100 KB) alojadas en un servicio externo rápido (no Google Drive, que es
  lento para servir imágenes públicas) y pega esa URL en el campo
  "URL de imagen" de cada producto desde el panel de Administrador.
- **Concurrencia:** todas las escrituras (crear pedido, abrir mesa, marcar
  listo, etc.) usan `LockService`, así que dos acciones simultáneas no se
  pisan entre sí.

## 7. Vender esto como servicio mensual (piloto manual, sin pasarela de pago)

Esta plantilla está pensada para que **cada restaurante tenga su propia
copia** (su propio Sheet y su propia implementación de Apps Script). No es
una app multi-cliente centralizada: no hay un panel único donde se registran
varios restaurantes ni cobro en línea integrado todavía. Para un piloto con
pocos clientes, el control de pago funciona así:

1. Por cada restaurante nuevo, repites los pasos 1 a 3 de este README
   (Sheet nuevo, pegar el código, `crearBaseDatos()`, publicar). Tú quedas
   como quien administra ese proyecto de Apps Script.
2. El código ya trae un **interruptor de licencia** que **solo tú puedes
   ver y cambiar**, desde el editor de Apps Script (nunca desde la app ni
   desde el Sheet, así que el restaurante no puede tocarlo):
   - La primera vez que se abre la app, la licencia se activa sola por
     30 días (para que puedas hacer la implementación sin bloquearte).
   - Cuando el restaurante te paga la mensualidad, abres su proyecto de
     Apps Script, eliges en el selector de funciones **`renovarLicenciaUnMes`**
     y pulsas **Ejecutar**. Eso extiende el acceso 30 días más.
   - Si no paga, no hace falta que hagas nada: a los 30 días la app
     empieza a mostrar sola un aviso de "Servicio temporalmente
     suspendido. Contacta a tu proveedor del servicio para reactivarlo."
     en vez del menú.
   - Si quieres cortar el acceso de inmediato (por ejemplo, el restaurante
     se dio de baja), ejecuta **`suspenderLicencia`**.
3. Lleva tú, por fuera (una hoja de cálculo personal, no parte de esta
   plantilla), el control de qué restaurante pagó y cuándo vence, para
   saber a quién renovarle.

**Límites de este modelo** (por eso es un piloto, no la versión para
escalar): cada restaurante vive en una cuenta/proyecto de Google separado,
por lo que mantener 20-30 clientes así ya es poco práctico de administrar
a mano, y no hay cobro automático ni registro de nuevos clientes por sí
mismos. Si el piloto valida que la gente paga por esto, el siguiente paso
natural es migrar a una aplicación multi-cliente con base de datos propia,
inicio de sesión por restaurante y cobro recurrente automatizado (por
ejemplo con Wompi o ePayco), para no depender de que abras manualmente
cada proyecto de Apps Script cada mes.

### Un paso intermedio: el Panel Maestro

Si ya tienes varios restaurantes y abrir uno por uno cada mes para
ejecutar `renovarLicenciaUnMes` se vuelve pesado, en `panel-maestro/` (al
lado de esta carpeta, en la raíz del proyecto) hay una **segunda app de
Apps Script**, exclusiva para ti, desde la que ves todos tus restaurantes
en una sola pantalla y los activas, renuevas o suspendes con un botón —
sin entrar al proyecto de cada uno. Conectar un restaurante a ese panel
es opcional y no cambia nada de lo anterior: si no lo conectas, sigue
usando el interruptor local de este mismo README. Ver
`panel-maestro/README.md` para publicarlo y conectar restaurantes.
