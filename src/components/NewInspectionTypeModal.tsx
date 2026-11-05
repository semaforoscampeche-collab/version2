import React, { useState } from 'react';
import {
  CategoriaInspeccion,
  TipoTramite,
  TIPOS_PERMISO,
  TIPOS_MEJORA_VIAL,
} from '../types/inspection';
import { Award, Wrench, X, PlusCircle, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoria: CategoriaInspeccion, tipoTramite: TipoTramite) => void;
}

export const NewInspectionTypeModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [categoria, setCategoria] = useState<CategoriaInspeccion>('MEJORA_VIAL');
  const [selectedTramite, setSelectedTramite] = useState<string>(TIPOS_MEJORA_VIAL[4]); // Paso peatonal default

  if (!isOpen) return null;

  const handleSelectCategoria = (cat: CategoriaInspeccion) => {
    setCategoria(cat);
    if (cat === 'PERMISO') {
      setSelectedTramite(TIPOS_PERMISO[0]);
    } else {
      setSelectedTramite(TIPOS_MEJORA_VIAL[4]);
    }
  };

  const handleConfirm = () => {
    onConfirm(categoria, selectedTramite);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#691C32] to-[#801D3A] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <PlusCircle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide">
                Nuevo Anexo Técnico de Inspección
              </h3>
              <p className="text-xs text-white/80">
                Seleccione el tipo de levantamiento o trámite que se va a realizar en campo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Categoría Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
              1. Seleccione la Modalidad
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectCategoria('PERMISO')}
                className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                  categoria === 'PERMISO'
                    ? 'border-[#691C32] bg-[#691C32]/5 text-[#691C32] ring-2 ring-[#691C32]/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    categoria === 'PERMISO' ? 'bg-[#691C32] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold uppercase">Permisos</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-normal">
                    5 trámites institucionales para particulares y comercios
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCategoria('MEJORA_VIAL')}
                className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                  categoria === 'MEJORA_VIAL'
                    ? 'border-[#691C32] bg-[#691C32]/5 text-[#691C32] ring-2 ring-[#691C32]/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    categoria === 'MEJORA_VIAL' ? 'bg-[#691C32] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold uppercase">Propuestas para Mejora Vial</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-normal">
                    10 trámites técnicos de infraestructura, seguridad y tránsito
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Listado de trámites específicos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                2. Seleccione el Tipo de Trámite a Dictaminar
              </label>
              <span className="text-[11px] text-slate-400">
                {categoria === 'PERMISO' ? '5 opciones disponibles' : '10 opciones disponibles'}
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(categoria === 'PERMISO' ? TIPOS_PERMISO : TIPOS_MEJORA_VIAL).map((tramite) => {
                const isSelected = selectedTramite === tramite;
                return (
                  <button
                    type="button"
                    key={tramite}
                    onClick={() => setSelectedTramite(tramite)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#691C32] bg-[#691C32] text-white shadow-xs font-bold'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span className="text-xs leading-snug">{tramite}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3 ${
                        isSelected ? 'bg-white text-[#691C32]' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Podrá cambiar o ajustar este tipo en cualquier momento dentro de la Sección I.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold bg-[#691C32] hover:bg-[#801D3A] text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              Comenzar Inspección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
