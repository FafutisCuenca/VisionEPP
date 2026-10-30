
/**
 * VisionEPP — Almacenamiento local
 * Versión: 1.0.0
 *
 * Sin base de datos, servidor ni servicios de pago.
 * Los datos permanecen en el navegador hasta exportarlos.
 */

const STORAGE_KEY = 'visionepp.admin.data.v1';

export const EMPTY_ADMIN_DATA = {
  schemaVersion: 1,
  updatedAt: null,
  works: []
};

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function validateAdminData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('El archivo no contiene un objeto JSON válido.');
  }

  if (data.schemaVersion !== 1) {
    throw new Error('La versión del archivo no es compatible.');
  }

  if (!Array.isArray(data.works)) {
    throw new Error('Falta la lista de obras.');
  }

  const ids = new Set();

  for (const work of data.works) {
    if (!work || typeof work !== 'object') {
      throw new Error('Se encontró un registro de obra inválido.');
    }

    if (
      typeof work.id !== 'string' ||
      !work.id.trim() ||
      typeof work.name !== 'string' ||
      !work.name.trim()
    ) {
      throw new Error('Cada obra debe tener identificador y nombre.');
    }

    if (ids.has(work.id)) {
      throw new Error(`Identificador de obra duplicado: ${work.id}`);
    }

    ids.add(work.id);

    if (!Array.isArray(work.stages) || !Array.isArray(work.zones)) {
      throw new Error(
        `La obra "${work.name}" debe contener listas de etapas y zonas.`
      );
    }
  }

  return true;
}

export function loadAdminData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return cloneData(EMPTY_ADMIN_DATA);
    }

    const data = JSON.parse(raw);
    validateAdminData(data);

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        'Los datos locales no se pudieron interpretar. ' +
        'No se han sobrescrito.'
      );
    }

    throw error;
  }
}

export function saveAdminData(data) {
  validateAdminData(data);

  const updated = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    throw new Error(
      'No fue posible guardar los datos localmente. ' +
      'Comprueba el espacio disponible del navegador.'
    );
  }

  return updated;
}

export function exportAdminData(data) {
  validateAdminData(data);

  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], {
    type: 'application/json;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `visionepp-respaldo-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importAdminData(file) {
  if (!(file instanceof File)) {
    throw new Error('Selecciona un archivo JSON.');
  }

  if (!file.name.toLowerCase().endsWith('.json')) {
    throw new Error('El archivo debe tener extensión .json.');
  }

  const text = await file.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('El archivo no contiene JSON válido.');
  }

  validateAdminData(data);

  return cloneData(data);
}

export function createId(prefix = 'reg') {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
