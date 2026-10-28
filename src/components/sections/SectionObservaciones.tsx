import React from 'react';
import { InspectionData } from '../../types/inspection';
import { generateObjectiveObservations } from '../../services/observationGenerator';
import { FileEdit, Sparkles, RotateCcw, Copy, Check } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const SectionObservaciones: React.FC<Props> = ({ data, onChange }) => {
  const [copied, setCopied] = React.useState(false);
  const texto = data.observaciones.texto || '';

  const handleTextChange = (val: string) => {
    onChange((prev) => ({
      ...prev,
      observaciones: {
        ...prev.observaciones,
        texto: val,
      },
    }));
  };

  const handleGenerate = () => {
    if (texto.trim() && !confirm('¿Desea regenerar el borrador de observaciones a partir de los datos capturados? Esto actualizará el texto.')) {
      return;
    }
    const generated = generateObjectiveObservations(data);
    handleTextChange(generated);
  };

  const handleClear = () => {
    if (!confirm('¿Desea limpiar el campo de observaciones?')) return;
    handleTextChange('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-[#691C32]" />
          Observaciones y Dictamen Técnico General
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Redacción objetiva y estructurada en párrafos sobre hechos observados, aforos registrados y recomendaciones técnicas.
        </p>
      </div>

      {/* Control bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          Puede redactar manualmente o pulsar el botón para compilar automáticamente todos los datos del formulario.
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="px-3.5 py-2 bg-[#691C32] hover:bg-[#521527] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Generar observaciones a partir de los datos
          </button>

          {texto && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copiar texto al portapapeles"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Limpiar texto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpiar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Cuerpo de Observaciones Técnicas (Párrafos estructurados)
        </label>
        <textarea
          rows={14}
          value={texto}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Haga clic en 'Generar observaciones a partir de los datos' o redacte aquí directamente..."
          className="w-full px-4 py-3.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 leading-relaxed font-sans shadow-2xs"
        />
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
          <span>Los hechos de inspección deben estar claramente separados de las recomendaciones o dictamen final.</span>
          <span>{texto.length} caracteres | {texto.split(/\s+/).filter(Boolean).length} palabras</span>
        </div>
      </div>
    </div>
  );
};
