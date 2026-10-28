import React from 'react';
import { InspectionData } from '../../types/inspection';
import { Car, Gauge, BarChart2, Bike, Bus, Truck, Activity } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const Section5Vehicular: React.FC<Props> = ({ data, onChange }) => {
  const s5 = data.seccion5;

  const handleFieldChange = (field: keyof typeof s5, value: any) => {
    onChange(prev => ({
      ...prev,
      seccion5: {
        ...prev.seccion5,
        [field]: value,
      },
    }));
  };

  const totalVehiculos = [
    Number(s5.automoviles) || 0,
    Number(s5.motocicletas) || 0,
    Number(s5.camiones) || 0,
    Number(s5.transportePublico) || 0,
    Number(s5.bicicletas) || 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <Car className="w-5 h-5 text-[#691C32]" />
          V. Tránsito y Aforo Vehicular
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Aforo por modo de transporte, rangos de velocidad operativa y estimación de volumen vehicular.
        </p>
      </div>

      {/* Conteo Vehicular */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Conteo Vehicular Cuantificado por Modalidad
          </h3>
          <span className="text-xs font-bold text-[#691C32] bg-[#691C32]/10 px-2.5 py-1 rounded-full">
            Total observado: {totalVehiculos} vehículos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {/* Automóviles */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <Car className="w-5 h-5 mx-auto text-slate-600 mb-1" />
            <span className="block text-[11px] font-semibold text-slate-600 mb-1">
              Automóviles
            </span>
            <input
              type="number"
              min="0"
              value={s5.automoviles}
              onChange={(e) => handleFieldChange('automoviles', e.target.value)}
              placeholder="0"
              className="w-full text-center px-2 py-1.5 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>

          {/* Motocicletas */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <Activity className="w-5 h-5 mx-auto text-slate-600 mb-1" />
            <span className="block text-[11px] font-semibold text-slate-600 mb-1">
              Motocicletas
            </span>
            <input
              type="number"
              min="0"
              value={s5.motocicletas}
              onChange={(e) => handleFieldChange('motocicletas', e.target.value)}
              placeholder="0"
              className="w-full text-center px-2 py-1.5 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>

          {/* Transporte Público */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <Bus className="w-5 h-5 mx-auto text-slate-600 mb-1" />
            <span className="block text-[11px] font-semibold text-slate-600 mb-1">
              Transporte Público
            </span>
            <input
              type="number"
              min="0"
              value={s5.transportePublico}
              onChange={(e) => handleFieldChange('transportePublico', e.target.value)}
              placeholder="0"
              className="w-full text-center px-2 py-1.5 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>

          {/* Camiones */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <Truck className="w-5 h-5 mx-auto text-slate-600 mb-1" />
            <span className="block text-[11px] font-semibold text-slate-600 mb-1">
              Camiones
            </span>
            <input
              type="number"
              min="0"
              value={s5.camiones}
              onChange={(e) => handleFieldChange('camiones', e.target.value)}
              placeholder="0"
              className="w-full text-center px-2 py-1.5 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>

          {/* Bicicletas */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <Bike className="w-5 h-5 mx-auto text-slate-600 mb-1" />
            <span className="block text-[11px] font-semibold text-slate-600 mb-1">
              Bicicletas
            </span>
            <input
              type="number"
              min="0"
              value={s5.bicicletas}
              onChange={(e) => handleFieldChange('bicicletas', e.target.value)}
              placeholder="0"
              className="w-full text-center px-2 py-1.5 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Velocidad y Volumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Velocidad observada */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3.5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-[#691C32]" />
            Velocidad Vehicular
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Rango de Velocidad Observado en Tramo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'menor_30', label: 'Menor de 30 km/h' },
                { id: 'de_30_a_50', label: '30 a 50 km/h' },
                { id: 'mayor_50', label: 'Mayor de 50 km/h' },
              ].map(r => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => handleFieldChange('velocidadRango', r.id)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                    s5.velocidadRango === r.id
                      ? 'bg-[#691C32] text-white border-[#691C32]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Velocidad Estimada o Medida (km/h)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="160"
                value={s5.velocidadEstimadaKmH}
                onChange={(e) => handleFieldChange('velocidadEstimadaKmH', e.target.value)}
                placeholder="Ej: 48"
                className="w-full px-3.5 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900 pr-16"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                km/h
              </span>
            </div>
          </div>
        </div>

        {/* Volumen vehicular */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3.5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-[#691C32]" />
            Volumen Vehicular Estimado
          </h3>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { id: 'bajo', label: 'Bajo', desc: 'Flujo esporádico' },
              { id: 'medio', label: 'Medio', desc: 'Flujo regular' },
              { id: 'alto', label: 'Alto', desc: 'Flujo continuo / congestión' },
            ].map(vol => (
              <button
                type="button"
                key={vol.id}
                onClick={() => handleFieldChange('volumenVehicular', vol.id)}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  s5.volumenVehicular === vol.id
                    ? 'bg-[#691C32] text-white border-[#691C32] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-sm font-bold uppercase">{vol.label}</span>
                <span className={`block text-[10px] mt-0.5 ${s5.volumenVehicular === vol.id ? 'text-white/80' : 'text-slate-400'}`}>
                  {vol.desc}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones de Tránsito Vehicular
            </label>
            <input
              type="text"
              value={s5.observaciones}
              onChange={(e) => handleFieldChange('observaciones', e.target.value)}
              placeholder="Ej: Tránsito constante de rutas de camiones y combis de pasaje"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
