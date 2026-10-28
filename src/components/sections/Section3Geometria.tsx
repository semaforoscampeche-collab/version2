import React from 'react';
import { InspectionData } from '../../types/inspection';
import { Ruler, Activity, CheckCircle2 } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const Section3Geometria: React.FC<Props> = ({ data, onChange }) => {
  const s3 = data.seccion3;

  const handleFieldChange = (field: keyof typeof s3, value: any) => {
    onChange(prev => ({
      ...prev,
      seccion3: {
        ...prev.seccion3,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <Ruler className="w-5 h-5 text-[#691C32]" />
          III. Características Geométricas de la Vialidad
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Dimensionamiento físico de calzada, banquetas, carriles, sentido vial y estado de rodamiento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Ancho vialidad */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Ancho de Vialidad (metros) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.05"
              value={s3.anchoVialidadMetros}
              onChange={(e) => handleFieldChange('anchoVialidadMetros', e.target.value)}
              placeholder="Ej: 10.50"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] font-semibold text-slate-900 pr-10"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
              m
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ancho total del arroyo vehicular</span>
        </div>

        {/* Número de carriles */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Número de Carriles <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={s3.numeroCarriles}
            onChange={(e) => handleFieldChange('numeroCarriles', e.target.value)}
            placeholder="Ej: 2"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] font-semibold text-slate-900"
          />
        </div>

        {/* Sentido de circulación */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Sentido de Circulación <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={s3.sentidoCirculacion}
            onChange={(e) => handleFieldChange('sentidoCirculacion', e.target.value)}
            placeholder="Ej: Doble sentido / Un sentido N-S"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-medium"
          />
        </div>
      </div>

      {/* Camellón, Banquetas, Rampas, Pendiente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Camellón central */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Camellón Central
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFieldChange('camellonCentral', true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                s3.camellonCentral
                  ? 'bg-[#691C32] text-white border-[#691C32]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('camellonCentral', false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                !s3.camellonCentral
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Banquetas */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Existencia de Banquetas
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFieldChange('banquetas', true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                s3.banquetas
                  ? 'bg-[#691C32] text-white border-[#691C32]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('banquetas', false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                !s3.banquetas
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Rampas */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Existencia de Rampas
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFieldChange('rampas', true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                s3.rampas
                  ? 'bg-[#691C32] text-white border-[#691C32]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('rampas', false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                !s3.rampas
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Pendiente */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Existencia de Pendiente
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFieldChange('pendiente', true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                s3.pendiente
                  ? 'bg-[#691C32] text-white border-[#691C32]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('pendiente', false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                !s3.pendiente
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Ancho de banquetas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Ancho de Banquetas (metros)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.05"
              value={s3.anchoBanquetasMetros}
              onChange={(e) => handleFieldChange('anchoBanquetasMetros', e.target.value)}
              placeholder="Ej: 2.10"
              disabled={!s3.banquetas}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] disabled:bg-slate-100 disabled:text-slate-400 font-semibold text-slate-900 pr-10"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
              m
            </span>
          </div>
        </div>

        {/* Estado del pavimento */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Estado del Pavimento <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 'bueno', label: 'Bueno', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
              { val: 'regular', label: 'Regular', color: 'border-amber-500 text-amber-700 bg-amber-50' },
              { val: 'malo', label: 'Malo', color: 'border-red-500 text-red-700 bg-red-50' },
            ].map(opt => (
              <button
                type="button"
                key={opt.val}
                onClick={() => handleFieldChange('estadoPavimento', opt.val)}
                className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  s3.estadoPavimento === opt.val
                    ? opt.color + ' ring-2 ring-offset-1 ring-slate-400 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s3.estadoPavimento === opt.val && <CheckCircle2 className="w-3.5 h-3.5" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Observaciones adicionales */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Observaciones Adicionales sobre las Características Físicas de la Vialidad
        </label>
        <textarea
          rows={3}
          value={s3.observaciones}
          onChange={(e) => handleFieldChange('observaciones', e.target.value)}
          placeholder="Ej: Carpeta asfáltica en condiciones regulares con desgaste por tránsito pesado; banquetas con libre paso peatonal sin obstrucción de postes."
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900"
        />
      </div>
    </div>
  );
};
