
/**
 * VisionEPP - Reglas y configuración contextual.
 *
 * Responsabilidades:
 * - Conservar los cuatro perfiles originales.
 * - Consultar zonas, actividades y funciones disponibles.
 * - Obtener requisitos orientativos de EPP por actividad.
 * - No generar detecciones ni dictámenes de cumplimiento.
 */

import { APP_CONFIG } from './config.js';

// ---------------------------------------------------------
// 1. PERFILES ORIGINALES
// ---------------------------------------------------------

export function getProfile(profileId) {
  return APP_CONFIG.profiles[profileId] ?? APP_CONFIG.profiles.general;
}

/**
 * Conserva la función utilizada por app.js en la versión actual.
 */
export function renderProfileSummary(profileId, target) {
  const profile = getProfile(profileId);

  target.replaceChildren();

  const heading = document.createElement('strong');
  heading.textContent = profile.title;

  const description = document.createElement('div');
  description.textContent = profile.description;

  const list = document.createElement('ul');

  profile.items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  });

  const note = document.createElement('p');
  note.textContent = profile.note;
  note.style.marginBottom = '0';

  target.append(heading, description, list, note);
}

// ---------------------------------------------------------
// 2. CONSULTA DE CATÁLOGOS
// ---------------------------------------------------------

export function getZones() {
  return Object.values(APP_CONFIG.zones);
}

export function getZone(zoneId) {
  return APP_CONFIG.zones[zoneId] ?? null;
}

export function getActivities() {
  return Object.values(APP_CONFIG.activities);
}

export function getActivity(activityId) {
  return APP_CONFIG.activities[activityId] ?? null;
}

export function getRoles() {
  return Object.values(APP_CONFIG.roles);
}

export function getRole(roleId) {
  return APP_CONFIG.roles[roleId] ?? null;
}

export function getPpeItems() {
  return APP_CONFIG.ppeItems;
}

export function getPpeItem(ppeId) {
  return APP_CONFIG.ppeItems.find((item) => item.id === ppeId) ?? null;
}

// ---------------------------------------------------------
// 3. ACTIVIDADES DISPONIBLES POR ZONA
// ---------------------------------------------------------

/**
 * Devuelve las actividades asociadas a una zona.
 * Si la zona no existe, devuelve un arreglo vacío.
 */
export function getActivitiesByZone(zoneId) {
  const zone = getZone(zoneId);

  if (!zone) {
    return [];
  }

  return zone.activityIds
    .map((activityId) => getActivity(activityId))
    .filter(Boolean);
}

// ---------------------------------------------------------
// 4. FUNCIONES DISPONIBLES POR ACTIVIDAD
// ---------------------------------------------------------

/**
 * Devuelve las funciones que pueden seleccionarse para
 * una actividad determinada.
 *
 * Esta asociación organiza la interfaz; no acredita que
 * una persona esté autorizada para realizar la actividad.
 */
export function getRolesByActivity(activityId) {
  const activity = getActivity(activityId);

  if (!activity) {
    return [];
  }

  return activity.roleIds
    .map((roleId) => getRole(roleId))
    .filter(Boolean);
}

// ---------------------------------------------------------
// 5. REQUISITOS DE EPP POR ACTIVIDAD
// ---------------------------------------------------------

/**
 * Devuelve los requisitos configurados para una actividad.
 *
 * Son requisitos orientativos pendientes de validación.
 * No representan observaciones de cámara ni detecciones.
 */
export function getRequirementsByActivity(activityId) {
  const activity = getActivity(activityId);

  if (!activity) {
    return [];
  }

  return activity.ppeRequirements.map((requirement) => {
    const ppe = getPpeItem(requirement.ppeId);

    return {
      ...requirement,
      ppeId: requirement.ppeId,
      name: ppe?.name ?? requirement.ppeId,
      symbol: ppe?.symbol ?? '•',
      note: ppe?.note ?? '',
      status: 'pendiente_validacion_SST',
      detected: null
    };
  });
}

// ---------------------------------------------------------
// 6. VALIDACIÓN DE LA COMBINACIÓN CONTEXTUAL
// ---------------------------------------------------------

/**
 * Comprueba si una actividad pertenece a una zona.
 */
export function isActivityAllowedInZone(zoneId, activityId) {
  const zone = getZone(zoneId);

  return Boolean(zone && zone.activityIds.includes(activityId));
}

/**
 * Comprueba si una función está configurada para
 * la actividad seleccionada.
 */
export function isRoleAllowedForActivity(activityId, roleId) {
  const activity = getActivity(activityId);

  return Boolean(activity && activity.roleIds.includes(roleId));
}

/**
 * Valida la selección contextual completa.
 * No evalúa EPP ni cumplimiento.
 */
export function validateContext({ zoneId, activityId, roleId }) {
  const errors = [];

  if (!getZone(zoneId)) {
    errors.push('Selecciona una zona de trabajo válida.');
  }

  if (!getActivity(activityId)) {
    errors.push('Selecciona una actividad válida.');
  } else if (
    getZone(zoneId) &&
    !isActivityAllowedInZone(zoneId, activityId)
  ) {
    errors.push('La actividad no corresponde a la zona seleccionada.');
  }

  if (!getRole(roleId)) {
    errors.push('Selecciona una función del personal válida.');
  } else if (
    getActivity(activityId) &&
    !isRoleAllowedForActivity(activityId, roleId)
  ) {
    errors.push('La función seleccionada no está configurada para esta actividad.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ---------------------------------------------------------
// 7. RESUMEN DEL CONTEXTO
// ---------------------------------------------------------

/**
 * Construye un resumen descriptivo para mostrar en pantalla.
 * Los requisitos siguen siendo orientativos.
 */
export function getContextSummary({ zoneId, activityId, roleId }) {
  const validation = validateContext({
    zoneId,
    activityId,
    roleId
  });

  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
      zone: null,
      activity: null,
      role: null,
      requirements: []
    };
  }

  return {
    valid: true,
    errors: [],
    zone: getZone(zoneId),
    activity: getActivity(activityId),
    role: getRole(roleId),
    requirements: getRequirementsByActivity(activityId),
    disclaimer: APP_CONFIG.evaluation.disclaimer
  };
}
