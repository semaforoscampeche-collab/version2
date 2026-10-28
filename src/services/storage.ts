import { InspectionData } from '../types/inspection';
import { SAMPLE_INSPECTION_DATA } from '../data/sampleInspection';
import { db, handleFirestoreError, OperationType } from './firebase';
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
   * Realtime listener to synchronize inspections across all computers connected in network
   */
  subscribe(onUpdate: (items: InspectionData[]) => void): () => void {
    const colRef = collection(db, FIRESTORE_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: InspectionData[] = [];
          snapshot.forEach((docSnap) => {
            const raw = docSnap.data() as InspectionData;
            items.push(enforceOfficialInstitutionalData(raw));
          });
          items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
          
          // Cache in local storage for resilience
          this.saveAllToLocal(items);
          onUpdate(items);
        } else {
          // If Firestore is empty on first boot, seed it
          const seeded = enforceOfficialInstitutionalData(SAMPLE_INSPECTION_DATA);
          this.save(seeded).then(() => {
            onUpdate([seeded]);
          });
        }
      },
      (error) => {
        console.warn('Realtime sync fallback a almacenamiento local:', error);
        // Fallback to local
        this.getAllFromLocal().then(onUpdate);
      }
    );
  },

  /**
   * Fetches all inspections from centralized Firestore database, with local fallback
   */
  async getAll(): Promise<InspectionData[]> {
    try {
      const colRef = collection(db, FIRESTORE_COLLECTION);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        // Seed first inspection to Firestore so all computers see it
        const seeded = enforceOfficialInstitutionalData(SAMPLE_INSPECTION_DATA);
        await this.save(seeded);
        return [seeded];
      }

      const items: InspectionData[] = [];
      snapshot.forEach((d) => {
        items.push(enforceOfficialInstitutionalData(d.data() as InspectionData));
      });

      items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      this.saveAllToLocal(items);
      return items;
    } catch (err) {
      console.warn('Error leyendo de Firestore, usando respaldo local:', err);
      return this.getAllFromLocal();
    }
  },

  /**
   * Fetches single inspection by ID
   */
  async getById(id: string): Promise<InspectionData | null> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return enforceOfficialInstitutionalData(snap.data() as InspectionData);
      }
      return this.getByIdFromLocal(id);
    } catch {
      return this.getByIdFromLocal(id);
    }
  },

  /**
   * Saves inspection to centralized Firestore database and local backup
   */
  async save(data: InspectionData): Promise<void> {
    const updatedData: InspectionData = enforceOfficialInstitutionalData({
      ...data,
      updatedAt: new Date().toISOString(),
    });

    // 1. Save to central Firestore database
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, updatedData.id);
      await setDoc(docRef, updatedData);
    } catch (err) {
      console.error('Error guardando en Firestore central:', err);
      // Fallback local save so user never loses their work
    }

    // 2. Also keep local IndexedDB backup
    await this.saveToLocal(updatedData);
  },

  /**
   * Deletes inspection from centralized Firestore and local cache
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error eliminando de Firestore central:', err);
    }

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
      // Ignored if local db fails
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
