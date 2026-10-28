import React from 'react';
import { InspectionData } from '../types/inspection';
import {
  FileText,
  Signpost,
  Ruler,
  Users,
  Car,
  Building2,
  ShieldCheck,
  ClipboardCheck,
  SlidersHorizontal,
  Lightbulb,
  DraftingCompass,
  Camera,
  FileEdit,
  Award,
  CheckCircle2,
  Circle
} from 'lucide-react';

export interface SectionDef {
  id: string;
  number: string;
  title: string;
  icon: any;
  isComplete: (data: InspectionData) => boolean;
}

export const SECTIONS: SectionDef[] = [
  {
    id: 's1',
    number: 'I',
    title: 'Datos Generales',
    icon: FileText,
    isComplete: (d) => Boolean(d.seccion1.folioInterno && d.seccion1.ubicacionExacta && d.seccion1.fechaInspeccion),
  },
  {
    id: 's2',
    number: 'II',
    title: 'Clasificación Vial',
    icon: Signpost,
    isComplete: (d) => d.seccion2.tipoVialidad.length > 0 && d.seccion2.jerarquiaVial.length > 0,
  },
  {
    id: 's3',
    number: 'III',
    title: 'Características Geométricas',
    icon: Ruler,
    isComplete: (d) => Boolean(d.seccion3.anchoVialidadMetros && d.seccion3.numeroCarriles && d.seccion3.estadoPavimento),
  },
  {
    id: 's4',
    number: 'IV',
    title: 'Demanda Peatonal',
    icon: Users,
    isComplete: (d) => Boolean(d.seccion4.conteo15min || d.seccion4.conteo30min || d.seccion4.conteo60min),
  },
  {
    id: 's5',
    number: 'V',
    title: 'Tránsito Vehicular',
    icon: Car,
    isComplete: (d) => Boolean(d.seccion5.automoviles || d.seccion5.volumenVehicular),
  },
  {
    id: 's6',
    number: 'VI',
    title: 'Entorno Urbano',
    icon: Building2,
    isComplete: (d) => d.seccion6.generadores.some(g => g.existe),
  },
  {
    id: 's7',
    number: 'VII',
    title: 'Seguridad Vial',
    icon: ShieldCheck,
    isComplete: (d) => Boolean(d.seccion7.visibilidad && d.seccion7.iluminacion),
  },
  {
    id: 's8',
    number: 'VIII',
    title: 'Evaluación Técnica',
    icon: ClipboardCheck,
    isComplete: (d) => d.seccion8.criterios.some(c => c.cumple !== null),
  },
  {
    id: 's9',
    number: 'IX',
    title: 'Medidas Complementarias',
    icon: SlidersHorizontal,
    isComplete: (d) => d.seccion9.medidas.some(m => m.aplica !== null),
  },
  {
    id: 's10',
    number: 'X',
    title: 'Propuesta Técnica',
    icon: Lightbulb,
    isComplete: (d) => d.seccion10.dictamenOpciones.length > 0 && Boolean(d.seccion10.propuestaDetallada),
  },
  {
    id: 's11',
    number: 'XI',
    title: 'Croquis Implementación',
    icon: DraftingCompass,
    isComplete: (d) => (d.seccion11.croquisList?.length || 0) > 0,
  },
  {
    id: 's12',
    number: 'XII',
    title: 'Registro Fotográfico',
    icon: Camera,
    isComplete: (d) => (d.seccion12.grupos || []).some(g => g.fotoNorte?.url || g.vistaGeneral?.url),
  },
  {
    id: 'sobs',
    number: 'OBS',
    title: 'Observaciones Finales',
    icon: FileEdit,
    isComplete: (d) => Boolean(d.observaciones.texto?.trim()),
  },
  {
    id: 'sfirma',
    number: 'RES',
    title: 'Responsable y Membrete',
    icon: Award,
    isComplete: (d) => Boolean(d.responsable.nombreCompleto && d.responsable.cargo),
  },
];

interface Props {
  data: InspectionData;
  activeSection: string;
  onSelectSection: (id: string) => void;
}

export const SectionNav: React.FC<Props> = ({ data, activeSection, onSelectSection }) => {
  const completedCount = SECTIONS.filter(s => s.isComplete(data)).length;
  const progressPercent = Math.round((completedCount / SECTIONS.length) * 100);

  return (
    <nav className="w-full bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col">
      {/* Progress header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
          <span>Avance de Captura</span>
          <span className="text-[#691C32]">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#691C32] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-400 mt-1.5 text-right">
          {completedCount} de {SECTIONS.length} secciones completadas
        </div>
      </div>

      {/* Navigation items list */}
      <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          const complete = sec.isComplete(data);
          const Icon = sec.icon;

          return (
            <button
              type="button"
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center justify-between gap-2.5 text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#691C32] text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {sec.number}
                </span>
                <span className="truncate">{sec.title}</span>
              </div>

              <div className="shrink-0">
                {complete ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-emerald-600'}`} />
                ) : (
                  <Circle className={`w-3.5 h-3.5 ${isActive ? 'text-white/40' : 'text-slate-300'}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
