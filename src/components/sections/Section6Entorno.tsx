import React, { useState } from 'react';
import { InspectionData } from '../../types/inspection';
import { Building2, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const Section6Entorno: React.FC<Props> = ({ data, onChange }) => {
  const generadores = data.seccion6.generadores;
  const [nuevoNombre, setNuevoNombre] = useState('');

  const toggleExiste = (id: string, existe: boolean) => {
    onChange(prev => ({
      ...prev,
      seccion6: {
        ...prev.seccion6,
        generadores: prev.seccion6.generadores.map(g =>
          g.id === id ? { ...g, existe, distanciaMetros: existe ? g.distanciaMetros : '' } : g
        ),
      },
    }));
  };

  const handleDistancia = (id: string, distancia: string) => {
    onChange(prev => ({
      ...prev,
      seccion6: {
        ...prev.seccion6,
        generadores: prev.seccion6.generadores.map(g =>
          g.id === id ? { ...g, distanciaMetros: distancia } : g
        ),
      },
    }));
  };

  const handleAgregarNuevo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const nuevoItem = {
      id: 'gen-' + Date.now(),
      tipo: nuevoNombre.trim(),
      existe: true,
      distanciaMetros: '',
    };

    onChange(prev => ({
      ...prev,
      seccion6: {
        ...prev.seccion6,
        generadores: [...prev.seccion6.generadores, nuevoItem],
      },
    }));

    setNuevoNombre('');
  };

  const handleEliminar = (id: string) => {
    onChange(prev => ({
      ...prev,
      seccion6: {
        ...prev.seccion6,
        generadores: prev.seccion6.generadores.filter(g => g.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#691C32]" />
          VI. Entorno Urbano y Generadores de Movilidad
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Inventario de equipamientos y servicios generadores de viajes peatonales y vehiculares en la zona de influencia.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Equipamientos e Infraestructura Urbana
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {generadores.filter(g => g.existe).length} identificados en el entorno
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4 w-1/2">Tipo de Infraestructura</th>
                <th className="py-2.5 px-4 w-1/4 text-center">Existencia</th>
                <th className="py-2.5 px-4 w-1/4">Distancia Aprox. (metros)</th>
                <th className="py-2.5 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {generadores.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-800">
                    {g.tipo}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => toggleExiste(g.id, true)}
                        className={`px-3 py-1 font-bold text-xs transition-colors cursor-pointer ${
                          g.existe
                            ? 'bg-[#691C32] text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExiste(g.id, false)}
                        className={`px-3 py-1 font-bold text-xs transition-colors cursor-pointer ${
                          !g.existe
                            ? 'bg-slate-700 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="relative max-w-xs">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        disabled={!g.existe}
                        value={g.distanciaMetros}
                        onChange={(e) => handleDistancia(g.id, e.target.value)}
                        placeholder={g.existe ? 'Ej: 50' : '-'}
                        className="w-full px-3 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-[#691C32] disabled:bg-slate-100 disabled:text-slate-400 font-semibold text-slate-800 pr-8"
                      />
                      {g.existe && (
                        <span className="absolute right-2 top-1 text-[11px] text-slate-400 pointer-events-none">
                          m
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {g.id.startsWith('gen-') && (
                      <button
                        type="button"
                        onClick={() => handleEliminar(g.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Eliminar elemento personalizado"
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

        {/* Agregar nuevo elemento */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleAgregarNuevo} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Agregar otro elemento (ej: Farmacia, Guardería...)"
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
