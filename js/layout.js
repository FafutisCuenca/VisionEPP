
/* =====================================================
   VisionEPP - SISTEMA CENTRALIZADO DE LAYOUT
   Version: 2.0
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
    if (document.querySelector("[data-visionepp-layout-css]")) {
      return;
    }

    const hojaEstilos = document.createElement("link");

    hojaEstilos.rel = "stylesheet";
    hojaEstilos.href = new URL(
      "../css/layout.css",
      scriptActual.src
    ).href;

    hojaEstilos.dataset.visioneppLayoutCss = "true";

    document.head.appendChild(hojaEstilos);
  }

  function aplicarLayout() {
    const contenedor = document.getElementById(
      "visionEPP-page-title"
    );

    if (!contenedor) {
      console.error(
        "VisionEPP: falta el contenedor #visionEPP-page-title."
      );
      return;
    }

    const pagina = (
      contenedor.dataset.page || "inicio"
    ).toLowerCase();

    const contenido = PAGINAS[pagina];

    if (!contenido) {
      console.error(
        `VisionEPP: no existe configuración de layout para "${pagina}".`
      );
      return;
    }

    const main = contenedor.closest("main");

    if (!main) {
      console.error(
        "VisionEPP: el título debe estar dentro de un elemento <main>."
      );
      return;
    }

    // Aplicar el contenedor global.
    main.classList.add("vision-page-container");

    // Insertar el título estandarizado.
    contenedor.innerHTML = `
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

    // Marcar la página como estandarizada.
    main.dataset.visionLayout = "true";
  }

  const scriptActual = document.currentScript;

  if (!scriptActual) {
    console.error(
      "VisionEPP: no fue posible identificar layout.js."
    );
    return;
  }

  cargarEstilos(scriptActual);
  aplicarLayout();

})();
