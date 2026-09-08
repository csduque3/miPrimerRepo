# Ruta 90 días · Contabilidad Tributaria Colombiana

Aplicación web (sin dependencias, sin servidor) para estudiar contabilidad
tributaria colombiana en 90 días usando cuatro técnicas de aprendizaje
acelerado respaldadas por investigación en ciencia cognitiva:

1. **Repetición espaciada** (algoritmo SM-2 simplificado): cada tarjeta
   vuelve a aparecer justo antes de que la olvides. Si te cuesta, vuelve
   pronto; si la dominas, el intervalo crece.
2. **Intercalado (interleaving)**: en cada sesión se mezclan conceptos de
   varios módulos ya vistos, en lugar de estudiar un solo tema en bloque.
   Esto obliga al cerebro a distinguir entre impuestos parecidos (ej. IVA
   vs. retención) en vez de memorizar de forma automática.
3. **Recuerdo activo (active recall)**: respondes antes de ver la
   respuesta. El esfuerzo de recordar —no releer— es lo que consolida la
   memoria de largo plazo.
4. **Técnica Feynman**: cada día se te asigna un módulo para explicar en
   lenguaje simple, con checklist de autoevaluación. Donde te trabas, ahí
   está tu vacío real de conocimiento.

## Cómo usarla

Abre `index.html` en cualquier navegador (no necesita instalación ni
conexión a internet, excepto para los enlaces de fuentes oficiales). Tu
progreso se guarda automáticamente en el `localStorage` de ese navegador,
así que usa siempre el mismo navegador/dispositivo para continuar tu racha.

Si prefieres servirla con un servidor local (opcional):

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Estructura del proyecto

```
index.html            interfaz principal (4 pestañas: Panel, Repaso, Feynman, Plan)
assets/styles.css     estilos en paleta pastel (con modo oscuro automático)
assets/app.js         lógica: SM-2, intercalado, plan de 90 días, métricas
assets/ui.js          renderizado de las 4 vistas y manejo de eventos
data/temario.js       12 módulos de contenido tributario (fuente de verdad del temario)
```

## Contenido y verificación normativa

**Importante:** las tarjetas de estudio explican la *lógica y el
procedimiento* de cada impuesto (hechos generadores, mecánica de
retención, diferencia entre exento y excluido, etc.). A propósito **no**
incluyen cifras que cambian cada año (UVT, tarifas exactas, topes en
pesos, fechas de vencimiento), porque memorizar un número desactualizado
es un riesgo profesional real para un contador. Cada módulo en
`data/temario.js` incluye sus fuentes de referencia para que verifiques
la vigencia antes de aplicar cualquier cifra en un caso real.

Fuentes oficiales generales:

- DIAN — normatividad y calendario tributario: https://www.dian.gov.co
- Estatuto Tributario Nacional (texto consolidado), Secretaría del Senado:
  http://www.secretariasenado.gov.co/senado/basedoc/estatuto_tributario.html
- Decreto Único Reglamentario 1625 de 2016 (materia tributaria):
  http://www.secretariasenado.gov.co/senado/basedoc/decreto_1625_2016.html
- Ley 2277 de 2022 (última reforma tributaria estructural a la fecha de
  creación de este plan):
  http://www.secretariasenado.gov.co/senado/basedoc/ley_2277_2022.html
- Consejo Técnico de la Contaduría Pública (NIIF en Colombia): https://www.ctcp.gov.co

Si alguna norma citada en `data/temario.js` fue modificada después de la
fecha de creación de este plan, verifícala en las fuentes anteriores antes
de tomar decisiones profesionales con base en ella.

## El plan de 12 semanas

| Semana | Módulo |
|---|---|
| 1 | Fundamentos del sistema tributario colombiano |
| 2 | Impuesto de renta – personas jurídicas |
| 3 | Impuesto de renta – personas naturales |
| 4 | IVA |
| 5 | Retención en la fuente (renta, IVA, ICA) |
| 6 | Impuesto de Industria y Comercio (ICA) |
| 7 | Régimen Simple de Tributación (RST) |
| 8 | Facturación electrónica y documentos soporte |
| 9 | Procedimiento tributario: declaraciones, plazos, sanciones |
| 10 | Relación contabilidad–fiscalidad (NIIF vs. norma fiscal) |
| 11 | Impuesto al patrimonio y otros tributos |
| 12 | Integración final: planeación tributaria y casos |

Desde la semana en que un módulo se activa, sus tarjetas se intercalan en
las sesiones diarias junto con los módulos anteriores, hasta el día 90.

## Extender el contenido

Para agregar o corregir tarjetas, edita `data/temario.js`: cada módulo es
un objeto con `conceptos` (preguntas y respuestas) y `feynman` (el reto de
explicación del día). No es necesario tocar la lógica de la app.

## Próximos pasos sugeridos (fuera del alcance de esta versión)

- Exportar el progreso a un archivo (JSON/Excel) para respaldo o para
  construir un dashboard externo con indicadores de estudio.
- Sincronizar el progreso entre dispositivos (hoy vive solo en el
  navegador local).
