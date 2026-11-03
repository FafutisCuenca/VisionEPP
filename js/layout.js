/* =====================================================
   VisionEPP - TITULO CENTRALIZADO DE PAGINAS
   Version: 1.0
   ===================================================== */

(() => {
  "use strict";

  const PAGINAS = {
    inicio: {
      etiqueta: "VISIONEPP / PLATAFORMA",
      titulo: "Plataforma de seguridad en obra",
      descripcion:
        "Plataforma de apoyo para la gestion de Seguridad y Salud en el Trabajo en proyectos de construccion."
    },

    analisis: {
      etiqueta: "VISIONEPP / ANALISIS",
      titulo: "Analisis de evidencia",
      descripcion:
        "Revision de imagenes y videos como apoyo para identificar elementos relacionados con la seguridad en obra."
    },

    inspeccion: {
      etiqueta: "VISIONEPP / INSPECCION",
      titulo: "Inspeccion de EPP",
      descripcion:
        "Consulta y revision del equipo de proteccion personal requerido para las actividades de trabajo."
    },

    normativa: {
      etiqueta: "VISIONEPP / NORMATIVA",
      titulo: "Normativa de seguridad",
      descripcion:
        "Consulta de referencias normativas mexicanas aplicables a la Seguridad y Salud en el Trabajo."
    },

    admin: {
      etiqueta: "VISIONEPP / ADMINISTRACION",
      titulo: "Centro de administracion",
      descripcion:
        "Gestiona tus proyectos, configura los catalogos y organiza los recursos de Seguridad y Salud en el Trabajo."
    }
  };

  const contenedor = document.getElementById("visionEPP-page-title");

  if (!contenedor) {
    console.warn(
      "VisionEPP: no se encontro el contenedor #visionEPP-page-title."
    );
    return;
  }

  const pagina = (contenedor.dataset.page || "inicio").toLowerCase();
  const contenido = PAGINAS[pagina] || PAGINAS.inicio;

  // Cargar los estilos compartidos.
  const scriptActual = document.currentScript;

  const rutaCSS = scriptActual
    ? new URL("../css/layout.css", scriptActual.src).href
    : "./css/layout.css";

  if (!document.querySelector("link[data-visionepp-layout-css]")) {
    const hojaEstilos = document.createElement("link");

    hojaEstilos.rel = "stylesheet";
    hojaEstilos.href = rutaCSS;
    hojaEstilos.dataset.visioneppLayoutCss = "true";

    document.head.appendChild(hojaEstilos);
  }

  // Insertar el titulo de la pagina.
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
})();
