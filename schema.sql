-- ==============================================================================
-- BASE DE DATOS INSTITUCIONAL: ANEXO TÉCNICO DE INSPECCIÓN Y LEVANTAMIENTO DE CAMPO
-- Dependencia: Dirección de Tránsito y Vialidad - Gobierno del Estado de Campeche
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `anexo_tecnico_vial` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `anexo_tecnico_vial`;

-- ------------------------------------------------------------------------------
-- Tabla principal: inspecciones
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inspecciones` (
  `id` VARCHAR(120) NOT NULL,
  `folio_interno` VARCHAR(100) NOT NULL,
  `fecha_inspeccion` VARCHAR(30) NULL,
  `hora_inspeccion` VARCHAR(30) NULL,
  `solicitante` TEXT NULL,
  `ubicacion_exacta` TEXT NULL,
  `colonia` VARCHAR(255) NULL,
  `municipio` VARCHAR(255) NULL DEFAULT 'Campeche',
  `coordenadas` VARCHAR(100) NULL,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'Borrador',
  `responsable_nombre` VARCHAR(255) NULL DEFAULT 'Pablo Ernesto Garrido Vera',
  `responsable_cargo` VARCHAR(255) NULL DEFAULT 'Encargado Balizamiento y Semaforizacion',
  `data_json` LONGTEXT NOT NULL COMMENT 'Estructura completa de las 12 secciones en JSON',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_folio` (`folio_interno`),
  KEY `idx_fecha` (`fecha_inspeccion`),
  KEY `idx_municipio_colonia` (`municipio`, `colonia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Tabla de registro de archivos físicos subidos a la carpeta local (/uploads)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `archivos_locales` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inspeccion_id` VARCHAR(120) NULL,
  `nombre_original` VARCHAR(255) NOT NULL,
  `nombre_archivo` VARCHAR(255) NOT NULL,
  `tipo_seccion` VARCHAR(50) NOT NULL COMMENT 'croquis, foto_norte, foto_sur, propuesta, etc.',
  `ruta_relativa` VARCHAR(500) NOT NULL COMMENT '/uploads/nombre_archivo',
  `tamano_bytes` BIGINT NULL,
  `mime_type` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_inspeccion_archivo` (`inspeccion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Configuración del sistema y estado de sincronización
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `configuracion_sistema` (
  `clave` VARCHAR(100) NOT NULL PRIMARY KEY,
  `valor` TEXT NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `configuracion_sistema` (`clave`, `valor`, `descripcion`) VALUES
('dependencia', 'GOBIERNO DEL ESTADO DE CAMPECHE', 'Nombre de la dependencia estatal'),
('direccion_unidad', 'Dirección de Transito y Vialidad', 'Dirección encargada'),
('responsable_default', 'Pablo Ernesto Garrido Vera', 'Encargado Balizamiento y Semaforizacion'),
('telefono', '9818119110 ext 80050', 'Contacto oficial'),
('domicilio', 'Av. Héroes de la salud # 385 por av maestros campechanos y prolongación lázaro cárdenas col. multunchac', 'Dirección física institucional')
ON DUPLICATE KEY UPDATE `valor` = VALUES(`valor`);
