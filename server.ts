import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Configuración de rutas de almacenamiento físico local
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DATA_DIR = path.resolve(process.cwd(), 'data');
const JSON_DB_FILE = path.join(DATA_DIR, 'inspecciones.json');

// Asegurar existencia física de directorios
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(JSON_DB_FILE)) {
  fs.writeFileSync(JSON_DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Configuración de Multer para guardar archivos directamente en /uploads
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

// Servir estáticamente la carpeta /uploads para que cualquier PC de la red acceda a las fotos
app.use('/uploads', express.static(UPLOADS_DIR));

// Variables de estado de MySQL
let mysqlPool: mysql.Pool | null = null;
let isMySQLConnected = false;
let mySQLErrorMsg = '';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'anexo_tecnico_vial',
};

async function initMySQL() {
  try {
    // 1. Probar conexión y crear BD si no existe
    const tempConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      connectTimeout: 3000,
    });

    await tempConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await tempConn.end();

    // 2. Crear pool a la base de datos
    mysqlPool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000,
    });

    // 3. Crear tabla si no existe
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS \`inspecciones\` (
        \`id\` VARCHAR(120) NOT NULL PRIMARY KEY,
        \`folio_interno\` VARCHAR(100) NOT NULL,
        \`fecha_inspeccion\` VARCHAR(30) NULL,
        \`hora_inspeccion\` VARCHAR(30) NULL,
        \`solicitante\` TEXT NULL,
        \`ubicacion_exacta\` TEXT NULL,
        \`colonia\` VARCHAR(255) NULL,
        \`municipio\` VARCHAR(255) NULL DEFAULT 'Campeche',
        \`coordenadas\` VARCHAR(100) NULL,
        \`estado\` VARCHAR(50) NOT NULL DEFAULT 'Borrador',
        \`responsable_nombre\` VARCHAR(255) NULL DEFAULT 'Pablo Ernesto Garrido Vera',
        \`responsable_cargo\` VARCHAR(255) NULL DEFAULT 'Encargado Balizamiento y Semaforizacion',
        \`data_json\` LONGTEXT NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`idx_folio\` (\`folio_interno\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    isMySQLConnected = true;
    mySQLErrorMsg = '';
    console.log(`[MySQL] Conexión exitosa a ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);

    // Migrar datos de data/inspecciones.json si la tabla está vacía
    try {
      const [rows]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM inspecciones');
      if (rows[0].count === 0 && fs.existsSync(JSON_DB_FILE)) {
        const localData = JSON.parse(fs.readFileSync(JSON_DB_FILE, 'utf-8'));
        for (const item of localData) {
          await insertOrUpdateMySQL(item);
        }
        console.log(`[MySQL] Se sincronizaron ${localData.length} registros locales iniciales a MySQL.`);
      }
    } catch (e) {
      console.warn('[MySQL] Advertencia durante sincronización inicial:', e);
    }
  } catch (err: any) {
    isMySQLConnected = false;
    mySQLErrorMsg = err?.message || 'No se pudo conectar a MySQL';
    console.log(`[Storage] MySQL no detectado (${mySQLErrorMsg}). Operando con almacenamiento local físico en:`);
    console.log(`          - Datos: ${JSON_DB_FILE}`);
    console.log(`          - Fotos/Croquis: ${UPLOADS_DIR}`);
  }
}

// Helper: Guardar en MySQL
async function insertOrUpdateMySQL(item: any) {
  if (!mysqlPool) return;
  const sql = `
    INSERT INTO inspecciones (
      id, folio_interno, fecha_inspeccion, hora_inspeccion, solicitante,
      ubicacion_exacta, colonia, municipio, coordenadas, estado,
      responsable_nombre, responsable_cargo, data_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      folio_interno = VALUES(folio_interno),
      fecha_inspeccion = VALUES(fecha_inspeccion),
      hora_inspeccion = VALUES(hora_inspeccion),
      solicitante = VALUES(solicitante),
      ubicacion_exacta = VALUES(ubicacion_exacta),
      colonia = VALUES(colonia),
      municipio = VALUES(municipio),
      coordenadas = VALUES(coordenadas),
      estado = VALUES(estado),
      responsable_nombre = VALUES(responsable_nombre),
      responsable_cargo = VALUES(responsable_cargo),
      data_json = VALUES(data_json),
      updated_at = CURRENT_TIMESTAMP;
  `;

  await mysqlPool.query(sql, [
    item.id,
    item.folioInterno || item.id,
    item.fechaInspeccion || '',
    item.horaInspeccion || '',
    item.solicitante || '',
    item.ubicacionExacta || '',
    item.colonia || '',
    item.municipio || 'Campeche',
    item.coordenadasGPS || '',
    item.estado || 'Borrador',
    item.responsable?.nombreCompleto || 'Pablo Ernesto Garrido Vera',
    item.responsable?.cargo || 'Encargado Balizamiento y Semaforizacion',
    JSON.stringify(item),
  ]);
}

// Helper: Leer de JSON local
function readLocalJSON(): any[] {
  try {
    if (!fs.existsSync(JSON_DB_FILE)) return [];
    const content = fs.readFileSync(JSON_DB_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch {
    return [];
  }
}

// Helper: Escribir a JSON local
function writeLocalJSON(data: any[]) {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error escribiendo a JSON local:', err);
  }
}

// ==========================================
// RUTAS API
// ==========================================

// 1. Estado del Servidor y Base de Datos
app.get('/api/status', async (_req, res) => {
  // Reintentar conexión si no estaba conectado
  if (!isMySQLConnected) {
    await initMySQL();
  }

  let totalFiles = 0;
  try {
    totalFiles = fs.readdirSync(UPLOADS_DIR).length;
  } catch {}

  res.json({
    status: 'online',
    mysql: {
      connected: isMySQLConnected,
      host: dbConfig.host,
      database: dbConfig.database,
      user: dbConfig.user,
      port: dbConfig.port,
      error: mySQLErrorMsg || null,
    },
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

// 2. Subida física de archivos / imágenes a la carpeta /uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalName: req.file.originalname,
    });
  } catch (error: any) {
    console.error('Error en /api/upload:', error);
    res.status(500).json({ error: error?.message || 'Error guardando archivo' });
  }
});

// 3. Subida directa de base64 a archivo físico local (croquis, firmas, etc.)
app.post('/api/upload-base64', (req, res) => {
  try {
    const { base64Data, filenamePrefix, extension = 'png' } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Falta base64Data' });
    }

    // Extraer datos base64 limpios
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const dataString = matches ? matches[2] : base64Data;
    const buffer = Buffer.from(dataString, 'base64');

    const prefix = filenamePrefix ? filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '') : 'img';
    const filename = `${prefix}_${Date.now()}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error('Error guardando base64 físico:', err);
    res.status(500).json({ error: err.message || 'Error procesando imagen' });
  }
});

// 4. Descargar script schema.sql
app.get('/api/schema.sql', (_req, res) => {
  const schemaPath = path.resolve(process.cwd(), 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    res.download(schemaPath, 'schema_anexo_tecnico_vial.sql');
  } else {
    res.status(404).send('Archivo schema.sql no encontrado');
  }
});

// 5. Listar todas las inspecciones (MySQL o local JSON)
app.get('/api/inspecciones', async (_req, res) => {
  if (isMySQLConnected && mysqlPool) {
    try {
      const [rows]: any = await mysqlPool.query(
        'SELECT data_json FROM inspecciones ORDER BY updated_at DESC'
      );
      const items = rows.map((r: any) => JSON.parse(r.data_json));
      return res.json(items);
    } catch (err) {
      console.warn('Error leyendo de MySQL, usando respaldo local:', err);
    }
  }

  // Fallback local JSON
  const items = readLocalJSON();
  items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  res.json(items);
});

// 6. Obtener una inspección por ID
app.get('/api/inspecciones/:id', async (req, res) => {
  const { id } = req.params;

  if (isMySQLConnected && mysqlPool) {
    try {
      const [rows]: any = await mysqlPool.query(
        'SELECT data_json FROM inspecciones WHERE id = ? LIMIT 1',
        [id]
      );
      if (rows && rows.length > 0) {
        return res.json(JSON.parse(rows[0].data_json));
      }
    } catch (err) {
      console.warn('Error leyendo id de MySQL:', err);
    }
  }

  const items = readLocalJSON();
  const found = items.find((i) => i.id === id);
  if (found) {
    return res.json(found);
  }
  return res.status(404).json({ error: 'Inspección no encontrada' });
});

// 7. Guardar o actualizar inspección (guarda tanto en MySQL como en disco local)
app.post('/api/inspecciones', async (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.id) {
      return res.status(400).json({ error: 'Datos incompletos: falta ID' });
    }

    item.updatedAt = new Date().toISOString();

    // Guardar siempre en JSON local como respaldo de seguridad física inmediata
    const localItems = readLocalJSON();
    const idx = localItems.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      localItems[idx] = item;
    } else {
      localItems.unshift(item);
    }
    writeLocalJSON(localItems);

    // Si MySQL está conectado, guardar en MySQL
    if (isMySQLConnected && mysqlPool) {
      try {
        await insertOrUpdateMySQL(item);
      } catch (sqlErr: any) {
        console.error('Error insertando en MySQL:', sqlErr);
      }
    }

    res.json({ success: true, item });
  } catch (error: any) {
    console.error('Error en POST /api/inspecciones:', error);
    res.status(500).json({ error: error?.message || 'Error al guardar la inspección' });
  }
});

// 8. Eliminar inspección
app.delete('/api/inspecciones/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar de JSON local
    const localItems = readLocalJSON().filter((i) => i.id !== id);
    writeLocalJSON(localItems);

    // Eliminar de MySQL si aplica
    if (isMySQLConnected && mysqlPool) {
      try {
        await mysqlPool.query('DELETE FROM inspecciones WHERE id = ?', [id]);
      } catch (sqlErr) {
        console.error('Error eliminando de MySQL:', sqlErr);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Error al eliminar' });
  }
});

// ==========================================
// INTEGRACIÓN CON VITE DEV / DIST
// ==========================================
async function startServer() {
  await initMySQL();

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
    console.log(` Servidor local activo en: http://localhost:${PORT}`);
    console.log(` Acceso en red local (LAN): http://0.0.0.0:${PORT}`);
    console.log(` Carpeta física de fotos/croquis: ${UPLOADS_DIR}`);
    console.log(` Almacenamiento central de datos: ${isMySQLConnected ? 'MySQL Activo' : 'Disco Local (JSON)'}`);
    console.log(`================================================================`);
  });
}

startServer();
