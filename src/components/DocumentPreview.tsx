import React, { useState } from 'react';
import { InspectionData } from '../types/inspection';
import { generateInspectionPDF } from '../services/pdfGenerator';
import {
  Download,
  Printer,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface Props {
  data: InspectionData;
  onBackToEdit: () => void;
  onGoToSection: (sectionId: string) => void;
}

export const DocumentPreview: React.FC<Props> = ({ data, onBackToEdit, onGoToSection }) => {
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'completo' | 'paginado'>('completo');
  const [currentPage, setCurrentPage] = useState(1);

  // Validation warnings
  const warnings: Array<{ message: string; sectionId: string }> = [];
  if (!data.seccion1.folioInterno) {
    warnings.push({ message: 'Falta registrar el Folio Interno oficial', sectionId: 's1' });
  }
  if (!data.seccion1.ubicacionExacta) {
    warnings.push({ message: 'Falta especificar la Ubicación Exacta', sectionId: 's1' });
  }
  if (data.seccion2.tipoVialidad.length === 0) {
    warnings.push({ message: 'No se ha seleccionado el Tipo de Vialidad', sectionId: 's2' });
  }
  if (!data.seccion10.propuestaDetallada) {
    warnings.push({ message: 'La Memoria Descriptiva de la Propuesta Técnica está vacía', sectionId: 's10' });
  }
  const totalPhotos = (data.seccion12.grupos || []).reduce((acc, g) => {
    let count = 0;
    if (g.fotoNorte?.url) count++;
    if (g.fotoSur?.url) count++;
    if (g.fotoOriente?.url) count++;
    if (g.fotoPoniente?.url) count++;
    if (g.vistaGeneral?.url) count++;
    if (g.detalleSitio?.url) count++;
    return acc + count;
  }, 0);
  if (totalPhotos === 0) {
    warnings.push({ message: 'No se han adjuntado fotografías en el Registro Fotográfico', sectionId: 's12' });
  }

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateInspectionPDF(data);
    } catch (err) {
      console.error(err);
      alert('Error al generar el PDF: ' + err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const institutional = data.institutionalInfo;
  const s1 = data.seccion1;
  const s2 = data.seccion2;
  const s3 = data.seccion3;
  const s4 = data.seccion4;
  const s5 = data.seccion5;
  const s6 = data.seccion6;
  const s7 = data.seccion7;
  const s8 = data.seccion8;
  const s9 = data.seccion9;
  const s10 = data.seccion10;
  const s11 = data.seccion11;
  const s12 = data.seccion12;
  const resp = data.responsable;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar (hidden in print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden sticky top-3 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToEdit}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar al Formulario
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#691C32]" />
            Vista Previa del Documento Oficial
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Imprimir
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 bg-[#691C32] hover:bg-[#521527] disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
            {downloading ? 'Generando PDF...' : 'Descargar PDF Oficial'}
          </button>
        </div>
      </div>

      {/* Warnings Banner if fields missing */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 print:hidden space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Atención: Se detectaron {warnings.length} campos o elementos pendientes de completar:
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-800 pl-1">
            {warnings.map((w, i) => (
              <li key={i}>
                <span className="font-medium">{w.message}</span>
                <button
                  type="button"
                  onClick={() => onGoToSection(w.sectionId)}
                  className="ml-2 underline font-semibold text-[#691C32] hover:text-red-900 cursor-pointer"
                >
                  (Ir a sección)
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Document Sheet Container */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-xl max-w-4xl mx-auto p-6 md:p-10 font-sans text-slate-900 space-y-6 print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Institutional Header */}
        <div className="border-b-2 border-[#691C32] pb-3 flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xs md:text-sm font-extrabold text-[#691C32] uppercase tracking-wide">
              {institutional.dependencia || 'GOBIERNO DEL ESTADO DE CAMPECHE'}
            </h1>
            <h2 className="text-[11px] md:text-xs font-bold text-slate-700 uppercase">
              {institutional.direccionUnidad || 'DIRECCIÓN DE TRÁNSITO Y VIALIDAD'}
            </h2>
            <div className="pt-1">
              <span className="inline-block bg-[#691C32] text-white text-[10px] md:text-xs font-black px-2.5 py-0.5 rounded tracking-wider uppercase">
                ANEXO TÉCNICO DE INSPECCIÓN Y LEVANTAMIENTO DE CAMPO
              </span>
            </div>
          </div>

          <div className="text-right shrink-0 border border-slate-200 bg-slate-50 p-2 rounded-lg">
            <span className="block text-[9px] font-bold text-slate-500 uppercase">FOLIO INTERNO</span>
            <span className="text-xs font-mono font-bold text-[#691C32]">
              {s1.folioInterno || data.folioInterno || 'S/F'}
            </span>
            <span className="block text-[9px] text-slate-400 mt-0.5">
              Fecha: {s1.fechaInspeccion || 'S/F'}
            </span>
          </div>
        </div>

        {/* I. DATOS GENERALES */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            I. Datos Generales
          </div>
          <div className="border border-slate-200 rounded text-xs divide-y divide-slate-200 bg-slate-50/30">
            <div className="grid grid-cols-2 md:grid-cols-4 p-2 gap-2">
              <div><span className="font-bold text-slate-600">Fecha:</span> {s1.fechaInspeccion || '-'}</div>
              <div><span className="font-bold text-slate-600">Hora:</span> {s1.horaInspeccion || '-'}</div>
              <div className="md:col-span-2"><span className="font-bold text-slate-600">Municipio:</span> {s1.municipio || '-'}</div>
            </div>
            <div className="p-2">
              <span className="font-bold text-slate-600">Solicitante / Propuesta:</span> {s1.solicitante || '-'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 p-2 gap-2">
              <div><span className="font-bold text-slate-600">Ubicación Exacta:</span> {s1.ubicacionExacta || '-'}</div>
              <div><span className="font-bold text-slate-600">Colonia/Barrio:</span> {s1.coloniaBarrio || '-'}</div>
            </div>
            <div className="p-2">
              <span className="font-bold text-slate-600">Coordenadas GPS:</span> Lat: {s1.latitud || 'S/D'}, Long: {s1.longitud || 'S/D'}
            </div>
            {s1.croquisUbicacionImg && (
              <div className="p-3 bg-white">
                <span className="block font-bold text-slate-700 text-[11px] mb-1.5">Croquis de Ubicación Geográfica:</span>
                <div className="max-h-48 flex justify-center bg-slate-50 rounded border border-slate-200 p-1">
                  <img src={s1.croquisUbicacionImg} alt="Croquis Ubicación" className="max-h-44 object-contain" />
                </div>
                {s1.croquisUbicacionDesc && (
                  <p className="text-[10px] text-slate-500 italic mt-1">{s1.croquisUbicacionDesc}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* II. CLASIFICACIÓN DE LA VIALIDAD */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            II. Clasificación de la Vialidad
          </div>
          <div className="border border-slate-200 rounded text-xs p-3 space-y-2 bg-slate-50/30">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Tipo de Vialidad:</span>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {['Avenida primaria', 'Avenida secundaria', 'Colectora', 'Local', 'Carretera urbana', 'Zona escolar', 'Zona comercial', 'Zona hospitalaria'].map(t => (
                  <span key={t} className="inline-flex items-center gap-1 font-mono text-[11px]">
                    [{s2.tipoVialidad.includes(t) ? 'X' : '  '}] {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Jerarquía Vial:</span>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {['Primaria', 'Secundaria', 'Colectora', 'Local'].map(j => (
                  <span key={j} className="inline-flex items-center gap-1 font-mono text-[11px]">
                    [{s2.jerarquiaVial.includes(j) ? 'X' : '  '}] {j}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* III. CARACTERÍSTICAS GEOMÉTRICAS */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            III. Características Geométricas
          </div>
          <div className="border border-slate-200 rounded text-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-200">
                <tr className="divide-x divide-slate-200 bg-slate-50/50">
                  <td className="p-2 font-bold text-slate-600">Ancho vialidad:</td>
                  <td className="p-2 font-semibold">{s3.anchoVialidadMetros ? `${s3.anchoVialidadMetros} m` : 'S/D'}</td>
                  <td className="p-2 font-bold text-slate-600">Número de carriles:</td>
                  <td className="p-2 font-semibold">{s3.numeroCarriles || 'S/D'}</td>
                  <td className="p-2 font-bold text-slate-600">Sentido:</td>
                  <td className="p-2 font-semibold">{s3.sentidoCirculacion || 'S/D'}</td>
                </tr>
                <tr className="divide-x divide-slate-200">
                  <td className="p-2 font-bold text-slate-600">Camellón central:</td>
                  <td className="p-2">{s3.camellonCentral ? '[X] Sí  [ ] No' : '[ ] Sí  [X] No'}</td>
                  <td className="p-2 font-bold text-slate-600">Banquetas:</td>
                  <td className="p-2">{s3.banquetas ? `[X] Sí (${s3.anchoBanquetasMetros || 'S/D'} m)` : '[ ] No'}</td>
                  <td className="p-2 font-bold text-slate-600">Rampas:</td>
                  <td className="p-2">{s3.rampas ? '[X] Sí  [ ] No' : '[ ] Sí  [X] No'}</td>
                </tr>
                <tr className="divide-x divide-slate-200 bg-slate-50/50">
                  <td className="p-2 font-bold text-slate-600">Estado pavimento:</td>
                  <td colSpan={3} className="p-2 font-semibold uppercase">{s3.estadoPavimento || 'No evaluado'}</td>
                  <td className="p-2 font-bold text-slate-600">Pendiente:</td>
                  <td className="p-2">{s3.pendiente ? '[X] Sí  [ ] No' : '[ ] Sí  [X] No'}</td>
                </tr>
                {s3.observaciones && (
                  <tr>
                    <td className="p-2 font-bold text-slate-600">Observaciones:</td>
                    <td colSpan={5} className="p-2 text-slate-700">{s3.observaciones}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* IV. DEMANDA PEATONAL */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            IV. Demanda Peatonal
          </div>
          <div className="border border-slate-200 rounded text-xs divide-y divide-slate-200">
            <div className="grid grid-cols-3 p-2 bg-slate-50/50 text-center font-bold divide-x divide-slate-200">
              <div>15 min: <span className="font-mono text-[#691C32]">{s4.conteo15min || 0}</span> personas</div>
              <div>30 min: <span className="font-mono text-[#691C32]">{s4.conteo30min || 0}</span> personas</div>
              <div>60 min: <span className="font-mono text-[#691C32]">{s4.conteo60min || 0}</span> personas</div>
            </div>
            <div className="p-2.5">
              <span className="font-bold text-slate-700 block mb-1">Nivel de demanda por tipo de usuario:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                {Object.entries(s4.usuarios).map(([k, v]) => (
                  <div key={k} className="border border-slate-200 p-1 rounded bg-white text-center">
                    <span className="block text-slate-500 capitalize">{k.replace('personasDiscapacidad', 'Discapacidad')}</span>
                    <span className="font-bold uppercase text-[#691C32]">{v || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-2.5">
              <span className="font-bold text-slate-700 block mb-1">Comportamiento observado:</span>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {['Cruzan en grupo', 'Cruzan individualmente', 'Cruzan fuera de un cruce señalizado', 'Cruzan entre vehículos', 'Cruzan corriendo', 'Esperan mucho tiempo para cruzar'].map(c => (
                  <span key={c} className="font-mono text-[11px]">
                    [{s4.comportamiento.includes(c) ? 'X' : '  '}] {c}
                  </span>
                ))}
              </div>
            </div>
            {s4.observaciones && (
              <div className="p-2 text-slate-700">
                <span className="font-bold text-slate-600">Observaciones:</span> {s4.observaciones}
              </div>
            )}
          </div>
        </section>

        {/* V. TRÁNSITO VEHICULAR */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            V. Tránsito Vehicular
          </div>
          <div className="border border-slate-200 rounded text-xs divide-y divide-slate-200">
            <div className="grid grid-cols-5 p-2 bg-slate-50/50 text-center font-bold divide-x divide-slate-200">
              <div>Autos: <span className="font-mono text-[#691C32]">{s5.automoviles || 0}</span></div>
              <div>Motos: <span className="font-mono text-[#691C32]">{s5.motocicletas || 0}</span></div>
              <div>Camiones: <span className="font-mono text-[#691C32]">{s5.camiones || 0}</span></div>
              <div>Transp. Púb: <span className="font-mono text-[#691C32]">{s5.transportePublico || 0}</span></div>
              <div>Bicicletas: <span className="font-mono text-[#691C32]">{s5.bicicletas || 0}</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 p-2 gap-2 text-[11px]">
              <div><span className="font-bold text-slate-600">Rango velocidad:</span> {s5.velocidadRango?.replace('_', ' ') || '-'}</div>
              <div><span className="font-bold text-slate-600">Velocidad estimada:</span> {s5.velocidadEstimadaKmH ? `${s5.velocidadEstimadaKmH} km/h` : 'S/D'}</div>
              <div><span className="font-bold text-slate-600">Volumen vehicular:</span> <span className="font-bold uppercase text-[#691C32]">{s5.volumenVehicular || '-'}</span></div>
            </div>
            {s5.observaciones && (
              <div className="p-2 text-slate-700">
                <span className="font-bold text-slate-600">Observaciones:</span> {s5.observaciones}
              </div>
            )}
          </div>
        </section>

        {/* VI. ENTORNO URBANO */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            VI. Entorno Urbano (Generadores de Movilidad)
          </div>
          <div className="border border-slate-200 rounded text-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2">Equipamiento / Infraestructura</th>
                  <th className="p-2 text-center">Existencia</th>
                  <th className="p-2">Distancia al sitio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {s6.generadores.filter(g => g.existe).map(g => (
                  <tr key={g.id}>
                    <td className="p-2 font-medium">{g.tipo}</td>
                    <td className="p-2 text-center font-bold text-emerald-700">Sí</td>
                    <td className="p-2">{g.distanciaMetros ? `${g.distanciaMetros} m` : 'S/D'}</td>
                  </tr>
                ))}
                {s6.generadores.filter(g => g.existe).length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-3 text-center text-slate-400 italic">
                      No se registraron generadores directos en la zona inmediata.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* VII. SEGURIDAD VIAL */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            VII. Seguridad Vial
          </div>
          <div className="border border-slate-200 rounded text-xs p-3 space-y-1.5 bg-slate-50/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><span className="font-bold text-slate-600">Visibilidad:</span> <span className="font-semibold uppercase">{s7.visibilidad || '-'}</span></div>
              <div><span className="font-bold text-slate-600">Iluminación:</span> <span className="font-semibold uppercase">{s7.iluminacion?.replace('_', ' ') || '-'}</span></div>
              <div><span className="font-bold text-slate-600">Banquetas:</span> <span className="font-semibold uppercase">{s7.banquetas || '-'}</span></div>
              <div><span className="font-bold text-slate-600">Rampas:</span> <span className="font-semibold">{s7.rampas ? 'Sí' : 'No'}</span></div>
            </div>
            {s7.comentarios && (
              <div className="pt-2 border-t border-slate-200 text-slate-700">
                <span className="font-bold text-slate-600">Comentarios:</span> {s7.comentarios}
              </div>
            )}
          </div>
        </section>

        {/* VIII. EVALUACIÓN TÉCNICA */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            VIII. Evaluación Técnica Normativa
          </div>
          <div className="border border-slate-200 rounded text-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2 w-1/2">Criterio Evaluado</th>
                  <th className="p-2 text-center w-1/4">Cumplimiento</th>
                  <th className="p-2 w-1/4">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {s8.criterios.map(c => (
                  <tr key={c.id}>
                    <td className="p-2 font-medium">{c.criterio}</td>
                    <td className="p-2 text-center font-bold">
                      {c.cumple === true ? (
                        <span className="text-emerald-700">[X] Cumple</span>
                      ) : c.cumple === false ? (
                        <span className="text-red-700">[X] No cumple</span>
                      ) : (
                        <span className="text-slate-400">[  ] Sin evaluar</span>
                      )}
                    </td>
                    <td className="p-2 text-slate-600">{c.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* IX. MEDIDAS COMPLEMENTARIAS */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            IX. Medidas y Dispositivos Complementarios
          </div>
          <div className="border border-slate-200 rounded text-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2 w-1/2">Dispositivo o Medida</th>
                  <th className="p-2 text-center w-1/4">Procedencia</th>
                  <th className="p-2 w-1/4">Especificación Técnica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {s9.medidas.filter(m => m.aplica !== null).map(m => (
                  <tr key={m.id}>
                    <td className="p-2 font-medium">{m.dispositivo}</td>
                    <td className="p-2 text-center font-bold">
                      {m.aplica ? (
                        <span className="text-[#691C32]">[X] Sí Aplica</span>
                      ) : (
                        <span className="text-slate-500">[X] No Aplica</span>
                      )}
                    </td>
                    <td className="p-2 text-slate-600">{m.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* X. PROPUESTA TÉCNICA */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            X. Propuesta Técnica y Dictamen de Viabilidad
          </div>
          <div className="border border-slate-200 rounded text-xs p-3 space-y-3 bg-slate-50/30">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Dictamen:</span>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {[
                  'Procede únicamente el paso peatonal',
                  'Procede paso peatonal con reductores de velocidad',
                  'Procede con plataforma elevada',
                  'Procede con semaforización',
                  'Procede con isla de refugio',
                  'No procede',
                  'Procede con señalética',
                ].map(opc => (
                  <span key={opc} className="font-mono text-[11px]">
                    [{s10.dictamenOpciones.includes(opc) ? 'X' : '  '}] {opc}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Memoria Descriptiva de la Propuesta:</span>
              <p className="text-slate-800 whitespace-pre-line leading-relaxed font-normal bg-white p-3 rounded border border-slate-200">
                {s10.propuestaDetallada || 'Sin memoria técnica redactada.'}
              </p>
            </div>
          </div>
        </section>

        {/* OBSERVACIONES */}
        <section className="space-y-2">
          <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
            Observaciones Finales de la Inspección
          </div>
          <div className="border border-slate-200 rounded text-xs p-3.5 bg-white space-y-2">
            <p className="whitespace-pre-line leading-relaxed text-slate-800">
              {data.observaciones.texto || 'Sin observaciones finales capturadas.'}
            </p>
          </div>
        </section>

        {/* XI. CROQUIS DE IMPLEMENTACIÓN */}
        {s11.croquisList && s11.croquisList.length > 0 && (
          <section className="space-y-2">
            <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
              XI. Croquis de Implementación y Planos de Señalamiento
            </div>
            <div className="grid grid-cols-1 gap-4">
              {s11.croquisList.map((croquis) => (
                <div key={croquis.id} className="border border-slate-200 rounded p-3 bg-slate-50">
                  <h4 className="font-bold text-xs text-slate-800 mb-1">{croquis.titulo}</h4>
                  <div className="max-h-80 flex justify-center bg-white rounded border border-slate-200 p-2 overflow-hidden">
                    <img src={croquis.url} alt={croquis.titulo} className="max-h-72 object-contain" />
                  </div>
                  {croquis.descripcion && (
                    <p className="text-[11px] text-slate-600 mt-2">{croquis.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* XII. REGISTRO FOTOGRÁFICO */}
        {s12.grupos && s12.grupos.length > 0 && (
          <section className="space-y-2">
            <div className="bg-[#691C32] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider">
              XII. Registro Fotográfico de la Inspección
            </div>
            <div className="space-y-4">
              {s12.grupos.map((grupo) => (
                <div key={grupo.id} className="border border-slate-200 rounded p-3 bg-slate-50/50 space-y-3">
                  <span className="font-bold text-xs text-[#691C32] block">
                    Vialidad: {grupo.nombreVialidad}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { l: 'FOTOGRAFÍA NORTE', d: grupo.fotoNorte },
                      { l: 'FOTOGRAFÍA SUR', d: grupo.fotoSur },
                      { l: 'FOTOGRAFÍA ORIENTE', d: grupo.fotoOriente },
                      { l: 'FOTOGRAFÍA PONIENTE', d: grupo.fotoPoniente },
                      { l: 'VISTA GENERAL', d: grupo.vistaGeneral },
                      { l: 'DETALLE DEL SITIO', d: grupo.detalleSitio },
                    ].filter(p => p.d?.url).map((p, idx) => (
                      <div key={idx} className="border border-slate-200 rounded p-2 bg-white flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-[#691C32] mb-1">{p.l}</span>
                        <div className="h-32 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                          <img src={p.d!.url} alt={p.l} className="w-full h-full object-cover" />
                        </div>
                        {p.d!.descripcion && (
                          <span className="text-[10px] text-slate-500 mt-1 block">{p.d!.descripcion}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FIRMA Y RESPONSABLE */}
        <section className="pt-4 border-t-2 border-slate-300">
          <div className="border border-slate-200 rounded text-xs p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-bold text-slate-600 block text-[11px] uppercase tracking-wider">
                RESPONSABLE TÉCNICO DE LA ELABORACIÓN
              </span>
              <span className="text-sm font-bold text-slate-900 block">{resp.nombreCompleto || 'S/N'}</span>
              <span className="text-xs text-slate-600 block">{resp.cargo || 'S/C'}</span>
              <span className="text-xs text-slate-500 block">{resp.areaAdministrativa || 'S/A'}</span>
              <span className="text-[10px] text-slate-400 block pt-1">Fecha de elaboración: {resp.fechaElaboracion}</span>
            </div>

            <div className="text-center">
              {resp.firmaUrl ? (
                <div className="w-48 h-16 flex items-center justify-center">
                  <img src={resp.firmaUrl} alt="Firma" className="max-h-16 max-w-full object-contain" />
                </div>
              ) : (
                <div className="w-48 h-12 border-b border-slate-400" />
              )}
              <span className="text-[10px] text-slate-500 block pt-1 border-t border-slate-300">
                Firma y Rúbrica Oficial
              </span>
            </div>
          </div>
        </section>

        {/* Institutional Footer */}
        <div className="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400 space-y-0.5">
          <p>{institutional.domicilio} | {institutional.telefono} | {institutional.paginaWeb}</p>
          <p className="text-[9px] uppercase tracking-wider">Documento Administrativo Institucional de Dictaminación Vial</p>
        </div>

      </div>
    </div>
  );
};
