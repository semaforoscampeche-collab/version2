import { InspectionData, INITIAL_CRITERIA_LIST, INITIAL_MEDIDAS_LIST, INITIAL_GENERADORES_LIST, DEFAULT_INSTITUTIONAL_CONFIG } from '../types/inspection';

// High-resolution SVG placeholders encoded as clean data URLs for immediate realistic testing
const sampleSketchSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23f8fafc"><rect width="600" height="400" fill="%23e2e8f0"/><rect x="80" y="140" width="440" height="120" fill="%23334155"/><line x1="80" y1="200" x2="520" y2="200" stroke="%23fbbf24" stroke-width="4" stroke-dasharray="16,12"/><rect x="220" y="140" width="80" height="120" fill="%23ffffff" fill-opacity="0.85"/><line x1="230" y1="140" x2="230" y2="260" stroke="%23334155" stroke-width="8"/><line x1="250" y1="140" x2="250" y2="260" stroke="%23334155" stroke-width="8"/><line x1="270" y1="140" x2="270" y2="260" stroke="%23334155" stroke-width="8"/><line x1="290" y1="140" x2="290" y2="260" stroke="%23334155" stroke-width="8"/><rect x="80" y="100" width="440" height="40" fill="%2394a3b8"/><rect x="80" y="260" width="440" height="40" fill="%2394a3b8"/><text x="300" y="60" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23691c32" text-anchor="middle">CROQUIS DE LOCALIZACIÓN Y PROPUESTA VIAL</text><text x="300" y="85" font-family="sans-serif" font-size="12" fill="%23475569" text-anchor="middle">Av. Adolfo Ruiz Cortines x Calle 53</text><text x="160" y="225" font-family="sans-serif" font-size="14" fill="%23ffffff">Sentido E → O</text><text x="260" y="130" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23b91c1c" text-anchor="middle">PASO PEATONAL</text><circle cx="260" cy="90" r="14" fill="%23ef4444"/><text x="260" y="95" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23ffffff" text-anchor="middle">SP-33</text></svg>`;

const samplePhotoNorte = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450" fill="%23f1f5f9"><rect width="600" height="450" fill="%23cbd5e1"/><rect x="150" y="220" width="300" height="230" fill="%23475569"/><polygon points="200,220 400,220 550,450 50,450" fill="%23334155"/><line x1="300" y1="220" x2="300" y2="450" stroke="%23fbbf24" stroke-width="6" stroke-dasharray="14,10"/><rect x="40" y="220" width="120" height="230" fill="%2394a3b8"/><rect x="440" y="220" width="120" height="230" fill="%2394a3b8"/><rect x="60" y="100" width="160" height="120" fill="%2364748b"/><text x="300" y="50" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23691c32" text-anchor="middle">FOTOGRAFÍA VIAL - VISTA NORTE</text><text x="300" y="80" font-family="sans-serif" font-size="13" fill="%23334155" text-anchor="middle">Aproximación hacia cruce escolar y zona peatonal</text></svg>`;

const samplePhotoSur = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450" fill="%23f1f5f9"><rect width="600" height="450" fill="%23cbd5e1"/><polygon points="220,200 380,200 560,450 40,450" fill="%23334155"/><line x1="300" y1="200" x2="300" y2="450" stroke="%23fbbf24" stroke-width="6" stroke-dasharray="14,10"/><text x="300" y="50" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23691c32" text-anchor="middle">FOTOGRAFÍA VIAL - VISTA SUR</text><text x="300" y="80" font-family="sans-serif" font-size="13" fill="%23334155" text-anchor="middle">Perspectiva hacia entronque semaforizado posterior</text></svg>`;

const samplePhotoGeneral = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450" fill="%23f1f5f9"><rect width="600" height="450" fill="%23e2e8f0"/><rect x="0" y="240" width="600" height="210" fill="%231e293b"/><line x1="0" y1="345" x2="600" y2="345" stroke="%23ffffff" stroke-width="5" stroke-dasharray="20,15"/><text x="300" y="50" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23691c32" text-anchor="middle">VISTA GENERAL PANORÁMICA DEL SITIO</text><text x="300" y="80" font-family="sans-serif" font-size="13" fill="%23334155" text-anchor="middle">Intersección vial con afluencia comercial y educativa</text></svg>`;

export const SAMPLE_INSPECTION_DATA: InspectionData = {
  id: 'insp-sample-2026-06',
  folioInterno: 'DTV-BS-PP-IPP-06/2026',
  status: 'finalizado',
  createdAt: '2026-10-15T09:30:00Z',
  updatedAt: '2026-10-20T14:45:00Z',

  institutionalInfo: { ...DEFAULT_INSTITUTIONAL_CONFIG },

  seccion1: {
    folioInterno: 'DTV-BS-PP-IPP-06/2026',
    fechaInspeccion: '2026-10-18',
    horaInspeccion: '08:30',
    solicitante: 'Dirección de la Escuela Primaria "Benito Juárez García" y Asociación de Padres de Familia',
    ubicacionExacta: 'Av. Adolfo Ruiz Cortines entre Calle 53 y Calle 55',
    coloniaBarrio: 'Barrio de San Román',
    municipio: 'San Francisco de Campeche',
    latitud: '19.845210',
    longitud: '-90.536850',
    croquisUbicacionImg: sampleSketchSvg,
    croquisUbicacionDesc: 'Croquis de localización geográfica con señalamiento horizontal proyectado y radios de giro.',
  },

  seccion2: {
    tipoVialidad: ['Avenida secundaria', 'Zona escolar', 'Zona comercial'],
    jerarquiaVial: ['Secundaria'],
  },

  seccion3: {
    anchoVialidadMetros: '10.50',
    numeroCarriles: '2',
    sentidoCirculacion: 'Doble sentido de circulación (Norte-Sur y Sur-Norte)',
    camellonCentral: false,
    banquetas: true,
    anchoBanquetasMetros: '2.10',
    rampas: true,
    estadoPavimento: 'regular',
    pendiente: false,
    observaciones: 'El arroyo vehicular cuenta con carpeta asfáltica en condiciones regulares con desgaste superficial en el carril derecho. Las banquetas presentan desniveles menores por raíces de árboles pero cuentan con ancho libre de circulación.',
  },

  seccion4: {
    conteo15min: '48',
    conteo30min: '112',
    conteo60min: '215',
    usuarios: {
      escolares: 'alta',
      adultosMayores: 'media',
      personasDiscapacidad: 'baja',
      trabajadores: 'alta',
      transportePublico: 'alta',
      comercios: 'media',
    },
    comportamiento: [
      'Cruzan en grupo',
      'Cruzan fuera de un cruce señalizado',
      'Esperan mucho tiempo para cruzar',
      'Cruzan corriendo',
    ],
    observaciones: 'Se observa alta concentración de alumnos, padres de familia y usuarios de transporte público durante los horarios pico de entrada (07:30 a 08:30 hrs) y salida escolar (12:30 a 13:30 hrs). Debido a la falta de cruce demarcado y reductores, los peatones deben esperar prolongadamente entre brechas vehiculares.',
  },

  seccion5: {
    automoviles: '340',
    motocicletas: '115',
    camiones: '18',
    transportePublico: '55',
    bicicletas: '22',
    velocidadRango: 'de_30_a_50',
    velocidadEstimadaKmH: '46',
    volumenVehicular: 'medio',
    observaciones: 'Se registra flujo constante de vehículos ligeros y transporte colectivo (microbuses y taxis). La velocidad observada rebasa el límite permitido para zona escolar (30 km/h), registrándose picos de hasta 52 km/h fuera del horario de timbrado.',
  },

  seccion6: {
    generadores: INITIAL_GENERADORES_LIST.map(g => {
      if (g.id === 'g1') return { ...g, existe: true, distanciaMetros: '15' };
      if (g.id === 'g2') return { ...g, existe: true, distanciaMetros: '85' };
      if (g.id === 'g6') return { ...g, existe: true, distanciaMetros: '180' };
      if (g.id === 'g11') return { ...g, existe: true, distanciaMetros: '25' };
      if (g.id === 'g8') return { ...g, existe: true, distanciaMetros: '120' };
      return { ...g, existe: false, distanciaMetros: '' };
    }),
  },

  seccion7: {
    visibilidad: 'buena',
    iluminacion: 'buena',
    banquetas: 'continuas',
    rampas: true,
    comentarios: 'El tramo es recto con adecuada visibilidad a más de 80 metros. El alumbrado público tipo LED proporciona cobertura nocturna satisfactoria. Existen rampas de banqueta pero carecen de franjas podotáctiles normalizadas.',
  },

  seccion8: {
    criterios: [
      { id: 'c1', criterio: 'Demanda peatonal suficiente', cumple: true, observaciones: 'Aforo superior a 200 peatones/hora en horario de máxima demanda escolar.' },
      { id: 'c2', criterio: 'Vialidad adecuada', cumple: true, observaciones: 'Geometría y sección transversal apta para la intervención.' },
      { id: 'c3', criterio: 'Velocidad compatible', cumple: false, observaciones: 'Velocidades operativas incompatibles con entorno escolar sin moderador.' },
      { id: 'c4', criterio: 'Visibilidad suficiente', cumple: true, observaciones: 'Línea de visión despejada sin obstáculos visuales mayores.' },
      { id: 'c5', criterio: 'Banquetas continuas', cumple: true, observaciones: 'Banquetas existentes continuas a ambos márgenes viales.' },
      { id: 'c6', criterio: 'Rampas accesibles', cumple: true, observaciones: 'Existen rampas peatonales en las esquinas.' },
      { id: 'c7', criterio: 'Iluminación adecuada', cumple: true, observaciones: 'Postes de luminarias LED funcionales sobre el margen oriente.' },
      { id: 'c8', criterio: 'Distancia adecuada entre cruces', cumple: true, observaciones: 'Distancia mayor a 180 metros respecto al cruce semaforizado más cercano.' },
      { id: 'c9', criterio: 'No afecta intersecciones', cumple: true, observaciones: 'La ubicación no interfiere con áreas de conflicto de giro.' },
      { id: 'c10', criterio: 'Cumple con el Manual de Señalización', cumple: true, observaciones: 'Alineado a las especificaciones de la NOM-034-SCT2/SEDATU vigente.' },
    ],
  },

  seccion9: {
    medidas: [
      { id: 'm1', dispositivo: 'Paso tipo cebra', aplica: true, observaciones: 'Franjas de pintura termoplástica blanca de 40 cm con microesferas de vidrio.' },
      { id: 'm2', dispositivo: 'Línea de alto', aplica: true, observaciones: 'Línea de parada de 40 cm a 1.50 m antes del cruce peatonal.' },
      { id: 'm3', dispositivo: 'Señal preventiva de cruce peatonal (SP-33)', aplica: true, observaciones: 'Instalar dos señales preventivas a 50 metros del cruce en ambos sentidos.' },
      { id: 'm4', dispositivo: 'Señal restrictiva (SR)', aplica: true, observaciones: 'Señal SR-9 (Velocidad máxima 30 km/h en zona escolar).' },
      { id: 'm5', dispositivo: 'Reductor de velocidad (tipo trapecial o trapezoidal)', aplica: true, observaciones: 'Reductor de velocidad tipo trapecial con pendiente suave conforme a norma.' },
      { id: 'm6', dispositivo: 'Plataforma peatonal elevada', aplica: false, observaciones: 'No requerida; se opta por reductor normalizado previo a cebra.' },
      { id: 'm7', dispositivo: 'Isla de refugio central', aplica: false, observaciones: 'El ancho de 10.50 m con 2 carriles no amerita camellón o isla.' },
      { id: 'm8', dispositivo: 'Bolardos de protección peatonal', aplica: true, observaciones: 'Colocar 6 bolardos metálicos en las esquinas para resguardar la espera de escolares.' },
      { id: 'm9', dispositivo: 'Barreras peatonales de encauzamiento', aplica: false, observaciones: 'No aplica en este frente escolar.' },
      { id: 'm10', dispositivo: 'Semáforo peatonal', aplica: false, observaciones: 'Flujo vehicular no rebasa volumen para semaforización.' },
      { id: 'm11', dispositivo: 'Botón peatonal de demanda', aplica: false, observaciones: 'No aplica sin semáforo.' },
      { id: 'm12', dispositivo: 'Iluminación adicional en cruce', aplica: true, observaciones: 'Instalación de luminaria adicional focalizada en el punto de cruce.' },
      { id: 'm13', dispositivo: 'Guía podotáctil de advertencia', aplica: true, observaciones: 'Instalar placa de botones podotáctiles en rampas.' },
      { id: 'm14', dispositivo: 'Rampas accesibles norma universal', aplica: true, observaciones: 'Adecuación de pendiente al 6% en rampas existentes.' },
    ],
  },

  seccion10: {
    dictamenOpciones: [
      'Procede paso peatonal con reductores de velocidad',
      'Procede con señalética',
    ],
    propuestaDetallada: 'Con base en los estudios de campo, aforos peatonales y vehiculares, se dictamina PROCEDENTE la implementación de un paso peatonal a nivel de calzada tipo cebra (ancho de franjas 0.40 m, separación 0.40 m, longitud 4.00 m) complementado con dos reductores de velocidad tipo trapecial ubicados a 20 metros previos al cruce en ambos sentidos de circulación. Asimismo, se ordena la instalación de señalamiento vertical SP-33 (Zona Escolar / Cruce de Peatones) complementado con señal restrictiva SR-9 (30 km/h) y balizamiento de línea de alto reglamentaria a 1.50 metros.',
  },

  seccion11: {
    croquisList: [
      {
        id: 'croquis-1',
        url: sampleSketchSvg,
        titulo: 'Esquema de Señalización Horizontal y Vertical Proyectada',
        descripcion: 'Plano de distribución de franjas cebra, reductores de velocidad, línea de alto y ubicación de postes para señales verticales SP-33 y SR-9.',
      },
    ],
  },

  seccion12: {
    grupos: [
      {
        id: 'grupo-1',
        nombreVialidad: 'Av. Adolfo Ruiz Cortines frente a Escuela Primaria',
        fotoNorte: {
          url: samplePhotoNorte,
          descripcion: 'Aproximación vehicular sentido Norte hacia el punto propuesto de cruce escolar.',
        },
        fotoSur: {
          url: samplePhotoSur,
          descripcion: 'Perspectiva sentido Sur mostrando flujo y distancia al entronque posterior.',
        },
        fotoOriente: {
          url: samplePhotoGeneral,
          descripcion: 'Margen oriente donde se ubican la puerta escolar y la parada de transporte público.',
        },
        fotoPoniente: {
          url: samplePhotoNorte,
          descripcion: 'Margen poniente donde se concentran comercios de abarrotes y papelerías.',
        },
        vistaGeneral: {
          url: samplePhotoGeneral,
          descripcion: 'Vista general panorámica de la zona de intervención.',
        },
        detalleSitio: {
          url: samplePhotoNorte,
          descripcion: 'Detalle de la banqueta y estado de la rampa peatonal actual.',
        },
      },
    ],
  },

  observaciones: {
    texto: `I. CONDICIONES FÍSICAS Y OPERATIVAS OBSERVADAS:
Durante la inspección de campo realizada el día 18 de octubre de 2026 a las 08:30 horas en Av. Adolfo Ruiz Cortines entre Calle 53 y Calle 55, Barrio de San Román, Municipio de San Francisco de Campeche, se constató una sección transversal de 10.50 metros de ancho de calzada con 2 carriles en doble sentido de circulación, contando con banquetas peatonales de 2.10 metros a ambos costados.

II. DINÁMICA PEATONAL Y TRÁNSITO VEHICULAR:
Se contabilizó un aforo de 215 peatones en periodo de 60 minutos con demanda predominantemente alta de escolares, padres de familia y usuarios de transporte público. El tránsito vehicular alcanzó 550 vehículos/hora con velocidades operativas promedio de 46 km/h, superando el estándar de seguridad vial de 30 km/h requerido para entornos escolares. Los peatones se ven forzados a cruzar en grupos con esperas prolongadas debido a la falta de señalamiento y dispositivos moderadores de velocidad.

III. ENTORNO URBANO Y ELEMENTOS GENERADORES:
Se constató la presencia inmediata de la Escuela Primaria a 15 metros, un Jardín de Niños a 85 metros y una parada de transporte público a 25 metros del punto inspeccionado, generando puntos críticos de conflicto vial-peatonal.

IV. DICTAMEN TÉCNICO Y MEDIDAS RECOMENDADAS:
Por lo anteriormente expuesto y con fundamento en los criterios técnicos de seguridad vial, se dictamina PROCEDENTE la implementación del paso peatonal tipo cebra, la instalación de reductores de velocidad normalizados, línea de alto y señalamiento preventivo SP-33 y restrictivo SR-9 (30 km/h), salvaguardando la integridad física de la comunidad escolar y peatones en general.`,
  },

  responsable: {
    nombreCompleto: 'Pablo Ernesto Garrido Vera',
    cargo: 'Encargado Balizamiento y Semaforizacion',
    areaAdministrativa: 'Dirección de Transito y Vialidad',
    fechaElaboracion: '2026-10-20',
  },
};
