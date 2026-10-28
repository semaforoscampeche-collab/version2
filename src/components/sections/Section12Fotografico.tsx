import React, { useState } from 'react';
import { InspectionData } from '../../types/inspection';
import { Camera, Plus, Trash2, Upload, Compass, Eye, Maximize2, Loader2 } from 'lucide-react';
import { uploadPhysicalImage } from '../../services/storage';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

type PhotoKey = 'fotoNorte' | 'fotoSur' | 'fotoOriente' | 'fotoPoniente' | 'vistaGeneral' | 'detalleSitio';

const SLOTS_CONFIG: Array<{ key: PhotoKey; label: string; icon: any }> = [
  { key: 'fotoNorte', label: 'Fotografía Norte', icon: Compass },
  { key: 'fotoSur', label: 'Fotografía Sur', icon: Compass },
  { key: 'fotoOriente', label: 'Fotografía Oriente', icon: Compass },
  { key: 'fotoPoniente', label: 'Fotografía Poniente', icon: Compass },
  { key: 'vistaGeneral', label: 'Vista General Panorámica', icon: Eye },
  { key: 'detalleSitio', label: 'Detalle del Sitio / Banqueta / Asfalto', icon: Maximize2 },
];

export const Section12Fotografico: React.FC<Props> = ({ data, onChange }) => {
  const grupos = data.seccion12.grupos || [];
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  const handleUpdateVialidad = (grupoId: string, nombre: string) => {
    onChange((prev) => ({
      ...prev,
      seccion12: {
        ...prev.seccion12,
        grupos: prev.seccion12.grupos.map((g) =>
          g.id === grupoId ? { ...g, nombreVialidad: nombre } : g
        ),
      },
    }));
  };

  const handleUploadPhoto = async (grupoId: string, slotKey: PhotoKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('La fotografía excede 15 MB. Seleccione una imagen más ligera.');
      return;
    }

    const slotId = `${grupoId}-${slotKey}`;
    setUploadingSlot(slotId);

    try {
      // Subida física al directorio /uploads de la computadora
      const url = await uploadPhysicalImage(file, `foto_${slotKey}`);
      onChange((prev) => ({
        ...prev,
        seccion12: {
          ...prev.seccion12,
          grupos: prev.seccion12.grupos.map((g) => {
            if (g.id !== grupoId) return g;
            return {
              ...g,
              [slotKey]: {
                url,
                descripcion: g[slotKey]?.descripcion || '',
              },
            };
          }),
        },
      }));
    } catch (err) {
      console.error('Error subiendo fotografía:', err);
    } finally {
      setUploadingSlot(null);
      e.target.value = '';
    }
  };

  const handleUpdateDescription = (grupoId: string, slotKey: PhotoKey, desc: string) => {
    onChange((prev) => ({
      ...prev,
      seccion12: {
        ...prev.seccion12,
        grupos: prev.seccion12.grupos.map((g) => {
          if (g.id !== grupoId) return g;
          const current = g[slotKey] || { url: '', descripcion: '' };
          return {
            ...g,
            [slotKey]: {
              ...current,
              descripcion: desc,
            },
          };
        }),
      },
    }));
  };

  const handleDeletePhoto = (grupoId: string, slotKey: PhotoKey) => {
    onChange((prev) => ({
      ...prev,
      seccion12: {
        ...prev.seccion12,
        grupos: prev.seccion12.grupos.map((g) => {
          if (g.id !== grupoId) return g;
          return {
            ...g,
            [slotKey]: undefined,
          };
        }),
      },
    }));
  };

  const handleAgregarGrupo = () => {
    const nuevoGrupo = {
      id: 'grupo-' + Date.now(),
      nombreVialidad: 'Vialidad Secundaria / Intersección Complementaria',
    };
    onChange((prev) => ({
      ...prev,
      seccion12: {
        ...prev.seccion12,
        grupos: [...prev.seccion12.grupos, nuevoGrupo],
      },
    }));
  };

  const handleEliminarGrupo = (grupoId: string) => {
    if (!confirm('¿Desea eliminar este grupo de fotografías?')) return;
    onChange((prev) => ({
      ...prev,
      seccion12: {
        ...prev.seccion12,
        grupos: prev.seccion12.grupos.filter((g) => g.id !== grupoId),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#691C32]" />
            XII. Registro Fotográfico de la Inspección
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Evidencia visual estructurada por orientaciones cardinales, vista general del entorno y detalles del sitio.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAgregarGrupo}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Agregar otra vialidad
        </button>
      </div>

      <div className="space-y-8">
        {grupos.map((grupo, gIndex) => (
          <div
            key={grupo.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-4 p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex-1 max-w-lg">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Vialidad #{gIndex + 1}
                </label>
                <input
                  type="text"
                  value={grupo.nombreVialidad}
                  onChange={(e) => handleUpdateVialidad(grupo.id, e.target.value)}
                  placeholder="Ej: Av. Adolfo Ruiz Cortines / Calle 53"
                  className="w-full px-3 py-1.5 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] text-slate-900"
                />
              </div>

              {grupos.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleEliminarGrupo(grupo.id)}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 hover:bg-red-50 px-2 py-1.5 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar grupo
                </button>
              )}
            </div>

            {/* Photo Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SLOTS_CONFIG.map(({ key, label, icon: Icon }) => {
                const photo = grupo[key];
                const inputId = `photo-${grupo.id}-${key}`;

                return (
                  <div
                    key={key}
                    className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#691C32] flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                        {label}
                      </span>
                      {photo?.url && (
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(grupo.id, key)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {photo?.url ? (
                      <div className="space-y-2">
                        <div className="h-40 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                          <img
                            src={photo.url}
                            alt={label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="text"
                          value={photo.descripcion || ''}
                          onChange={(e) => handleUpdateDescription(grupo.id, key, e.target.value)}
                          placeholder="Descripción (ej: Vista sentido N...)"
                          className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-300 rounded focus:ring-1 focus:ring-[#691C32]"
                        />
                        <div className="flex justify-end">
                          <label
                            htmlFor={inputId}
                            className="text-[11px] text-slate-600 hover:text-[#691C32] cursor-pointer font-medium flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            Cambiar imagen
                          </label>
                          <input
                            type="file"
                            id={inputId}
                            accept="image/*"
                            onChange={(e) => handleUploadPhoto(grupo.id, key, e)}
                            className="hidden"
                          />
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor={inputId}
                        className="h-44 border-2 border-dashed border-slate-300 hover:border-[#691C32] rounded-lg flex flex-col items-center justify-center cursor-pointer bg-white transition-colors group p-3 text-center"
                      >
                        <Camera className="w-7 h-7 text-slate-400 group-hover:text-[#691C32] mb-1.5 transition-colors" />
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-[#691C32]">
                          Cargar {label}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Tomar foto o elegir archivo
                        </span>
                        <input
                          type="file"
                          id={inputId}
                          accept="image/*"
                          onChange={(e) => handleUploadPhoto(grupo.id, key, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
