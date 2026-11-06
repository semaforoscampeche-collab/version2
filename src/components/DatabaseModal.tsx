import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  FolderOpen,
  RefreshCw,
  CheckCircle2,
  FileText,
  FileCheck,
} from 'lucide-react';
import { getServerStatus, ServerStatus } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    const data = await getServerStatus();
    setStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const uploadsPath = status?.localStorage?.uploadsDir || './uploads';
  const dataPath = status?.localStorage?.dataFile || './data/inspecciones.json';
  const filesCount = status?.localStorage?.filesCount ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#691C32] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Almacenamiento Físico Local</h3>
              <p className="text-xs text-white/80">
                Todos los datos y fotografías se guardan exclusivamente en el disco de tu computadora
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status summary banner */}
          <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">
                  Almacenamiento 100% Físico en esta PC
                </h4>
                <p className="text-xs mt-1 text-slate-600">
                  Sin bases de datos remotas ni dependencias externas. Cada inspección, croquis y fotografía se almacena directamente en las carpetas locales de tu equipo.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchStatus}
              disabled={loading}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs shrink-0 flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Actualizar estado"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#691C32]' : ''}`} />
              Revisar
            </button>
          </div>

          {/* Tarjetas de Directorios Locales */}
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-bold text-xs uppercase text-[#691C32] flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4" />
                  Carpetas Físicas en tu Disco Duro
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Disco Local Activo
                </span>
              </div>

              <div className="text-xs space-y-3 text-slate-700">
                <div>
                  <span className="block text-slate-500 text-[11px] font-semibold mb-1">
                    📁 Carpeta física de fotografías y croquis:
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-300 break-all select-all">
                    {uploadsPath}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Aquí se guardan las fotos capturadas en campo y croquis esquemáticos.
                  </span>
                </div>

                <div>
                  <span className="block text-slate-500 text-[11px] font-semibold mb-1">
                    📄 Archivo físico de datos y expedientes:
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-300 break-all select-all">
                    {dataPath}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Archivo JSON editable con el historial de todos los anexos capturados.
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-600 font-medium">Total de fotos/croquis en disco:</span>
                  <span className="font-black text-[#691C32] bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md">
                    {filesCount} archivo(s) físicos
                  </span>
                </div>
              </div>
            </div>

            {/* Garantía de Privacidad y Portabilidad */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#691C32]">
                <FileCheck className="w-4 h-4" />
                Respaldo y Portabilidad Inmediata
              </div>
              <p className="leading-relaxed">
                Para hacer una copia de seguridad o mudar tus expedientes a otra computadora, solo copia las carpetas <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#691C32]">/uploads</code> y <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#691C32]">/data</code>. También puedes exportar e importar archivos JSON individuales desde el listado principal.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Dirección de Tránsito y Vialidad • Campeche
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#691C32] hover:bg-[#521527] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
