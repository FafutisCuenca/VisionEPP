
/**
 * VisionEPP — Administración de catálogos
 * Módulo: Tipos de obra
 */

import {
  loadCatalog,
  saveCatalog,
  exportCatalog
} from './catalog-manager.js';

import { createId } from './storage.js';

const main = document.querySelector('.admin-container');
const dashboard = document.getElementById('dashboardView');

let catalog = null;

const initialTypes = [
  // Los registros iniciales proceden exclusivamente del JSON externo.
];

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

function createCatalogView() {
  const view = createElement('section');
  view.id = 'workTypesView';
  view.className = 'catalog-view';

  const heading = createElement('div', 'section-title');
  const headingContent = createElement('div');

  headingContent.append(
    createElement('p', 'eyebrow', 'CONFIGURACIÓN GENERAL / CATÁLOGOS'),
    createElement('h1', '', 'Tipos de obra'),
    createElement(
      'p',
      '',
      'Administra los tipos de proyecto disponibles en VisionEPP.'
    )
  );

  heading.append(headingContent);

  const toolbar = createElement('div', 'catalog-toolbar');

  toolbar.append(
    createButton('← Volver al tablero', 'catalog-button secondary', showDashboard),
    createButton('+ Nuevo tipo de obra', 'catalog-button primary', () => openForm())
  );

  const summary = createElement('div', 'catalog-summary');
  summary.id = 'catalogSummary';

  const filters = createElement('div', 'catalog-filters');

  const search = createElement('input');
  search.type = 'search';
  search.id = 'workTypeSearch';
  search.placeholder = 'Buscar tipo de obra...';
  search.setAttribute('aria-label', 'Buscar tipo de obra');

  const status = createElement('select');
  status.id = 'workTypeStatus';
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

  const tableContainer = createElement('div', 'catalog-table-container');
  const table = createElement('table', 'catalog-table');

  const thead = createElement('thead');
  const headerRow = createElement('tr');

  ['Tipo de obra', 'Descripción', 'Estatus', 'Acciones'].forEach(label => {
    headerRow.append(createElement('th', '', label));
  });

  thead.append(headerRow);

  const tbody = createElement('tbody');
  tbody.id = 'workTypesTableBody';

  table.append(thead, tbody);
  tableContainer.append(table);

  const message = createElement('p', 'catalog-message');
  message.id = 'catalogMessage';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');

  const formPanel = createElement('div', 'catalog-form-panel');
  formPanel.id = 'workTypeFormPanel';
  formPanel.hidden = true;

  const formTitle = createElement('h2', '', 'Nuevo tipo de obra');
  formTitle.id = 'workTypeFormTitle';

  const form = createElement('form');
  form.id = 'workTypeForm';

  const nameLabel = createElement('label', '', 'Nombre');
  nameLabel.htmlFor = 'workTypeName';

  const nameInput = createElement('input');
  nameInput.id = 'workTypeName';
  nameInput.type = 'text';
  nameInput.maxLength = 100;
  nameInput.required = true;
  nameInput.placeholder = 'Ej. Edificación residencial';

  const descriptionLabel = createElement('label', '', 'Descripción');
  descriptionLabel.htmlFor = 'workTypeDescription';

  const descriptionInput = createElement('textarea');
  descriptionInput.id = 'workTypeDescription';
  descriptionInput.rows = 3;
  descriptionInput.maxLength = 500;
  descriptionInput.placeholder = 'Descripción del tipo de obra';

  const formActions = createElement('div', 'catalog-form-actions');

  const cancelButton = createButton(
    'Cancelar',
    'catalog-button secondary',
    closeForm
  );

  const saveButton = createElement(
    'button',
    'catalog-button primary',
    'Guardar registro'
  );
  saveButton.type = 'submit';

  formActions.append(cancelButton, saveButton);

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

function showDashboard() {
  const view = document.getElementById('workTypesView');

  if (view) view.hidden = true;
  if (dashboard) dashboard.hidden = false;

  history.replaceState(null, '', location.pathname);
}


async function showCatalog() {
  try {
    // Ocultar el tablero principal.
    if (dashboard) {
      dashboard.hidden = true;
    }

    // Buscar la sección del catálogo.
    let view = document.getElementById('workTypesView');

    // Crear el catálogo si todavía no existe.
    if (!view) {
      view = createCatalogView();
      main.append(view);
    }

    // Asegurar que la sección esté visible.
    view.hidden = false;

    // Cargar los datos del catálogo externo y local.
    catalog = await loadCatalog('tipos-obra');

    // Dibujar la tabla.
    renderTable();

    // Actualizar la dirección de navegación.
    history.replaceState(null, '', '#tipos-obra');

    // Desplazarse automáticamente hasta el catálogo.
    view.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

  } catch (error) {
    console.error('Error al abrir Tipos de obra:', error);

    // Recuperar el tablero si ocurre un error.
    if (dashboard) {
      dashboard.hidden = false;
    }

    alert(
      'No fue posible abrir el catálogo de tipos de obra.\n\n' +
      error.message
    );
  }
}

function updateSummary() {
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

  const metric = document.getElementById('worksMetric');

  if (metric) {
    // Se mantiene el indicador de obras independiente del catálogo.
    metric.textContent = '0';
  }
}

function renderTable() {
  if (!catalog) return;

  const tbody = document.getElementById('workTypesTableBody');
  const search = document.getElementById('workTypeSearch').value
    .trim()
    .toLowerCase();

  const status = document.getElementById('workTypeStatus').value;

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
        item.status === 'active' ? 'status-active' : 'status-inactive',
        item.status === 'active' ? 'Activo' : 'Inactivo'
      )
    );

    const actions = createElement('td');
    const actionGroup = createElement('div', 'catalog-actions');

    actionGroup.append(
      createButton('Editar', 'catalog-button small secondary', () => {
        openForm(item);
      }),
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

function openForm(item = null) {
  const panel = document.getElementById('workTypeFormPanel');
  const title = document.getElementById('workTypeFormTitle');
  const name = document.getElementById('workTypeName');
  const description = document.getElementById('workTypeDescription');
  const form = document.getElementById('workTypeForm');

  form.dataset.editingId = item?.id || '';

  title.textContent = item ? 'Editar tipo de obra' : 'Nuevo tipo de obra';
  name.value = item?.name || '';
  description.value = item?.description || '';

  panel.hidden = false;
  name.focus();
}

function closeForm() {
  const panel = document.getElementById('workTypeFormPanel');
  const form = document.getElementById('workTypeForm');

  panel.hidden = true;
  form.reset();
  delete form.dataset.editingId;
}

function saveForm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const name = document.getElementById('workTypeName').value.trim();
  const description = document.getElementById('workTypeDescription').value.trim();
  const editingId = form.dataset.editingId;

  if (!name) {
    showMessage('Escribe el nombre del tipo de obra.', 'error');
    return;
  }

  const duplicate = catalog.items.some(item =>
    item.name.toLowerCase() === name.toLowerCase() &&
    item.id !== editingId
  );

  if (duplicate) {
    showMessage('Ya existe un tipo de obra con ese nombre.', 'error');
    return;
  }

  if (editingId) {
    const item = catalog.items.find(entry => entry.id === editingId);

    if (!item) return;

    item.name = name;
    item.description = description;
    item.updatedAt = new Date().toISOString();

  } else {
    catalog.items.push({
      id: createId('obra'),
      name,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: null
    });
  }

  try {
    saveCatalog('tipos-obra', catalog.items);
    closeForm();
    renderTable();

    showMessage(
      editingId
        ? 'Tipo de obra actualizado correctamente.'
        : 'Tipo de obra agregado correctamente.'
    );

  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function toggleStatus(item) {
  const action = item.status === 'active' ? 'desactivar' : 'activar';

  if (!confirm(`¿Deseas ${action} "${item.name}"?`)) return;

  const previousStatus = item.status;

  item.status = previousStatus === 'active' ? 'inactive' : 'active';
  item.updatedAt = new Date().toISOString();

  try {
    saveCatalog('tipos-obra', catalog.items);
    renderTable();

    showMessage(
      `El tipo de obra "${item.name}" ahora está ${
        item.status === 'active' ? 'activo' : 'inactivo'
      }.`
    );

  } catch (error) {
    item.status = previousStatus;
    showMessage(error.message, 'error');
  }
}

/**
 * Exporta el catálogo local actualizado.
 */
function downloadCatalog() {
  if (!catalog) return;

  exportCatalog({
    ...catalog,
    updatedAt: new Date().toISOString()
  });
}

// Navegación desde la tarjeta Tipos de obra.
document.addEventListener('click', event => {
  const link = event.target.closest('#openWorkTypes, a[href="#tipos-obra"]');

  if (!link) return;

  event.preventDefault();
  showCatalog();
});

// Permite abrir el catálogo directamente mediante su hash.
if (location.hash === '#tipos-obra') {
  showCatalog();
}

// El botón de exportación se agrega a la barra del catálogo.
document.addEventListener('click', event => {
  if (event.target.id === 'exportWorkTypes') {
    downloadCatalog();
  }
});
