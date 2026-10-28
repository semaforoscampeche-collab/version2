import React from 'react';
import { InspectionData } from '../../types/inspection';
import { ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const Section8Evaluacion: React.FC<Props> = ({ data, onChange }) => {
  const criterios = data.seccion8.criterios;

  const setCumple = (id: string, cumple: boolean | null) => {
    onChange(prev => ({
      ...prev,
      seccion8: {
        ...prev.seccion8,
        criterios: prev.seccion8.criterios.map(c =>
          c.id === id ? { ...c, cumple } : c
        ),
      },
    }));
  };

  const setObservacion = (id: string, obs: string) => {
    onChange(prev => ({
      ...prev,
      seccion8: {
        ...prev.seccion8,
        criterios: prev.seccion8.criterios.map(c =>
          c.id === id ? { ...c, observaciones: obs } : c
        ),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-[#691C32]" />
          VIII. Evaluación Técnica Normativa
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Verificación reglamentaria de cumplimiento de criterios conforme al Manual de Señalización Vial y Movilidad.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-5/12">Criterio Técnico Normativo</th>
                <th className="py-3 px-4 w-3/12 text-center">Evaluación</th>
                <th className="py-3 px-4 w-4/12">Observaciones Técnicas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criterios.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {c.criterio}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setCumple(c.id, c.cumple === true ? null : true)}
                        className={`px-3 py-1.5 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                          c.cumple === true
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cumple
                      </button>
                      <button
                        type="button"
                        onClick={() => setCumple(c.id, c.cumple === false ? null : false)}
                        className={`px-3 py-1.5 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                          c.cumple === false
                            ? 'bg-rose-700 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        No cumple
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={c.observaciones}
                      onChange={(e) => setObservacion(c.id, e.target.value)}
                      placeholder="Observación o justificación del criterio..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-[#691C32] text-slate-900"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
