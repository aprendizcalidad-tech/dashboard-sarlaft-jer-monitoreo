/*
 * CONFIGURACIÓN DEL DASHBOARD
 * Después de desplegar Apps Script con la validación Firebase, pega su URL terminada en /exec en scriptUrl. El acceso a datos se envía por POST, no por JSONP.
 */
const JER_CONFIG = {
  scriptUrl: 'https://script.google.com/macros/s/AKfycbwLA-H_wxTrsTGQOfkI8dIqR-CD7uLDpxXjMxMcyk1wQlhGfafWSg79jSXQtq3BQv7jeg/exec',
  defaultMonth: 'ALL',
  detailRowsPerPage: 10,

  reportSequence: [
    { type: 'cover' },
    { type: 'activities' },

    { type: 'metric', title: 'MONITOREO DE GIROS BOYACÁ', metrics: [
      { title: 'CANTIDAD DE GIROS ENVIADOS', sheet: 'N. GIROS ENV BOY' },
      { title: 'GIROS ENVIADOS POR PERSONA', sheet: 'N. P GIROS ENV. BOY' }
    ]},
    { type: 'metric', title: 'MONITOREO DE GIROS BOYACÁ', metrics: [
      { title: 'MONTOS DE GIROS ENVIADOS', sheet: 'TOTALES GIROS ENV. BOY' },
      { title: 'CANTIDAD DE GIROS PAGADOS', sheet: 'N. GIROS PAG. BOY' }
    ]},
    { type: 'metric', title: 'MONITOREO DE GIROS BOYACÁ', metrics: [
      { title: 'GIROS PAGADOS POR PERSONA', sheet: 'N. PER GIROS PAG. BOY' },
      { title: 'MONTO DE GIROS PAGADOS', sheet: 'TOTAL GIROS PAG. BOY' }
    ]},
    { type: 'narrative', title: 'MONITOREO DE TRANSACCIONES DE GIROS BOYACÁ', text: 'Durante el período evaluado, el sistema de monitoreo transaccional evaluó el 100% de las operaciones del departamento de Boyacá. presentando un comportamiento operativo estable y alineado con las políticas de prevención de lavado de activos y financiación del terrorismo (SARLAFT) de la organización. Tras el análisis de las alertas generadas por el sistema de monitoreo automatizado y las revisiones manuales correspondientes, se concluye que la operación en Boyacá se encuentra dentro de los límites de tolerancia al riesgo establecidos por la organización. No se identificaron tipologías de fraude masivo, pitufeo (estructuración) descontrolado o redes de captación ilegal en la región.' },

    { type: 'metric', title: 'MONITOREO DE GIROS AMAZONAS', metrics: [
      { title: 'CANTIDAD DE GIROS ENVIADOS', sheet: ' N. GIROS ENV AMZ' },
      { title: 'GIROS ENVIADOS POR PERSONA', sheet: 'N. P GIROS ENV. AMZ' }
    ]},
    { type: 'metric', title: 'MONITOREO DE GIROS AMAZONAS', metrics: [
      { title: 'MONTOS DE GIROS ENVIADOS', sheet: 'TOTALES GIROS ENV. AMZ' },
      { title: 'CANTIDAD DE GIROS PAGADOS', sheet: 'N. GIROS PAG. AMZ' }
    ]},
    { type: 'metric', title: 'MONITOREO DE GIROS AMAZONAS', metrics: [
      { title: 'GIROS PAGADOS POR PERSONA', sheet: 'N. PER GIROS PAG. AMZ' },
      { title: 'MONTO DE GIROS PAGADOS', sheet: 'TOTAL GIROS PAG. AMZ' }
    ]},
    { type: 'narrative', title: 'MONITOREO DE TRANSACCIONES DE GIROS AMAZONAS', text: 'Durante el período evaluado, el sistema de monitoreo transaccional evaluó el 100% de las operaciones del departamento de Amazonas el servicio de giros postales presentó un comportamiento operativo estable, seguro y alineado con las políticas del Sistema de Administración del Riesgo de Lavado de Activos y Financiación del Terrorismo (SARLAFT). A pesar de ser una zona de frontera con dinámicas comerciales particulares, las alertas automatizadas y los controles de debida diligencia aplicados en los puntos de atención demuestran que la operación en Amazonas se encuentra dentro de los límites de tolerancia al riesgo establecidos por la organización. No se detectaron patrones de estructuración transfronteriza, flujos atípicos de efectivo ni sospechas de financiación de actividades ilícitas.' },

    { type: 'metric', title: 'MONITOREO BETPLAY BOYACÁ', metrics: [
      { title: 'CANTIDAD DE RECARGAS', sheet: 'CANT RECARGAS BETPLAY BOY' },
      { title: 'RECARGAS POR PERSONA', sheet: 'N PERSONAS RECARGAS BOY' }
    ]},
    { type: 'metric', title: 'MONITOREO BETPLAY BOYACÁ', metrics: [
      { title: 'MONTOS DE RECARGAS', sheet: 'MONTOS RECARGAS BOY' },
      { title: 'CANTIDAD DE RETIROS BETPLAY', sheet: 'CANT RETIROS BETPLAY BOY' }
    ]},
    { type: 'metric', title: 'MONITOREO BETPLAY BOYACÁ', metrics: [
      { title: 'RETIROS POR PERSONA', sheet: 'N PERSONAS RETIROS BOY' },
      { title: 'MONTO DE RETIROS', sheet: 'MONTOS RETIROS BOY' }
    ]},
    { type: 'narrative', title: 'MONITOREO DE TRANSACCIONES DE BETPLAY BOYACÁ', text: 'Se realizó monitoreo de recargas y retiros de Betplay, acorde con la politica de monitoreo transaccional establecida por la organización, se generó alerta vía correo electronico a corredor empresarial para clientes con recargas o retiros por montos superiores a 40 millones de pesos por persona, con el fin de que se efectue análisis detallado de las apuestas y de ser el caso se realice el bloqueo del usuario. para usuarios internos se solicito a los gestores de zona indagar el motivo de recargas frecuentes de los colocadores y colaboradores de nómina con el fin de recordarles las implicaciones de prestar su nombre para realizar este tipo de apuestas, así como efectuar indagación acerca del origen de los fondos con los que realizan las recargas.' },

    { type: 'metric', title: 'MONITOREO BETPLAY AMAZONAS', metrics: [
      { title: 'CANTIDAD DE RECARGAS', sheet: 'CANT RECARGAS BETPLAY AMZ' },
      { title: 'RECARGAS POR PERSONA', sheet: 'N PERSONAS RECARGAS AMZ' }
    ]},
    { type: 'metric', title: 'MONITOREO BETPLAY AMAZONAS', metrics: [
      { title: 'MONTOS DE RECARGAS', sheet: 'MONTOS RECARGAS AMZ' },
      { title: 'CANTIDAD DE RETIROS BETPLAY', sheet: 'CANT RETIROS BETPLAY AMZ' }
    ]},
    { type: 'metric', title: 'MONITOREO BETPLAY AMAZONAS', metrics: [
      { title: 'RETIROS POR PERSONA', sheet: 'N PERSONAS RETIROS AMZ' },
      { title: 'MONTO DE RETIROS', sheet: 'MONTOS RETIROS AMZ' }
    ]},
    { type: 'narrative', title: 'MONITOREO DE TRANSACCIONES DE BETPLAY AMAZONAS', text: 'Se realizó monitoreo de recargas y retiros de Betplay, acorde con la politica de monitoreo transaccional establecida por la organización, se generó alerta vía correo electronico a corredor empresarial para clientes con recargas o retiros por montos superiores a 40 millones de pesos por persona, con el fin de que se efectue análisis detallado de las apuestas y de ser el caso se realice el bloqueo del usuario. para usuarios internos se solicito a los gestores de zona indagar el motivo de recargas frecuentes de los colocadores y colaboradores de nómina con el fin de recordarles las implicaciones de prestar su nombre para realizar este tipo de apuestas, así como efectuar indagación acerca del origen de los fondos con los que realizan las recargas.' },
    { type: 'metric', title: 'MONITOREO DE PREMIOS BOYACÁ', metrics: [
      { title: 'CANTIDAD DE PREMIOS CHANCE', sheet: 'CANT PREMIOS CHANCE BOY' },
      { title: 'PREMIOS CHANCE POR PERSONA', sheet: 'N. PERSONAS PREMIOS CHANCE BOY' }
    ]},
    { type: 'metric', title: 'MONITOREO DE PREMIOS BOYACÁ', metrics: [
      { title: 'MONTOS DE PREMIOS CHANCE PAGADOS', sheet: ' MONTOS TOTALES PREMIOS CHANCE ' },
      { title: 'CANTIDAD DE PREMIOS INSTANTÁNEAS PAGADOS', sheet: 'CANT. INSTANT-BOY' }
    ]},
    { type: 'metric', title: 'MONITOREO DE PREMIOS BOYACÁ', metrics: [
      { title: 'PREMIOS INSTANTÁNEAS POR PERSONA', sheet: 'N. PERSONAS INSTANT BOY.' },
      { title: 'MONTO DE PREMIOS INSTANTÁNEAS', sheet: 'MONTOS INSTANT. BOY' }
    ]},
    { type: 'narrative', title: 'MONITOREO PAGO DE PREMIOS BOYACÁ', text: `Como medida de prevención, se solicitó a los Gestores de zona, recordar a la fuerza de venta, las implicaciones legales y tributarias que puede tener el “prestar el nombre” para el cobro de premios.
      
      En cuanto a clientes externos ganadores de premios y que se ajustaron a la politica de monitoreo transaccional se pudo determinar que fueron ganadores de premios superiores a 5 millones de pesos y fueron validados por el área de auditoría de manera previa al pago, sin novedades. Así mismo se solicito indagación prudente en campo por parte de gestores de zona.
      
      Clientes ganadores INTERNOS: Se tiene en cuenta la estrategia comercial de los vendedores de chance, de cobro de premios de clientes frecuentes, como medida de fidelización de clientes.
      
      teniendo en cuenta que las transacciones analizadas se encuentran dentro del rango de normalidad establecido por JER S.A. no se generan alertas por operaciones inusuales o sospechosas.` },
    { type: 'metric', title: 'MONITOREO DE PREMIOS AMAZONAS', metrics: [
      { title: 'CANTIDAD DE PREMIOS CHANCE', sheet: 'CANT PREMIOS CHANCE AMZ' },
      { title: 'PREMIOS CHANCE POR PERSONA', sheet: 'N. PERSONAS PREMIOS CHANCE AMZ' }
    ]},
    { type: 'metric', title: 'MONITOREO DE PREMIOS AMAZONAS', metrics: [
      { title: 'MONTOS DE PREMIOS CHANCE PAGADOS', sheet: 'MONTOS TOTALES PREMIOS CHANCE A' },
      { title: 'CANTIDAD DE PREMIOS INSTANTÁNEAS PAGADOS', sheet: 'CANT. INSTANT AMZ' }
    ]},
    { type: 'metric', title: 'MONITOREO DE PREMIOS AMAZONAS', metrics: [
      { title: 'PREMIOS INSTANTÁNEAS POR PERSONA', sheet: 'N. PERSONAS INSTANT AMZ.' },
      { title: 'MONTO DE PREMIOS INSTANTÁNEAS', sheet: 'MONTOS INSTANT. AMZ' }
    ]},
    { type: 'narrative', title: 'MONITOREO PAGO DE PREMIOS AMAZONAS', text: `Como medida de prevención, se solicitó a la Gestora de zona, recordar a la fuerza de venta, las implicaciones legales y tributarias que puede tener el “prestar el nombre” para el cobro de premios.
      
      Ningún cliente externo se ajustó a la politica de monitoreo transaccional. Clientes ganadores EXTERNOS: Se continua con el seguimiento y monitoreo para el cobro de premios por parte de clientes EXTERNOS, incluyendo la verificación diaria, por parte de auditoría, de premiación mayor de cinco millones.
      
      Clientes ganadores INTERNOS: Se tiene en cuenta la estrategia comercial de los vendedores de chance, de cobro de premios de clientes frecuentes, como medida de fidelización de clientes.
      
      teniendo en cuenta que las transacciones analizadas se encuentran dentro del rango de normalidad establecido por JER S.A. no se generan alertas por operaciones inusuales o sospechosas.` },
    { type: 'pairedTables', title: 'OPERACIONES INUSUALES · OPERACIONES SOSPECHOSAS', cards: [
      { title: 'REPORTES ROS', sheet: 'ROS' }, { title: 'OPERACIONES INUSUALES DE GIROS', sheet: 'ROI' }
    ]},
    { type: 'cnjsa', title: 'REPORTE A ENTES DE CONTROL', sheet: 'CNJSA' },
    { type: 'dueDiligence', title: 'DEBIDA DILIGENCIA EN LA VERIFICACIÓN DE TERCEROS', sheet: 'DEBIDA DILIGENCIA' },
    { type: 'metric', title: 'DEBIDA DILIGENCIA EN LA VERIFICACIÓN DE TERCEROS', metrics: [
      { title: 'PEP Y EXTRANJEROS', sheet: 'PEP EXT', displayIndices: [1, 2, 3], primaryIndex: 2, secondaryIndex: 3 }
    ]},
    { type: 'trainingDashboard', title: 'CAPACITACIONES E INDUCCIONES', capSheet: 'CAPACITACIONES', inductionSheet: 'INDUCCIONES' },
    { type: 'detail', title: 'FORMACIÓN Y ACTUALIZACIÓN DE COMPETENCIAS', sheet: 'formacion oc', tableTitle: 'FORMACIÓN OFICIAL DE CUMPLIMIENTO' },
    { type: 'detailPair', title: 'FORMACIÓN Y ACTUALIZACIÓN DE COMPETENCIAS', sheets: [
      { sheet: 'CAPACITACIONES JER', title: 'CAPACITACIONES JER' }
    ]},
    { type: 'detail', title: 'OTRAS ACTIVIDADES', sheet: 'otras act', tableTitle: 'OTRAS ACTIVIDADES' },
    { type: 'detail', title: 'REUNIONES', sheet: 'REUNIONES', tableTitle: 'REUNIONES' },
    { type: 'closing' }
  ],

  activities: [
    'Monitoreo de transacciones de giros, cobro de premios de chance e instantáneas, recargas y retiros de Betplay.',
    'Reportes mensuales a Entes de control.',
    'Debida diligencia en la verificación de terceros.',
    'Plan de capacitación e inducción en la prevención del LA/FT-PADM.',
    'Formación y actualización de competencias.',
    'Otras actividades.',
    'Reuniones.'
  ]
};
