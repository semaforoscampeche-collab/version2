import { InspectionData } from '../types/inspection';
import { SAMPLE_INSPECTION_DATA } from '../data/sampleInspection';

const DB_NAME = 'AnexoTecnicoVialDB_v2';
const DB_VERSION = 1;
const STORE_NAME = 'inspecciones';
const LS_FALLBACK_KEY = 'anexo_tecnico_inspecciones_backup_v2';

export const OFFICIAL_INSTITUTIONAL_DATA = {
  dependencia: "GOBIERNO DEL ESTADO DE CAMPECHE",
  direccionUnidad: "Dirección de Transito y Vialidad",
  domicilio: "Av. Héroes de la salud # 385 por av maestros campechanos y prolongación lázaro cárdenas col. multunchac",
  telefono: "9818119110 ext 80050",
  paginaWeb: "https://www.spsc.campeche.gob.mx/",
  nombreCompleto: "Pablo Ernesto Garrido Vera",
  cargo: "Encargado Balizamiento y Semaforizacion",
  areaAdministrativa: "Dirección de Transito y Vialidad",
};

export interface ServerStatus {
  status: string;
  mode: string;
  localStorage: {
    uploadsDir: string;
    dataDir: string;
    dataFile: string;
    filesCount: number;
  };
  institutional: typeof OFFICIAL_INSTITUTIONAL_DATA;
}

/**
 * Asegura los datos institucionales oficiales en cada expediente
 */
export function enforceOfficialInstitutionalData(item: InspectionData): InspectionData {
  if (!item) return item;
  const inst = { ...(item.institutionalInfo || {}) };
  const resp = { ...(item.responsable || {}) };

  inst.dependencia = inst.dependencia || OFFICIAL_INSTITUTIONAL_DATA.dependencia;
  inst.direccionUnidad = OFFICIAL_INSTITUTIONAL_DATA.direccionUnidad;
  inst.domicilio = OFFICIAL_INSTITUTIONAL_DATA.domicilio;
  inst.telefono = OFFICIAL_INSTITUTIONAL_DATA.telefono;
  inst.paginaWeb = OFFICIAL_INSTITUTIONAL_DATA.paginaWeb;

  if (!resp.nombreCompleto || resp.nombreCompleto.includes('Carlos Alberto Morales') || resp.nombreCompleto === 'Pablo Ernesto Garrido Vera') {
    resp.nombreCompleto = OFFICIAL_INSTITUTIONAL_DATA.nombreCompleto;
  }
  if (!resp.cargo || resp.cargo.includes('Jefe del Departamento') || resp.cargo === 'Encargado Balizamiento y Semaforizacion') {
    resp.cargo = OFFICIAL_INSTITUTIONAL_DATA.cargo;
  }
  if (!resp.areaAdministrativa || resp.areaAdministrativa.includes('Movilidad Urbana') || resp.areaAdministrativa === 'Dirección de Transito y Vialidad') {
    resp.areaAdministrativa = OFFICIAL_INSTITUTIONAL_DATA.areaAdministrativa;
  }

  return {
    ...item,
    institutionalInfo: inst as any,
    responsable: resp as any,
  };
}

/**
 * Guarda una fotografía o archivo físicamente en la carpeta /uploads del disco duro de esta PC
 */
export async function uploadPhysicalImage(file: File, prefix?: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (prefix) formData.append('prefix', prefix);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const result = await res.json();
      if (result && result.url) {
        return result.url; // Ruta física estática: /uploads/timestamp-nombre.jpg
      }
    }
  } catch (err) {
    console.warn('[Upload] Servidor /api/upload no disponible, usando lectura base64 local:', err);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Guarda un DataURL (croquis de canvas o firma digital) como archivo físico en /uploads
 */
export async function uploadPhysicalBase64(base64Data: string, filenamePrefix = 'img'): Promise<string> {
  if (!base64Data || !base64Data.startsWith('data:')) {
    return base64Data;
  }
  try {
    const res = await fetch('/api/upload-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, filenamePrefix }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('[Upload Base64] Fallback local a dataURL:', err);
  }
  return base64Data;
}

/**
 * Consulta el estado del almacenamiento en disco de esta PC
 */
export async function getServerStatus(): Promise<ServerStatus | null> {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline
  }
  return null;
}

function openLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB no soportado'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const idb = (event.target as IDBOpenDBRequest).result;
      if (!idb.objectStoreNames.contains(STORE_NAME)) {
        idb.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const StorageService = {
  /**
   * Carga y sincroniza las inspecciones físicamente desde el disco local
   */
  subscribe(onUpdate: (items: InspectionData[]) => void): () => void {
    // Carga inicial
    this.getAll().then(onUpdate);

    // Revisión periódica en el archivo local de la PC
    const intervalId = window.setInterval(async () => {
      try {
        const res = await fetch('/api/inspecciones');
        if (res.ok) {
          const items: InspectionData[] = await res.json();
          if (Array.isArray(items)) {
            const clean = items.map(i => enforceOfficialInstitutionalData(i));
            this.saveAllToLocal(clean);
            onUpdate(clean);
          }
        }
      } catch {
        // Modo sin conexión con el backend
      }
    }, 4000);

    return () => {
      clearInterval(intervalId);
    };
  },

  /**
   * Obtiene todas las inspecciones guardadas físicamente en el disco de la PC
   */
  async getAll(): Promise<InspectionData[]> {
    try {
      const res = await fetch('/api/inspecciones');
      if (res.ok) {
        const data: InspectionData[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const items = data.map(item => enforceOfficialInstitutionalData(item));
          items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
          this.saveAllToLocal(items);
          return items;
        } else if (Array.isArray(data) && data.length === 0) {
          // Si el archivo está vacío, registrar la primera inspección muestra institucional
          const seeded = enforceOfficialInstitutionalData(SAMPLE_INSPECTION_DATA);
          await this.save(seeded);
          return [seeded];
        }
      }
    } catch (apiErr) {
      console.warn('[Storage] Servidor local no disponible, leyendo almacenamiento del navegador:', apiErr);
    }

    // Fallback a almacenamiento del navegador
    return this.getAllFromLocal();
  },

  /**
   * Obtiene una inspección por ID del disco físico
   */
  async getById(id: string): Promise<InspectionData | null> {
    try {
      const res = await fetch(`/api/inspecciones/${id}`);
      if (res.ok) {
        const item = await res.json();
        return enforceOfficialInstitutionalData(item);
      }
    } catch {
      // Ignorado
    }

    return this.getByIdFromLocal(id);
  },

  /**
   * Guarda la inspección físicamente en el disco duro de la PC (data/inspecciones.json)
   */
  async save(data: InspectionData): Promise<void> {
    const updatedData: InspectionData = enforceOfficialInstitutionalData({
      ...data,
      updatedAt: new Date().toISOString(),
    });

    // 1. Guardar en el archivo físico en disco
    try {
      await fetch('/api/inspecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      console.warn('[Storage] Error guardando en archivo físico local:', err);
    }

    // 2. Guardar también en el almacenamiento local de este navegador como copia de respaldo
    await this.saveToLocal(updatedData);
  },

  /**
   * Elimina la inspección del archivo físico en disco
   */
  async delete(id: string): Promise<void> {
    try {
      await fetch(`/api/inspecciones/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[Storage] Error eliminando archivo local:', err);
    }

    await this.deleteFromLocal(id);
  },

  // --- MOTOR LOCAL DEL NAVEGADOR (IndexedDB + localStorage de la PC) ---
  async getAllFromLocal(): Promise<InspectionData[]> {
    try {
      const idb = await openLocalDB();
      return new Promise((resolve) => {
        const tx = idb.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          let items: InspectionData[] = req.result || [];
          if (items.length === 0) {
            resolve([enforceOfficialInstitutionalData(SAMPLE_INSPECTION_DATA)]);
            return;
          }
          items = items.map(item => enforceOfficialInstitutionalData(item));
          items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          resolve(items);
        };
        req.onerror = () => resolve(this.getFromLocalStorage());
      });
    } catch {
      return this.getFromLocalStorage();
    }
  },

  async getByIdFromLocal(id: string): Promise<InspectionData | null> {
    try {
      const idb = await openLocalDB();
      return new Promise((resolve) => {
        const tx = idb.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result ? enforceOfficialInstitutionalData(req.result) : null);
        req.onerror = () => resolve(this.getByIdFromLocalStorage(id));
      });
    } catch {
      return this.getByIdFromLocalStorage(id);
    }
  },

  async saveToLocal(data: InspectionData): Promise<void> {
    try {
      const idb = await openLocalDB();
      await new Promise<void>((resolve, reject) => {
        const tx = idb.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(data);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      this.syncBackupToLocalStorage(data);
    } catch {
      this.saveToLocalStorage(data);
    }
  },

  async saveAllToLocal(items: InspectionData[]): Promise<void> {
    try {
      const idb = await openLocalDB();
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      items.forEach(item => store.put(item));
    } catch {
      // Ignorado
    }
  },

  async deleteFromLocal(id: string): Promise<void> {
    try {
      const idb = await openLocalDB();
      await new Promise<void>((resolve, reject) => {
        const tx = idb.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      this.deleteFromLocalStorage(id);
    } catch {
      this.deleteFromLocalStorage(id);
    }
  },

  getFromLocalStorage(): InspectionData[] {
    try {
      const raw = localStorage.getItem(LS_FALLBACK_KEY);
      if (raw) {
        const parsed: InspectionData[] = JSON.parse(raw);
        return parsed.map(item => enforceOfficialInstitutionalData(item));
      }
      return [enforceOfficialInstitutionalData(SAMPLE_INSPECTION_DATA)];
    } catch {
      return [enforceOfficialInstitutionalData(SAMPLE_INSPECTION_DATA)];
    }
  },

  getByIdFromLocalStorage(id: string): InspectionData | null {
    const items = this.getFromLocalStorage();
    const found = items.find(i => i.id === id);
    return found ? enforceOfficialInstitutionalData(found) : null;
  },

  saveToLocalStorage(data: InspectionData) {
    try {
      const items = this.getFromLocalStorage();
      const cleanData = enforceOfficialInstitutionalData(data);
      const idx = items.findIndex(i => i.id === cleanData.id);
      if (idx >= 0) items[idx] = cleanData;
      else items.unshift(cleanData);
      localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(items));
    } catch {
      // Ignored
    }
  },

  deleteFromLocalStorage(id: string) {
    try {
      const items = this.getFromLocalStorage().filter(i => i.id !== id);
      localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(items));
    } catch {
      // Ignored
    }
  },

  syncBackupToLocalStorage(data: InspectionData) {
    try {
      this.saveToLocalStorage(data);
    } catch {
      // Ignored
    }
  },

  exportToJson(data: InspectionData): void {
    const jsonStr = JSON.stringify(enforceOfficialInstitutionalData(data), null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Respaldo_${data.folioInterno || data.id || 'inspeccion'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async importFromJson(file: File): Promise<InspectionData> {
    const text = await file.text();
    const data: InspectionData = JSON.parse(text);
    if (!data.id) {
      data.id = 'insp-' + Date.now();
    }
    data.updatedAt = new Date().toISOString();
    const cleanData = enforceOfficialInstitutionalData(data);
    await this.save(cleanData);
    return cleanData;
  }
};
