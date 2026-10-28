import React, { useState } from 'react';
import { InspectionData } from '../../types/inspection';
import { Award, PenTool, Building, Trash2, Calendar, User, Briefcase, Layers } from 'lucide-react';
import { SignatureModal } from '../SignatureModal';

interface Props {
  data: InspectionData;
  onChange: (updater: (prev: InspectionData) => InspectionData) => void;
}

export const SectionFirma: React.FC<Props> = ({ data, onChange }) => {
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const resp = data.responsable;
  const inst = data.institutionalInfo;

  const handleRespChange = (field: keyof typeof resp, value: any) => {
    onChange((prev) => ({
      ...prev,
      responsable: {
        ...prev.responsable,
        [field]: value,
      },
    }));
  };

  const handleInstChange = (field: keyof typeof inst, value: any) => {
    onChange((prev) => ({
      ...prev,
      institutionalInfo: {
        ...prev.institutionalInfo,
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleInstChange('logotipoUrl', event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Responsable de Elaboración */}
      <div className="space-y-5">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#691C32]" />
            Responsable Técnico de la Inspección y Elaboración
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Datos del perito o servidor público facultado para emitir y autorizar el anexo técnico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nombre Completo del Responsable <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resp.nombreCompleto}
              onChange={(e) => handleRespChange('nombreCompleto', e.target.value)}
              placeholder="Ej: Pablo Ernesto Garrido Vera"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Cargo Institucional <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resp.cargo}
              onChange={(e) => handleRespChange('cargo', e.target.value)}
              placeholder="Ej: Encargado Balizamiento y Semaforizacion"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Área Administrativa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resp.areaAdministrativa}
              onChange={(e) => handleRespChange('areaAdministrativa', e.target.value)}
              placeholder="Ej: Dirección de Transito y Vialidad"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Fecha de Elaboración del Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={resp.fechaElaboracion}
              onChange={(e) => handleRespChange('fechaElaboracion', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 focus:border-[#691C32] text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Firma Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-[#691C32]" />
                Rúbrica / Firma Digital del Responsable
              </h3>
              <p className="text-xs text-slate-500">
                Puede trazar su firma en pantalla o cargar una imagen autorizada para incluir en el pie del documento.
              </p>
            </div>
            {resp.firmaUrl && (
              <button
                type="button"
                onClick={() => handleRespChange('firmaUrl', undefined)}
                className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Quitar firma
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-64 h-24 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-2 shadow-2xs">
              {resp.firmaUrl ? (
                <img src={resp.firmaUrl} alt="Firma" className="max-h-20 max-w-full object-contain" />
              ) : (
                <span className="text-xs text-slate-400 italic">Espacio reservado para firma</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSigModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <PenTool className="w-3.5 h-3.5" />
                Trazar firma digital
              </button>

              <label className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                Cargar imagen de firma
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const r = new FileReader();
                    r.onload = (ev) => handleRespChange('firmaUrl', ev.target?.result as string);
                    r.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración Institucional */}
      <div className="space-y-5 pt-4 border-t border-slate-200">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#691C32] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#691C32]" />
              Configuración de Membrete y Datos Institucionales
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Personalice los encabezados y pies de página oficiales que aparecen en el PDF generado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange((prev) => ({
                ...prev,
                institutionalInfo: {
                  ...prev.institutionalInfo,
                  dependencia: 'GOBIERNO DEL ESTADO DE CAMPECHE',
                  direccionUnidad: 'Dirección de Transito y Vialidad',
                  domicilio: 'Av. Héroes de la salud # 385 por av maestros campechanos y prolongación lázaro cárdenas col. multunchac',
                  telefono: '9818119110 ext 80050',
                  paginaWeb: 'https://www.spsc.campeche.gob.mx/',
                },
                responsable: {
                  ...prev.responsable,
                  nombreCompleto: 'Pablo Ernesto Garrido Vera',
                  cargo: 'Encargado Balizamiento y Semaforizacion',
                  areaAdministrativa: 'Dirección de Transito y Vialidad',
                },
              }));
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#691C32] text-xs font-bold rounded-lg border border-slate-300 transition-colors shrink-0 cursor-pointer"
          >
            Restablecer a Datos Oficiales Vigentes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dependencia Gubernamental (Encabezado superior)
            </label>
            <input
              type="text"
              value={inst.dependencia}
              onChange={(e) => handleInstChange('dependencia', e.target.value)}
              placeholder="Ej: GOBIERNO DEL ESTADO DE CAMPECHE"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dirección o Unidad Administrativa
            </label>
            <input
              type="text"
              value={inst.direccionUnidad}
              onChange={(e) => handleInstChange('direccionUnidad', e.target.value)}
              placeholder="Ej: Dirección de Transito y Vialidad"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Domicilio Institucional (Pie de página)
            </label>
            <input
              type="text"
              value={inst.domicilio}
              onChange={(e) => handleInstChange('domicilio', e.target.value)}
              placeholder="Ej: Av. Héroes de la salud # 385 por av maestros campechanos y prolongación lázaro cárdenas col. multunchac"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Teléfono y Extensión
            </label>
            <input
              type="text"
              value={inst.telefono}
              onChange={(e) => handleInstChange('telefono', e.target.value)}
              placeholder="Ej: 9818119110 ext 80050"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Página Web Oficial
            </label>
            <input
              type="text"
              value={inst.paginaWeb}
              onChange={(e) => handleInstChange('paginaWeb', e.target.value)}
              placeholder="Ej: https://www.spsc.campeche.gob.mx/"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#691C32]/30 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Logotipo o Escudo Institucional (opcional)
            </label>
            <div className="flex items-center gap-3">
              <label className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                Subir escudo / logotipo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {inst.logotipoUrl && (
                <button
                  type="button"
                  onClick={() => handleInstChange('logotipoUrl', undefined)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Quitar logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SignatureModal
        isOpen={sigModalOpen}
        onClose={() => setSigModalOpen(false)}
        onSave={(dataUrl) => handleRespChange('firmaUrl', dataUrl)}
      />
    </div>
  );
};
