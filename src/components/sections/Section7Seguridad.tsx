import React from 'react';
import { InspectionData } from '../../types/inspection';
import { ShieldCheck, Eye, Sun, Footprints, Accessibility } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const Section7Seguridad: React.FC<Props> = ({ data, onChange }) => {
  const s7 = data.seccion7;

  const handleFieldChange = (field: keyof typeof s7, value: any) => {
    onChange(prev => ({
      ...prev,
      seccion7: {
        ...prev.seccion7,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#691C32]" />
          VII. Condiciones de Seguridad Vial
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Evaluación de factores de riesgo, visibilidad entre usuarios, nivel de iluminación y continuidad de accesibilidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Visibilidad */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#691C32]" />
            Visibilidad del Tramo
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'excelente', label: 'Excelente' },
              { id: 'buena', label: 'Buena' },
              { id: 'regular', label: 'Regular' },
              { id: 'mala', label: 'Mala' },
            ].map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleFieldChange('visibilidad', item.id)}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                  s7.visibilidad === item.id
                    ? 'bg-[#691C32] text-white border-[#691C32]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Iluminación */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-[#691C32]" />
            Iluminación Pública Nocturna
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'buena', label: 'Buena' },
              { id: 'regular', label: 'Regular' },
              { id: 'deficiente', label: 'Deficiente' },
              { id: 'no_existe', label: 'No existe' },
            ].map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleFieldChange('iluminacion', item.id)}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                  s7.iluminacion === item.id
                    ? 'bg-[#691C32] text-white border-[#691C32]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Banquetas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-[#691C32]" />
            Continuidad de Banquetas
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'continuas', label: 'Continuas' },
              { id: 'discontinuas', label: 'Discontinuas' },
              { id: 'inexistentes', label: 'Inexistentes' },
            ].map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleFieldChange('banquetas', item.id)}
                className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                  s7.banquetas === item.id
                    ? 'bg-[#691C32] text-white border-[#691C32]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rampas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Accessibility className="w-4 h-4 text-[#691C32]" />
            Rampas de Accesibilidad Universal
          </h3>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleFieldChange('rampas', true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                s7.rampas
                  ? 'bg-[#691C32] text-white border-[#691C32]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Sí existen
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('rampas', false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                !s7.rampas
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              No existen
            </button>
          </div>
        </div>
      </div>

      {/* Comentarios adicionales */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Comentarios y Observaciones de Seguridad Vial
        </label>
        <textarea
          rows={3}
          value={s7.comentarios}
          onChange={(e) => handleFieldChange('comentarios', e.target.value)}
          placeholder="Ej: Adecuada visibilidad diurna; se requiere poda de ramas de árbol que ocultan parcialmente la visión del entronque..."
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900"
        />
      </div>
    </div>
  );
};
