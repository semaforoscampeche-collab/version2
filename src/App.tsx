import React, { useState, useEffect, useRef } from 'react';
import { InspectionData, INITIAL_INSPECTION } from './types/inspection';
import { StorageService } from './services/storage';
import { generateInspectionPDF } from './services/pdfGenerator';
import { Header } from './components/Header';
import { InspectionList } from './components/InspectionList';
import { SectionNav, SECTIONS } from './components/SectionNav';
import { DocumentPreview } from './components/DocumentPreview';

// Form Section Components
import { Section1General } from './components/sections/Section1General';
import { Section2Clasificacion } from './components/sections/Section2Clasificacion';
import { Section3Geometria } from './components/sections/Section3Geometria';
import { Section4Peatonal } from './components/sections/Section4Peatonal';
import { Section5Vehicular } from './components/sections/Section5Vehicular';
import { Section6Entorno } from './components/sections/Section6Entorno';
import { Section7Seguridad } from './components/sections/Section7Seguridad';
import { Section8Evaluacion } from './components/sections/Section8Evaluacion';
import { Section9Medidas } from './components/sections/Section9Medidas';
import { Section10Propuesta } from './components/sections/Section10Propuesta';
import { Section11Croquis } from './components/sections/Section11Croquis';
import { Section12Fotografico } from './components/sections/Section12Fotografico';
import { SectionObservaciones } from './components/sections/SectionObservaciones';
import { SectionFirma } from './components/sections/SectionFirma';

import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { DatabaseModal } from './components/DatabaseModal';

export default function App() {
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [currentInspection, setCurrentInspection] = useState<InspectionData | null>(null);
  const [mode, setMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [activeSection, setActiveSection] = useState<string>('s1');
  const [saving, setSaving] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const autoSaveTimeoutRef = useRef<any>(null);

  // Subscribe to real-time updates from centralized Firestore cloud database
  useEffect(() => {
    const unsubscribe = StorageService.subscribe((items) => {
      setInspections(items);
    });
    return () => unsubscribe();
  }, []);

  const loadInspections = async () => {
    try {
      const all = await StorageService.getAll();
      setInspections(all);
    } catch (err) {
      console.error('Error loading inspections:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCreateNew = () => {
    const newId = 'insp-' + Date.now();
    const newFolio = `DTV-BS-PP-${String(inspections.length + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
    const newInspection: InspectionData = {
      ...INITIAL_INSPECTION,
      id: newId,
      folioInterno: newFolio,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seccion1: {
        ...INITIAL_INSPECTION.seccion1,
        folioInterno: newFolio,
        fechaInspeccion: new Date().toISOString().split('T')[0],
      },
    };
    setCurrentInspection(newInspection);
    setActiveSection('s1');
    setMode('edit');
  };

  const handleEdit = (item: InspectionData) => {
    setCurrentInspection(JSON.parse(JSON.stringify(item)));
    setActiveSection('s1');
    setMode('edit');
  };

  const handlePreview = (item: InspectionData) => {
    setCurrentInspection(JSON.parse(JSON.stringify(item)));
    setMode('preview');
  };

  const handleDuplicate = async (item: InspectionData) => {
    const newId = 'insp-' + Date.now();
    const newFolio = `${item.seccion1.folioInterno || item.folioInterno || 'COPIA'}-COPIA`;
    const duplicated: InspectionData = {
      ...JSON.parse(JSON.stringify(item)),
      id: newId,
      folioInterno: newFolio,
      status: 'borrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seccion1: {
        ...item.seccion1,
        folioInterno: newFolio,
        fechaInspeccion: new Date().toISOString().split('T')[0],
      },
    };
    await StorageService.save(duplicated);
    await loadInspections();
    showToast(`Inspección duplicada como ${newFolio}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta inspección? Esta acción no se puede deshacer.')) {
      return;
    }
    await StorageService.delete(id);
    await loadInspections();
    showToast('Inspección eliminada correctamente.');
    if (currentInspection?.id === id) {
      setCurrentInspection(null);
      setMode('list');
    }
  };

  const handleSave = async (showNotification = true) => {
    if (!currentInspection) return;
    setSaving(true);
    try {
      await StorageService.save(currentInspection);
      await loadInspections();
      if (showNotification) {
        showToast('Inspección guardada exitosamente.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al guardar: ' + err, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!currentInspection) return;
    const newStatus = currentInspection.status === 'finalizado' ? 'borrador' : 'finalizado';
    const updated: InspectionData = {
      ...currentInspection,
      status: newStatus,
    };
    setCurrentInspection(updated);
    await StorageService.save(updated);
    await loadInspections();
    showToast(`Estado actualizado a ${newStatus.toUpperCase()}`);
  };

  const handleGeneratePdf = async () => {
    if (!currentInspection) return;
    try {
      setSaving(true);
      await StorageService.save(currentInspection);
      await generateInspectionPDF(currentInspection);
      showToast('PDF generado y descargado correctamente.');
    } catch (err) {
      console.error(err);
      showToast('Error al generar el PDF: ' + err, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Auto-save on data change with debounce
  const handleDataChange = (updater: (prev: InspectionData) => InspectionData) => {
    setCurrentInspection((prev) => {
      if (!prev) return null;
      const next = updater(prev);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(() => {
        StorageService.save(next);
      }, 1500);
      return next;
    });
  };

  // Navigation between sections
  const currentSectionIndex = SECTIONS.findIndex(s => s.id === activeSection);
  const prevSection = currentSectionIndex > 0 ? SECTIONS[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < SECTIONS.length - 1 ? SECTIONS[currentSectionIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${
            toastType === 'success' ? 'bg-emerald-700' : 'bg-red-700'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-200" />
          )}
          {toastMessage}
        </div>
      )}

      {/* Main Header */}
      <Header
        data={currentInspection}
        mode={mode}
        onBackToList={() => {
          if (currentInspection) StorageService.save(currentInspection);
          setMode('list');
        }}
        onSave={() => handleSave(true)}
        onTogglePreview={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
        onGeneratePdf={handleGeneratePdf}
        onToggleStatus={handleToggleStatus}
        onOpenDatabaseModal={() => setDbModalOpen(true)}
        saving={saving}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {mode === 'list' && (
          <InspectionList
            inspections={inspections}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onPreview={handlePreview}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onRefresh={loadInspections}
            onOpenDatabaseModal={() => setDbModalOpen(true)}
          />
        )}

        {mode === 'preview' && currentInspection && (
          <DocumentPreview
            data={currentInspection}
            onBackToEdit={() => setMode('edit')}
            onGoToSection={(secId) => {
              setActiveSection(secId);
              setMode('edit');
            }}
          />
        )}

        {mode === 'edit' && currentInspection && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-4 xl:col-span-3 sticky top-20 z-20">
              <SectionNav
                data={currentInspection}
                activeSection={activeSection}
                onSelectSection={(id) => {
                  setActiveSection(id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </aside>

            {/* Form Section Body */}
            <div className="lg:col-span-8 xl:col-span-9 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
              {activeSection === 's1' && (
                <Section1General data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's2' && (
                <Section2Clasificacion data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's3' && (
                <Section3Geometria data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's4' && (
                <Section4Peatonal data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's5' && (
                <Section5Vehicular data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's6' && (
                <Section6Entorno data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's7' && (
                <Section7Seguridad data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's8' && (
                <Section8Evaluacion data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's9' && (
                <Section9Medidas data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's10' && (
                <Section10Propuesta data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's11' && (
                <Section11Croquis data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 's12' && (
                <Section12Fotografico data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 'sobs' && (
                <SectionObservaciones data={currentInspection} onChange={handleDataChange} />
              )}
              {activeSection === 'sfirma' && (
                <SectionFirma data={currentInspection} onChange={handleDataChange} />
              )}

              {/* Step Navigation Footer */}
              <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  {prevSection ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection(prevSection.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior: {prevSection.number}. {prevSection.title}
                    </button>
                  ) : <div />}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#691C32]" />
                    Guardar Avance
                  </button>

                  {nextSection ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection(nextSection.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-[#691C32] hover:bg-[#521527] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      Siguiente: {nextSection.number}. {nextSection.title}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMode('preview')}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-black rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      Revisar Vista Previa Final
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-800 text-slate-400 text-xs py-5 border-t border-slate-700 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-200">
              Sistema de Dictaminación y Levantamiento de Campo Vial
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Herramienta administrativa institucional conforme a normas y especificaciones técnicas oficiales.
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Exportación y validación PDF en tiempo real
          </div>
        </div>
      </footer>

      {/* Modal de Configuración y Estado de MySQL / Almacenamiento Local */}
      <DatabaseModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </div>
  );
}
