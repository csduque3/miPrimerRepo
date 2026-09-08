/**
 * Temario de Contabilidad Tributaria Colombiana - Plan de 90 días.
 *
 * IMPORTANTE (léelo antes de estudiar):
 * Estas tarjetas explican CONCEPTOS y MECÁNICAS que cambian poco con el tiempo
 * (cómo funciona el IVA, qué es la retención en la fuente, cómo se concilia
 * NIIF vs fiscal, etc.). A propósito NO incluyen cifras que cambian cada año
 * (UVT, tarifas exactas, topes en pesos, fechas de vencimiento), porque esos
 * datos deben verificarse siempre en la fuente oficial vigente al momento de
 * usarlos. Cada módulo indica dónde consultarlos.
 *
 * Fuentes oficiales generales para verificar vigencia:
 * - DIAN (resoluciones, conceptos, calendario tributario): https://www.dian.gov.co
 * - Estatuto Tributario Nacional (texto consolidado): http://www.secretariasenado.gov.co/senado/basedoc/estatuto_tributario.html
 * - Decreto Único Reglamentario en materia tributaria 1625 de 2016: http://www.secretariasenado.gov.co/senado/basedoc/decreto_1625_2016.html
 * - Ley 2277 de 2022 (última reforma tributaria estructural a la fecha de creación de este plan):
 *   http://www.secretariasenado.gov.co/senado/basedoc/ley_2277_2022.html
 * - Normas Internacionales de Información Financiera (NIIF) adoptadas en Colombia: https://www.ctcp.gov.co
 *
 * Si alguna norma citada aquí fue modificada después de la fecha de creación de este
 * plan, verifícalo en las fuentes anteriores antes de tomar decisiones profesionales.
 */

const TEMARIO = [
  {
    id: 1,
    nombre: "Fundamentos del sistema tributario colombiano",
    semanaFoco: 1,
    fuentes: [
      "Constitución Política de Colombia, arts. 95-9 (deber de contribuir) y 338 (principio de legalidad tributaria)",
      "Estatuto Tributario Nacional (E.T.), Libro I",
      "www.dian.gov.co – sección normatividad"
    ],
    conceptos: [
      { q: "¿Qué diferencia hay entre impuesto, tasa y contribución?", a: "Impuesto: obligatorio, sin contraprestación directa (ej. renta, IVA). Tasa: se paga por un servicio específico que presta el Estado (ej. peajes, trámites). Contribución: se paga por un beneficio específico derivado de una obra o actividad estatal (ej. contribución de valorización)." },
      { q: "¿Qué es el principio de legalidad tributaria?", a: "Ningún tributo puede existir, modificarse o cobrarse si no ha sido creado por una ley, ordenanza o acuerdo expedido por el órgano competente (Congreso, asambleas, concejos), según el art. 338 de la Constitución." },
      { q: "¿Cuál es la diferencia entre impuestos nacionales, departamentales y municipales?", a: "Nacionales: los administra la DIAN (renta, IVA, timbre). Departamentales: los administran las gobernaciones (ej. impuesto al consumo, registro). Municipales: los administran las alcaldías (ej. ICA, predial)." },
      { q: "¿Qué es el hecho generador de un tributo?", a: "Es la situación jurídica o económica definida por la ley cuya realización origina el nacimiento de la obligación tributaria (ej. en IVA, la venta de un bien gravado; en renta, obtener ingresos susceptibles de incrementar el patrimonio)." },
      { q: "¿Qué es la obligación tributaria sustancial y en qué se diferencia de la formal?", a: "La sustancial es pagar el tributo (obligación de dar). La formal son los deberes instrumentales para cumplir la sustancial: declarar, facturar, informar, conservar soportes, etc." },
      { q: "¿Quién es sujeto activo y quién sujeto pasivo en una relación tributaria?", a: "Sujeto activo: el Estado (Nación, departamento o municipio) titular del derecho a exigir el tributo. Sujeto pasivo: la persona natural o jurídica obligada al pago o al cumplimiento de deberes formales." },
      { q: "¿Qué es un régimen tributario y qué regímenes existen para personas jurídicas en Colombia?", a: "Es el conjunto de reglas que definen cómo tributa un contribuyente. En Colombia las personas jurídicas pueden estar en el régimen ordinario de renta o en el Régimen Simple de Tributación (RST), este último opcional y con requisitos específicos." },
      { q: "¿Dónde verifico si una norma tributaria sigue vigente?", a: "En el Estatuto Tributario consolidado (Secretaría del Senado), en la normatividad publicada por la DIAN, y revisando si existe una ley posterior (como reformas tributarias) que la haya modificado o derogado." }
    ],
    feynman: "Explícale a alguien sin formación contable, en menos de 3 minutos y sin usar la palabra 'tributo', por qué existen impuestos, tasas y contribuciones y en qué se diferencian. Usa un ejemplo cotidiano para cada uno."
  },
  {
    id: 2,
    nombre: "Impuesto de renta – personas jurídicas (régimen ordinario)",
    semanaFoco: 2,
    fuentes: [
      "E.T., Libro I, Títulos I a VI",
      "Decreto 1625 de 2016, Parte 1"
    ],
    conceptos: [
      { q: "¿Qué es la renta líquida gravable y cómo se llega a ella (esquema general)?", a: "Ingresos brutos – devoluciones, rebajas y descuentos = ingresos netos; – costos = renta bruta; – deducciones = renta líquida; se compara contra la renta presuntiva/límites de compensación (según la norma vigente) y se ajusta por rentas exentas y descuentos tributarios para llegar al impuesto a cargo." },
      { q: "¿Qué requisitos generales debe cumplir un costo o gasto para ser deducible en renta?", a: "Debe tener relación de causalidad con la actividad productora de renta, ser necesario, ser proporcional a esa actividad, y cumplir los requisitos formales (factura o soporte válido, retención practicada cuando aplique, realización fiscal)." },
      { q: "¿Qué significa 'realización' del ingreso, costo o gasto en materia fiscal?", a: "Es el momento en que, según las reglas del Estatuto Tributario (que en general remiten a la causación contable con algunas excepciones expresas), un ingreso, costo o gasto se entiende fiscalmente ocurrido y por tanto debe reconocerse en la declaración de renta del periodo correspondiente." },
      { q: "¿Qué es una diferencia temporaria y una diferencia permanente entre la utilidad contable (NIIF) y la renta fiscal?", a: "Temporaria: la partida se reconoce en periodos distintos para efectos contables y fiscales, pero termina revirtiendo (ej. depreciación con vidas útiles distintas), y genera impuesto diferido. Permanente: la diferencia nunca revierte (ej. un gasto no deducible por ley), y no genera impuesto diferido." },
      { q: "¿Qué es una renta exenta y qué es un descuento tributario, y en qué momento del cálculo actúa cada uno?", a: "La renta exenta se resta ANTES de calcular el impuesto (reduce la base gravable). El descuento tributario se resta DESPUÉS de calcular el impuesto (reduce directamente el valor a pagar), y suele tener límites establecidos por la ley." },
      { q: "¿Qué es la sobretasa o tarifa diferencial en renta para ciertos sectores, en términos conceptuales?", a: "Es un componente adicional que la ley puede imponer a ciertas actividades económicas (ej. sector financiero) sobre la tarifa general de renta; su existencia, porcentaje y vigencia deben verificarse en la ley vigente, pues han cambiado en reformas recientes." },
      { q: "¿Qué es la conciliación fiscal y en qué formato se presenta ante la DIAN?", a: "Es el proceso mediante el cual el contribuyente parte de la utilidad contable bajo NIIF y le aplica los ajustes fiscales necesarios para llegar a la renta líquida; se documenta en el reporte de conciliación fiscal (formato definido por la DIAN, ej. Formato 2516 y anexos, cuya numeración debe verificarse cada año)." },
      { q: "¿Qué es la retención en la fuente a título de renta desde la óptica del pagador y del receptor del pago?", a: "Para el pagador (agente retenedor) es un deber formal: descontar y consignar un anticipo del impuesto de renta de su contraparte. Para el receptor del pago, esa retención es un anticipo del impuesto de renta que podrá descontar en su propia declaración." }
    ],
    feynman: "Dibuja en una hoja el 'camino' desde los ingresos brutos de una empresa hasta el impuesto de renta a pagar, usando solo flechas y palabras simples (sin fórmulas). Luego explícaselo a alguien como si fuera una receta de cocina."
  },
  {
    id: 3,
    nombre: "Impuesto de renta – personas naturales",
    semanaFoco: 3,
    fuentes: [
      "E.T., Título V (personas naturales)",
      "www.dian.gov.co – cartilla de renta personas naturales (verificar edición del año en curso)"
    ],
    conceptos: [
      { q: "¿Qué son las cédulas en la depuración de la renta de personas naturales y qué busca ese modelo?", a: "Es un sistema que agrupa los ingresos de una persona natural en categorías (ej. rentas de trabajo, de capital, no laborales, de pensiones, dividendos) para depurarlos por separado con sus propios costos, gastos y límites, y luego sumarlas según las reglas vigentes para obtener la base gravable total." },
      { q: "¿Qué diferencia hay entre un ingreso laboral y un ingreso por honorarios para efectos de renta?", a: "El ingreso laboral surge de una relación de dependencia (contrato de trabajo) y tiene beneficios como ciertas rentas exentas asociadas. Los honorarios surgen de una relación independiente (prestación de servicios sin subordinación) y se depuran con reglas de costos/deducciones distintas, pudiendo en algunos casos asimilarse a rentas de trabajo si se cumplen condiciones específicas de la ley." },
      { q: "¿Qué es el sistema de renta presuntiva (o su reemplazo) y para qué se comparaba históricamente?", a: "Era un mecanismo que establecía una renta mínima calculada sobre el patrimonio líquido del año anterior, que se comparaba con la renta ordinaria depurada, tomando la mayor como base. Su vigencia y porcentaje han cambiado con las reformas, por lo que debe verificarse si sigue aplicando y bajo qué reglas." },
      { q: "¿Qué es la renta líquida gravable alternativa y su relación con la 'renta mínima' o 'tributación mínima' de personas naturales?", a: "Es un cálculo comparativo (bajo distintos nombres según la reforma vigente) que busca asegurar que las personas de mayores ingresos no reduzcan su tributación por debajo de un mínimo, comparando el impuesto depurado normalmente contra un cálculo alternativo y tomando el resultado que la ley determine." },
      { q: "¿Qué son los aportes obligatorios a salud y pensión en la depuración de la cédula de rentas de trabajo?", a: "Son ingresos no constitutivos de renta ni ganancia ocasional: se restan de la base porque no representan un incremento real del patrimonio del trabajador, ya que van a cubrir su propia seguridad social." },
      { q: "¿Qué es una ganancia ocasional y en qué se diferencia de la renta ordinaria?", a: "Es un ingreso que proviene de hechos esporádicos o extraordinarios ajenos a la actividad habitual del contribuyente (ej. venta de un activo fijo poseído por largo tiempo, herencias, loterías), y se calcula y tarifa por separado de la renta ordinaria." },
      { q: "¿Qué obligación formal tiene una persona natural que no supera los topes para declarar renta, en relación con las retenciones que le practicaron?", a: "Si no está obligada a declarar, generalmente esas retenciones quedan como su impuesto definitivo (no las recupera), salvo que decida declarar voluntariamente y le resulte favorable, o que aplique un mecanismo especial previsto por la norma vigente." }
    ],
    feynman: "Explica el sistema de cédulas como si fueran 'cajones' separados donde una persona guarda distintos tipos de ingresos. Usa el ejemplo de un profesional independiente que además tiene un apartamento arrendado."
  },
  {
    id: 4,
    nombre: "IVA – impuesto sobre las ventas",
    semanaFoco: 4,
    fuentes: [
      "E.T., Libro III",
      "DIAN – concepto unificado de IVA vigente"
    ],
    conceptos: [
      { q: "¿Cuáles son los hechos generadores del IVA?", a: "La venta de bienes corporales muebles e inmuebles no excluidos, la prestación de servicios en el territorio nacional (o desde el exterior cuando la ley lo indique), la importación de bienes, y la circulación, venta u operación de juegos de suerte y azar, salvo las loterías y apuestas exceptuadas por la ley." },
      { q: "¿Qué diferencia hay entre un bien o servicio excluido y uno exento de IVA?", a: "Excluido: no causa IVA en ninguna etapa y quien lo produce NO puede descontar el IVA de sus insumos (lo asume como mayor costo). Exento: se grava a tarifa 0%, pero el productor SÍ puede solicitar como descontable o en devolución el IVA pagado en sus insumos." },
      { q: "¿Qué es el IVA descontable y cuándo se puede solicitar?", a: "Es el IVA pagado en la compra de bienes y servicios que constituyen costo o gasto, o que se incorporan a bienes gravados o exentos que produce el contribuyente; se resta del IVA generado en las ventas para determinar el saldo a pagar o a favor, siempre que cumpla los requisitos legales (proporcionalidad, relación de causalidad, factura válida)." },
      { q: "¿Qué es el mecanismo de retención en la fuente a título de IVA (reteIVA) y quién suele actuar como agente retenedor?", a: "Es un mecanismo de recaudo anticipado en el que, sobre ciertas operaciones gravadas, el comprador retiene un porcentaje del IVA facturado y lo declara directamente a la DIAN. Suelen ser agentes retenedores los grandes contribuyentes y entidades designadas por la ley o por resolución de la DIAN." },
      { q: "¿Qué es la base gravable del IVA en una venta general?", a: "En general es el valor total de la operación, incluyendo gastos accesorios como financiación, instalación, seguros y otros conceptos que se facturen conjuntamente con el bien o servicio, salvo las exclusiones que la ley señale expresamente." },
      { q: "¿Qué significa que el IVA es un impuesto plurifásico no acumulativo?", a: "Se cobra en cada etapa de la cadena de producción y comercialización (plurifásico), pero cada responsable solo paga sobre el valor agregado que él incorpora, porque puede descontar el IVA que ya pagó en sus compras (no acumulativo o 'de valor agregado')." },
      { q: "¿Qué es el IVA teórico o el impuesto al consumo, y en qué se diferencian del IVA general?", a: "El impuesto al consumo es un tributo distinto al IVA que grava operaciones específicas (ej. algunos servicios de restaurantes, telefonía móvil, vehículos), no genera descontable para quien lo paga, y coexiste con el IVA sin sustituirlo salvo en los casos que la ley expresamente indique." }
    ],
    feynman: "Explica con el ejemplo de una cadena 'productor de leche → fábrica de queso → tienda → consumidor final' cómo se va cobrando y descontando el IVA en cada eslabón, hasta que el consumidor final termina asumiendo el impuesto total."
  },
  {
    id: 5,
    nombre: "Retención en la fuente (renta, IVA e ICA)",
    semanaFoco: 5,
    fuentes: [
      "E.T., Libro II",
      "Decreto 1625 de 2016, Parte 2 (retención en la fuente)"
    ],
    conceptos: [
      { q: "¿Cuál es la finalidad de la retención en la fuente como mecanismo de recaudo?", a: "Recaudar el impuesto de forma anticipada, en el mismo momento en que se genera el ingreso, distribuyendo el recaudo a lo largo del año y facilitando el control tributario, en lugar de esperar a que el contribuyente pague todo el impuesto al presentar su declaración anual." },
      { q: "¿Qué elementos debe identificar el agente retenedor antes de aplicar una retención?", a: "El concepto del pago (qué tipo de ingreso es: honorarios, servicios, compras, salarios, etc.), la calidad del beneficiario (persona natural o jurídica, régimen al que pertenece), si el pago supera la base mínima sujeta a retención (cuando aplique), y la tarifa correspondiente a ese concepto según la norma vigente." },
      { q: "¿Qué es el certificado de retención en la fuente y para qué lo usa quien lo recibe?", a: "Es el documento que expide el agente retenedor certificando los valores retenidos a un tercero en un periodo; quien lo recibe lo usa como soporte para descontar esas retenciones como anticipo en su propia declaración de renta (o IVA/ICA según el caso)." },
      { q: "¿Qué es la autorretención y por qué existe?", a: "Es un mecanismo en el que el propio vendedor o prestador del servicio se practica la retención (en lugar de que se la practique el comprador), aplicado típicamente a sectores o contribuyentes designados por la ley o el Gobierno para simplificar el recaudo cuando hay muchos compradores dispersos o no todos son agentes retenedores." },
      { q: "¿Qué pasa si un agente retenedor no practica la retención debiendo hacerlo?", a: "El agente retenedor responde solidariamente por el valor de la retención no practicada o no consignada, y puede ser objeto de sanciones administrativas; el hecho de no haber retenido no exime al beneficiario del pago de declarar correctamente su ingreso." },
      { q: "¿Qué es la retención en la fuente a título de ICA y en qué se parece y diferencia de la de renta?", a: "Se parece en que también es un anticipo del impuesto (en este caso municipal) que se descuenta en el momento del pago. Se diferencia en que las tarifas, actividades gravadas y quiénes deben actuar como agentes retenedores dependen del acuerdo municipal de cada ciudad, no de una norma nacional única." },
      { q: "¿Qué es la 'autoliquidación' de retenciones en la declaración mensual y qué puede pasar si un mes no se practicaron retenciones?", a: "Es la obligación del agente retenedor de presentar una declaración mensual consolidando lo retenido y consignarlo a la DIAN; según la norma vigente, la declaración de retención presentada sin pago total o presentada en ceros sin justificación puede generar que se tenga por no presentada, por lo que conviene verificar las reglas vigentes sobre este punto." }
    ],
    feynman: "Explica la retención en la fuente como un 'anticipo' comparándolo con dar una propina adelantada. Incluye quién retiene, a quién, cuándo y qué documento prueba que se hizo."
  },
  {
    id: 6,
    nombre: "Impuesto de Industria y Comercio (ICA)",
    semanaFoco: 6,
    fuentes: [
      "Ley 14 de 1983 y Ley 1819 de 2016 (reglas de territorialidad del ICA)",
      "Acuerdo municipal / distrital del municipio donde opera el contribuyente (cada ciudad tiene su propio acuerdo)"
    ],
    conceptos: [
      { q: "¿Qué grava el impuesto de industria y comercio (ICA)?", a: "El ejercicio de actividades industriales, comerciales o de servicios que se realicen, de forma permanente u ocasional, en la jurisdicción de un municipio o distrito, con o sin establecimiento de comercio." },
      { q: "¿Por qué es clave la 'territorialidad' en el ICA?", a: "Porque cada municipio tiene su propio acuerdo con sus propias tarifas y reglas, y una empresa que opera en varias ciudades debe determinar en cuál(es) se entiende realizada cada actividad para saber dónde debe declarar y pagar, evitando doble tributación o el no pago donde correspondía." },
      { q: "¿Qué es la base gravable general del ICA?", a: "Por regla general, los ingresos brutos ordinarios y extraordinarios obtenidos en el respectivo periodo, con las deducciones que expresamente permita la ley y el acuerdo municipal (ej. exportaciones, actividades excluidas, ingresos por venta de activos fijos)." },
      { q: "¿Qué es el avisos y tableros y cómo se relaciona con el ICA?", a: "Es un impuesto complementario al ICA que se liquida como un porcentaje adicional sobre el valor del ICA a cargo, aplicable a quienes tengan avisos, tableros o vallas visibles desde el espacio público; su tarifa y aplicación depende del acuerdo municipal." },
      { q: "¿Qué es el Registro de Información Tributaria (RIT) municipal y para qué sirve?", a: "Es el registro que exige cada municipio (equivalente local al RUT nacional) para identificar a los contribuyentes de ICA que desarrollan actividades en su jurisdicción, requisito previo para poder declarar y pagar correctamente ante esa administración." },
      { q: "¿Qué es la retención de ICA y quién suele estar obligado a practicarla?", a: "Es un anticipo del impuesto municipal que se retiene al momento del pago, generalmente a cargo de grandes contribuyentes, entidades públicas o quienes el acuerdo municipal designe expresamente como agentes retenedores de ICA en esa jurisdicción." }
    ],
    feynman: "Explica por qué una empresa que vende en Bogotá, Medellín y Cali podría tener que declarar ICA en las tres ciudades y no solo donde tiene su oficina principal. Usa un mapa mental simple."
  },
  {
    id: 7,
    nombre: "Régimen Simple de Tributación (RST)",
    semanaFoco: 7,
    fuentes: [
      "E.T., Libro VIII (Régimen Simple de Tributación)",
      "DIAN – cartilla vigente del Régimen Simple"
    ],
    conceptos: [
      { q: "¿Qué es el Régimen Simple de Tributación (RST) y qué busca simplificar?", a: "Es un modelo de tributación opcional que sustituye el impuesto de renta e integra otros tributos (como el ICA consolidado nacional y, en algunos casos, el IVA vía facturación electrónica) en una sola declaración anual con anticipos bimestrales, buscando reducir cargas formales para pequeños y medianos contribuyentes." },
      { q: "¿Qué tipo de contribuyentes pueden acogerse al RST (en términos generales)?", a: "Personas naturales y jurídicas que desarrollen actividades empresariales, cumplan con los topes de ingresos brutos anuales definidos por la ley (que deben verificarse en UVT vigentes), y no estén incursos en las causales de exclusión que señala la norma (ej. ciertas actividades financieras o profesionales excluidas)." },
      { q: "¿Cómo se determina la tarifa del RST?", a: "Depende del grupo de actividad económica en el que se clasifique el contribuyente (ej. comercio, servicios, actividades industriales) y del rango de ingresos brutos anuales, aplicando tablas progresivas que deben consultarse en la norma vigente, ya que han sido modificadas por reformas tributarias." },
      { q: "¿El RST exime del cobro de IVA a quien se inscribe en él?", a: "No necesariamente: pertenecer al RST es independiente de ser o no responsable de IVA. Un contribuyente del RST puede seguir siendo responsable de IVA si realiza hechos generadores gravados, y debe cumplir esa obligación de forma separada según las reglas vigentes." },
      { q: "¿Qué ventaja formal ofrece el RST frente al régimen ordinario en cuanto a retenciones?", a: "Los contribuyentes del RST, en general, no son sujetos de retención en la fuente a título de renta (con algunas excepciones que señala la norma), lo que reduce trámites tanto para ellos como para quienes les pagan, aunque sí deben cumplir con sus anticipos bimestrales." }
    ],
    feynman: "Explícale a un pequeño comerciante, sin usar la palabra 'régimen', qué gana y qué pierde si decide tributar bajo el Simple en vez del sistema ordinario."
  },
  {
    id: 8,
    nombre: "Facturación electrónica y documentos soporte",
    semanaFoco: 8,
    fuentes: [
      "E.T., art. 616-1 y siguientes",
      "Resolución DIAN vigente sobre factura electrónica (verificar número y año, ya que se actualiza periódicamente)"
    ],
    conceptos: [
      { q: "¿Qué es la factura electrónica de venta y qué la diferencia de un PDF de una factura escaneada?", a: "Es un documento electrónico estructurado (formato XML con firma digital) que se genera, valida ante la DIAN y transmite antes o al momento de entregarse al adquiriente; un PDF escaneado no cumple estos requisitos de validación y estructura, por lo que no equivale legalmente a una factura electrónica." },
      { q: "¿Qué es el CUFE y para qué sirve?", a: "Es el Código Único de Factura Electrónica, un identificador único que se genera a partir de los datos de la factura y garantiza su autenticidad e integridad; permite verificar que el documento no ha sido alterado después de emitido." },
      { q: "¿Qué es el documento soporte en adquisiciones a no obligados a facturar?", a: "Es el documento electrónico que debe generar el comprador cuando adquiere bienes o servicios de una persona que no está obligada a expedir factura (ej. ciertos vendedores del régimen simplificado o informal), y que le sirve como soporte de costos, deducciones e impuestos descontables." },
      { q: "¿Por qué la factura electrónica es clave para poder deducir un costo o gasto en renta?", a: "Porque la norma exige, salvo excepciones, que los costos y gastos estén soportados en factura electrónica válida (o el documento equivalente que corresponda) para poder ser deducidos en la declaración de renta o descontados en IVA." },
      { q: "¿Qué es la nota crédito y la nota débito electrónicas y cuándo se usan?", a: "La nota crédito ajusta (disminuye) el valor de una factura ya emitida (ej. por una devolución o un descuento posterior). La nota débito la incrementa (ej. por un cobro adicional o un interés). Ambas deben vincularse electrónicamente a la factura que modifican." }
    ],
    feynman: "Explica a un comerciante que factura a mano por qué la factura electrónica no es solo 'lo mismo pero en computador', usando la idea del CUFE como una 'huella digital' del documento."
  },
  {
    id: 9,
    nombre: "Procedimiento tributario: declaraciones, plazos y sanciones",
    semanaFoco: 9,
    fuentes: [
      "E.T., Libro V (procedimiento tributario, sanciones y estructura de la DIAN)",
      "Calendario tributario anual publicado por la DIAN (verificar fechas del año en curso)"
    ],
    conceptos: [
      { q: "¿Qué es una declaración tributaria y qué efecto tiene el principio de que se presume veraz?", a: "Es el documento mediante el cual el contribuyente informa a la administración sus hechos económicos relevantes para un tributo. Se presume veraz mientras la DIAN no demuestre lo contrario mediante el proceso de fiscalización correspondiente, lo que traslada la carga de la prueba inicial a la administración." },
      { q: "¿Qué es una declaración de corrección y qué diferencia hay entre corregir para aumentar el impuesto y corregir para disminuirlo?", a: "Es la declaración que reemplaza una anterior para ajustar errores. Corregir para aumentar el impuesto a cargo (o disminuir el saldo a favor) generalmente puede hacerse dentro de un plazo amplio y de forma más simple; corregir para disminuir el impuesto (o aumentar el saldo a favor) suele exigir un procedimiento más estricto y plazos más cortos, según la norma vigente." },
      { q: "¿Qué es el requerimiento especial dentro de un proceso de fiscalización?", a: "Es el acto mediante el cual la DIAN le propone formalmente al contribuyente modificar su declaración, explicando los hechos, pruebas y fundamentos de derecho; el contribuyente tiene la oportunidad de responder antes de que la DIAN expida una liquidación oficial." },
      { q: "¿Qué es la sanción por extemporaneidad y por qué es más alta si la DIAN ya emplazó al contribuyente?", a: "Es la sanción que se genera por presentar una declaración después del plazo legal. Suele calcularse como un porcentaje por cada mes o fracción de mes de retraso; la norma generalmente agrava esta sanción cuando el contribuyente presenta la declaración solo después de haber sido requerido o emplazado por la DIAN, en lugar de hacerlo voluntariamente." },
      { q: "¿Qué es el principio de favorabilidad en materia sancionatoria tributaria?", a: "Si después de cometida una infracción la ley cambia y establece una sanción más benigna, se debe aplicar la norma posterior más favorable al contribuyente, incluso en procesos ya en curso, en la parte que aún no esté en firme." },
      { q: "¿Qué es la firmeza de una declaración tributaria?", a: "Es el momento a partir del cual la declaración ya no puede ser cuestionada ni modificada por la DIAN (ni corregida por el contribuyente en ciertos casos), transcurrido el término que la ley establece contado generalmente desde el vencimiento del plazo para declarar o desde la presentación, según el caso." }
    ],
    feynman: "Explica el proceso de fiscalización de la DIAN como una conversación de varios pasos entre dos personas (DIAN y contribuyente), usando una analogía de 'ida y vuelta de cartas' en lugar de tecnicismos jurídicos."
  },
  {
    id: 10,
    nombre: "Relación contabilidad–fiscalidad: NIIF vs. norma fiscal",
    semanaFoco: 10,
    fuentes: [
      "E.T., art. 4 (título IV del Libro I, sistema de renta e integración con NIIF)",
      "Marco técnico normativo NIIF vigente en Colombia (Decretos reglamentarios de la Ley 1314 de 2009)"
    ],
    conceptos: [
      { q: "¿Cuál es la regla general sobre la relación entre las NIIF y la determinación del impuesto de renta en Colombia?", a: "Como regla general, las bases contables bajo NIIF sirven de punto de partida para determinar la renta fiscal, pero cuando el Estatuto Tributario establece un tratamiento distinto (una regla fiscal especial), prevalece esta última sobre el reconocimiento contable, generando ajustes en la conciliación fiscal." },
      { q: "¿Qué es el impuesto diferido y por qué surge?", a: "Es el reconocimiento contable (bajo NIC 12 o la NIIF para pymes, según corresponda) del efecto tributario futuro de las diferencias temporarias entre las bases contables y fiscales de activos y pasivos; refleja que en el futuro se pagará más o menos impuesto por esas diferencias cuando reviertan." },
      { q: "¿Qué es un activo por impuesto diferido y un pasivo por impuesto diferido, en términos simples?", a: "Activo por impuesto diferido: representa un menor impuesto a pagar en el futuro (ej. una pérdida fiscal compensable o un gasto contable ya reconocido pero deducible fiscalmente después). Pasivo por impuesto diferido: representa un mayor impuesto a pagar en el futuro (ej. un ingreso ya reconocido contablemente pero gravable fiscalmente después)." },
      { q: "¿Por qué la depreciación es un ejemplo clásico de diferencia temporaria?", a: "Porque la vida útil y el método de depreciación contable (definidos técnicamente según el uso real del activo) pueden diferir de los límites o métodos que acepta la norma fiscal, generando que el gasto se reconozca en montos o periodos distintos para cada propósito, aunque al final del ciclo de vida del activo el efecto total se iguale." },
      { q: "¿Qué es una diferencia permanente y por qué no genera impuesto diferido?", a: "Es una diferencia entre la base contable y la fiscal que nunca revierte (ej. una multa contablemente reconocida como gasto pero que la ley nunca permite deducir); como no hay reversión futura, no existe un efecto de impuesto por recuperar o pagar después, por lo que no se reconoce impuesto diferido sobre ella." }
    ],
    feynman: "Explica el impuesto diferido usando la analogía de una 'promesa de pago futuro' o una 'cuenta pendiente' con la DIAN, sin usar los términos 'activo' ni 'pasivo' en tu primera explicación."
  },
  {
    id: 11,
    nombre: "Impuesto al patrimonio y otros tributos relevantes",
    semanaFoco: 11,
    fuentes: [
      "Verificar vigencia: el impuesto al patrimonio en Colombia ha sido creado y derogado varias veces mediante reformas; confirmar en la ley vigente si existe, quiénes son sujetos pasivos y cuál es la base gravable",
      "E.T. y leyes de reforma tributaria vigentes – www.dian.gov.co"
    ],
    conceptos: [
      { q: "¿Qué características suele tener un impuesto al patrimonio cuando el legislador lo crea (rasgos conceptuales generales)?", a: "Suele gravar el patrimonio líquido (activos menos pasivos) que supere un umbral determinado, a una fecha de corte específica (ej. 1 de enero de cada año gravable), con tarifas marginales o progresivas, y normalmente se crea con carácter temporal, aunque algunas reformas lo han hecho permanente. Su existencia debe verificarse en la ley vigente." },
      { q: "¿Qué es la normalización tributaria y cuándo suele ofrecerse?", a: "Es un mecanismo excepcional y temporal mediante el cual el Gobierno permite a los contribuyentes incluir en su declaración de renta (o en una declaración especial) activos omitidos o pasivos inexistentes, pagando un impuesto complementario reducido, a cambio de beneficios como la no persecución penal por ese hecho específico; solo existe cuando una ley lo crea expresamente y por un tiempo limitado." },
      { q: "¿Qué es el gravamen a los movimientos financieros (4x1000) y sobre qué operaciones recae?", a: "Es un impuesto que grava las transacciones financieras, principalmente los retiros de cuentas corrientes y de ahorro, cuya tarifa y exenciones (como cierto número de transacciones exentas en una cuenta de ahorros) deben verificarse en la norma vigente." },
      { q: "¿Qué es el impuesto de timbre nacional, en términos generales?", a: "Es un impuesto que recae sobre ciertos documentos o contratos (históricamente aplicado de forma muy limitada en Colombia salvo casos específicos que la ley señale, como algunos contratos con el Estado o de cuantía elevada); su aplicación actual debe verificarse porque ha tenido tarifas del 0% en la mayoría de los casos según las normas recientes." }
    ],
    feynman: "Explica por qué un impuesto 'temporal' como el de normalización tributaria puede seguir apareciendo cada varios años en las reformas, usando la analogía de una amnistía que el Estado ofrece de vez en cuando."
  },
  {
    id: 12,
    nombre: "Integración final: planeación tributaria y casos",
    semanaFoco: 12,
    fuentes: [
      "Repaso integrado de todos los módulos anteriores",
      "Casos prácticos publicados por gremios contables (ej. Consejo Técnico de la Contaduría Pública, colegios de contadores) para contrastar tu razonamiento"
    ],
    conceptos: [
      { q: "¿Qué es la planeación tributaria y en qué se diferencia de la evasión y de la elusión?", a: "Planeación tributaria: usar legítimamente las opciones que la ley ofrece (beneficios, regímenes, momentos de reconocimiento) para optimizar la carga fiscal, dentro del marco legal. Elusión: aprovechar vacíos o interpretaciones forzadas de la norma para evitar el impuesto sin violar la letra de la ley, pero contrariando su propósito (puede ser cuestionada por la DIAN). Evasión: incumplir abiertamente la ley (ocultar ingresos, no declarar), lo cual es ilegal." },
      { q: "¿Por qué es importante analizar de forma integrada renta, IVA, ICA y retenciones al planear una operación, en vez de ver cada impuesto por separado?", a: "Porque una misma operación puede tener efectos simultáneos en varios impuestos (ej. una venta genera IVA, ingreso gravado en renta, base de ICA, y puede estar sujeta a retención), y una decisión que optimiza un impuesto puede generar un costo mayor en otro si no se analiza el efecto conjunto." },
      { q: "¿Qué preguntas clave debes hacerte frente a un caso práctico de tributación antes de dar una respuesta?", a: "¿Qué impuesto(s) están en juego? ¿Cuál es el hecho generador exacto? ¿Quién es el sujeto pasivo y quién el agente retenedor si aplica? ¿La norma que conozco sigue vigente o fue modificada? ¿Necesito verificar una cifra (tarifa, UVT, plazo) en la fuente oficial antes de responder?" },
      { q: "¿Por qué un contador en formación debe evitar memorizar cifras exactas de tarifas y UVT como conocimiento fijo?", a: "Porque esas cifras cambian con frecuencia (cada año se actualiza la UVT, y las reformas tributarias modifican tarifas y topes); memorizarlas sin verificar genera errores profesionales graves. Es más valioso dominar la lógica y el procedimiento, y consultar siempre la cifra vigente al aplicar el caso real." }
    ],
    feynman: "Toma un caso ficticio simple (ej. una persona natural que vende un apartamento y también recibe honorarios) y explica, paso a paso y en voz alta, qué impuestos se activan y por qué, como si estuvieras asesorando a un cliente real."
  }
];
