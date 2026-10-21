
/**
 * VisionEPP - Aplicación principal.
 *
 * Funciones:
 * - Carga y vista previa local de imágenes y videos.
 * - Validación de archivos.
 * - Limpieza de evidencia.
 * - Registro de actividad y exportación JSON.
 * - Perfiles originales de evaluación.
 * - Selectores contextuales de zona, actividad y función.
 * - Consulta de requisitos de EPP configurados.
 *
 * IMPORTANTE:
 * - No ejecuta detecciones simuladas.
 * - El detector real todavía debe integrarse.
 * - Los requisitos de EPP son orientativos hasta su validación.
 */

import { APP_CONFIG } from './config.js';

import {
  validateEvidence,
  formatBytes,
  createEvidenceUrl
} from './evidence.js';

import {
  renderProfileSummary,
  getZones,
  getActivitiesByZone,
  getRolesByActivity,
  getContextSummary
} from './rules.js';

// ---------------------------------------------------------
// 1. REFERENCIAS A LOS ELEMENTOS DE LA INTERFAZ
// ---------------------------------------------------------

const $ = (id) => document.getElementById(id);

const fileInput = $('fileInput');
const dropZone = $('dropZone');
const preview = $('preview');
const fileInfo = $('fileInfo');
const clearBtn = $('clearBtn');
const analyzeBtn = $('analyzeBtn');
const exportBtn = $('exportBtn');
const activityLog = $('activityLog');
const ppeGrid = $('ppeGrid');

const areaSelect = $('areaSelect');

// Los tres selectores nuevos se activarán cuando existan
// sus respectivos elementos en index.html.
const zoneSelect = $('zoneSelect');
const activitySelect = $('activitySelect');
const roleSelect = $('roleSelect');

// El HTML puede incluir contextSummary para separar el
// contexto de los cuatro perfiles originales.
const contextSummary = $('contextSummary');

// Si no existe contextSummary, podemos utilizar
// ruleSummary cuando no esté ocupado por el perfil original.
const ruleSummary = $('ruleSummary');

let currentFile = null;
let currentUrl = null;
let currentKind = null;
let activity = [];

// ---------------------------------------------------------
// 2. UTILIDADES DE INTERFAZ
// ---------------------------------------------------------

function setFileInfo(message, isError = false) {
  if (!fileInfo) return;

  fileInfo.replaceChildren();

  const icon = document.createElement('span');
  icon.className = 'file-info-icon';
  icon.textContent = isError ? '!' : 'i';

  const text = document.createElement('span');
  text.textContent = message;

  if (isError) {
    text.style.color = '#a12b2b';
  }

  fileInfo.append(icon, text);
}

function revokeCurrentUrl() {
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
  }

  currentUrl = null;
}

function addPlaceholder(select, label) {
  if (!select) return;

  select.replaceChildren();

  const option = document.createElement('option');
  option.value = '';
  option.textContent = label;

  select.append(option);
}

function populateSelect(select, items, placeholder, getValue, getLabel) {
  if (!select) return;

  addPlaceholder(select, placeholder);

  items.forEach((item) => {
    const option = document.createElement('option');

    option.value = getValue(item);
    option.textContent = getLabel(item);

    select.append(option);
  });
}

// ---------------------------------------------------------
// 3. CATÁLOGO VISUAL DE EPP
// ---------------------------------------------------------

function renderPpeItems() {
  if (!ppeGrid) return;

  ppeGrid.replaceChildren();

  APP_CONFIG.ppeItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'ppe-item';

    const symbol = document.createElement('span');
    symbol.className = 'ppe-symbol';
    symbol.textContent = item.symbol;

    const name = document.createElement('strong');
    name.textContent = item.name;

    const note = document.createElement('span');
    note.textContent = item.note;

    card.append(symbol, name, note);
    ppeGrid.append(card);
  });
}

// ---------------------------------------------------------
// 4. REGISTRO DE ACTIVIDAD
// ---------------------------------------------------------

function logActivity(title, detail) {
  activity.unshift({
    time: new Date().toLocaleString('es-MX'),
    title,
    detail
  });

  activity = activity.slice(0, 30);

  renderActivity();

  if (exportBtn) {
    exportBtn.disabled = false;
  }
}

function renderActivity() {
  if (!activityLog) return;

  activityLog.replaceChildren();

  if (!activity.length) {
    const empty = document.createElement('div');
    empty.className = 'log-empty';

    const icon = document.createElement('span');
    icon.textContent = '◷';

    const p = document.createElement('p');
    p.textContent = 'Aún no hay actividad.';

    empty.append(icon, p);
    activityLog.append(empty);

    return;
  }

  activity.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'log-entry';

    const bullet = document.createElement('span');
    bullet.className = 'log-bullet';
    bullet.textContent = '✓';

    const body = document.createElement('div');

    const title = document.createElement('strong');
    title.textContent = entry.title;

    const detail = document.createElement('div');
    detail.textContent = entry.detail;

    const time = document.createElement('small');
    time.textContent = entry.time;

    body.append(title, detail, time);
    row.append(bullet, body);
    activityLog.append(row);
  });
}

// ---------------------------------------------------------
// 5. CARGA Y VISTA PREVIA DE EVIDENCIA
// ---------------------------------------------------------

function clearEvidence(addLog = true) {
  const hadFile = Boolean(currentFile);

  revokeCurrentUrl();

  currentFile = null;
  currentKind = null;

  if (fileInput) {
    fileInput.value = '';
  }

  if (preview) {
    preview.replaceChildren();

    const empty = document.createElement('div');
    empty.className = 'preview-empty';

    const strong = document.createElement('strong');
    strong.textContent = 'Tu evidencia aparecerá aquí';

    const note = document.createElement('span');
    note.textContent = 'Selecciona una imagen o un video de prueba.';

    empty.append(strong, note);
    preview.append(empty);
  }

  const mediaType = $('mediaType');
  const mediaDimensions = $('mediaDimensions');

  if (mediaType) {
    mediaType.textContent = 'Sin archivo cargado';
  }

  if (mediaDimensions) {
    mediaDimensions.textContent = '—';
  }

  setFileInfo(
    'Elige un archivo de prueba para comenzar. No uses grabaciones sensibles en el repositorio público.'
  );

  if (clearBtn) clearBtn.disabled = true;
  if (analyzeBtn) analyzeBtn.disabled = true;

  if (hadFile && addLog) {
    logActivity(
      'Evidencia retirada',
      'Se limpió la vista previa local.'
    );
  }
}

function loadFile(file) {
  if (!file) return;

  const result = validateEvidence(file);

  if (!result.ok) {
    setFileInfo(result.message, true);
    return;
  }

  revokeCurrentUrl();

  currentFile = file;
  currentKind = result.kind;
  currentUrl = createEvidenceUrl(file);

  if (!preview) return;

  preview.replaceChildren();

  const isImage = result.kind === 'image';

  const media = document.createElement(isImage ? 'img' : 'video');

  media.src = currentUrl;

  media.alt = isImage
    ? 'Vista previa de evidencia seleccionada'
    : 'Video de evidencia seleccionado';

  if (!isImage) {
    media.controls = true;
    media.preload = 'metadata';
  }

  const mediaDimensions = $('mediaDimensions');

  const updateDimensions = () => {
    const width = isImage ? media.naturalWidth : media.videoWidth;
    const height = isImage ? media.naturalHeight : media.videoHeight;

    if (mediaDimensions && width && height) {
      mediaDimensions.textContent = `${width} × ${height}`;
    }
  };

  if (isImage) {
    media.addEventListener('load', updateDimensions, { once: true });
    media.addEventListener('error', () => {
      setFileInfo('No fue posible mostrar la imagen seleccionada.', true);
    }, { once: true });
  } else {
    media.addEventListener('loadedmetadata', updateDimensions, { once: true });
    media.addEventListener('error', () => {
      setFileInfo('No fue posible leer los metadatos del video.', true);
    }, { once: true });
  }

  preview.append(media);

  const mediaType = $('mediaType');

  if (mediaType) {
    mediaType.textContent = isImage
      ? 'Imagen de prueba'
      : 'Video de prueba';
  }

  if (mediaDimensions) {
    mediaDimensions.textContent = 'Leyendo dimensiones…';
  }

  setFileInfo(
    `${file.name} · ${formatBytes(file.size)} · archivo local; no se ha enviado a ningún servidor.`
  );

  if (clearBtn) clearBtn.disabled = false;
  if (analyzeBtn) analyzeBtn.disabled = false;

  logActivity(
    'Evidencia cargada',
    `${file.name} (${isImage ? 'imagen' : 'video'}, ${formatBytes(file.size)}).`
  );
}

// ---------------------------------------------------------
// 6. PERFILES ORIGINALES
// ---------------------------------------------------------

function updateProfileSummary() {
  if (!areaSelect || !ruleSummary) return;

  // Cuando existe un resumen contextual independiente,
  // ruleSummary sigue reservado para el perfil original.
  if (contextSummary && contextSummary === ruleSummary) {
    return;
  }

  renderProfileSummary(areaSelect.value, ruleSummary);
}

function handleProfileChange() {
  updateProfileSummary();

  const selectedOption = areaSelect?.selectedOptions?.[0];

  if (selectedOption) {
    logActivity(
      'Perfil seleccionado',
      `Perfil demostrativo: ${selectedOption.textContent}.`
    );
  }
}

// ---------------------------------------------------------
// 7. SELECTORES CONTEXTUALES EN CASCADA
// ---------------------------------------------------------

function resetActivitySelect() {
  if (!activitySelect) return;

  addPlaceholder(
    activitySelect,
    'Primero selecciona una zona'
  );

  activitySelect.disabled = true;
}

function resetRoleSelect() {
  if (!roleSelect) return;

  addPlaceholder(
    roleSelect,
    'Primero selecciona una actividad'
  );

  roleSelect.disabled = true;
}

function initializeZoneSelect() {
  if (!zoneSelect) return;

  populateSelect(
    zoneSelect,
    getZones(),
    'Selecciona una zona',
    (zone) => zone.id,
    (zone) => zone.name
  );

  resetActivitySelect();
  resetRoleSelect();
}

function handleZoneChange() {
  const zoneId = zoneSelect?.value ?? '';

  resetActivitySelect();
  resetRoleSelect();

  if (!zoneId) {
    renderContextSummary();
    return;
  }

  const activities = getActivitiesByZone(zoneId);

  populateSelect(
    activitySelect,
    activities,
    'Selecciona una actividad',
    (activityItem) => activityItem.id,
    (activityItem) => activityItem.name
  );

  if (activitySelect) {
    activitySelect.disabled = activities.length === 0;
  }

  const zone = getZones().find((item) => item.id === zoneId);

  logActivity(
    'Zona seleccionada',
    zone?.name ?? zoneId
  );

  renderContextSummary();
}

function handleActivityChange() {
  const activityId = activitySelect?.value ?? '';

  resetRoleSelect();

  if (!activityId) {
    renderContextSummary();
    return;
  }

  const roles = getRolesByActivity(activityId);

  populateSelect(
    roleSelect,
    roles,
    'Selecciona una función',
    (role) => role.id,
    (role) => role.name
  );

  if (roleSelect) {
    roleSelect.disabled = roles.length === 0;
  }

  const activityItem = APP_CONFIG.activities[activityId];

  logActivity(
    'Actividad seleccionada',
    activityItem?.name ?? activityId
  );

  renderContextSummary();
}

function handleRoleChange() {
  const roleId = roleSelect?.value ?? '';

  if (roleId) {
    const role = APP_CONFIG.roles[roleId];

    logActivity(
      'Función seleccionada',
      role?.name ?? roleId
    );
  }

  renderContextSummary();
}

// ---------------------------------------------------------
// 8. RESUMEN DE CONTEXTO Y REQUISITOS ORIENTATIVOS
// ---------------------------------------------------------

function getContextTarget() {
  if (contextSummary) {
    return contextSummary;
  }

  // Compatibilidad con la interfaz original:
  // no sobrescribir el resumen del perfil si ambos selectores
  // comparten el mismo contenedor.
  if (!areaSelect && ruleSummary) {
    return ruleSummary;
  }

  return null;
}

function renderContextSummary() {
  const target = getContextTarget();

  if (!target || !zoneSelect || !activitySelect || !roleSelect) {
    return;
  }

  target.replaceChildren();

  const zoneId = zoneSelect.value;
  const activityId = activitySelect.value;
  const roleId = roleSelect.value;

  if (!zoneId) {
    const message = document.createElement('p');
    message.textContent = 'Selecciona una zona para comenzar la configuración contextual.';
    target.append(message);
    return;
  }

  if (!activityId) {
    const message = document.createElement('p');
    message.textContent = 'Selecciona una actividad correspondiente a la zona elegida.';
    target.append(message);
    return;
  }

  if (!roleId) {
    const message = document.createElement('p');
    message.textContent = 'Selecciona la función del personal para consultar el contexto completo.';
    target.append(message);
    return;
  }

  const summary = getContextSummary({
    zoneId,
    activityId,
    roleId
  });

  if (!summary.valid) {
    const message = document.createElement('p');
    message.textContent = summary.errors.join(' ');
    target.append(message);
    return;
  }

  const heading = document.createElement('strong');
  heading.textContent = 'Contexto de evaluación';

  const contextList = document.createElement('ul');

  [
    `Zona: ${summary.zone.name}`,
    `Actividad: ${summary.activity.name}`,
    `Función: ${summary.role.name}`
  ].forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    contextList.append(li);
  });

  const requirementsHeading = document.createElement('strong');
  requirementsHeading.textContent = 'Requisitos de EPP por evaluar';

  const requirementsList = document.createElement('ul');

  summary.requirements.forEach((requirement) => {
    const li = document.createElement('li');

    const name = document.createElement('strong');
    name.textContent = requirement.name;

    const reason = document.createElement('span');
    reason.textContent = ` — ${requirement.reason}`;

    const status = document.createElement('small');
    status.textContent = ' (pendiente de validación SST)';

    li.append(name, reason, status);
    requirementsList.append(li);
  });

  const disclaimer = document.createElement('p');
  disclaimer.textContent = summary.disclaimer;

  target.append(
    heading,
    contextList,
    requirementsHeading,
    requirementsList,
    disclaimer
  );
}

// ---------------------------------------------------------
// 9. PREPARACIÓN DE ANÁLISIS
//
// No se invoca el detector ni se inventan resultados.
// ---------------------------------------------------------

function handleAnalyzeClick() {
  if (!currentFile) return;

  setFileInfo(
    'La evidencia está preparada. El detector real de IA todavía no está integrado; no se han evaluado elementos de EPP.'
  );

  logActivity(
    'Análisis no ejecutado',
    'La evidencia está preparada, pero el modelo de IA aún no está integrado. No se generaron detecciones.'
  );
}

// ---------------------------------------------------------
// 10. EXPORTACIÓN DEL REGISTRO
// ---------------------------------------------------------

function exportSession() {
  const selectedZone = zoneSelect?.value
    ? APP_CONFIG.zones[zoneSelect.value]?.name ?? null
    : null;

  const selectedActivity = activitySelect?.value
    ? APP_CONFIG.activities[activitySelect.value]?.name ?? null
    : null;

  const selectedRole = roleSelect?.value
    ? APP_CONFIG.roles[roleSelect.value]?.name ?? null
    : null;

  const selectedProfile = areaSelect?.value
    ? APP_CONFIG.profiles[areaSelect.value]?.title ?? null
    : null;

  const payload = {
    application: APP_CONFIG.name,
    version: APP_CONFIG.version,
    exportedAt: new Date().toISOString(),

    note:
      'Registro de actividad de la interfaz. No contiene detecciones de IA ni dictámenes de cumplimiento.',

    detectorIntegrated: APP_CONFIG.evaluation.detectorIntegrated,
    simulatedDetections: APP_CONFIG.evaluation.simulatedDetections,

    context: {
      zone: selectedZone,
      activity: selectedActivity,
      role: selectedRole,
      profile: selectedProfile
    },

    evidence: currentFile
      ? {
          name: currentFile.name,
          type: currentFile.type,
          sizeBytes: currentFile.size,
          kind: currentKind,
          note: 'La evidencia no se incluye en el archivo exportado.'
        }
      : null,

    activity
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: 'application/json' }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'visionepp-registro-sesion.json';

  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------
// 11. EVENTOS
// ---------------------------------------------------------

if (fileInput) {
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) {
      loadFile(fileInput.files[0]);
    }
  });
}

if (dropZone) {
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];

    if (file) {
      loadFile(file);
    }
  });
}

if (clearBtn) {
  clearBtn.addEventListener('click', () => clearEvidence());
}

if (analyzeBtn) {
  analyzeBtn.addEventListener('click', handleAnalyzeClick);
}

if (areaSelect) {
  areaSelect.addEventListener('change', handleProfileChange);
}

if (zoneSelect) {
  zoneSelect.addEventListener('change', handleZoneChange);
}

if (activitySelect) {
  activitySelect.addEventListener('change', handleActivityChange);
}

if (roleSelect) {
  roleSelect.addEventListener('change', handleRoleChange);
}

if (exportBtn) {
  exportBtn.addEventListener('click', exportSession);
}

window.addEventListener('beforeunload', revokeCurrentUrl);

// ---------------------------------------------------------
// 12. INICIALIZACIÓN
// ---------------------------------------------------------

renderPpeItems();

updateProfileSummary();

initializeZoneSelect();

renderContextSummary();

if (exportBtn) {
  exportBtn.disabled = activity.length === 0;
}
