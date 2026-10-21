
/**
 * VisionEPP - Aplicación principal.
 *
 * - Carga y vista previa local de imágenes y videos.
 * - Validación y limpieza de evidencia.
 * - Registro de actividad y exportación JSON.
 * - Perfiles orientativos y selectores contextuales.
 * - Validación de zona, actividad y función.
 *
 * IMPORTANTE:
 * - No ejecuta detecciones simuladas.
 * - El detector real todavía no está integrado.
 * - Los requisitos de EPP requieren validación por SST.
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
  getZone,
  getActivitiesByZone,
  getActivity,
  getRolesByActivity,
  getRole,
  getContextSummary,
  validateContext
} from './rules.js';

// ---------------------------------------------------------
// 1. ELEMENTOS DE LA INTERFAZ
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
const zoneSelect = $('zoneSelect');
const activitySelect = $('activitySelect');
const roleSelect = $('roleSelect');

const contextSummary = $('contextSummary');
const ruleSummary = $('ruleSummary');

// ---------------------------------------------------------
// 2. ESTADO DE LA SESIÓN
// ---------------------------------------------------------

let currentFile = null;
let currentUrl = null;
let currentKind = null;

let activity = [];

// Controla los intentos de análisis de la evidencia actual.
// El detector no se ejecuta en esta versión.
let analysisAttempted = false;

// Evita registrar repetidamente el mismo evento en una
// secuencia inmediata de cambios o clics.
let lastLoggedEventKey = '';
let lastLoggedEventTime = 0;

// ---------------------------------------------------------
// 3. UTILIDADES DE INTERFAZ
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

function populateSelect(
  select,
  items,
  placeholder,
  getValue,
  getLabel
) {
  if (!select) return;

  addPlaceholder(select, placeholder);

  items.forEach((item) => {
    const option = document.createElement('option');

    option.value = getValue(item);
    option.textContent = getLabel(item);

    select.append(option);
  });
}

function getSelectedContext() {
  return {
    zoneId: zoneSelect?.value ?? '',
    activityId: activitySelect?.value ?? '',
    roleId: roleSelect?.value ?? ''
  };
}

function getSelectedContextLabels() {
  const { zoneId, activityId, roleId } = getSelectedContext();

  return {
    zone: zoneId ? getZone(zoneId)?.name ?? null : null,
    activity: activityId ? getActivity(activityId)?.name ?? null : null,
    role: roleId ? getRole(roleId)?.name ?? null : null,
    profile: areaSelect?.value
      ? APP_CONFIG.profiles[areaSelect.value]?.title ?? null
      : null
  };
}

function hasContextSelectors() {
  return Boolean(zoneSelect && activitySelect && roleSelect);
}

function validateSelectedContext() {
  if (!hasContextSelectors()) {
    return {
      valid: true,
      errors: []
    };
  }

  const { zoneId, activityId, roleId } = getSelectedContext();

  if (!zoneId || !activityId || !roleId) {
    return {
      valid: false,
      errors: [
        'Completa la zona, la actividad y la función del personal.'
      ]
    };
  }

  return validateContext({
    zoneId,
    activityId,
    roleId
  });
}

// ---------------------------------------------------------
// 4. CATÁLOGO VISUAL DE EPP
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
// 5. REGISTRO DE ACTIVIDAD
// ---------------------------------------------------------

function logActivity(title, detail, options = {}) {
  const { force = false } = options;
  const now = Date.now();
  const eventKey = `${title}::${detail}`;

  // Evita duplicar el mismo evento cuando se produce
  // varias veces en un intervalo muy corto.
  if (
    !force &&
    eventKey === lastLoggedEventKey &&
    now - lastLoggedEventTime < 2000
  ) {
    return;
  }

  lastLoggedEventKey = eventKey;
  lastLoggedEventTime = now;

  activity.unshift({
    time: new Date().toLocaleString('es-MX'),
    timestamp: new Date().toISOString(),
    title,
    detail
  });

  // Conserva un máximo de 30 eventos, del más reciente
  // al más antiguo en la interfaz.
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
// 6. CARGA Y VISTA PREVIA DE EVIDENCIA
// ---------------------------------------------------------

function clearEvidence(addLog = true) {
  const hadFile = Boolean(currentFile);

  revokeCurrentUrl();

  currentFile = null;
  currentKind = null;
  analysisAttempted = false;

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

  // Liberar la URL de la evidencia anterior.
  revokeCurrentUrl();

  currentFile = file;
  currentKind = result.kind;
  currentUrl = createEvidenceUrl(file);
  analysisAttempted = false;

  if (!preview) return;

  preview.replaceChildren();

  const isImage = result.kind === 'image';
  const media = document.createElement(isImage ? 'img' : 'video');

  // Mantener la evidencia dentro de la ventana de vista previa.
  media.style.display = 'block';
  media.style.maxWidth = '100%';
  media.style.maxHeight = '100%';
  media.style.objectFit = 'contain';
  media.style.objectPosition = 'center';
  media.style.boxSizing = 'border-box';

  if (isImage) {
    // Respetar las dimensiones originales sin ampliar ni recortar.
    media.style.width = 'auto';
    media.style.height = 'auto';
    media.style.flex = '0 1 auto';
  } else {
    // El video ocupa el espacio disponible sin deformarse.
    media.style.width = '100%';
    media.style.height = '100%';
  }

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
      setFileInfo(
        'No fue posible mostrar la imagen seleccionada.',
        true
      );
    }, { once: true });
  } else {
    media.addEventListener(
      'loadedmetadata',
      updateDimensions,
      { once: true }
    );

    media.addEventListener('error', () => {
      setFileInfo(
        'No fue posible leer los metadatos del video.',
        true
      );
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

  // Habilitar las acciones para la evidencia cargada.
  if (clearBtn) clearBtn.disabled = false;
  if (analyzeBtn) analyzeBtn.disabled = false;

  // Registrar la carga de evidencia.
  logActivity(
    'Evidencia cargada',
    `${file.name} · ${formatBytes(file.size)} · ${isImage ? 'Imagen' : 'Video'}`
  );
}
  
// ---------------------------------------------------------
// 7. PERFILES ORIGINALES
// ---------------------------------------------------------

function updateProfileSummary() {
  if (!areaSelect || !ruleSummary) return;

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
// 8. SELECTORES CONTEXTUALES
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

  const zone = getZone(zoneId);

  if (!zone) {
    renderContextSummary();
    return;
  }

  const activities = getActivitiesByZone(zoneId);

  populateSelect(
    activitySelect,
    activities,
    'Selecciona una actividad',
    (item) => item.id,
    (item) => item.name
  );

  if (activitySelect) {
    activitySelect.disabled = activities.length === 0;
  }

  logActivity(
    'Zona seleccionada',
    zone.name
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

  const selectedActivity = getActivity(activityId);

  if (!selectedActivity) {
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

  logActivity(
    'Actividad seleccionada',
    selectedActivity.name
  );

  renderContextSummary();
}

function handleRoleChange() {
  const roleId = roleSelect?.value ?? '';

  if (roleId) {
    const role = getRole(roleId);

    if (role) {
      logActivity(
        'Función seleccionada',
        role.name
      );
    }
  }

  renderContextSummary();
}

// ---------------------------------------------------------
// 9. RESUMEN DEL CONTEXTO
// ---------------------------------------------------------

function getContextTarget() {
  if (contextSummary) {
    return contextSummary;
  }

  // Evita sobrescribir el resumen del perfil existente.
  if (!areaSelect && ruleSummary) {
    return ruleSummary;
  }

  return null;
}

function renderContextSummary() {
  const target = getContextTarget();

  if (!target || !hasContextSelectors()) {
    return;
  }

  target.replaceChildren();

  const { zoneId, activityId, roleId } = getSelectedContext();

  if (!zoneId) {
    const message = document.createElement('p');
    message.textContent =
      'Selecciona una zona para comenzar la configuración contextual.';

    target.append(message);
    return;
  }

  if (!activityId) {
    const message = document.createElement('p');
    message.textContent =
      'Selecciona una actividad correspondiente a la zona elegida.';

    target.append(message);
    return;
  }

  if (!roleId) {
    const message = document.createElement('p');
    message.textContent =
      'Selecciona la función del personal para completar el contexto.';

    target.append(message);
    return;
  }

  const validation = validateSelectedContext();

  if (!validation.valid) {
    const heading = document.createElement('strong');
    heading.textContent = 'Contexto por revisar';

    const message = document.createElement('p');
    message.textContent = Array.isArray(validation.errors)
      ? validation.errors.join(' ')
      : 'La combinación seleccionada no ha sido validada.';

    target.append(heading, message);
    return;
  }

  const summary = getContextSummary({
    zoneId,
    activityId,
    roleId
  });

  if (!summary || !summary.valid) {
    const message = document.createElement('p');

    message.textContent = Array.isArray(summary?.errors)
      ? summary.errors.join(' ')
      : 'No fue posible validar el contexto seleccionado.';

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
  requirementsHeading.textContent = 'Requisitos orientativos de EPP';

  const requirementsList = document.createElement('ul');

  (summary.requirements ?? []).forEach((requirement) => {
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
  disclaimer.textContent =
    summary.disclaimer ??
    'Los requisitos deben validarse con el responsable de SST.';

  target.append(
    heading,
    contextList,
    requirementsHeading,
    requirementsList,
    disclaimer
  );
}

// ---------------------------------------------------------
// 10. CONTROL DEL BOTÓN DE ANÁLISIS
//
// No se llama al detector ni se generan detecciones.
// Se permite un solo intento de interfaz por evidencia.
// ---------------------------------------------------------

function handleAnalyzeClick() {
  if (!currentFile) {
    setFileInfo(
      'Primero selecciona una imagen o un video.',
      true
    );
    return;
  }

  if (analysisAttempted) {
    setFileInfo(
      'Este archivo ya fue revisado en la interfaz. Para iniciar otra prueba, carga nuevamente la evidencia o selecciona otro archivo.'
    );
    return;
  }

  const validation = validateSelectedContext();

  if (!validation.valid) {
    const message = Array.isArray(validation.errors)
      ? validation.errors.join(' ')
      : 'Completa y valida el contexto antes de continuar.';

    setFileInfo(message, true);

    logActivity(
      'Contexto incompleto',
      message
    );

    return;
  }

  // Se marca el intento antes de actualizar la interfaz,
  // para impedir un segundo clic mientras se procesa el evento.
  analysisAttempted = true;

  if (analyzeBtn) {
    analyzeBtn.disabled = true;
  }

  const message =
    'El detector real de IA todavía no está integrado. No se ejecutó un análisis ni se generaron detecciones.';

  setFileInfo(message);

  logActivity(
    'Análisis no ejecutado',
    'La evidencia y el contexto están preparados, pero el modelo de IA aún no está integrado. No se generaron detecciones.'
  );
}

// ---------------------------------------------------------
// 11. EXPORTACIÓN JSON
// ---------------------------------------------------------

function exportSession() {
  const context = getSelectedContextLabels();

  const payload = {
    application: APP_CONFIG.name,
    version: APP_CONFIG.version,
    exportedAt: new Date().toISOString(),

    note:
      'Registro de actividad de la interfaz. No contiene detecciones de IA ni dictámenes de cumplimiento.',

    detectorIntegrated:
      APP_CONFIG.evaluation.detectorIntegrated,

    simulatedDetections:
      APP_CONFIG.evaluation.simulatedDetections,

    context: {
      ...context,
      validation: hasContextSelectors()
        ? validateSelectedContext()
        : {
            valid: false,
            errors: ['Los selectores contextuales no están disponibles.']
          }
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

    activity: [...activity].reverse()
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

  // Se libera la URL temporal tras iniciar la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// ---------------------------------------------------------
// 12. EVENTOS DE ARCHIVOS
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

// ---------------------------------------------------------
// 13. EVENTOS DE LA APLICACIÓN
// ---------------------------------------------------------

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
// 14. INICIALIZACIÓN
// ---------------------------------------------------------

renderPpeItems();

updateProfileSummary();

initializeZoneSelect();

renderContextSummary();

clearEvidence(false);

if (exportBtn) {
  exportBtn.disabled = true;
}
