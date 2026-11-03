
/* =====================================================
   VisionEPP - ENCABEZADO CENTRALIZADO
   Versión: 1.0
   ===================================================== */

(() => {
  "use strict";

  // Configuración de los módulos y sus títulos.
  const MODULOS = {
    inicio: {
      titulo: "Plataforma de seguridad en obra",
      archivo: "./"
    },
    analisis: {
      titulo: "Análisis de evidencia",
      archivo: "analisis.html"
    },
    inspeccion: {
      titulo: "Inspección de EPP",
      archivo: "inspeccion.html"
    },
    normativa: {
      titulo: "Normativa de seguridad",
      archivo: "normativa.html"
    },
    admin: {
      titulo: "Administración",
      archivo: "admin.html"
    }
  };

  // Obtener el elemento donde se insertará el encabezado.
  const contenedor = document.getElementById("visionEPP-header");

  if (!contenedor) {
    console.warn(
      "VisionEPP: no se encontró el contenedor #visionEPP-header."
    );
    return;
  }

  // Identificar el módulo actual.
  const pagina = (contenedor.dataset.page || "inicio").toLowerCase();
  const moduloActual = MODULOS[pagina] || MODULOS.inicio;

  // Cargar la hoja de estilos centralizada.
  const scriptActual = document.currentScript;
  const rutaCSS = scriptActual
    ? new URL("../css/header.css", scriptActual.src).href
    : "./css/header.css";

  if (!document.querySelector('link[data-visionepp-header-css]')) {
    const hojaEstilos = document.createElement("link");

    hojaEstilos.rel = "stylesheet";
    hojaEstilos.href = rutaCSS;
    hojaEstilos.dataset.visioneppHeaderCss = "true";

    document.head.appendChild(hojaEstilos);
  }

  // Construir las opciones del menú.
  const opcionesMenu = [
    { id: "inicio", texto: "Inicio" },
    { id: "analisis", texto: "Análisis" },
    { id: "inspeccion", texto: "Inspección" },
    { id: "normativa", texto: "Normativa" },
    { id: "admin", texto: "Administración" }
  ];

  const menuHTML = opcionesMenu.map((opcion, indice) => {
    const activo = opcion.id === pagina;
    const claseActiva = activo ? ' class="active"' : "";
    const paginaActual = activo ? ' aria-current="page"' : "";
    const separador = indice > 0
      ? '<span class="nav-divider" aria-hidden="true">|</span>'
      : "";

    return `
      ${separador}
      <a href="${MODULOS[opcion.id].archivo}"${claseActiva}${paginaActual}>
        ${opcion.texto}
      </a>
    `;
  }).join("");

  // Insertar el encabezado.
  contenedor.innerHTML = `
    <header class="site-header">
      <div class="header-content">

        <div class="header-brand">

          <a href="./"
             class="brand-home"
             aria-label="Ir al inicio de VisionEPP">

            <svg viewBox="0 0 24 24"
                 fill="none"
                 xmlns="http://www.w3.org/2000/svg"
                 aria-hidden="true">

              <path
                d="M3 10.5L12 3L21 10.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"/>

              <path
                d="M5.5 9.5V20H18.5V9.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"/>

              <text
                x="12"
                y="17"
                text-anchor="middle"
                font-size="6"
                font-weight="bold"
                fill="currentColor">VE</text>

            </svg>
          </a>

          <span class="brand-name">VisionEPP</span>

          <span class="header-divider">|</span>

          <span class="header-title">
            ${moduloActual.titulo}
          </span>

        </div>

        <nav class="main-nav" aria-label="Navegación principal">
          ${menuHTML}
        </nav>

      </div>
    </header>
  `;
})();
