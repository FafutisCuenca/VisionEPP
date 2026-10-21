/** Gestión de archivos locales; no realiza cargas ni peticiones de red. */
import { APP_CONFIG } from './config.js';

export function validateEvidence(file) {
  if (!file) return { ok: false, message: 'Selecciona un archivo.' };
  const allowed = [...APP_CONFIG.acceptedImageTypes, ...APP_CONFIG.acceptedVideoTypes];
  if (!allowed.includes(file.type)) return { ok: false, message: 'Formato no compatible. Usa JPG, PNG, WEBP, MP4 o WEBM.' };
  const maxBytes = APP_CONFIG.maxFileSizeMB * 1024 * 1024;
  if (file.size > maxBytes) return { ok: false, message: `El archivo supera el límite del piloto (${APP_CONFIG.maxFileSizeMB} MB).` };
  return { ok: true, kind: APP_CONFIG.acceptedImageTypes.includes(file.type) ? 'image' : 'video', message: 'Archivo compatible.' };
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function createEvidenceUrl(file) { return URL.createObjectURL(file); }
