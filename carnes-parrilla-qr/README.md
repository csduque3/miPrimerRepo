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
7. El **administrador** entra con su PIN para editar el menú, las opciones
   de cada plato, los usuarios/PIN del personal y la configuración general
   (impuesto, propina sugerida, medios de pago).

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
