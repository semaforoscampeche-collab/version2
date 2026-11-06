import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// ==============================================================================
// ALMACENAMIENTO FÍSICO LOCAL EN EL DISCO DURO DE ESTA COMPUTADORA
// - Fotos y croquis: ./uploads/ (archivos JPG/PNG físicos)
// - Expedientes y datos: ./data/inspecciones.json (archivo físico de inspecciones)
// ==============================================================================
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DATA_DIR = path.resolve(process.cwd(), 'data');
const JSON_DB_FILE = path.join(DATA_DIR, 'inspecciones.json');

// Asegurar existencia física de directorios y archivo de datos
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(JSON_DB_FILE)) {
  fs.writeFileSync(JSON_DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Configuración de Multer para guardar físicamente cada archivo en /uploads
const storageConfig = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedName}`);
  },
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 25 * 1024 * 1024 }, // Hasta 25 MB por archivo
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir estáticamente la carpeta /uploads para que las imágenes se visualicen directamente desde el disco
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Leer expedientes del archivo físico inspecciones.json en el disco duro
function readLocalJSON(): any[] {
  try {
    if (!fs.existsSync(JSON_DB_FILE)) return [];
    const content = fs.readFileSync(JSON_DB_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('Error leyendo archivo local de datos:', err);
    return [];
  }
}

// Helper: Escribir físicamente en el archivo inspecciones.json en el disco duro
function writeLocalJSON(data: any[]) {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error escribiendo en archivo local de datos:', err);
  }
}

// ==============================================================================
// RUTAS API PARA ALMACENAMIENTO FÍSICO LOCAL
// ==============================================================================

// 1. Estado del almacenamiento físico en disco
app.get('/api/status', (_req, res) => {
  let totalFiles = 0;
  try {
    totalFiles = fs.readdirSync(UPLOADS_DIR).length;
  } catch {}

  res.json({
    status: 'online',
    mode: 'almacenamiento_fisico_local',
    localStorage: {
      uploadsDir: UPLOADS_DIR,
      dataDir: DATA_DIR,
      dataFile: JSON_DB_FILE,
      filesCount: totalFiles,
    },
    institutional: {
      responsable: 'Pablo Ernesto Garrido Vera',
      cargo: 'Encargado Balizamiento y Semaforizacion',
      area: 'Dirección de Transito y Vialidad',
      domicilio: 'Av. Héroes de la salud # 385 por av maestros campechanos y prolongación lázaro cárdenas col. multunchac',
      telefono: '9818119110 ext 80050',
      paginaWeb: 'https://www.spsc.campeche.gob.mx/',
    },
  });
});

// 2. Subida física de archivos e imágenes a la carpeta local /uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: publicUrl,
      size: req.file.size,
    });
  } catch (error: any) {
    console.error('Error en /api/upload:', error);
    res.status(500).json({ error: error?.message || 'Error al guardar archivo en disco' });
  }
});

// 3. Conversión de DataURL (canvas o firmas) a archivo físico JPG/PNG en /uploads
app.post('/api/upload-base64', (req, res) => {
  try {
    const { base64Data, filenamePrefix = 'img' } = req.body;
    if (!base64Data || typeof base64Data !== 'string') {
      return res.status(400).json({ error: 'Falta base64Data' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato base64 inválido' });
    }

    const mime = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    let ext = 'png';
    if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
    if (mime.includes('svg')) ext = 'svg';

    const filename = `${Date.now()}-${filenamePrefix}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, dataBuffer);

    res.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      size: dataBuffer.length,
    });
  } catch (error: any) {
    console.error('Error en /api/upload-base64:', error);
    res.status(500).json({ error: error?.message || 'Error guardando imagen en disco' });
  }
});

// 4. Listar todas las inspecciones desde el archivo físico local
app.get('/api/inspecciones', (_req, res) => {
  const items = readLocalJSON();
  items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  res.json(items);
});

// 5. Obtener una inspección por ID desde el archivo físico local
app.get('/api/inspecciones/:id', (req, res) => {
  const { id } = req.params;
  const items = readLocalJSON();
  const found = items.find((i) => i.id === id);
  if (found) {
    return res.json(found);
  }
  return res.status(404).json({ error: 'Inspección no encontrada' });
});

// 6. Guardar o actualizar inspección físicamente en el disco
app.post('/api/inspecciones', (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.id) {
      return res.status(400).json({ error: 'Datos incompletos: falta ID' });
    }

    item.updatedAt = new Date().toISOString();

    const localItems = readLocalJSON();
    const idx = localItems.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      localItems[idx] = item;
    } else {
      localItems.unshift(item);
    }
    writeLocalJSON(localItems);

    res.json({ success: true, item });
  } catch (error: any) {
    console.error('Error en POST /api/inspecciones:', error);
    res.status(500).json({ error: error?.message || 'Error al guardar la inspección en disco' });
  }
});

// 7. Eliminar inspección del archivo físico local
app.delete('/api/inspecciones/:id', (req, res) => {
  try {
    const { id } = req.params;
    const localItems = readLocalJSON().filter((i) => i.id !== id);
    writeLocalJSON(localItems);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Error al eliminar inspección del disco' });
  }
});

// ==============================================================================
// INTEGRACIÓN CON VITE DEV / DIST
// ==============================================================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    console.log('[Server] Modo Producción: Sirviendo carpeta dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[Server] Modo Desarrollo: Montando Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`================================================================`);
    console.log(` ANEXO TÉCNICO DE INSPECCIÓN Y LEVANTAMIENTO DE CAMPO`);
    console.log(` MODO: Almacenamiento 100% físico en esta computadora (Sin base de datos externa)`);
    console.log(` Servidor local activo en: http://localhost:${PORT}`);
    console.log(` Carpeta física de fotos/croquis: ${UPLOADS_DIR}`);
    console.log(` Archivo físico de datos: ${JSON_DB_FILE}`);
    console.log(`================================================================`);
  });
}

startServer();
