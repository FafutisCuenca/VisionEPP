/* =====================================================
   VisionEPP - LAYOUT GLOBAL DE PAGINAS
   Version: 2.0
   Responsabilidad:
   - Estructura general de todas las páginas
   - Contenedor principal
   - Título estandarizado
   ===================================================== */

(() => {
  "use strict";

  const PAGINAS = {
    inicio: {
      etiqueta: "VISIONEPP / PLATAFORMA",
      titulo: "Plataforma de seguridad en obra",
      descripcion:
        "Plataforma de apoyo para la gestión de Seguridad y Salud en el Trabajo en proyectos de construcción."
    },

    analisis: {
      etiqueta: "VISIONEPP / ANÁLISIS",
      titulo: "Análisis de evidencia",
      descripcion:
        "Revisión de imágenes y videos como apoyo para identificar elementos relacionados con la seguridad en obra."
    },

    inspeccion: {
      etiqueta: "VISIONEPP / INSPECCIÓN",
      titulo: "Inspección de EPP",
      descripcion:
        "Consulta y revisión del equipo de protección personal requerido para las actividades de trabajo."
    },

    normativa: {
      etiqueta: "VISIONEPP / NORMATIVA",
      titulo: "Normativa de seguridad",
      descripcion:
        "Consulta de referencias normativas mexicanas aplicables a la Seguridad y Salud en el Trabajo."
    },

    admin: {
      etiqueta: "VISIONEPP / ADMINISTRACIÓN",
      titulo: "Centro de administración",
      descripcion:
        "Gestiona tus proyectos, configura los catálogos y organiza los recursos de Seguridad y Salud en el Trabajo."
    }
  };

  function cargarEstilos(scriptActual) {
    if (document.querySelector("link[data-visionepp-layout-css]")) {
      return;
    }

    const rutaCSS = scriptActual
      ? new URL("../css/layout.css", scriptActual.src).href
      : "./css/layout.css";

    const hojaEstilos = document.createElement("link");

    hojaEstilos.rel = "stylesheet";
    hojaEstilos.href = rutaCSS;
    hojaEstilos.dataset.visioneppLayoutCss = "true";

    document.head.appendChild(hojaEstilos);
  }

  function aplicarLayout() {
    const contenedorTitulo = document.getElementById(
      "visionEPP-page-title"
    );

    if (!contenedorTitulo) {
      console.warn(
        "VisionEPP: no se encontró #visionEPP-page-title."
      );
      return;
    }

    const pagina = (
      contenedorTitulo.dataset.page || "inicio"
    ).toLowerCase();

    const contenido = PAGINAS[pagina];

    if (!contenido) {
      console.warn(
        `VisionEPP: no existe configuración para la página "${pagina}".`
      );
      return;
    }

    const contenedorPrincipal = contenedorTitulo.closest("main");

    if (!contenedorPrincipal) {
      console.error(
        "VisionEPP: el título debe estar dentro de un elemento <main>."
      );
      return;
    }

    // Aplicar la estructura global.
    contenedorPrincipal.classList.add("vision-page-container");
    contenedorPrincipal.dataset.visionLayout = "true";

    // Generar el título común.
    contenedorTitulo.innerHTML = `
      <section class="vision-page-title">
        <p class="vision-page-eyebrow">
          ${contenido.etiqueta}
        </p>

        <h1 class="vision-page-heading">
          ${contenido.titulo}
        </h1>

        <p class="vision-page-description">
          ${contenido.descripcion}
        </p>
      </section>
    `;
  }

  const scriptActual = document.currentScript;

  cargarEstilos(scriptActual);
  aplicarLayout();

})();
