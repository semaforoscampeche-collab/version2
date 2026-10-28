import React from 'react';
import { InspectionData } from '../../types/inspection';
import { Signpost, CheckSquare, Square } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

const TIPOS_VIALIDAD = [
  'Avenida primaria',
  'Avenida secundaria',
  'Colectora',
  'Local',
  'Carretera urbana',
  'Zona escolar',
  'Zona comercial',
  'Zona hospitalaria',
];

const JERARQUIAS_VIAL = [
  'Primaria',
  'Secundaria',
  'Colectora',
  'Local',
];

export const Section2Clasificacion: React.FC<Props> = ({ data, onChange }) => {
  const s2 = data.seccion2;

  const toggleTipo = (tipo: string) => {
    const exists = s2.tipoVialidad.includes(tipo);
    const updated = exists
      ? s2.tipoVialidad.filter(t => t !== tipo)
      : [...s2.tipoVialidad, tipo];

    onChange(prev => ({
      ...prev,
      seccion2: {
        ...prev.seccion2,
        tipoVialidad: updated,
      },
    }));
  };

  const toggleJerarquia = (jerarquia: string) => {
    const exists = s2.jerarquiaVial.includes(jerarquia);
    const updated = exists
      ? s2.jerarquiaVial.filter(j => j !== jerarquia)
      : [...s2.jerarquiaVial, jerarquia];

    onChange(prev => ({
      ...prev,
      seccion2: {
        ...prev.seccion2,
        jerarquiaVial: updated,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <Signpost className="w-5 h-5 text-[#691C32]" />
          II. Clasificación de la Vialidad
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Definición del tipo de vialidad por uso de suelo circundante y su jerarquía en la red vial urbana.
        </p>
      </div>

      {/* Tipo de Vialidad */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Tipo de Vialidad (Seleccione una o varias opciones aplicables)
          </h3>
          <span className="text-xs text-slate-400">
            {s2.tipoVialidad.length} seleccionada(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {TIPOS_VIALIDAD.map((tipo) => {
            const isChecked = s2.tipoVialidad.includes(tipo);
            return (
              <button
                type="button"
                key={tipo}
                onClick={() => toggleTipo(tipo)}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isChecked
                    ? 'border-[#691C32] bg-[#691C32]/5 text-[#691C32] font-semibold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-[#691C32] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className="text-xs">{tipo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jerarquía Vial */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Jerarquía Vial
          </h3>
          <span className="text-xs text-slate-400">
            {s2.jerarquiaVial.length} seleccionada(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {JERARQUIAS_VIAL.map((jerarquia) => {
            const isChecked = s2.jerarquiaVial.includes(jerarquia);
            return (
              <button
                type="button"
                key={jerarquia}
                onClick={() => toggleJerarquia(jerarquia)}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isChecked
                    ? 'border-[#691C32] bg-[#691C32]/5 text-[#691C32] font-semibold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-[#691C32] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className="text-xs">{jerarquia}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
