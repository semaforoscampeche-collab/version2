export type InspectionStatus = 'borrador' | 'finalizado';

export interface InstitutionalConfig {
  dependencia: string;
  direccionUnidad: string;
  domicilio: string;
  telefono: string;
  paginaWeb: string;
  logotipoUrl?: string; // base64 or url
}

export interface InspectionData {
  id: string;
  folioInterno: string;
  status: InspectionStatus;
  createdAt: string;
  updatedAt: string;

  institutionalInfo: InstitutionalConfig;

  // I. DATOS GENERALES
  seccion1: {
    folioInterno: string;
    fechaInspeccion: string;
    horaInspeccion: string;
    solicitante: string;
    ubicacionExacta: string;
    coloniaBarrio: string;
    municipio: string;
    latitud: string;
    longitud: string;
    croquisUbicacionImg?: string; // base64
    croquisUbicacionDesc?: string;
  };

  // II. CLASIFICACIÓN DE LA VIALIDAD
  seccion2: {
    tipoVialidad: string[]; // "Avenida primaria", "Avenida secundaria", "Colectora", "Local", "Carretera urbana", "Zona escolar", "Zona comercial", "Zona hospitalaria"
    tipoVialidadOtro?: string;
    jerarquiaVial: string[]; // "Primaria", "Secundaria", "Colectora", "Local"
  };

  // III. CARACTERÍSTICAS GEOMÉTRICAS
  seccion3: {
    anchoVialidadMetros: string;
    numeroCarriles: string;
    sentidoCirculacion: string; // "Un sentido", "Doble sentido", "Oriente a Poniente", etc.
    camellonCentral: boolean;
    banquetas: boolean;
    anchoBanquetasMetros: string;
    rampas: boolean;
    estadoPavimento: 'bueno' | 'regular' | 'malo' | '';
    pendiente: boolean;
    observaciones: string;
  };

  // IV. DEMANDA PEATONAL
  seccion4: {
    conteo15min: string;
    conteo30min: string;
    conteo60min: string;
    usuarios: {
      escolares: 'baja' | 'media' | 'alta' | '';
      adultosMayores: 'baja' | 'media' | 'alta' | '';
      personasDiscapacidad: 'baja' | 'media' | 'alta' | '';
      trabajadores: 'baja' | 'media' | 'alta' | '';
      transportePublico: 'baja' | 'media' | 'alta' | '';
      comercios: 'baja' | 'media' | 'alta' | '';
    };
    comportamiento: string[];
    observaciones: string;
  };

  // V. TRÁNSITO VEHICULAR
  seccion5: {
    automoviles: string;
    motocicletas: string;
    camiones: string;
    transportePublico: string;
    bicicletas: string;
    velocidadRango: 'menor_30' | 'de_30_a_50' | 'mayor_50' | '';
    velocidadEstimadaKmH: string;
    volumenVehicular: 'bajo' | 'medio' | 'alto' | '';
    observaciones: string;
  };

  // VI. ENTORNO URBANO
  seccion6: {
    generadores: Array<{
      id: string;
      tipo: string;
      existe: boolean;
      distanciaMetros: string;
    }>;
  };

  // VII. SEGURIDAD VIAL
  seccion7: {
    visibilidad: 'excelente' | 'buena' | 'regular' | 'mala' | '';
    iluminacion: 'buena' | 'regular' | 'deficiente' | 'no_existe' | '';
    banquetas: 'continuas' | 'discontinuas' | 'inexistentes' | '';
    rampas: boolean;
    comentarios: string;
  };

  // VIII. EVALUACIÓN TÉCNICA
  seccion8: {
    criterios: Array<{
      id: string;
      criterio: string;
      cumple: boolean | null; // true: Cumple, false: No cumple, null: Sin evaluar
      observaciones: string;
    }>;
  };

  // IX. MEDIDAS COMPLEMENTARIAS
  seccion9: {
    medidas: Array<{
      id: string;
      dispositivo: string;
      aplica: boolean | null;
      observaciones: string;
    }>;
  };

  // X. PROPUESTA TÉCNICA
  seccion10: {
    dictamenOpciones: string[];
    propuestaDetallada: string;
  };

  // XI. CROQUIS DE IMPLEMENTACIÓN
  seccion11: {
    croquisList: Array<{
      id: string;
      url: string; // base64
      titulo: string;
      descripcion: string;
    }>;
  };

  // XII. REGISTRO FOTOGRÁFICO
  seccion12: {
    grupos: Array<{
      id: string;
      nombreVialidad: string;
      fotoNorte?: { url: string; descripcion: string };
      fotoSur?: { url: string; descripcion: string };
      fotoOriente?: { url: string; descripcion: string };
      fotoPoniente?: { url: string; descripcion: string };
      vistaGeneral?: { url: string; descripcion: string };
      detalleSitio?: { url: string; descripcion: string };
    }>;
  };

  // OBSERVACIONES FINALES
  observaciones: {
    texto: string;
  };

  // FIRMA Y RESPONSABLE
  responsable: {
    nombreCompleto: string;
    cargo: string;
    areaAdministrativa: string;
    fechaElaboracion: string;
    firmaUrl?: string; // base64
  };
}

export const DEFAULT_INSTITUTIONAL_CONFIG: InstitutionalConfig = {
  dependencia: "GOBIERNO DEL ESTADO DE CAMPECHE",
  direccionUnidad: "Dirección de Transito y Vialidad",
  domicilio: "Av. Héroes de la salud # 385 por av maestros campechanos y prolongación lázaro cárdenas col. multunchac",
  telefono: "9818119110 ext 80050",
  paginaWeb: "https://www.spsc.campeche.gob.mx/",
};

export const INITIAL_CRITERIA_LIST = [
  { id: 'c1', criterio: 'Demanda peatonal suficiente', cumple: null, observaciones: '' },
  { id: 'c2', criterio: 'Vialidad adecuada', cumple: null, observaciones: '' },
  { id: 'c3', criterio: 'Velocidad compatible', cumple: null, observaciones: '' },
  { id: 'c4', criterio: 'Visibilidad suficiente', cumple: null, observaciones: '' },
  { id: 'c5', criterio: 'Banquetas continuas', cumple: null, observaciones: '' },
  { id: 'c6', criterio: 'Rampas accesibles', cumple: null, observaciones: '' },
  { id: 'c7', criterio: 'Iluminación adecuada', cumple: null, observaciones: '' },
  { id: 'c8', criterio: 'Distancia adecuada entre cruces', cumple: null, observaciones: '' },
  { id: 'c9', criterio: 'No afecta intersecciones', cumple: null, observaciones: '' },
  { id: 'c10', criterio: 'Cumple con el Manual de Señalización', cumple: null, observaciones: '' },
];

export const INITIAL_MEDIDAS_LIST = [
  { id: 'm1', dispositivo: 'Paso tipo cebra', aplica: null, observaciones: '' },
  { id: 'm2', dispositivo: 'Línea de alto', aplica: null, observaciones: '' },
  { id: 'm3', dispositivo: 'Señal preventiva de cruce peatonal (SP-33)', aplica: null, observaciones: '' },
  { id: 'm4', dispositivo: 'Señal restrictiva (SR)', aplica: null, observaciones: '' },
  { id: 'm5', dispositivo: 'Reductor de velocidad (tipo trapecial o trapezoidal)', aplica: null, observaciones: '' },
  { id: 'm6', dispositivo: 'Plataforma peatonal elevada', aplica: null, observaciones: '' },
  { id: 'm7', dispositivo: 'Isla de refugio central', aplica: null, observaciones: '' },
  { id: 'm8', dispositivo: 'Bolardos de protección peatonal', aplica: null, observaciones: '' },
  { id: 'm9', dispositivo: 'Barreras peatonales de encauzamiento', aplica: null, observaciones: '' },
  { id: 'm10', dispositivo: 'Semáforo peatonal', aplica: null, observaciones: '' },
  { id: 'm11', dispositivo: 'Botón peatonal de demanda', aplica: null, observaciones: '' },
  { id: 'm12', dispositivo: 'Iluminación adicional en cruce', aplica: null, observaciones: '' },
  { id: 'm13', dispositivo: 'Guía podotáctil de advertencia', aplica: null, observaciones: '' },
  { id: 'm14', dispositivo: 'Rampas accesibles norma universal', aplica: null, observaciones: '' },
];

export const INITIAL_GENERADORES_LIST = [
  { id: 'g1', tipo: 'Escuela primaria', existe: false, distanciaMetros: '' },
  { id: 'g2', tipo: 'Jardín de niños', existe: false, distanciaMetros: '' },
  { id: 'g3', tipo: 'Universidad / Instituto', existe: false, distanciaMetros: '' },
  { id: 'g4', tipo: 'Hospital', existe: false, distanciaMetros: '' },
  { id: 'g5', tipo: 'Clínica / Centro de Salud', existe: false, distanciaMetros: '' },
  { id: 'g6', tipo: 'Mercado público', existe: false, distanciaMetros: '' },
  { id: 'g7', tipo: 'Parque público / Área recreativa', existe: false, distanciaMetros: '' },
  { id: 'g8', tipo: 'Iglesia / Templo', existe: false, distanciaMetros: '' },
  { id: 'g9', tipo: 'Centro deportivo', existe: false, distanciaMetros: '' },
  { id: 'g10', tipo: 'Centro comercial / Plazas', existe: false, distanciaMetros: '' },
  { id: 'g11', tipo: 'Parada de transporte público', existe: false, distanciaMetros: '' },
  { id: 'g12', tipo: 'Oficina pública / Palacio', existe: false, distanciaMetros: '' },
];

export const INITIAL_INSPECTION: InspectionData = {
  id: '',
  folioInterno: '',
  status: 'borrador',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  institutionalInfo: { ...DEFAULT_INSTITUTIONAL_CONFIG },

  seccion1: {
    folioInterno: '',
    fechaInspeccion: new Date().toISOString().split('T')[0],
    horaInspeccion: '10:00',
    solicitante: '',
    ubicacionExacta: '',
    coloniaBarrio: '',
    municipio: 'San Francisco de Campeche',
    latitud: '19.8438',
    longitud: '-90.5255',
  },

  seccion2: {
    tipoVialidad: ['Avenida secundaria'],
    jerarquiaVial: ['Secundaria'],
  },

  seccion3: {
    anchoVialidadMetros: '9.50',
    numeroCarriles: '2',
    sentidoCirculacion: 'Doble sentido',
    camellonCentral: false,
    banquetas: true,
    anchoBanquetasMetros: '1.80',
    rampas: true,
    estadoPavimento: 'regular',
    pendiente: false,
    observaciones: '',
  },

  seccion4: {
    conteo15min: '24',
    conteo30min: '52',
    conteo60min: '98',
    usuarios: {
      escolares: 'alta',
      adultosMayores: 'media',
      personasDiscapacidad: 'baja',
      trabajadores: 'media',
      transportePublico: 'alta',
      comercios: 'media',
    },
    comportamiento: ['Cruzan individualmente', 'Esperan mucho tiempo para cruzar'],
    observaciones: '',
  },

  seccion5: {
    automoviles: '185',
    motocicletas: '72',
    camiones: '14',
    transportePublico: '38',
    bicicletas: '16',
    velocidadRango: 'de_30_a_50',
    velocidadEstimadaKmH: '48',
    volumenVehicular: 'medio',
    observaciones: '',
  },

  seccion6: {
    generadores: INITIAL_GENERADORES_LIST.map(g => ({ ...g })),
  },

  seccion7: {
    visibilidad: 'buena',
    iluminacion: 'regular',
    banquetas: 'continuas',
    rampas: true,
    comentarios: '',
  },

  seccion8: {
    criterios: INITIAL_CRITERIA_LIST.map(c => ({ ...c })),
  },

  seccion9: {
    medidas: INITIAL_MEDIDAS_LIST.map(m => ({ ...m })),
  },

  seccion10: {
    dictamenOpciones: ['Procede paso peatonal con reductores de velocidad', 'Procede con señalética'],
    propuestaDetallada: '',
  },

  seccion11: {
    croquisList: [],
  },

  seccion12: {
    grupos: [
      {
        id: 'grupo-1',
        nombreVialidad: 'Vialidad Principal de Inspección',
      },
    ],
  },

  observaciones: {
    texto: '',
  },

  responsable: {
    nombreCompleto: 'Pablo Ernesto Garrido Vera',
    cargo: 'Encargado Balizamiento y Semaforizacion',
    areaAdministrativa: 'Dirección de Transito y Vialidad',
    fechaElaboracion: new Date().toISOString().split('T')[0],
  },
};
