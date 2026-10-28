import { InspectionData } from '../types/inspection';
import { SAMPLE_INSPECTION_DATA } from '../data/sampleInspection';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

const DB_NAME = 'AnexoTecnicoVialDB_v2';
const DB_VERSION = 1;
const STORE_NAME = 'inspecciones';
const LS_FALLBACK_KEY = 'anexo_tecnico_inspecciones_backup_v2';
const FIRESTORE_COLLECTION = 'inspecciones';

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
  mysql: {
    connected: boolean;
    host: string;
    database: string;
    user: string;
    port: number;
    error: string | null;
  };
  localStorage: {
    uploadsDir: string;
    dataDir: string;
    dataFile: string;
    filesCount: number;
  };
  institutional: typeof OFFICIAL_INSTITUTIONAL_DATA;
}

/**
 * Ensures that any loaded inspection has the official institutional information
 * and current officer defaults applied.
 */
export function enforceOfficialInstitutionalData(item: InspectionData): InspectionData {
  if (!item) return item;
  const inst = { ...(item.institutionalInfo || {}) };
  const resp = { ...(item.responsable || {}) };

  // Always update institutional data to official government values
  inst.dependencia = inst.dependencia || OFFICIAL_INSTITUTIONAL_DATA.dependencia;
  inst.direccionUnidad = OFFICIAL_INSTITUTIONAL_DATA.direccionUnidad;
  inst.domicilio = OFFICIAL_INSTITUTIONAL_DATA.domicilio;
  inst.telefono = OFFICIAL_INSTITUTIONAL_DATA.telefono;
  inst.paginaWeb = OFFICIAL_INSTITUTIONAL_DATA.paginaWeb;

  // Always update officer name, cargo and department if default or unset
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
 * Sube una imagen directamente al servidor local físico (/uploads)
 * para que quede almacenada en el disco duro central de la computadora.
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
        return result.url; // Ruta física estática accesible en la red: /uploads/174000-archivo.jpg
      }
    }
  } catch (err) {
    console.warn('[Upload] Servidor /api/upload no disponible en este momento, usando DataURL:', err);
  }

  // Fallback a FileReader base64 si el backend no está disponible
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Convierte un DataURL (croquis generado en canvas, firma digital) a archivo físico en /uploads
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
 * Obtiene el estado actual de MySQL y almacenamiento en disco
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
   * Realtime listener to synchronize inspections across computers in network
   */
  subscribe(onUpdate: (items: InspectionData[]) => void): () => void {
    // 1. Cargar de inmediato desde la API local central
    this.getAll().then(onUpdate);

    // 2. Intervalo de actualización periódica para sincronizar múltiples computadoras en la red LAN
    const intervalId = window.setInterval(async () => {
      try {
        const res = await fetch('/api/inspecciones');
        if (res.ok) {
          const remoteItems: InspectionData[] = await res.json();
          if (Array.isArray(remoteItems) && remoteItems.length > 0) {
            const clean = remoteItems.map(i => enforceOfficialInstitutionalData(i));
            this.saveAllToLocal(clean);
            onUpdate(clean);
          }
        }
      } catch {
        // Red local transitoria
      }
    }, 5000);

    // 3. Suscripción a Firestore como respaldo en la nube si está habilitado
    let unsubscribeFirestore = () => {};
    try {
      const colRef = collection(db, FIRESTORE_COLLECTION);
      unsubscribeFirestore = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const items: InspectionData[] = [];
            snapshot.forEach((docSnap) => {
              const raw = docSnap.data() as InspectionData;
              items.push(enforceOfficialInstitutionalData(raw));
            });
            items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
            this.saveAllToLocal(items);
            onUpdate(items);
          }
        },
        () => {
          // Ignorado
        }
      );
    } catch {
      // Ignorado si no hay conexión externa
    }

    return () => {
      clearInterval(intervalId);
      unsubscribeFirestore();
    };
  },

  /**
   * Obtiene todas las inspecciones: primero del Backend Central (MySQL / Disco local),
   * y como respaldo de Firestore / IndexedDB
   */
  async getAll(): Promise<InspectionData[]> {
    // 1. Intentar Backend Central (MySQL / Servidor Express en red)
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
          // Sembrar primera inspección institucional
          const seeded = enforceOfficialInstitutionalData(SAMPLE_INSPECTION_DATA);
          await this.save(seeded);
          return [seeded];
        }
      }
    } catch (apiErr) {
      console.warn('[Storage] API Central local no disponible, intentando Firestore/Local:', apiErr);
    }

    // 2. Intentar Firestore en la nube
    try {
      const colRef = collection(db, FIRESTORE_COLLECTION);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const items: InspectionData[] = [];
        snapshot.forEach((d) => {
          items.push(enforceOfficialInstitutionalData(d.data() as InspectionData));
        });
        items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        this.saveAllToLocal(items);
        return items;
      }
    } catch (fsErr) {
      console.warn('[Storage] Error leyendo de Firestore, usando respaldo local:', fsErr);
    }

    // 3. Fallback a IndexedDB / LocalStorage
    return this.getAllFromLocal();
  },

  /**
   * Obtiene una inspección por ID
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

    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return enforceOfficialInstitutionalData(snap.data() as InspectionData);
      }
    } catch {
      // Ignorado
    }

    return this.getByIdFromLocal(id);
  },

  /**
   * Guarda inspección en el backend central (MySQL y disco local),
   * además de respaldar en IndexedDB y Firestore
   */
  async save(data: InspectionData): Promise<void> {
    const updatedData: InspectionData = enforceOfficialInstitutionalData({
      ...data,
      updatedAt: new Date().toISOString(),
    });

    // 1. Guardar en Backend Central (MySQL + uploads físicos)
    try {
      await fetch('/api/inspecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      console.warn('[Storage] Error guardando en servidor central:', err);
    }

    // 2. Guardar en Firestore si está conectado
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, updatedData.id);
      await setDoc(docRef, updatedData);
    } catch (err) {
      console.warn('[Storage] Fallback Firestore:', err);
    }

    // 3. Guardar en copia local del navegador (IndexedDB)
    await this.saveToLocal(updatedData);
  },

  /**
   * Elimina inspección de la base de datos central y cachés
   */
  async delete(id: string): Promise<void> {
    // 1. Eliminar de backend central
    try {
      await fetch(`/api/inspecciones/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[Storage] Error eliminando en servidor central:', err);
    }

    // 2. Eliminar de Firestore
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, id);
      await deleteDoc(docRef);
    } catch {
      // Ignorado
    }

    // 3. Eliminar de IndexedDB local
    await this.deleteFromLocal(id);
  },

  // --- LOCAL FALLBACK ENGINE (IndexedDB + localStorage) ---
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
      // Ignorado si falla indexeddb
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
