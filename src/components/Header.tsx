import React from 'react';
import { InspectionData, InspectionStatus } from '../types/inspection';
import {
  Save,
  Eye,
  Download,
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  FileCheck,
  Database
} from 'lucide-react';

interface Props {
  data: InspectionData | null;
  mode: 'list' | 'edit' | 'preview';
  onBackToList: () => void;
  onSave: () => void;
  onTogglePreview: () => void;
  onGeneratePdf: () => void;
  onToggleStatus: () => void;
  onOpenDatabaseModal?: () => void;
  saving?: boolean;
}

export const Header: React.FC<Props> = ({
  data,
  mode,
  onBackToList,
  onSave,
  onTogglePreview,
  onGeneratePdf,
  onToggleStatus,
  onOpenDatabaseModal,
  saving = false,
}) => {
  const folio = data?.seccion1.folioInterno || data?.folioInterno || 'NUEVA INSPECCIÓN';
  const status: InspectionStatus = data?.status || 'borrador';

  return (
    <header className="bg-[#691C32] text-white border-b-4 border-[#9F2241] shadow-md sticky top-0 z-40 print:hidden">
      {/* Top micro institutional banner */}
      <div className="bg-[#521527] px-4 py-1 text-[11px] text-white/90 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-semibold tracking-wider uppercase">
            {data?.institutionalInfo?.dependencia || 'GOBIERNO DEL ESTADO DE CAMPECHE'} • {data?.institutionalInfo?.direccionUnidad || 'DIRECCIÓN DE TRANSITO Y VIALIDAD'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-[10px] text-amber-200 font-medium">
            Encargado Balizamiento y Semaforizacion • Tel: 9818119110 ext 80050
          </div>
          {onOpenDatabaseModal && (
            <button
              type="button"
              onClick={onOpenDatabaseModal}
              className="flex items-center gap-1.5 text-amber-200 cursor-pointer bg-black/25 hover:bg-black/40 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-300/30 transition-colors"
              title="Ver estado de base de datos MySQL y almacenamiento local"
            >
              <Database className="w-3 h-3 text-amber-300" />
              <span>Base de Datos / Red</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Folio */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {mode !== 'list' && (
            <button
              type="button"
              onClick={onBackToList}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              title="Volver al Listado de Inspecciones"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Anexo Técnico de Levantamiento</span>
              {mode !== 'list' && (
                <span className="text-xs font-mono font-medium bg-black/25 px-2.5 py-0.5 rounded text-amber-200 border border-white/15">
                  {folio}
                </span>
              )}
            </h1>
            <p className="text-[11px] text-white/75 truncate max-w-md">
              {mode === 'list'
                ? 'Dirección de Transito y Vialidad • Balizamiento y Semaforización'
                : data?.seccion1.ubicacionExacta || 'Sin ubicación registrada aún'}
            </p>
          </div>
        </div>

        {/* Right: Actions when editing or previewing */}
        {mode !== 'list' && data && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Status toggle button */}
            <button
              type="button"
              onClick={onToggleStatus}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                status === 'finalizado'
                  ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400'
                  : 'bg-amber-500/80 hover:bg-amber-500 text-white border-amber-300'
              }`}
              title="Cambiar estado del documento"
            >
              {status === 'finalizado' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Finalizado
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Borrador
                </>
              )}
            </button>

            {/* Guardar */}
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-3.5 py-1.5 bg-white text-[#691C32] hover:bg-slate-100 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>

            {/* Vista Previa toggle */}
            <button
              type="button"
              onClick={onTogglePreview}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'preview'
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-sm'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {mode === 'preview' ? 'Modo Formulario' : 'Vista Previa'}
            </button>

            {/* Exportar PDF */}
            <button
              type="button"
              onClick={onGeneratePdf}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Generar PDF
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
