
/**
 * VisionEPP — Administrador de catálogos externos
 * Versión: 1.0.0
 *
 * Lee los catálogos JSON del repositorio y los integra
 * con el almacenamiento local del navegador.
 */

import {
  loadAdminData,
  saveAdminData
} from './storage.js';

const CATALOGS_PATH = '../../catalogs/';

const LOCAL_CATALOG_KEYS = {
  'tipos-obra': 'workTypes'
};

/**
 * Descarga y valida un archivo JSON.
 */

async function fetchJSON(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  const content = await response.text();

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status} al cargar: ${response.url}`
    );
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(
      `La respuesta no es JSON. URL solicitada: ${response.url}`
    );
  }
}

/**
 * Obtiene el manifiesto general.
 */
export async function loadCatalogManifest() {
  const manifest = await fetchJSON(
    new URL(`${CATALOGS_PATH}manifest.json`, import.meta.url)
  );

  if (
    !manifest ||
    manifest.schemaVersion !== 1 ||
    !Array.isArray(manifest.catalogs)
  ) {
    throw new Error('El manifiesto de catálogos no es válido.');
  }

  const ids = new Set();

  for (const catalog of manifest.catalogs) {
    if (
      !catalog ||
      typeof catalog.id !== 'string' ||
      typeof catalog.name !== 'string' ||
      typeof catalog.file !== 'string' ||
      !['active', 'planned'].includes(catalog.status)
    ) {
      throw new Error('Se encontró una definición de catálogo inválida.');
    }

    if (ids.has(catalog.id)) {
      throw new Error(`Catálogo duplicado: ${catalog.id}`);
    }

    // Solo se permiten nombres de archivo JSON simples.
    if (!/^[a-z0-9-]+\.json$/i.test(catalog.file)) {
      throw new Error(
        `Nombre de archivo no permitido en el catálogo ${catalog.id}.`
      );
    }

    ids.add(catalog.id);
  }

  return manifest;
}

/**
 * Valida el contenido de un catálogo.
 */
function validateCatalog(catalog, expectedId) {
  if (
    !catalog ||
    catalog.schemaVersion !== 1 ||
    catalog.catalogId !== expectedId ||
    !Array.isArray(catalog.items)
  ) {
    throw new Error(
      `El archivo del catálogo "${expectedId}" no tiene una estructura válida.`
    );
  }

  const ids = new Set();

  for (const item of catalog.items) {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      typeof item.name !== 'string' ||
      !item.name.trim() ||
      typeof item.description !== 'string' ||
      !['active', 'inactive'].includes(item.status)
    ) {
      throw new Error(
        `Se encontró un registro inválido en "${expectedId}".`
      );
    }

    if (ids.has(item.id)) {
      throw new Error(
        `Identificador duplicado en "${expectedId}": ${item.id}`
      );
    }

    ids.add(item.id);
  }

  return true;
}

/**
 * Carga un catálogo maestro desde su archivo externo.
 */
export async function loadMasterCatalog(catalogId) {
  const manifest = await loadCatalogManifest();

  const definition = manifest.catalogs.find(
    item => item.id === catalogId
  );

  if (!definition || definition.status !== 'active') {
    throw new Error(
      `El catálogo "${catalogId}" no está disponible.`
    );
  }

  const path = new URL(
    `${CATALOGS_PATH}${definition.file}`,
    import.meta.url
  );

  const catalog = await fetchJSON(path);

  validateCatalog(catalog, catalogId);

  return catalog;
}

/**
 * Combina el catálogo maestro con los cambios locales.
 *
 * Los registros locales tienen prioridad.
 * Los nuevos registros del archivo maestro se incorporan
 * si todavía no existen localmente.
 */
function mergeCatalogItems(masterItems, localItems) {
  const merged = new Map();

  for (const item of masterItems) {
    merged.set(item.id, item);
  }

  for (const item of localItems) {
    merged.set(item.id, item);
  }

  return Array.from(merged.values());
}

/**
 * Obtiene un catálogo listo para utilizarse.
 */
export async function loadCatalog(catalogId) {
  const localKey = LOCAL_CATALOG_KEYS[catalogId];

  if (!localKey) {
    throw new Error(
      `El catálogo "${catalogId}" todavía no está integrado al almacenamiento.`
    );
  }

  const master = await loadMasterCatalog(catalogId);
  const data = loadAdminData();

  const localItems = data.catalogs[localKey] || [];

  const mergedItems = mergeCatalogItems(
    master.items,
    localItems
  );

  const changed =
    JSON.stringify(localItems) !== JSON.stringify(mergedItems);

  if (changed) {
    data.catalogs[localKey] = mergedItems;
    saveAdminData(data);
  }

  return {
    ...master,
    items: mergedItems
  };
}

/**
 * Guarda los registros de un catálogo en el navegador.
 */
export function saveCatalog(catalogId, items) {
  const localKey = LOCAL_CATALOG_KEYS[catalogId];

  if (!localKey) {
    throw new Error(
      `El catálogo "${catalogId}" todavía no está integrado al almacenamiento.`
    );
  }

  if (!Array.isArray(items)) {
    throw new Error('La lista de registros no es válida.');
  }

  const data = loadAdminData();

  data.catalogs[localKey] = items;

  saveAdminData(data);

  return items;
}

/**
 * Exporta un catálogo como archivo JSON independiente.
 */
export function exportCatalog(catalog) {
  validateCatalog(catalog, catalog.catalogId);

  const content = JSON.stringify(catalog, null, 2);

  const blob = new Blob([content], {
    type: 'application/json;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${catalog.catalogId}.json`;

  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
