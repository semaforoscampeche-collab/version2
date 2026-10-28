import React from 'react';
import { InspectionData } from '../../types/inspection';
import { DraftingCompass, Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const Section11Croquis: React.FC<Props> = ({ data, onChange }) => {
  const croquisList = data.seccion11.croquisList || [];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert(`El archivo ${file.name} excede el límite de 8 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newItem = {
          id: 'croquis-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          url: event.target?.result as string,
          titulo: 'Esquema de Señalamiento / Croquis de Proyecto',
          descripcion: '',
        };

        onChange((prev) => ({
          ...prev,
          seccion11: {
            ...prev.seccion11,
            croquisList: [...(prev.seccion11.croquisList || []), newItem],
          },
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleUpdate = (id: string, field: 'titulo' | 'descripcion' | 'url', value: string) => {
    onChange((prev) => ({
      ...prev,
      seccion11: {
        ...prev.seccion11,
        croquisList: (prev.seccion11.croquisList || []).map((c) =>
          c.id === id ? { ...c, [field]: value } : c
        ),
      },
    }));
  };

  const handleReplace = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleUpdate(id, 'url', event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Desea eliminar este croquis de implementación?')) return;
    onChange((prev) => ({
      ...prev,
      seccion11: {
        ...prev.seccion11,
        croquisList: (prev.seccion11.croquisList || []).filter((c) => c.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <DraftingCompass className="w-5 h-5 text-[#691C32]" />
          XI. Croquis de Implementación y Planos de Señalamiento
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Planos esquemáticos de señalamiento horizontal (marcas en pavimento), señalamiento vertical y detalles constructivos propuestos.
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#691C32] rounded-xl p-6 text-center transition-colors">
        <input
          type="file"
          id="croquis-upload"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
        <label
          htmlFor="croquis-upload"
          className="cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <div className="w-12 h-12 rounded-full bg-[#691C32]/10 flex items-center justify-center text-[#691C32]">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 hover:text-[#691C32]">
              Haga clic aquí para seleccionar croquis o esquemas
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Puede cargar uno o múltiples planos (PNG, JPG, SVG). Se ajustarán automáticamente al PDF preservando sus proporciones.
            </p>
          </div>
        </label>
      </div>

      {/* Croquis Cards */}
      <div className="space-y-5">
        {croquisList.map((croquis, index) => (
          <div
            key={croquis.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#691C32] uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                Croquis #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(croquis.id)}
                className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar croquis
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Preview image */}
              <div className="md:col-span-5 bg-slate-100 border border-slate-200 rounded-lg p-2 overflow-hidden flex items-center justify-center max-h-64">
                <img
                  src={croquis.url}
                  alt={croquis.titulo}
                  className="max-h-56 w-auto object-contain rounded"
                />
              </div>

              {/* Fields */}
              <div className="md:col-span-7 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Título o Identificador del Croquis
                  </label>
                  <input
                    type="text"
                    value={croquis.titulo}
                    onChange={(e) => handleUpdate(croquis.id, 'titulo', e.target.value)}
                    placeholder="Ej: Plano de distribución horizontal de franjas y reductores"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Descripción / Especificaciones del Croquis
                  </label>
                  <textarea
                    rows={3}
                    value={croquis.descripcion}
                    onChange={(e) => handleUpdate(croquis.id, 'descripcion', e.target.value)}
                    placeholder="Indique cotas, medidas de retiro, simbología utilizada y observaciones técnicas del plano..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] text-slate-900"
                  />
                </div>

                <div className="pt-1">
                  <label className="text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg cursor-pointer font-medium inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-[#691C32]" />
                    Reemplazar imagen de croquis
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReplace(croquis.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}

        {croquisList.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 border border-slate-200 rounded-xl">
            No se han agregado croquis de implementación todavía.
          </div>
        )}
      </div>
    </div>
  );
};
