import React from 'react';
import { InspectionData } from '../../types/inspection';
import { Users, Clock, CheckSquare, Square } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

const USUARIOS_CONFIG: Array<{
  key: keyof InspectionData['seccion4']['usuarios'];
  label: string;
}> = [
  { key: 'escolares', label: 'Escolares (Alumnos / Estudiantes)' },
  { key: 'adultosMayores', label: 'Adultos Mayores' },
  { key: 'personasDiscapacidad', label: 'Personas con Discapacidad' },
  { key: 'trabajadores', label: 'Trabajadores / Empleados' },
  { key: 'transportePublico', label: 'Usuarios del Transporte Público' },
  { key: 'comercios', label: 'Clientes y Usuarios de Comercios' },
];

const COMPORTAMIENTOS = [
  'Cruzan en grupo',
  'Cruzan individualmente',
  'Cruzan fuera de un cruce señalizado',
  'Cruzan entre vehículos',
  'Cruzan corriendo',
  'Esperan mucho tiempo para cruzar',
];

export const Section4Peatonal: React.FC<Props> = ({ data, onChange }) => {
  const s4 = data.seccion4;

  const handleConteoChange = (field: 'conteo15min' | 'conteo30min' | 'conteo60min', value: string) => {
    onChange(prev => ({
      ...prev,
      seccion4: {
        ...prev.seccion4,
        [field]: value,
      },
    }));
  };

  const handleUsuarioDemanda = (key: keyof typeof s4.usuarios, level: 'baja' | 'media' | 'alta' | '') => {
    onChange(prev => ({
      ...prev,
      seccion4: {
        ...prev.seccion4,
        usuarios: {
          ...prev.seccion4.usuarios,
          [key]: level,
        },
      },
    }));
  };

  const toggleComportamiento = (item: string) => {
    const exists = s4.comportamiento.includes(item);
    const updated = exists
      ? s4.comportamiento.filter(c => c !== item)
      : [...s4.comportamiento, item];

    onChange(prev => ({
      ...prev,
      seccion4: {
        ...prev.seccion4,
        comportamiento: updated,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#691C32]" />
          IV. Demanda y Aforo Peatonal
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Volúmenes de paso de peatones por intervalos temporales, estratificación de usuarios y patrones de cruce.
        </p>
      </div>

      {/* Conteo Peatonal por Intervalos */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#691C32]" />
          Tabla de Conteo Peatonal por Período de Observación
        </h3>
        <p className="text-xs text-slate-500">
          Registre el total de personas que cruzaron o caminaron por el punto de inspección en cada período:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <span className="block text-xs font-semibold text-slate-700 mb-1">
              Conteo a los 15 minutos
            </span>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={s4.conteo15min}
                onChange={(e) => handleConteoChange('conteo15min', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900 pr-16"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                peatones
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <span className="block text-xs font-semibold text-slate-700 mb-1">
              Conteo a los 30 minutos
            </span>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={s4.conteo30min}
                onChange={(e) => handleConteoChange('conteo30min', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900 pr-16"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                peatones
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <span className="block text-xs font-semibold text-slate-700 mb-1">
              Conteo a los 60 minutos (1 hora)
            </span>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={s4.conteo60min}
                onChange={(e) => handleConteoChange('conteo60min', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900 pr-16"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                peatones
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tipos de Usuarios */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Clasificación de Tipos de Usuarios y Grado de Demanda
        </h3>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {USUARIOS_CONFIG.map(({ key, label }) => {
            const current = s4.usuarios[key];
            return (
              <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/40 hover:bg-slate-50">
                <span className="text-xs font-semibold text-slate-800">
                  {label}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  {(['baja', 'media', 'alta'] as const).map(lvl => {
                    const isSelected = current === lvl;
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => handleUsuarioDemanda(key, isSelected ? '' : lvl)}
                        className={`px-3 py-1 text-xs font-bold rounded border transition-colors cursor-pointer ${
                          isSelected
                            ? lvl === 'alta'
                              ? 'bg-red-700 text-white border-red-700'
                              : lvl === 'media'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {lvl.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comportamiento Peatonal */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Comportamiento Observado de los Peatones
          </h3>
          <span className="text-xs text-slate-400">
            {s4.comportamiento.length} seleccionados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {COMPORTAMIENTOS.map(comp => {
            const isChecked = s4.comportamiento.includes(comp);
            return (
              <button
                type="button"
                key={comp}
                onClick={() => toggleComportamiento(comp)}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isChecked
                    ? 'border-[#691C32] bg-[#691C32]/5 text-[#691C32] font-semibold'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-[#691C32] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className="text-xs">{comp}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Observaciones complementarias */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Observaciones Complementarias de la Demanda Peatonal
        </label>
        <textarea
          rows={3}
          value={s4.observaciones}
          onChange={(e) => onChange(prev => ({
            ...prev,
            seccion4: {
              ...prev.seccion4,
              observaciones: e.target.value,
            },
          }))}
          placeholder="Ej: Flujo peatonal crítico coincidente con horarios de timbrado escolar; tiempos de espera superiores a 90 segundos para cruzar..."
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900"
        />
      </div>
    </div>
  );
};
