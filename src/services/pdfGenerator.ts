import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InspectionData } from '../types/inspection';

const BURGUNDY: [number, number, number] = [105, 28, 50]; // #691C32 Institutional Burgundy
const DARK_GRAY: [number, number, number] = [51, 65, 85]; // #334155
const LIGHT_BG: [number, number, number] = [248, 250, 252]; // #F8FAFC
const BORDER_GRAY: [number, number, number] = [203, 213, 225]; // #CBD5E1
const TEXT_DARK: [number, number, number] = [30, 41, 59];

function cleanTextForFilename(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function getTableFinalY(docInstance: any, defaultY: number): number {
  return typeof docInstance.lastAutoTable?.finalY === 'number'
    ? docInstance.lastAutoTable.finalY
    : defaultY;
}

async function resolveImageForPdf(src?: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('data:image/')) return src;
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || src);
      reader.onerror = () => resolve(src);
      reader.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

export async function generateInspectionPDF(rawData: InspectionData): Promise<void> {
  // Pre-cargar y convertir rutas locales (/uploads/...) a dataURL para jsPDF
  const data: InspectionData = JSON.parse(JSON.stringify(rawData));
  if (data.seccion1?.croquisUbicacionImg) {
    data.seccion1.croquisUbicacionImg = await resolveImageForPdf(data.seccion1.croquisUbicacionImg);
  }
  if (data.responsable?.firmaUrl) {
    data.responsable.firmaUrl = await resolveImageForPdf(data.responsable.firmaUrl);
  }
  if (data.seccion11?.croquisList) {
    for (const c of data.seccion11.croquisList) {
      if (c.url) c.url = await resolveImageForPdf(c.url);
    }
  }
  if (data.seccion12?.grupos) {
    for (const g of data.seccion12.grupos) {
      if (g.fotoNorte?.url) g.fotoNorte.url = await resolveImageForPdf(g.fotoNorte.url);
      if (g.fotoSur?.url) g.fotoSur.url = await resolveImageForPdf(g.fotoSur.url);
      if (g.fotoOriente?.url) g.fotoOriente.url = await resolveImageForPdf(g.fotoOriente.url);
      if (g.fotoPoniente?.url) g.fotoPoniente.url = await resolveImageForPdf(g.fotoPoniente.url);
      if (g.vistaGeneral?.url) g.vistaGeneral.url = await resolveImageForPdf(g.vistaGeneral.url);
      if (g.detalleSitio?.url) g.detalleSitio.url = await resolveImageForPdf(g.detalleSitio.url);
    }
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter', // 215.9 x 279.4 mm
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const institutional = data.institutionalInfo;
  const folio = data.seccion1.folioInterno || data.folioInterno || 'S/F';

  // Helper for drawing header on each page
  const drawHeader = (docInstance: jsPDF): number => {
    // Top colored institutional accent band
    docInstance.setFillColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
    docInstance.rect(0, 0, pageWidth, 4, 'F');

    // Header container
    docInstance.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
    docInstance.setLineWidth(0.3);

    // Institutional text
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(8.5);
    docInstance.setTextColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
    docInstance.text((institutional.dependencia || 'GOBIERNO DEL ESTADO').toUpperCase(), margin, 10);

    docInstance.setFont('helvetica', 'normal');
    docInstance.setFontSize(7.5);
    docInstance.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
    docInstance.text((institutional.direccionUnidad || 'DIRECCIÓN DE TRANSITO Y VIALIDAD').toUpperCase(), margin, 14);

    // Title & Folio Box (right aligned)
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(8);
    docInstance.setTextColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
    docInstance.text('ANEXO TÉCNICO DE INSPECCIÓN Y LEVANTAMIENTO', pageWidth - margin, 10, { align: 'right' });
    
    docInstance.setFont('helvetica', 'normal');
    docInstance.setFontSize(7.5);
    docInstance.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
    docInstance.text(`FOLIO: ${folio}`, pageWidth - margin, 14, { align: 'right' });

    docInstance.setDrawColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
    docInstance.setLineWidth(0.8);
    docInstance.line(margin, 17, pageWidth - margin, 17);

    return 21;
  };

  // Helper for section title
  const addSectionTitle = (title: string, yPos: number): number => {
    if (yPos > pageHeight - 35) {
      doc.addPage();
      yPos = drawHeader(doc);
    }
    doc.setFillColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
    doc.roundedRect(margin, yPos, contentWidth, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 3, yPos + 4.2);
    return yPos + 8;
  };

  // Initial page header
  currentY = drawHeader(doc);

  // --- SECCIÓN I: DATOS GENERALES ---
  currentY = addSectionTitle('I. DATOS GENERALES', currentY);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8, textColor: TEXT_DARK },
    headStyles: { fillColor: LIGHT_BG, textColor: DARK_GRAY, fontStyle: 'bold' },
    body: [
      [
        { content: 'Folio Interno:', styles: { fontStyle: 'bold', cellWidth: 28 } },
        { content: data.seccion1.folioInterno || folio || 'S/N' },
        { content: 'Fecha de Inspección:', styles: { fontStyle: 'bold', cellWidth: 32 } },
        { content: data.seccion1.fechaInspeccion || 'No registrada' },
        { content: 'Hora:', styles: { fontStyle: 'bold', cellWidth: 15 } },
        { content: data.seccion1.horaInspeccion || 'No registrada' },
      ],
      [
        { content: 'Solicitante / Propuesta:', styles: { fontStyle: 'bold' } },
        { content: data.seccion1.solicitante || 'Sin solicitante específico', colSpan: 5 },
      ],
      [
        { content: 'Ubicación Exacta:', styles: { fontStyle: 'bold' } },
        { content: data.seccion1.ubicacionExacta || 'No especificada', colSpan: 3 },
        { content: 'Municipio:', styles: { fontStyle: 'bold' } },
        { content: data.seccion1.municipio || 'No especificado' },
      ],
      [
        { content: 'Colonia o Barrio:', styles: { fontStyle: 'bold' } },
        { content: data.seccion1.coloniaBarrio || 'No especificada' },
        { content: 'Coordenadas GPS:', styles: { fontStyle: 'bold' } },
        { content: `Lat: ${data.seccion1.latitud || 'S/D'}, Long: ${data.seccion1.longitud || 'S/D'}`, colSpan: 3 },
      ],
    ],
  });

  currentY = getTableFinalY(doc, currentY) + 3;

  // Croquis de ubicación si existe en sección 1
  if (data.seccion1.croquisUbicacionImg) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = drawHeader(doc);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
    doc.text('Croquis de Ubicación Geográfica:', margin, currentY);
    currentY += 2;
    try {
      const imgWidth = 70;
      const imgHeight = 42;
      doc.addImage(data.seccion1.croquisUbicacionImg, 'PNG', margin, currentY, imgWidth, imgHeight, undefined, 'FAST');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.text(data.seccion1.croquisUbicacionDesc || 'Esquema de localización de la zona de intervención.', margin + imgWidth + 4, currentY + 6, { maxWidth: contentWidth - imgWidth - 4 });
      currentY += imgHeight + 4;
    } catch {
      currentY += 4;
    }
  }

  // --- SECCIÓN II: CLASIFICACIÓN DE LA VIALIDAD ---
  currentY = addSectionTitle('II. CLASIFICACIÓN DE LA VIALIDAD', currentY);

  const tiposList = [
    'Avenida primaria', 'Avenida secundaria', 'Colectora', 'Local',
    'Carretera urbana', 'Zona escolar', 'Zona comercial', 'Zona hospitalaria',
  ];
  const jerarquiasList = ['Primaria', 'Secundaria', 'Colectora', 'Local'];

  const tipoBoxes = tiposList.map(t => {
    const isChecked = data.seccion2.tipoVialidad?.includes(t);
    return `[ ${isChecked ? 'X' : '  '} ] ${t}`;
  });

  const jerarquiaBoxes = jerarquiasList.map(j => {
    const isChecked = data.seccion2.jerarquiaVial?.includes(j);
    return `[ ${isChecked ? 'X' : '  '} ] ${j}`;
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.8 },
    body: [
      [
        { content: 'Tipo de Vialidad (puede marcar varias):', styles: { fontStyle: 'bold', fillColor: LIGHT_BG } },
        { content: tipoBoxes.slice(0, 4).join('     ') + '\n' + tipoBoxes.slice(4).join('     ') },
      ],
      [
        { content: 'Jerarquía Vial:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG } },
        { content: jerarquiaBoxes.join('          ') },
      ],
    ],
  });

  currentY = getTableFinalY(doc, currentY) + 3;

  // --- SECCIÓN III: CARACTERÍSTICAS GEOMÉTRICAS ---
  currentY = addSectionTitle('III. CARACTERÍSTICAS GEOMÉTRICAS', currentY);

  const s3 = data.seccion3;
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.6 },
    body: [
      [
        { content: 'Ancho de vialidad:', styles: { fontStyle: 'bold' } },
        { content: s3.anchoVialidadMetros ? `${s3.anchoVialidadMetros} m` : 'S/D' },
        { content: 'Número de carriles:', styles: { fontStyle: 'bold' } },
        { content: s3.numeroCarriles || 'S/D' },
        { content: 'Sentido circulación:', styles: { fontStyle: 'bold' } },
        { content: s3.sentidoCirculacion || 'S/D' },
      ],
      [
        { content: 'Camellón central:', styles: { fontStyle: 'bold' } },
        { content: s3.camellonCentral ? '[X] Sí  [ ] No' : '[ ] Sí  [X] No' },
        { content: 'Banquetas:', styles: { fontStyle: 'bold' } },
        { content: s3.banquetas ? `[X] Sí (${s3.anchoBanquetasMetros || 'S/D'} m)` : '[ ] No' },
        { content: 'Rampas peatonales:', styles: { fontStyle: 'bold' } },
        { content: s3.rampas ? '[X] Sí  [ ] No' : '[ ] Sí  [X] No' },
      ],
      [
        { content: 'Estado del pavimento:', styles: { fontStyle: 'bold' } },
        {
          content: `[ ${s3.estadoPavimento === 'bueno' ? 'X' : ' '} ] Bueno  [ ${s3.estadoPavimento === 'regular' ? 'X' : ' '} ] Regular  [ ${s3.estadoPavimento === 'malo' ? 'X' : ' '} ] Malo`,
          colSpan: 3,
        },
        { content: 'Pendiente vial:', styles: { fontStyle: 'bold' } },
        { content: s3.pendiente ? '[X] Sí  [ ] No' : '[ ] Sí  [X] No' },
      ],
      [
        { content: 'Observaciones geométricas:', styles: { fontStyle: 'bold' } },
        { content: s3.observaciones || 'Sin observaciones adicionales registradas.', colSpan: 5 },
      ],
    ],
  });

  currentY = getTableFinalY(doc, currentY) + 3;

  // Check page break before section IV
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = drawHeader(doc);
  }

  // --- SECCIÓN IV: DEMANDA PEATONAL ---
  currentY = addSectionTitle('IV. DEMANDA PEATONAL', currentY);

  const s4 = data.seccion4;
  const compBoxes = [
    'Cruzan en grupo', 'Cruzan individualmente', 'Cruzan fuera de un cruce señalizado',
    'Cruzan entre vehículos', 'Cruzan corriendo', 'Esperan mucho tiempo para cruzar',
  ].map(c => `[ ${s4.comportamiento?.includes(c) ? 'X' : ' '} ] ${c}`).join('   ');

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.6 },
    body: [
      [
        { content: 'Conteo Peatonal por Período:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG }, colSpan: 6 },
      ],
      [
        { content: '15 minutos:', styles: { fontStyle: 'bold' } },
        { content: `${s4.conteo15min || '0'} personas` },
        { content: '30 minutos:', styles: { fontStyle: 'bold' } },
        { content: `${s4.conteo30min || '0'} personas` },
        { content: '60 minutos:', styles: { fontStyle: 'bold' } },
        { content: `${s4.conteo60min || '0'} personas` },
      ],
      [
        { content: 'Demanda por Tipo de Usuario (Baja / Media / Alta):', styles: { fontStyle: 'bold', fillColor: LIGHT_BG }, colSpan: 6 },
      ],
      [
        { content: `Escolares: ${s4.usuarios.escolares?.toUpperCase() || '-'}` },
        { content: `Adultos Mayores: ${s4.usuarios.adultosMayores?.toUpperCase() || '-'}` },
        { content: `Discapacidad: ${s4.usuarios.personasDiscapacidad?.toUpperCase() || '-'}` },
        { content: `Trabajadores: ${s4.usuarios.trabajadores?.toUpperCase() || '-'}` },
        { content: `Transporte Púb: ${s4.usuarios.transportePublico?.toUpperCase() || '-'}` },
        { content: `Comercios: ${s4.usuarios.comercios?.toUpperCase() || '-'}` },
      ],
      [
        { content: 'Comportamiento Observado:', styles: { fontStyle: 'bold' } },
        { content: compBoxes, colSpan: 5 },
      ],
      [
        { content: 'Observaciones:', styles: { fontStyle: 'bold' } },
        { content: s4.observaciones || 'Sin observaciones particulares.', colSpan: 5 },
      ],
    ],
  });

  currentY = getTableFinalY(doc, currentY) + 3;

  // --- SECCIÓN V: TRÁNSITO VEHICULAR ---
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = drawHeader(doc);
  }
  currentY = addSectionTitle('V. TRÁNSITO VEHICULAR', currentY);

  const s5 = data.seccion5;
  const velRangoStr = `[ ${s5.velocidadRango === 'menor_30' ? 'X' : ' '} ] <30 km/h   [ ${s5.velocidadRango === 'de_30_a_50' ? 'X' : ' '} ] 30-50 km/h   [ ${s5.velocidadRango === 'mayor_50' ? 'X' : ' '} ] >50 km/h`;
  const volStr = `[ ${s5.volumenVehicular === 'bajo' ? 'X' : ' '} ] Bajo   [ ${s5.volumenVehicular === 'medio' ? 'X' : ' '} ] Medio   [ ${s5.volumenVehicular === 'alto' ? 'X' : ' '} ] Alto`;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.6 },
    body: [
      [
        { content: 'Conteo Vehicular por Tipo:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG }, colSpan: 5 },
      ],
      [
        { content: `Automóviles: ${s5.automoviles || '0'}` },
        { content: `Motocicletas: ${s5.motocicletas || '0'}` },
        { content: `Camiones: ${s5.camiones || '0'}` },
        { content: `Transporte Púb: ${s5.transportePublico || '0'}` },
        { content: `Bicicletas: ${s5.bicicletas || '0'}` },
      ],
      [
        { content: 'Velocidad Observada:', styles: { fontStyle: 'bold' } },
        { content: velRangoStr, colSpan: 2 },
        { content: 'Velocidad Estimada:', styles: { fontStyle: 'bold' } },
        { content: `${s5.velocidadEstimadaKmH || 'S/D'} km/h` },
      ],
      [
        { content: 'Volumen Vehicular:', styles: { fontStyle: 'bold' } },
        { content: volStr, colSpan: 2 },
        { content: 'Observaciones:', styles: { fontStyle: 'bold' } },
        { content: s5.observaciones || 'Sin observaciones de tránsito.', colSpan: 1 },
      ],
    ],
  });

  currentY = getTableFinalY(doc, currentY) + 3;

  // --- SECCIÓN VI: ENTORNO URBANO ---
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = drawHeader(doc);
  }
  currentY = addSectionTitle('VI. ENTORNO URBANO (GENERADORES DE VIAJE E INFRAESTRUCTURA)', currentY);

  const genRows = data.seccion6.generadores.map(g => [
    g.tipo,
    g.existe ? '[X] Sí' : '[ ] No',
    g.existe && g.distanciaMetros ? `${g.distanciaMetros} m` : g.existe ? 'S/D' : '-',
  ]);

  const midPoint = Math.ceil(genRows.length / 2);
  const leftCol = genRows.slice(0, midPoint);
  const rightCol = genRows.slice(midPoint);
  const combinedRows = leftCol.map((left, idx) => {
    const right = rightCol[idx] || ['', '', ''];
    return [left[0], left[1], left[2], right[0], right[1], right[2]];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 6.8, cellPadding: 1.4 },
    headStyles: { fillColor: LIGHT_BG, textColor: DARK_GRAY, fontStyle: 'bold' },
    head: [['Generador / Infraestructura', 'Existe', 'Distancia', 'Generador / Infraestructura', 'Existe', 'Distancia']],
    body: combinedRows,
  });

  currentY = getTableFinalY(doc, currentY) + 3;

  // --- SECCIÓN VII: SEGURIDAD VIAL ---
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = drawHeader(doc);
  }
  currentY = addSectionTitle('VII. CONDICIONES DE SEGURIDAD VIAL', currentY);

  const s7 = data.seccion7;
  const visibBoxes = `[ ${s7.visibilidad === 'excelente' ? 'X' : ' '} ] Excelente  [ ${s7.visibilidad === 'buena' ? 'X' : ' '} ] Buena  [ ${s7.visibilidad === 'regular' ? 'X' : ' '} ] Regular  [ ${s7.visibilidad === 'mala' ? 'X' : ' '} ] Mala`;
  const ilumBoxes = `[ ${s7.iluminacion === 'buena' ? 'X' : ' '} ] Buena  [ ${s7.iluminacion === 'regular' ? 'X' : ' '} ] Regular  [ ${s7.iluminacion === 'deficiente' ? 'X' : ' '} ] Deficiente  [ ${s7.iluminacion === 'no_existe' ? 'X' : ' '} ] No existe`;
  const banqBoxes = `[ ${s7.banquetas === 'continuas' ? 'X' : ' '} ] Continuas  [ ${s7.banquetas === 'discontinuas' ? 'X' : ' '} ] Discontinuas  [ ${s7.banquetas === 'inexistentes' ? 'X' : ' '} ] Inexistentes`;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.6 },
    body: [
      [
        { content: 'Visibilidad:', styles: { fontStyle: 'bold' } },
        { content: visibBoxes },
        { content: 'Iluminación:', styles: { fontStyle: 'bold' } },
        { content: ilumBoxes },
      ],
      [
        { content: 'Banquetas:', styles: { fontStyle: 'bold' } },
        { content: banqBoxes },
        { content: 'Rampas accesibles:', styles: { fontStyle: 'bold' } },
        { content: s7.rampas ? '[X] Sí  [ ] No' : '[ ] Sí  [X] No' },
      ],
      [
        { content: 'Comentarios de Seguridad:', styles: { fontStyle: 'bold' } },
        { content: s7.comentarios || 'Sin observaciones complementarias.', colSpan: 3 },
      ],
    ],
  });

  currentY = getTableFinalY(doc, currentY) + 4;

  // New page for Section VIII & IX
  doc.addPage();
  currentY = drawHeader(doc);

  // --- SECCIÓN VIII: EVALUACIÓN TÉCNICA ---
  currentY = addSectionTitle('VIII. EVALUACIÓN TÉCNICA NORMATIVA', currentY);

  const evalRows = data.seccion8.criterios.map(c => [
    c.criterio,
    c.cumple === true ? '[X] Sí' : c.cumple === false ? '[X] No' : '[ ] S/E',
    c.observaciones || '-',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: LIGHT_BG, textColor: DARK_GRAY, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 'auto' },
    },
    head: [['Criterio Técnico Evaluado', 'Cumplimiento', 'Observaciones Técnicas']],
    body: evalRows,
  });

  currentY = getTableFinalY(doc, currentY) + 4;

  // --- SECCIÓN IX: MEDIDAS COMPLEMENTARIAS ---
  currentY = addSectionTitle('IX. MEDIDAS Y DISPOSITIVOS COMPLEMENTARIOS', currentY);

  const medidasRows = data.seccion9.medidas.map(m => [
    m.dispositivo,
    m.aplica === true ? '[X] Sí' : m.aplica === false ? '[X] No' : '[ ] -',
    m.observaciones || '-',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.4 },
    headStyles: { fillColor: LIGHT_BG, textColor: DARK_GRAY, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 75 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 'auto' },
    },
    head: [['Dispositivo o Medida Propuesta', 'Aplica', 'Observaciones de Implementación']],
    body: medidasRows,
  });

  currentY = getTableFinalY(doc, currentY) + 4;

  // New page for Section X and Observaciones
  doc.addPage();
  currentY = drawHeader(doc);

  // --- SECCIÓN X: PROPUESTA TÉCNICA ---
  currentY = addSectionTitle('X. PROPUESTA TÉCNICA Y DICTAMEN DE INTERVENCIÓN', currentY);

  const dictamenes = [
    'Procede el paso peatonal',
    'Procede paso peatonal con reductores de velocidad',
    'Procede solo reductores de velocidad con señal vertical',
    'Procede con plataforma elevada',
    'Procede con semaforización',
    'Procede con isla de refugio',
    'Procede con señalética',
    'No procede',
  ];

  const dictBoxes = dictamenes.map(d => {
    const isChecked = Boolean(
      data.seccion10.dictamenOpciones?.includes(d) ||
      (d === 'Procede el paso peatonal' && data.seccion10.dictamenOpciones?.includes('Procede únicamente el paso peatonal'))
    );
    return `[ ${isChecked ? 'X' : '  '} ] ${d}`;
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7.2, cellPadding: 1.8 },
    body: [
      [
        { content: 'Dictamen de Viabilidad:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG } },
        { content: dictBoxes.slice(0, 4).join('\n') },
        { content: dictBoxes.slice(4).join('\n') },
      ],
      [
        { content: 'Memoria y Justificación Técnica de la Propuesta:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG } },
        { content: data.seccion10.propuestaDetallada || 'No se redactó especificación detallada.', colSpan: 2 },
      ],
    ],
  });

  currentY = getTableFinalY(doc, currentY) + 4;

  // --- SECCIÓN OBSERVACIONES FINALES ---
  currentY = addSectionTitle('OBSERVACIONES GENERALES DE LA INSPECCIÓN', currentY);

  const obsText = data.observaciones.texto || 'Sin observaciones finales adicionales.';
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7.2, cellPadding: 2, textColor: TEXT_DARK },
    body: [
      [{ content: obsText }],
    ],
  });

  currentY = getTableFinalY(doc, currentY) + 4;

  // --- SECCIÓN FIRMA Y RESPONSABLE ---
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = drawHeader(doc);
  }

  doc.setFillColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
  doc.roundedRect(margin, currentY, contentWidth, 5.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('RESPONSABLE TÉCNICO DE LA ELABORACIÓN', margin + 3, currentY + 3.8);
  currentY += 7.5;

  const resp = data.responsable;
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7.2, cellPadding: 2 },
    body: [
      [
        { content: 'Nombre Completo:', styles: { fontStyle: 'bold', cellWidth: 35 } },
        { content: resp.nombreCompleto || 'S/N' },
        { content: 'Fecha de Elaboración:', styles: { fontStyle: 'bold', cellWidth: 35 } },
        { content: resp.fechaElaboracion || 'S/F' },
      ],
      [
        { content: 'Cargo Institucional:', styles: { fontStyle: 'bold' } },
        { content: resp.cargo || 'S/C' },
        { content: 'Área Administrativa:', styles: { fontStyle: 'bold' } },
        { content: resp.areaAdministrativa || 'S/A' },
      ],
      [
        { content: 'Firma y Rúbrica:', styles: { fontStyle: 'bold' } },
        {
          content: resp.firmaUrl ? '' : '\n\n_____________________________________\nFirma de Conformidad Técnica',
          colSpan: 3,
          styles: { halign: 'center' },
        },
      ],
    ],
  });

  currentY = getTableFinalY(doc, currentY);

  if (resp.firmaUrl) {
    try {
      doc.addImage(resp.firmaUrl, 'PNG', pageWidth / 2 - 25, currentY - 14, 50, 12, undefined, 'FAST');
    } catch {
      // ignore
    }
  }

  // --- SECCIÓN XI: CROQUIS DE IMPLEMENTACIÓN ---
  if (data.seccion11.croquisList && data.seccion11.croquisList.length > 0) {
    doc.addPage();
    currentY = drawHeader(doc);
    currentY = addSectionTitle('XI. CROQUIS DE IMPLEMENTACIÓN Y PLANOS DE SEÑALAMIENTO', currentY);

    for (const croquis of data.seccion11.croquisList) {
      if (currentY > pageHeight - 90) {
        doc.addPage();
        currentY = drawHeader(doc);
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
      doc.text(croquis.titulo || 'Croquis Técnico de Proyecto', margin, currentY);
      currentY += 2;

      try {
        const boxW = contentWidth;
        const boxH = 75;
        doc.addImage(croquis.url, 'PNG', margin, currentY, boxW, boxH, undefined, 'FAST');
        currentY += boxH + 2;

        if (croquis.descripcion) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
          doc.text(croquis.descripcion, margin, currentY, { maxWidth: contentWidth });
          currentY += 6;
        }
      } catch {
        currentY += 4;
      }
    }
  }

  // --- SECCIÓN XII: REGISTRO FOTOGRÁFICO ---
  if (data.seccion12.grupos && data.seccion12.grupos.length > 0) {
    doc.addPage();
    currentY = drawHeader(doc);
    currentY = addSectionTitle('XII. REGISTRO FOTOGRÁFICO DE LA INSPECCIÓN', currentY);

    for (const grupo of data.seccion12.grupos) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
      doc.text(`Vialidad: ${grupo.nombreVialidad || 'Sitio de Levantamiento'}`, margin, currentY);
      currentY += 3.5;

      const photoCards = [
        { label: 'FOTOGRAFÍA NORTE', data: grupo.fotoNorte },
        { label: 'FOTOGRAFÍA SUR', data: grupo.fotoSur },
        { label: 'FOTOGRAFÍA ORIENTE', data: grupo.fotoOriente },
        { label: 'FOTOGRAFÍA PONIENTE', data: grupo.fotoPoniente },
        { label: 'VISTA GENERAL', data: grupo.vistaGeneral },
        { label: 'DETALLE DEL SITIO', data: grupo.detalleSitio },
      ].filter(p => p.data?.url);

      const cardWidth = (contentWidth - 6) / 2;
      const cardHeight = 62;

      for (let i = 0; i < photoCards.length; i += 2) {
        if (currentY > pageHeight - cardHeight - 20) {
          doc.addPage();
          currentY = drawHeader(doc);
        }

        const left = photoCards[i];
        const right = photoCards[i + 1];

        if (left) {
          const x = margin;
          doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
          doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
          doc.roundedRect(x, currentY, cardWidth, cardHeight, 1, 1, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
          doc.text(left.label, x + 3, currentY + 4);

          try {
            doc.addImage(left.data!.url, 'PNG', x + 2, currentY + 6, cardWidth - 4, 44, undefined, 'FAST');
          } catch {
            // ignore
          }

          if (left.data!.descripcion) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
            doc.text(left.data!.descripcion, x + 3, currentY + 53, { maxWidth: cardWidth - 6 });
          }
        }

        if (right) {
          const x = margin + cardWidth + 6;
          doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
          doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
          doc.roundedRect(x, currentY, cardWidth, cardHeight, 1, 1, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
          doc.text(right.label, x + 3, currentY + 4);

          try {
            doc.addImage(right.data!.url, 'PNG', x + 2, currentY + 6, cardWidth - 4, 44, undefined, 'FAST');
          } catch {
            // ignore
          }

          if (right.data!.descripcion) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
            doc.text(right.data!.descripcion, x + 3, currentY + 53, { maxWidth: cardWidth - 6 });
          }
        }

        currentY += cardHeight + 4;
      }
    }
  }

  // --- FOOTER ON ALL PAGES: Numbering "Página X de Y" and institutional disclaimer ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);

    const contactStr = [
      institutional.domicilio,
      institutional.telefono,
      institutional.paginaWeb,
    ].filter(Boolean).join('  |  ');

    doc.text(contactStr || 'DOCUMENTO INSTITUCIONAL OFICIAL DE EVALUACIÓN VIAL', margin, pageHeight - 8, { maxWidth: contentWidth - 35 });
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });

    doc.setFillColor(BURGUNDY[0], BURGUNDY[1], BURGUNDY[2]);
    doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');
  }

  const cleanFolio = cleanTextForFilename(data.seccion1.folioInterno || folio || 'SN');
  const cleanUbic = cleanTextForFilename(data.seccion1.ubicacionExacta || data.seccion1.municipio || 'Campeche');
  const fileName = `Anexo_Tecnico_${cleanFolio}_${cleanUbic}.pdf`;

  doc.save(fileName);
}
