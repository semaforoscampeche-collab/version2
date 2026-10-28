import { InspectionData } from '../types/inspection';

export function generateObjectiveObservations(data: InspectionData): string {
  const paragraphs: string[] = [];

  // Párrafo 1: Hechos de la inspección, ubicación y geometría
  const { seccion1, seccion2, seccion3 } = data;
  const p1Parts: string[] = [];
  p1Parts.push(`1. CONDICIONES GENERALES Y GEOMETRÍA VIAL:`);

  const fechaStr = seccion1.fechaInspeccion ? `el día ${seccion1.fechaInspeccion}` : 'en fecha registrada';
  const horaStr = seccion1.horaInspeccion ? `a las ${seccion1.horaInspeccion} horas` : '';
  const ubicStr = seccion1.ubicacionExacta ? `en ${seccion1.ubicacionExacta}` : '';
  const colStr = seccion1.coloniaBarrio ? `, Col./Barrio ${seccion1.coloniaBarrio}` : '';
  const munStr = seccion1.municipio ? `, Municipio de ${seccion1.municipio}` : '';

  p1Parts.push(
    `Se llevó a cabo la inspección técnica de campo ${fechaStr} ${horaStr} ${ubicStr}${colStr}${munStr}.`
  );

  if (seccion1.solicitante) {
    p1Parts.push(`Propuesta motivada por: ${seccion1.solicitante}.`);
  }

  const tipos = seccion2.tipoVialidad.length > 0 ? seccion2.tipoVialidad.join(', ') : 'No especificado';
  const jerarquia = seccion2.jerarquiaVial.length > 0 ? seccion2.jerarquiaVial.join(', ') : 'No especificada';
  p1Parts.push(`Clasificación vial: ${tipos} (Jerarquía: ${jerarquia}).`);

  const anchoVial = seccion3.anchoVialidadMetros ? `${seccion3.anchoVialidadMetros} m` : 's/d';
  const carriles = seccion3.numeroCarriles ? `${seccion3.numeroCarriles} carril(es)` : 's/d';
  const sentido = seccion3.sentidoCirculacion || 'No especificado';
  const camellon = seccion3.camellonCentral ? 'con camellón central' : 'sin camellón central';
  const banquetas = seccion3.banquetas ? `banquetas existentes (${seccion3.anchoBanquetasMetros || 's/d'} m de ancho)` : 'sin banquetas continuas';
  const rampas = seccion3.rampas ? 'con presencia de rampas' : 'sin rampas accesibles';
  const pavimento = seccion3.estadoPavimento ? `estado del pavimento ${seccion3.estadoPavimento.toUpperCase()}` : '';
  const pendiente = seccion3.pendiente ? 'y con pendiente topográfica' : 'en terreno predominantemente plano';

  p1Parts.push(
    `La sección transversal presenta un ancho de calzada de ${anchoVial}, configurada con ${carriles}, sentido ${sentido}, ${camellon}, ${banquetas}, ${rampas}, ${pavimento} ${pendiente}.`
  );

  if (seccion3.observaciones?.trim()) {
    p1Parts.push(`Observación física adicional: ${seccion3.observaciones.trim()}`);
  }

  paragraphs.push(p1Parts.join(' '));

  // Párrafo 2: Aforo peatonal y comportamiento
  const { seccion4 } = data;
  const p2Parts: string[] = [];
  p2Parts.push(`2. AFORO Y COMPORTAMIENTO PEATONAL:`);

  const conteos: string[] = [];
  if (seccion4.conteo15min) conteos.push(`${seccion4.conteo15min} peatones en 15 min`);
  if (seccion4.conteo30min) conteos.push(`${seccion4.conteo30min} peatones en 30 min`);
  if (seccion4.conteo60min) conteos.push(`${seccion4.conteo60min} peatones en 60 min`);

  if (conteos.length > 0) {
    p2Parts.push(`En los conteos peatonales se registraron: ${conteos.join('; ')}.`);
  }

  const demandasAltas: string[] = [];
  const demandasMedias: string[] = [];
  const u = seccion4.usuarios;
  const mapUser = (tipo: string, val: string) => {
    if (val === 'alta') demandasAltas.push(tipo);
    else if (val === 'media') demandasMedias.push(tipo);
  };
  mapUser('escolares', u.escolares);
  mapUser('adultos mayores', u.adultosMayores);
  mapUser('personas con discapacidad', u.personasDiscapacidad);
  mapUser('trabajadores', u.trabajadores);
  mapUser('usuarios de transporte público', u.transportePublico);
  mapUser('usuarios de comercios', u.comercios);

  if (demandasAltas.length > 0) {
    p2Parts.push(`Se identificó demanda alta en usuarios: ${demandasAltas.join(', ')}.`);
  }
  if (demandasMedias.length > 0) {
    p2Parts.push(`Demanda moderada en: ${demandasMedias.join(', ')}.`);
  }

  if (seccion4.comportamiento.length > 0) {
    p2Parts.push(`Patrones de comportamiento observados: ${seccion4.comportamiento.join(', ')}.`);
  }

  if (seccion4.observaciones?.trim()) {
    p2Parts.push(seccion4.observaciones.trim());
  }

  paragraphs.push(p2Parts.join(' '));

  // Párrafo 3: Tránsito vehicular y velocidades
  const { seccion5 } = data;
  const p3Parts: string[] = [];
  p3Parts.push(`3. TRÁNSITO VEHICULAR Y VELOCIDADES:`);

  const vehs: string[] = [];
  if (seccion5.automoviles) vehs.push(`${seccion5.automoviles} automóviles`);
  if (seccion5.motocicletas) vehs.push(`${seccion5.motocicletas} motocicletas`);
  if (seccion5.transportePublico) vehs.push(`${seccion5.transportePublico} unidades de transporte público`);
  if (seccion5.camiones) vehs.push(`${seccion5.camiones} camiones`);
  if (seccion5.bicicletas) vehs.push(`${seccion5.bicicletas} bicicletas`);

  if (vehs.length > 0) {
    p3Parts.push(`Composición vehicular cuantificada: ${vehs.join(', ')}.`);
  }

  const volStr = seccion5.volumenVehicular ? `Volumen vehicular global calificado como ${seccion5.volumenVehicular.toUpperCase()}.` : '';
  const velEst = seccion5.velocidadEstimadaKmH ? `Velocidad estimada en sitio: ${seccion5.velocidadEstimadaKmH} km/h.` : '';
  const velRango = seccion5.velocidadRango ? `Rango de velocidad predominante: ${seccion5.velocidadRango.replace('_', ' ').replace('_', ' ')}.` : '';

  p3Parts.push([volStr, velEst, velRango].filter(Boolean).join(' '));

  if (seccion5.observaciones?.trim()) {
    p3Parts.push(seccion5.observaciones.trim());
  }

  paragraphs.push(p3Parts.join(' '));

  // Párrafo 4: Entorno urbano y generadores de viaje
  const { seccion6, seccion7 } = data;
  const p4Parts: string[] = [];
  p4Parts.push(`4. ENTORNO URBANO Y CONDICIONES DE SEGURIDAD VIAL:`);

  const genExistentes = seccion6.generadores
    .filter(g => g.existe)
    .map(g => `${g.tipo}${g.distanciaMetros ? ` a ${g.distanciaMetros} m` : ''}`);

  if (genExistentes.length > 0) {
    p4Parts.push(`Equipamientos urbanos circundantes detectados: ${genExistentes.join('; ')}.`);
  } else {
    p4Parts.push(`No se identificaron equipamientos urbanos generadores de alta afluencia a menos de 200 metros.`);
  }

  const visib = seccion7.visibilidad ? `Visibilidad ${seccion7.visibilidad}` : '';
  const ilum = seccion7.iluminacion ? `iluminación ${seccion7.iluminacion.replace('_', ' ')}` : '';
  const banqEst = seccion7.banquetas ? `banquetas ${seccion7.banquetas}` : '';
  const segDesc = [visib, ilum, banqEst].filter(Boolean).join(', ');
  if (segDesc) {
    p4Parts.push(`Evaluación de visibilidad e infraestructura: ${segDesc}.`);
  }

  if (seccion7.comentarios?.trim()) {
    p4Parts.push(seccion7.comentarios.trim());
  }

  paragraphs.push(p4Parts.join(' '));

  // Párrafo 5: Dictamen y Propuesta Técnica
  const { seccion10, seccion9 } = data;
  const p5Parts: string[] = [];
  p5Parts.push(`5. DICTAMEN TÉCNICO Y RECOMENDACIONES DE INTERVENCIÓN:`);

  if (seccion10.dictamenOpciones.length > 0) {
    p5Parts.push(`Resolutivo técnico acordado: ${seccion10.dictamenOpciones.join('; ')}.`);
  }

  const medidasAprobadas = seccion9.medidas
    .filter(m => m.aplica === true)
    .map(m => m.dispositivo);

  if (medidasAprobadas.length > 0) {
    p5Parts.push(`Dispositivos y medidas complementarias procedentes a implementar: ${medidasAprobadas.join(', ')}.`);
  }

  if (seccion10.propuestaDetallada?.trim()) {
    p5Parts.push(`Detalle de especificaciones: ${seccion10.propuestaDetallada.trim()}`);
  }

  paragraphs.push(p5Parts.join(' '));

  return paragraphs.join('\n\n');
}
