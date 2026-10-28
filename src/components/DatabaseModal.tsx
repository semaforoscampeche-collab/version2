import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  HardDrive,
  FolderOpen,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Network,
  Share2,
  Terminal,
  Server
} from 'lucide-react';
import { getServerStatus, ServerStatus } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const isMySQL = status?.mysql?.connected;
  const uploadsPath = status?.localStorage?.uploadsDir || './uploads';
  const dataPath = status?.localStorage?.dataFile || './data/inspecciones.json';
  const filesCount = status?.localStorage?.filesCount ?? 0;

  const handleDownloadSchema = () => {
    window.location.href = '/api/schema.sql';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#691C32] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Servidor y Base de Datos Local</h3>
              <p className="text-xs text-white/80">
                Almacenamiento físico centralizado en tu computadora y red local (LAN)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Status summary banner */}
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
            isMySQL 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              {isMySQL ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {isMySQL 
                    ? 'Base de Datos MySQL Conectada y Activa' 
                    : 'Modo Almacenamiento Local Físico Activo (Listo para MySQL)'}
                </h4>
                <p className="text-xs mt-1 text-slate-600">
                  {isMySQL
                    ? `Guardando directamente en la base de datos MySQL '${status?.mysql?.database}' en ${status?.mysql?.host}:${status?.mysql?.port}.`
                    : 'Las inspecciones y fotos se guardan físicamente en tu disco duro (carpetas ./data y ./uploads). Al iniciar tu MySQL o importar schema.sql, se conectará automáticamente.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchStatus}
              disabled={loading}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs shrink-0 flex items-center gap-1 text-xs font-semibold"
              title="Actualizar estado"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#691C32]' : ''}`} />
              Revisar
            </button>
          </div>

          {/* Grid de 2 Tarjetas: MySQL y Carpeta Local */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta MySQL */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-bold text-xs uppercase text-[#691C32] flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  Base de Datos MySQL
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isMySQL ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isMySQL ? 'Conectado' : 'Espera de Conexión'}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base de datos:</span>
                  <span className="font-mono font-bold text-slate-800">{status?.mysql?.database || 'anexo_tecnico_vial'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Host / Puerto:</span>
                  <span className="font-mono text-slate-800">{status?.mysql?.host || 'localhost'}:{status?.mysql?.port || 3306}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Usuario:</span>
                  <span className="font-mono text-slate-800">{status?.mysql?.user || 'root'}</span>
                </div>
                {status?.mysql?.error && !isMySQL && (
                  <div className="text-[11px] text-amber-700 bg-amber-100/50 p-2 rounded mt-2">
                    {status.mysql.error}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={handleDownloadSchema}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#691C32]" />
                  Descargar schema.sql para MySQL
                </button>
              </div>
            </div>

            {/* Tarjeta Almacenamiento Físico */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-bold text-xs uppercase text-[#691C32] flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4" />
                  Disco Local de tu PC
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Activo
                </span>
              </div>

              <div className="text-xs space-y-2 text-slate-600">
                <div>
                  <span className="block text-slate-500 text-[11px]">Carpeta de fotos y croquis:</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block truncate" title={uploadsPath}>
                    {uploadsPath}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[11px]">Archivo de datos (JSON):</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block truncate" title={dataPath}>
                    {dataPath}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-slate-500">Archivos en /uploads:</span>
                  <span className="font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">{filesCount} archivo(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guía para compartir en red local (LAN) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-xs uppercase text-[#691C32] flex items-center gap-1.5">
              <Network className="w-4 h-4 text-[#691C32]" />
              ¿Cómo compartir con otras computadoras en tu red local?
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#691C32] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <p>
                  Ejecuta el sistema en tu PC principal ejecutando: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[#691C32] font-semibold">npm run dev</code>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#691C32] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <p>
                  Obtén la IP local de tu computadora (por ejemplo <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-semibold">192.168.1.50</code>).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#691C32] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <p>
                  Desde cualquier otra computadora o tablet conectada a la misma red WiFi o cableada, abre el navegador e ingresa a: <br />
                  <span className="inline-block mt-1 bg-amber-50 border border-amber-300 text-amber-950 font-mono font-bold px-2 py-1 rounded">
                    http://[TU-IP-LOCAL]:3000
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">✓</span>
                <p className="font-medium text-emerald-800">
                  Todas las fotos se subirán directamente a la carpeta <code className="font-mono">uploads/</code> de tu PC y todas las modificaciones quedarán guardadas centralmente en un solo lugar físico.
                </p>
              </div>
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
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
