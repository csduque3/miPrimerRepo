# Panel Maestro · Carnes Parrilla

Esta es una **segunda aplicación de Apps Script, separada de la de cada
restaurante**. Es tu panel privado como proveedor del servicio: aquí ves
todos los restaurantes a los que les vendes el sistema de pedidos por QR,
y los activas, renuevas o suspendes con un par de clics, sin tener que
entrar al proyecto de Apps Script de cada uno.

## Cómo se conecta con cada restaurante

1. Publicas este Panel Maestro **una sola vez** (los pasos de abajo).
2. Por cada restaurante nuevo, lo agregas aquí con **"+ Nuevo restaurante"**.
   El panel te da un `idCliente`.
3. En el proyecto de Apps Script de **ese** restaurante (el de
   `carnes-parrilla-qr/`), abres el editor y ejecutas una vez, desde el
   selector de funciones:

   ```
   conectarConPanelMaestro("URL_DE_ESTE_PANEL", "idCliente_que_te_dio_el_panel")
   ```

4. Desde ese momento, cada vez que alguien abre la app de ese restaurante,
   esa app le pregunta a este Panel Maestro (una vez por hora, en caché)
   si sigue activo. Si lo suspendes aquí, en menos de una hora su app
   empieza a mostrar el aviso de servicio suspendido.

Si un restaurante **no** está conectado al Panel Maestro, sigue
funcionando con su interruptor local de siempre (`renovarLicenciaUnMes` /
`suspenderLicencia` dentro de su propio proyecto) — conectar al Panel
Maestro es opcional, útil sobre todo cuando ya tienes varios restaurantes
y no quieres entrar a cada proyecto por separado.

## 1. Publicar el Panel Maestro

1. Crea un Google Sheet **nuevo y exclusivo para esto** (no el de ningún
   restaurante), por ejemplo "Panel Maestro - Carnes Parrilla".
2. Extensiones → Apps Script.
3. Pega el contenido de `Code.gs` de esta carpeta en el archivo de código.
4. Crea un archivo HTML llamado `Index` y pega el contenido de
   `Index.html` de esta carpeta.
5. Activa el manifiesto (`appsscript.json`) desde Configuración del
   proyecto ⚙️ y reemplázalo por el de esta carpeta.
6. En el selector de funciones, elige **`crearPanelMaestro`** y pulsa
   Ejecutar (autoriza los permisos si te los pide). Esto crea la hoja
   `CLIENTES`.
7. **Implementar → Nueva implementación → Aplicación web**:
   - Ejecutar como: Yo
   - Quién tiene acceso: **Cualquier persona** (así cada restaurante
     puede consultar su estado sin que tú intervengas)
8. Copia la URL `/exec`. Esa es "la URL de este panel" que usas en el
   paso 3 de arriba y la que abres tú mismo en el navegador para
   administrar tus restaurantes.

## 2. Usarlo día a día

1. Abres la URL del Panel Maestro en tu navegador (puedes guardarla como
   marcador o acceso directo en tu celular).
2. La primera vez, escribe cualquier PIN de 4+ dígitos: ese queda como tu
   PIN de acceso a partir de ahora (solo tuyo, nada que ver con los PIN
   de los restaurantes).
3. Verás la tabla de restaurantes con su estado (Activo / Vencido /
   Suspendido), fecha de vencimiento y tus notas.
4. Cuando un restaurante te pague la mensualidad, pulsa **"Renovar 30d"**
   en su fila.
5. Si deja de pagar o se da de baja, pulsa **"Suspender"**.

## Seguridad y límites de este modelo

- El PIN de este panel protege **la administración** (crear/renovar/
  suspender/eliminar). El endpoint que cada restaurante consulta
  (`?accion=estado&idCliente=...`) es público a propósito —sin eso, los
  restaurantes no podrían preguntar su propio estado— pero solo devuelve
  `{"activo": true/false}`, nunca datos de ningún restaurante.
- Si el Panel Maestro está caído o sin internet un momento, cada
  restaurante usa el último estado que conoce (hasta 1 hora de caché) en
  vez de bloquearse de inmediato, para no tumbar un restaurante por un
  problema de red pasajero.
- Esto sigue siendo un modelo manual (tú renuevas con un clic, no hay
  cobro automático). Es el paso natural entre "abrir un proyecto de Apps
  Script por restaurante cada mes" y una plataforma con cobro recurrente
  automatizado, pero no sustituye a esta última si el negocio crece a
  decenas de restaurantes.
