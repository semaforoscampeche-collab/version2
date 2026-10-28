import React from 'react';
import { InspectionData } from '../../types/inspection';
import { Lightbulb, CheckSquare, Square } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const OPCIONES_DICTAMEN = [
  'Procede el paso peatonal',
  'Procede paso peatonal con reductores de velocidad',
  'Procede solo reductores de velocidad con señal vertical',
  'Procede con plataforma elevada',
  'Procede con semaforización',
  'Procede con isla de refugio',
  'Procede con señalética',
  'No procede',
];

export const isDictamenSelected = (opciones: string[] | undefined, target: string): boolean => {
  if (!opciones) return false;
  if (opciones.includes(target)) return true;
  if (target === 'Procede el paso peatonal' && opciones.includes('Procede únicamente el paso peatonal')) return true;
  return false;
};

export const Section10Propuesta: React.FC<Props> = ({ data, onChange }) => {
  const s10 = data.seccion10;

  const toggleDictamen = (opcion: string) => {
    const currentlyActive = isDictamenSelected(s10.dictamenOpciones, opcion);
    let updated: string[];

    if (currentlyActive) {
      updated = s10.dictamenOpciones.filter(
        o => o !== opcion && !(opcion === 'Procede el paso peatonal' && o === 'Procede únicamente el paso peatonal')
      );
    } else {
      // If choosing 'No procede', optionally allow it or keep multi-select
      updated = [...s10.dictamenOpciones, opcion];
    }

    onChange(prev => ({
      ...prev,
      seccion10: {
        ...prev.seccion10,
        dictamenOpciones: updated,
      },
    }));
  };

  const handleTextoChange = (val: string) => {
    onChange(prev => ({
      ...prev,
      seccion10: {
        ...prev.seccion10,
        propuestaDetallada: val,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#691C32]" />
          X. Propuesta Técnica y Dictamen de Viabilidad
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Resolución técnica institucional para la autorización de obras viales, señalamiento y dispositivos de control.
        </p>
      </div>

      {/* Casillas de dictamen */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Dictamen Técnico de Intervención (Seleccione las opciones que aplican)
          </h3>
          <span className="text-xs text-slate-400">
            {s10.dictamenOpciones.length} opción(es) marcada(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {OPCIONES_DICTAMEN.map((opc) => {
            const isChecked = isDictamenSelected(s10.dictamenOpciones, opc);
            const isNoProcede = opc === 'No procede';
            return (
              <button
                type="button"
                key={opc}
                onClick={() => toggleDictamen(opc)}
                className={`p-3.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  isChecked
                    ? isNoProcede
                      ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-2xs'
                      : 'border-[#691C32] bg-[#691C32]/5 text-[#691C32] font-bold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className={`w-4 h-4 shrink-0 mt-0.5 ${isNoProcede ? 'text-red-600' : 'text-[#691C32]'}`} />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                )}
                <span className="text-xs leading-snug">{opc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campo de texto amplio */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Memoria Descriptiva de la Propuesta Técnica y Medidas Complementarias <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={6}
          value={s10.propuestaDetallada}
          onChange={(e) => handleTextoChange(e.target.value)}
          placeholder="Desarrolle ampliamente los fundamentos técnicos de la propuesta: especificaciones de materiales, dimensiones del paso peatonal (ancho y separación de franjas), tipo de reductor de velocidad (trapecial, trapezoidal, boyas), distancia de anticipación de señales verticales SP-33 y restrictivas SR-9, adecuaciones a banquetas y balizamiento de línea de alto..."
          className="w-full px-3.5 py-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 leading-relaxed font-normal"
        />
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-[11px] font-semibold text-slate-500">Plantillas técnicas rápidas:</span>
          <button
            type="button"
            onClick={() => handleTextoChange('Con base en la inspección de campo y la velocidad vehicular registrada, se dictamina PROCEDENTE ÚNICAMENTE la instalación de reductores de velocidad acompañados de señalamiento vertical preventivo (SP) y restrictivo de velocidad (SR a 30 km/h) a 25 metros de aproximación en ambos sentidos de circulación.')}
            className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-[#691C32]/10 hover:text-[#691C32] text-slate-700 rounded border border-slate-200 transition-colors cursor-pointer"
          >
            + Solo reductores con señal vertical
          </button>
          <button
            type="button"
            onClick={() => handleTextoChange('Con base en los aforos peatonales y vehiculares, se dictamina PROCEDENTE la implementación de un paso peatonal a nivel de calzada tipo cebra (franjas de 0.40 m) complementado con reductores de velocidad trapeciales a 20 metros de aproximación y señalamiento vertical reglamentario.')}
            className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-[#691C32]/10 hover:text-[#691C32] text-slate-700 rounded border border-slate-200 transition-colors cursor-pointer"
          >
            + Paso peatonal c/ reductores
          </button>
          <button
            type="button"
            onClick={() => handleTextoChange('Tras la inspección técnica ocular y el aforo vial realizado, se concluye que NO PROCEDE la solicitud debido a que las características geométricas y el flujo vehicular no cumplen los umbrales mínimos establecidos por la normativa técnica de vialidad.')}
            className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded border border-slate-200 transition-colors cursor-pointer"
          >
            + No procede
          </button>
        </div>
        <span className="text-[11px] text-slate-400 mt-1.5 block">
          Esta memoria técnica se imprimirá textualmente en el cuerpo resolutivo del dictamen.
        </span>
      </div>
    </div>
  );
};
