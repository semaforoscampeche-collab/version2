import React, { useState } from 'react';
import { InspectionData } from '../../types/inspection';
import { SlidersHorizontal, Plus, Trash2, Check, X } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const Section9Medidas: React.FC<Props> = ({ data, onChange }) => {
  const medidas = data.seccion9.medidas;
  const [nuevaMedida, setNuevaMedida] = useState('');

  const setAplica = (id: string, aplica: boolean | null) => {
    onChange(prev => ({
      ...prev,
      seccion9: {
        ...prev.seccion9,
        medidas: prev.seccion9.medidas.map(m =>
          m.id === id ? { ...m, aplica } : m
        ),
      },
    }));
  };

  const setObservacion = (id: string, obs: string) => {
    onChange(prev => ({
      ...prev,
      seccion9: {
        ...prev.seccion9,
        medidas: prev.seccion9.medidas.map(m =>
          m.id === id ? { ...m, observaciones: obs } : m
        ),
      },
    }));
  };

  const handleAgregar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaMedida.trim()) return;

    const item = {
      id: 'm-custom-' + Date.now(),
      dispositivo: nuevaMedida.trim(),
      aplica: true,
      observaciones: '',
    };

    onChange(prev => ({
      ...prev,
      seccion9: {
        ...prev.seccion9,
        medidas: [...prev.seccion9.medidas, item],
      },
    }));

    setNuevaMedida('');
  };

  const handleEliminar = (id: string) => {
    onChange(prev => ({
      ...prev,
      seccion9: {
        ...prev.seccion9,
        medidas: prev.seccion9.medidas.filter(m => m.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#691C32]" />
          IX. Medidas y Dispositivos Complementarios
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Determinación de elementos de señalamiento horizontal, vertical y obras de infraestructura vial requeridas.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-5/12">Dispositivo o Medida Vial</th>
                <th className="py-3 px-4 w-3/12 text-center">Procedencia / Aplica</th>
                <th className="py-3 px-4 w-4/12">Observaciones y Especificaciones</th>
                <th className="py-3 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medidas.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {m.dispositivo}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setAplica(m.id, m.aplica === true ? null : true)}
                        className={`px-3 py-1.5 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                          m.aplica === true
                            ? 'bg-[#691C32] text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => setAplica(m.id, m.aplica === false ? null : false)}
                        className={`px-3 py-1.5 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                          m.aplica === false
                            ? 'bg-slate-700 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        No
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={m.observaciones}
                      onChange={(e) => setObservacion(m.id, e.target.value)}
                      placeholder="Detalles de ubicación, dimensiones o material..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-[#691C32] text-slate-900"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    {m.id.startsWith('m-custom-') && (
                      <button
                        type="button"
                        onClick={() => handleEliminar(m.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Eliminar dispositivo personalizado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Agregar medida adicional */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleAgregar} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={nuevaMedida}
              onChange={(e) => setNuevaMedida(e.target.value)}
              placeholder="Agregar otra medida (ej: Radares pedagógicos, Balizas...)"
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
