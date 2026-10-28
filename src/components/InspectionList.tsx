import React, { useState } from 'react';
import { InspectionData, InspectionStatus } from '../types/inspection';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  MapPin,
  User,
  Copy,
  Trash2,
  Edit,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Upload,
  Database,
  Building
} from 'lucide-react';
import { generateInspectionPDF } from '../services/pdfGenerator';
import { StorageService } from '../services/storage';

interface Props {
  inspections: InspectionData[];
  onCreateNew: () => void;
  onEdit: (inspection: InspectionData) => void;
  onPreview: (inspection: InspectionData) => void;
  onDuplicate: (inspection: InspectionData) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export const InspectionList: React.FC<Props> = ({
  inspections,
  onCreateNew,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | InspectionStatus>('todos');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const filtered = inspections.filter((item) => {
    const term = searchTerm.toLowerCase();
    const folio = (item.seccion1.folioInterno || item.folioInterno || '').toLowerCase();
    const ubicacion = (item.seccion1.ubicacionExacta || '').toLowerCase();
    const municipio = (item.seccion1.municipio || '').toLowerCase();
    const solicitante = (item.seccion1.solicitante || '').toLowerCase();
    const responsable = (item.responsable.nombreCompleto || '').toLowerCase();

    const matchesSearch =
      folio.includes(term) ||
      ubicacion.includes(term) ||
      municipio.includes(term) ||
      solicitante.includes(term) ||
      responsable.includes(term);

    const matchesStatus =
      statusFilter === 'todos' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportPDF = async (e: React.MouseEvent, item: InspectionData) => {
    e.stopPropagation();
    setGeneratingId(item.id);
    try {
      await generateInspectionPDF(item);
    } catch (err) {
      alert('Error al generar PDF: ' + err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleBackupExport = (e: React.MouseEvent, item: InspectionData) => {
    e.stopPropagation();
    StorageService.exportToJson(item);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await StorageService.importFromJson(file);
      onRefresh();
      alert('Inspección importada con éxito.');
    } catch (err) {
      alert('Error al importar archivo JSON: ' + err);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-r from-[#691C32] to-[#801D3A] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-amber-200">
              <Building className="w-3.5 h-3.5" />
              DIRECCIÓN DE TRANSITO Y VIALIDAD • GOBIERNO DEL ESTADO DE CAMPECHE
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Base de Datos en Red (Firestore Sincronizada en Tiempo Real)
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Anexos Técnicos de Inspección y Levantamiento
          </h2>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            Plataforma oficial para captura de aforos peatonales, geométricos y vehiculares, evaluación de seguridad vial, registro fotográfico y expedición de dictámenes técnicos en formato PDF reglamentario.
          </p>
          <div className="pt-2 text-[11px] text-white/70 flex flex-wrap gap-x-4 gap-y-1">
            <span>📍 Av. Héroes de la salud # 385, Col. Multunchac</span>
            <span>📞 9818119110 ext 80050</span>
            <a
              href="https://www.spsc.campeche.gob.mx/"
              target="_blank"
              rel="noreferrer"
              className="text-amber-200 hover:underline font-medium"
            >
              🌐 www.spsc.campeche.gob.mx
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <label className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs">
            <Upload className="w-4 h-4 text-amber-200" />
            Importar JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all scale-100 hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nueva Inspección
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por folio, ubicación, municipio o solicitante..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <span className="text-xs font-semibold text-slate-500 hidden sm:block">Filtrar:</span>
          {(['todos', 'finalizado', 'borrador'] as const).map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#691C32] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Inspections Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const folio = item.seccion1.folioInterno || item.folioInterno || 'SIN FOLIO';
          const isDone = item.status === 'finalizado';
          const dictamen = item.seccion10.dictamenOpciones?.[0] || 'Dictamen en proceso';
          const totalPhotos = (item.seccion12.grupos || []).reduce((acc, g) => {
            let count = 0;
            if (g.fotoNorte?.url) count++;
            if (g.fotoSur?.url) count++;
            if (g.fotoOriente?.url) count++;
            if (g.fotoPoniente?.url) count++;
            if (g.vistaGeneral?.url) count++;
            if (g.detalleSitio?.url) count++;
            return acc + count;
          }, 0);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-[#691C32]/40"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-extrabold text-[#691C32] bg-[#691C32]/10 px-2.5 py-1 rounded-md">
                    {folio}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isDone ? 'Finalizado' : 'Borrador'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#691C32] transition-colors line-clamp-2">
                    {item.seccion1.ubicacionExacta || 'Ubicación sin registrar'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {item.seccion1.coloniaBarrio ? `${item.seccion1.coloniaBarrio}, ` : ''}
                    {item.seccion1.municipio || 'Campeche'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-[11px] space-y-1">
                  <div className="text-slate-600 font-medium truncate">
                    <span className="text-slate-400">Propuesta:</span> {dictamen}
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.seccion1.fechaInspeccion || 'S/F'}
                    </span>
                    <span>{totalPhotos} foto(s) registradas</span>
                  </div>
                </div>

                <div className="space-y-0.5 pt-1">
                  <div className="text-[11px] text-slate-700 flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-[#691C32] shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">
                      {item.responsable.nombreCompleto || 'Sin responsable asignado'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate pl-5">
                    {item.responsable.cargo || 'Encargado Balizamiento y Semaforizacion'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate pl-5">
                    {item.responsable.areaAdministrativa || 'Dirección de Transito y Vialidad'}
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="bg-slate-50/70 p-3 px-4 flex items-center justify-between border-t border-slate-100 gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onPreview(item)}
                    className="p-1.5 text-slate-600 hover:text-[#691C32] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Vista previa del documento"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(item)}
                    className="p-1.5 text-slate-600 hover:text-[#691C32] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Duplicar como plantilla"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleBackupExport(e, item)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Descargar copia de respaldo JSON"
                  >
                    <Database className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar inspección"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleExportPDF(e, item)}
                    disabled={generatingId === item.id}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-amber-300 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Exportar archivo PDF"
                  >
                    <Download className={`w-3.5 h-3.5 ${generatingId === item.id ? 'animate-bounce' : ''}`} />
                    PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="px-3 py-1.5 bg-[#691C32] hover:bg-[#521527] text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No se encontraron inspecciones
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm
                ? 'No existen registros que coincidan con los criterios de búsqueda ingresados.'
                : 'Aún no cuenta con inspecciones registradas. Haga clic en el botón inferior para iniciar una nueva.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-[#691C32] hover:bg-[#521527] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Crear Primera Inspección
          </button>
        </div>
      )}
    </div>
  );
};
