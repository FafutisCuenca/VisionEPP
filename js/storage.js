
/**
 * VisionEPP — Almacenamiento local
 * Esquema: versión 2
 *
 * Sin base de datos, servidor ni servicios de pago.
 * Los datos permanecen en el navegador hasta exportarlos.
 */

const STORAGE_KEY = 'visionepp.admin.data.v1';

export const EMPTY_ADMIN_DATA = {
  schemaVersion: 2,
  updatedAt: null,
  works: [],
  catalogs: {
    workTypes: []
  }
};

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Convierte datos anteriores al esquema actual.
 * Conserva todas las obras existentes.
 */
function normalizeAdminData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('El archivo no contiene un objeto JSON válido.');
  }

  if (![1, 2].includes(data.schemaVersion)) {
    throw new Error('La versión del archivo no es compatible.');
  }

  if (!Array.isArray(data.works)) {
    throw new Error('Falta la lista de obras.');
  }

  const normalized = {
    schemaVersion: 2,
    updatedAt: data.updatedAt || null,
    works: cloneData(data.works),
    catalogs: {
      workTypes: []
    }
  };

  if (data.schemaVersion === 2) {
    if (
      !data.catalogs ||
      typeof data.catalogs !== 'object' ||
      !Array.isArray(data.catalogs.workTypes)
    ) {
      throw new Error('La estructura de catálogos no es válida.');
    }

    normalized.catalogs = cloneData(data.catalogs);
  }

  validateWorks(normalized.works);
  validateWorkTypes(normalized.catalogs.workTypes);

  return normalized;
}

function validateWorks(works) {
  const ids = new Set();

  for (const work of works) {
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
}

function validateWorkTypes(workTypes) {
  const ids = new Set();

  for (const item of workTypes) {
    if (!item || typeof item !== 'object') {
      throw new Error('Se encontró un tipo de obra inválido.');
    }

    if (
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      typeof item.name !== 'string' ||
      !item.name.trim()
    ) {
      throw new Error(
        'Cada tipo de obra debe tener identificador y nombre.'
      );
    }

    if (ids.has(item.id)) {
      throw new Error(
        `Identificador de tipo de obra duplicado: ${item.id}`
      );
    }

    ids.add(item.id);

    if (
      typeof item.description !== 'string' ||
      !['active', 'inactive'].includes(item.status)
    ) {
      throw new Error(
        `El tipo de obra "${item.name}" contiene datos inválidos.`
      );
    }
  }
}

function validateAdminData(data) {
  normalizeAdminData(data);
  return true;
}

export function loadAdminData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return cloneData(EMPTY_ADMIN_DATA);
    }

    const data = JSON.parse(raw);
    const normalized = normalizeAdminData(data);

    // Migración automática de versión 1 a versión 2.
    if (data.schemaVersion !== 2) {
      return saveAdminData(normalized);
    }

    return normalized;

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
  const normalized = normalizeAdminData(data);

  const updated = {
    ...normalized,
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
  const normalized = normalizeAdminData(data);

  const content = JSON.stringify(normalized, null, 2);

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

  return cloneData(normalizeAdminData(data));
}

export function createId(prefix = 'reg') {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
