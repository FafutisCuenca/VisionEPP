
/**
 * VisionEPP — Administración de catálogos
 * Versión: 2.0.0
 *
 * Administración reutilizable para:
 * - Tipos de obra
 * - Especialidades
 *
 * Los catálogos se habilitan mediante manifest.json.
 * Los cambios se guardan en el almacenamiento local.
 */

import {
  loadCatalog,
  saveCatalog,
  exportCatalog,
  loadCatalogManifest
} from './catalog-manager.js';

import { createId } from './storage.js';

const main = document.querySelector('.admin-container');

let catalog = null;
let currentCatalogId = null;
let catalogDefinitions = new Map();
let dashboardElements = [];
let dashboardHiddenStates = new Map();

let catalogView = null;

// -----------------------------------------------------
// UTILIDADES GENERALES
// -----------------------------------------------------

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function showMessage(message, type = 'success') {
  const element = document.getElementById('catalogMessage');

  if (!element) return;

  element.textContent = message;
  element.dataset.type = type;
}

function createButton(text, className, action) {
  const button = createElement('button', className, text);
  button.type = 'button';
  button.addEventListener('click', action);

  return button;
}

function getCurrentDefinition() {
  return catalogDefinitions.get(currentCatalogId);
}

// -----------------------------------------------------
// NAVEGACIÓN DEL TABLERO
// -----------------------------------------------------

function hideDashboard() {
  if (!main) return;

  dashboardElements = Array.from(main.children)
    .filter(element => element !== catalogView);

  dashboardHiddenStates.clear();

  dashboardElements.forEach(element => {
    dashboardHiddenStates.set(element, element.hidden);
    element.hidden = true;
  });
}

function showDashboard() {
  if (catalogView) {
    catalogView.hidden = true;
  }

  dashboardElements.forEach(element => {
    element.hidden = dashboardHiddenStates.get(element) || false;
  });

  history.replaceState(null, '', location.pathname);

  currentCatalogId = null;
  catalog = null;
}

function updateCatalogCards() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const catalogId = link.getAttribute('href').slice(1);
    const definition = catalogDefinitions.get(catalogId);

    if (!definition) return;

    const action = link.querySelector('.module-action');

    if (definition.status === 'active') {
      if (action) {
        action.textContent = 'Configurar catálogo →';
      }

      link.dataset.catalogStatus = 'active';
      link.removeAttribute('aria-disabled');

    } else {
      if (action) {
        action.textContent = 'Próximamente';
      }

      link.dataset.catalogStatus = 'planned';
    }
  });
}

// -----------------------------------------------------
// CONSTRUCCIÓN DE LA PANTALLA DEL CATÁLOGO
// -----------------------------------------------------

function createCatalogView() {
  const view = createElement('section');
  view.id = 'catalogAdminView';
  view.className = 'catalog-view';

  const heading = createElement('div', 'section-title');
  const headingContent = createElement('div');

  headingContent.append(
    createElement(
      'p',
      'eyebrow',
      'CONFIGURACIÓN GENERAL / CATÁLOGOS'
    ),
    createElement('h1', '', ''),
    createElement('p', '', '')
  );

  heading.append(headingContent);

  const toolbar = createElement('div', 'catalog-toolbar');

  toolbar.append(
    createButton(
      '← Volver al tablero',
      'catalog-button secondary',
      showDashboard
    ),
    createButton(
      '+ Nuevo registro',
      'catalog-button primary',
      () => openForm()
    ),
    createButton(
      'Exportar JSON',
      'catalog-button secondary',
      downloadCatalog
    )
  );

  const summary = createElement('div', 'catalog-summary');
  summary.id = 'catalogSummary';

  const filters = createElement('div', 'catalog-filters');

  const search = createElement('input');
  search.type = 'search';
  search.id = 'catalogSearch';
  search.placeholder = 'Buscar registro...';
  search.setAttribute('aria-label', 'Buscar registro');

  const status = createElement('select');
  status.id = 'catalogStatus';
  status.setAttribute('aria-label', 'Filtrar por estatus');

  [
    ['all', 'Todos los registros'],
    ['active', 'Activos'],
    ['inactive', 'Inactivos']
  ].forEach(([value, label]) => {
    const option = createElement('option', '', label);
    option.value = value;
    status.append(option);
  });

  filters.append(search, status);

  const tableContainer = createElement(
    'div',
    'catalog-table-container'
  );

  const table = createElement('table', 'catalog-table');

  const thead = createElement('thead');
  const headerRow = createElement('tr');

  [
    'Nombre',
    'Descripción',
    'Estatus',
    'Acciones'
  ].forEach(label => {
    headerRow.append(createElement('th', '', label));
  });

  thead.append(headerRow);

  const tbody = createElement('tbody');
  tbody.id = 'catalogTableBody';

  table.append(thead, tbody);
  tableContainer.append(table);

  const message = createElement('p', 'catalog-message');
  message.id = 'catalogMessage';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');

  const formPanel = createElement('div', 'catalog-form-panel');
  formPanel.id = 'catalogFormPanel';
  formPanel.hidden = true;

  const formTitle = createElement('h2', '', 'Nuevo registro');
  formTitle.id = 'catalogFormTitle';

  const form = createElement('form');
  form.id = 'catalogForm';

  const nameLabel = createElement('label', '', 'Nombre');
  nameLabel.htmlFor = 'catalogName';

  const nameInput = createElement('input');
  nameInput.id = 'catalogName';
  nameInput.type = 'text';
  nameInput.maxLength = 100;
  nameInput.required = true;
  nameInput.placeholder = 'Nombre del registro';

  const descriptionLabel = createElement(
    'label',
    '',
    'Descripción'
  );

  descriptionLabel.htmlFor = 'catalogDescription';

  const descriptionInput = createElement('textarea');
  descriptionInput.id = 'catalogDescription';
  descriptionInput.rows = 3;
  descriptionInput.maxLength = 500;
  descriptionInput.placeholder = 'Descripción del registro';

  const formActions = createElement('div', 'catalog-form-actions');

  formActions.append(
    createButton(
      'Cancelar',
      'catalog-button secondary',
      closeForm
    ),
    (() => {
      const button = createElement(
        'button',
        'catalog-button primary',
        'Guardar registro'
      );

      button.type = 'submit';
      return button;
    })()
  );

  form.append(
    nameLabel,
    nameInput,
    descriptionLabel,
    descriptionInput,
    formActions
  );

  formPanel.append(formTitle, form);

  view.append(
    heading,
    toolbar,
    summary,
    filters,
    tableContainer,
    message,
    formPanel
  );

  search.addEventListener('input', renderTable);
  status.addEventListener('change', renderTable);
  form.addEventListener('submit', saveForm);

  return view;
}

// -----------------------------------------------------
// ABRIR UN CATÁLOGO
// -----------------------------------------------------

async function showCatalog(catalogId) {
  try {
    const definition = catalogDefinitions.get(catalogId);

    if (!definition) {
      throw new Error(
        `No existe la definición del catálogo "${catalogId}".`
      );
    }

    if (definition.status !== 'active') {
      alert(
        `El catálogo "${definition.name}" todavía no está disponible.`
      );
      return;
    }

    if (!main) {
      throw new Error(
        'No se encontró el contenedor principal de administración.'
      );
    }

    currentCatalogId = catalogId;

    if (!catalogView) {
      catalogView = createCatalogView();
      main.append(catalogView);
    }

    hideDashboard();

    catalogView.hidden = false;

    const headingContent = catalogView.querySelector(
      '.section-title > div'
    );

    headingContent.querySelector('h1').textContent =
      definition.name;

    headingContent.querySelectorAll('p')[1].textContent =
      `Administra los registros del catálogo ${definition.name} de VisionEPP.`;

    catalog = await loadCatalog(catalogId);

    closeForm();
    renderTable();

    showMessage(
      `Catálogo "${definition.name}" cargado correctamente.`
    );

    history.replaceState(
      null,
      '',
      `${location.pathname}#${catalogId}`
    );

    catalogView.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

  } catch (error) {
    console.error('Error al abrir el catálogo:', error);

    showDashboard();

    alert(
      'No fue posible abrir el catálogo.\n\n' +
      error.message
    );
  }
}

// -----------------------------------------------------
// RESUMEN Y TABLA
// -----------------------------------------------------

function updateSummary() {
  if (!catalog) return;

  const total = catalog.items.length;

  const active = catalog.items.filter(
    item => item.status === 'active'
  ).length;

  const inactive = total - active;

  const summary = document.getElementById('catalogSummary');

  summary.replaceChildren();

  [
    ['Total de registros', total],
    ['Activos', active],
    ['Inactivos', inactive]
  ].forEach(([label, value]) => {
    const card = createElement('div');

    card.append(
      createElement('span', 'metric-label', label),
      createElement('strong', '', String(value))
    );

    summary.append(card);
  });
}

function renderTable() {
  if (!catalog || !catalogView) return;

  const tbody = document.getElementById('catalogTableBody');

  const search = document.getElementById('catalogSearch')
    .value.trim().toLowerCase();

  const status = document.getElementById('catalogStatus').value;

  tbody.replaceChildren();

  const filtered = catalog.items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search);

    const matchesStatus =
      status === 'all' || item.status === status;

    return matchesSearch && matchesStatus;
  });

  filtered.forEach(item => {
    const row = createElement('tr');

    row.append(
      createElement('td', '', item.name),
      createElement('td', '', item.description),
      createElement(
        'td',
        item.status === 'active'
          ? 'status-active'
          : 'status-inactive',
        item.status === 'active' ? 'Activo' : 'Inactivo'
      )
    );

    const actions = createElement('td');
    const actionGroup = createElement('div', 'catalog-actions');

    actionGroup.append(
      createButton(
        'Editar',
        'catalog-button small secondary',
        () => openForm(item)
      ),
      createButton(
        item.status === 'active' ? 'Desactivar' : 'Activar',
        'catalog-button small secondary',
        () => toggleStatus(item)
      )
    );

    actions.append(actionGroup);
    row.append(actions);
    tbody.append(row);
  });

  if (!filtered.length) {
    const row = createElement('tr');

    const cell = createElement(
      'td',
      'catalog-empty',
      'No se encontraron registros.'
    );

    cell.colSpan = 4;

    row.append(cell);
    tbody.append(row);
  }

  updateSummary();
}

// -----------------------------------------------------
// FORMULARIO: AGREGAR Y EDITAR
// -----------------------------------------------------

function openForm(item = null) {
  const panel = document.getElementById('catalogFormPanel');
  const title = document.getElementById('catalogFormTitle');
  const name = document.getElementById('catalogName');
  const description = document.getElementById('catalogDescription');
  const form = document.getElementById('catalogForm');

  form.dataset.editingId = item?.id || '';

  title.textContent = item ? 'Editar registro' : 'Nuevo registro';

  name.value = item?.name || '';
  description.value = item?.description || '';

  panel.hidden = false;
  name.focus();
}

function closeForm() {
  const panel = document.getElementById('catalogFormPanel');
  const form = document.getElementById('catalogForm');

  if (!panel || !form) return;

  panel.hidden = true;
  form.reset();

  delete form.dataset.editingId;
}

function saveForm(event) {
  event.preventDefault();

  if (!catalog || !currentCatalogId) return;

  const form = event.currentTarget;

  const name = document.getElementById('catalogName')
    .value.trim();

  const description = document.getElementById('catalogDescription')
    .value.trim();

  const editingId = form.dataset.editingId;

  if (!name) {
    showMessage('Escribe el nombre del registro.', 'error');
    return;
  }

  const duplicate = catalog.items.some(item =>
    item.name.toLowerCase() === name.toLowerCase() &&
    item.id !== editingId
  );

  if (duplicate) {
    showMessage(
      'Ya existe un registro con ese nombre.',
      'error'
    );
    return;
  }

  if (editingId) {
    const item = catalog.items.find(
      entry => entry.id === editingId
    );

    if (!item) return;

    item.name = name;
    item.description = description;
    item.updatedAt = new Date().toISOString();

  } else {
    catalog.items.push({
      id: createId(currentCatalogId),
      name,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: null
    });
  }

  try {
    saveCatalog(currentCatalogId, catalog.items);

    closeForm();
    renderTable();

    showMessage(
      editingId
        ? 'Registro actualizado correctamente.'
        : 'Registro agregado correctamente.'
    );

  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// -----------------------------------------------------
// ACTIVAR Y DESACTIVAR
// -----------------------------------------------------

function toggleStatus(item) {
  if (!catalog || !currentCatalogId) return;

  const action = item.status === 'active'
    ? 'desactivar'
    : 'activar';

  if (!confirm(`¿Deseas ${action} "${item.name}"?`)) {
    return;
  }

  const previousStatus = item.status;

  item.status = previousStatus === 'active'
    ? 'inactive'
    : 'active';

  item.updatedAt = new Date().toISOString();

  try {
    saveCatalog(currentCatalogId, catalog.items);

    renderTable();

    showMessage(
      `El registro "${item.name}" ahora está ${
        item.status === 'active' ? 'activo' : 'inactivo'
      }.`
    );

  } catch (error) {
    item.status = previousStatus;
    showMessage(error.message, 'error');
  }
}

// -----------------------------------------------------
// EXPORTAR CATÁLOGO
// -----------------------------------------------------

function downloadCatalog() {
  if (!catalog) return;

  try {
    exportCatalog({
      ...catalog,
      updatedAt: new Date().toISOString()
    });

    showMessage('Catálogo exportado correctamente.');

  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// -----------------------------------------------------
// NAVEGACIÓN DESDE LAS TARJETAS
// -----------------------------------------------------

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');

  if (!link) return;

  const catalogId = link.getAttribute('href').slice(1);
  const definition = catalogDefinitions.get(catalogId);

  if (!definition) return;

  event.preventDefault();

  if (definition.status !== 'active') {
    alert(
      `El catálogo "${definition.name}" todavía está marcado como Próximamente.`
    );
    return;
  }

  showCatalog(catalogId);
});

// -----------------------------------------------------
// INICIALIZACIÓN
// -----------------------------------------------------

async function initializeAdmin() {
  try {
    const manifest = await loadCatalogManifest();

    catalogDefinitions = new Map(
      manifest.catalogs.map(definition => [
        definition.id,
        definition
      ])
    );

    updateCatalogCards();

    const requestedCatalog = location.hash.slice(1);

    if (requestedCatalog && catalogDefinitions.has(requestedCatalog)) {
      const definition = catalogDefinitions.get(requestedCatalog);

      if (definition.status === 'active') {
        await showCatalog(requestedCatalog);
      }
    }

  } catch (error) {
    console.error(
      'No fue posible inicializar los catálogos:',
      error
    );
  }
}

initializeAdmin();
