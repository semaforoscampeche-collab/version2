import React, { useState } from 'react';
import { InspectionData } from '../../types/inspection';
import { MapPin, Upload, Image as ImageIcon, Trash2, Calendar, Clock, FileText, Compass, Loader2 } from 'lucide-react';
import { MapModal } from '../MapModal';
import { uploadPhysicalImage } from '../../services/storage';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const Section1General: React.FC<Props> = ({ data, onChange }) => {
  const [mapOpen, setMapOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const s1 = data.seccion1;

  const handleFieldChange = (field: keyof typeof s1, value: any) => {
    onChange((prev) => ({
      ...prev,
      seccion1: {
        ...prev.seccion1,
        [field]: value,
      },
      // If folio is changed in section 1, keep root folio in sync
      ...(field === 'folioInterno' ? { folioInterno: value } : {}),
    }));
  };

  const handleCroquisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('La imagen excede el límite de 15 MB. Por favor elija un archivo más comprimido.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadPhysicalImage(file, 'croquis_ubicacion');
      handleFieldChange('croquisUbicacionImg', url);
    } catch (err) {
      console.error('Error subiendo croquis:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#691C32]" />
          I. Datos Generales de la Inspección
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Identificación técnica del expediente, horario, ubicación exacta y georreferenciación oficial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Folio interno */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Folio Interno <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={s1.folioInterno}
            onChange={(e) => handleFieldChange('folioInterno', e.target.value)}
            placeholder="Ej: DTV-BS-PP-IPP-06/2026"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] font-mono font-medium text-slate-900 transition-all"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">Identificador institucional único del anexo</span>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Fecha de Inspección <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={s1.fechaInspeccion}
            onChange={(e) => handleFieldChange('fechaInspeccion', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-medium transition-all"
          />
        </div>

        {/* Hora */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Hora de Inspección <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={s1.horaInspeccion}
            onChange={(e) => handleFieldChange('horaInspeccion', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-medium transition-all"
          />
        </div>
      </div>

      {/* Solicitante o descripción de la propuesta */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Solicitante o Descripción de la Propuesta Vial
        </label>
        <textarea
          rows={2}
          value={s1.solicitante}
          onChange={(e) => handleFieldChange('solicitante', e.target.value)}
          placeholder="Ej: Dirección de la Escuela Primaria 'Benito Juárez' / Solicitud ciudadana para instalación de reductor de velocidad y cruce escolar seguro"
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 transition-all"
        />
      </div>

      {/* Ubicación, Colonia, Municipio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Ubicación Exacta (Calles / Tramos / Entronques) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={s1.ubicacionExacta}
            onChange={(e) => handleFieldChange('ubicacionExacta', e.target.value)}
            placeholder="Ej: Av. Adolfo Ruiz Cortines entre Calle 53 y Calle 55"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-medium transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Municipio <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={s1.municipio}
            onChange={(e) => handleFieldChange('municipio', e.target.value)}
            placeholder="Ej: San Francisco de Campeche"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-medium transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Colonia o Barrio
          </label>
          <input
            type="text"
            value={s1.coloniaBarrio}
            onChange={(e) => handleFieldChange('coloniaBarrio', e.target.value)}
            placeholder="Ej: Barrio de San Román"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-medium transition-all"
          />
        </div>

        {/* GPS Coordenadas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            Latitud GPS
          </label>
          <input
            type="text"
            value={s1.latitud}
            onChange={(e) => handleFieldChange('latitud', e.target.value)}
            placeholder="Ej: 19.845210"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] font-mono text-slate-900 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            Longitud GPS
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={s1.longitud}
              onChange={(e) => handleFieldChange('longitud', e.target.value)}
              placeholder="Ej: -90.536850"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] font-mono text-slate-900 transition-all"
            />
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
              title="Seleccionar en Mapa Interactivo"
            >
              <MapPin className="w-4 h-4 text-amber-300" />
              Mapa
            </button>
          </div>
        </div>
      </div>

      {/* Croquis de Ubicación Geográfica */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#691C32]" />
              Croquis de Ubicación del Levantamiento
            </h3>
            <p className="text-xs text-slate-500">
              Adjunte una imagen del croquis o plano esquemático de ubicación que se incluirá en el anexo técnico.
            </p>
          </div>
          {s1.croquisUbicacionImg && (
            <button
              type="button"
              onClick={() => handleFieldChange('croquisUbicacionImg', undefined)}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 p-1 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar croquis
            </button>
          )}
        </div>

        {s1.croquisUbicacionImg ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1 bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
              <img
                src={s1.croquisUbicacionImg}
                alt="Croquis de Ubicación"
                className="w-full h-40 object-contain rounded bg-slate-100"
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Descripción o notas del croquis de ubicación
              </label>
              <input
                type="text"
                value={s1.croquisUbicacionDesc || ''}
                onChange={(e) => handleFieldChange('croquisUbicacionDesc', e.target.value)}
                placeholder="Ej: Croquis con delimitación de radios de giro y áreas de banqueta"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32]"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg cursor-pointer font-medium inline-flex items-center gap-1.5 shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#691C32]" />
                  Reemplazar imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCroquisUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-slate-300 hover:border-[#691C32] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white transition-all group">
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#691C32] transition-colors mb-2" />
            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#691C32]">
              Haga clic para cargar imagen del croquis
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              PNG, JPG o SVG (máx. 5 MB)
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCroquisUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        lat={s1.latitud}
        lng={s1.longitud}
        onSave={(newLat, newLng) => {
          handleFieldChange('latitud', newLat);
          handleFieldChange('longitud', newLng);
        }}
      />
    </div>
  );
};
