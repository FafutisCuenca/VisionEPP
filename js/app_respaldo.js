import { APP_CONFIG } from './config.js';
import { validateEvidence, formatBytes, createEvidenceUrl } from './evidence.js';
import { renderProfileSummary } from './rules.js';

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
let currentFile = null;
let currentUrl = null;
let currentKind = null;
let activity = [];

function renderPpeItems() {
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

function logActivity(title, detail) {
  activity.unshift({ time: new Date().toLocaleString('es-MX'), title, detail });
  activity = activity.slice(0, 30);
  renderActivity();
  exportBtn.disabled = false;
}

function renderActivity() {
  activityLog.replaceChildren();
  if (!activity.length) {
    const empty = document.createElement('div');
    empty.className = 'log-empty';
    const icon = document.createElement('span'); icon.textContent = '◷';
    const p = document.createElement('p'); p.textContent = 'Aún no hay actividad.';
    empty.append(icon, p); activityLog.append(empty); return;
  }
  activity.forEach((entry) => {
    const row = document.createElement('div'); row.className = 'log-entry';
    const bullet = document.createElement('span'); bullet.className = 'log-bullet'; bullet.textContent = '✓';
    const body = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = entry.title;
    const detail = document.createElement('div'); detail.textContent = entry.detail;
    const time = document.createElement('small'); time.textContent = entry.time;
    body.append(title, detail, time); row.append(bullet, body); activityLog.append(row);
  });
}

function setFileInfo(message, isError = false) {
  fileInfo.replaceChildren();
  const icon = document.createElement('span'); icon.className = 'file-info-icon'; icon.textContent = isError ? '!' : 'i';
  const text = document.createElement('span'); text.textContent = message;
  if (isError) text.style.color = '#a12b2b';
  fileInfo.append(icon, text);
}

function revokeCurrentUrl() {
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentUrl = null;
}

function clearEvidence(addLog = true) {
  const hadFile = Boolean(currentFile);
  revokeCurrentUrl();
  currentFile = null; currentKind = null;
  fileInput.value = '';
  preview.replaceChildren();
  const empty = document.createElement('div'); empty.className = 'preview-empty';
  const strong = document.createElement('strong'); strong.textContent = 'Tu evidencia aparecerá aquí';
  const note = document.createElement('span'); note.textContent = 'Selecciona una imagen o un video de prueba.';
  empty.append(strong, note); preview.append(empty);
  $('mediaType').textContent = 'Sin archivo cargado';
  $('mediaDimensions').textContent = '—';
  setFileInfo('Elige un archivo de prueba para comenzar. No uses grabaciones sensibles en el repositorio público.');
  clearBtn.disabled = true; analyzeBtn.disabled = true;
  if (hadFile && addLog) logActivity('Evidencia retirada', 'Se limpió la vista previa local.');
}

function loadFile(file) {
  const result = validateEvidence(file);
  if (!result.ok) { setFileInfo(result.message, true); return; }
  revokeCurrentUrl();
  currentFile = file; currentKind = result.kind; currentUrl = createEvidenceUrl(file);
  preview.replaceChildren();
  const media = document.createElement(result.kind === 'image' ? 'img' : 'video');
  media.src = currentUrl;
  media.alt = result.kind === 'image' ? 'Vista previa de evidencia seleccionada' : 'Video de evidencia seleccionado';
  if (result.kind === 'video') { media.controls = true; media.preload = 'metadata'; }
  media.addEventListener('loadedmetadata', () => {
    const dimensions = `${media.videoWidth || media.naturalWidth} × ${media.videoHeight || media.naturalHeight}`;
    $('mediaDimensions').textContent = dimensions;
  }, { once: true });
  preview.append(media);
  $('mediaType').textContent = result.kind === 'image' ? 'Imagen de prueba' : 'Video de prueba';
  $('mediaDimensions').textContent = 'Leyendo dimensiones…';
  setFileInfo(`${file.name} · ${formatBytes(file.size)} · archivo local; no se ha enviado a ningún servidor.`);
  clearBtn.disabled = false; analyzeBtn.disabled = false;
  logActivity('Evidencia cargada', `${file.name} (${result.kind === 'image' ? 'imagen' : 'video'}, ${formatBytes(file.size)}).`);
}

fileInput.addEventListener('change', () => { if (fileInput.files?.[0]) loadFile(fileInput.files[0]); });
['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add('dragover'); }));
['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove('dragover'); }));
dropZone.addEventListener('drop', (event) => { const file = event.dataTransfer?.files?.[0]; if (file) loadFile(file); });
clearBtn.addEventListener('click', () => clearEvidence());
analyzeBtn.addEventListener('click', () => {
  if (!currentFile) return;
  setFileInfo('La evidencia está lista. El detector real de IA se incorporará en la etapa 2; todavía no se han evaluado elementos de EPP.');
  logActivity('Análisis no ejecutado', 'La evidencia está preparada; el modelo de IA aún no está integrado. No se generaron detecciones.');
});
$('areaSelect').addEventListener('change', (event) => {
  renderProfileSummary(event.target.value, $('ruleSummary'));
  logActivity('Perfil seleccionado', `Perfil demostrativo: ${event.target.selectedOptions[0].textContent}.`);
});
exportBtn.addEventListener('click', () => {
  const payload = {
    application: APP_CONFIG.name,
    version: APP_CONFIG.version,
    exportedAt: new Date().toISOString(),
    note: 'Registro de actividad de la interfaz. No contiene detecciones de IA ni dictámenes de cumplimiento.',
    activity
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'visionepp-registro-sesion.json';
  document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
});
window.addEventListener('beforeunload', revokeCurrentUrl);
renderPpeItems();
renderProfileSummary($('areaSelect').value, $('ruleSummary'));
