# VisionEPP — piloto de visión artificial para EPP

**Versión:** 0.1.0 · **Etapa:** 1 — estructura web y visor de evidencia.

VisionEPP es un prototipo estático para preparar el análisis de equipo de protección personal en obras. Esta etapa permite seleccionar y visualizar imágenes y videos de prueba en el navegador, seleccionar perfiles demostrativos y exportar un registro local de actividad.

## Funciones disponibles

- Interfaz web adaptable a escritorio y móvil.
- Vista previa de imágenes JPG, PNG y WEBP; video MP4 y WEBM.
- Archivos procesados localmente con URL temporal del navegador; no se envían a un servidor.
- Configuración modular de perfiles en `js/config.js`.
- Registro de actividad exportable a JSON.
- Sin base de datos, sin reconocimiento facial y sin detecciones de IA simuladas.

## Limitaciones conocidas

- **Todavía no incluye un modelo de IA.** El botón «Preparar análisis» deja constancia de que el detector está pendiente; no clasifica EPP.
- Los perfiles de seguridad son demostrativos, no una interpretación legal definitiva ni una matriz de cumplimiento normativo.
- No se conecta a cámaras IP ni analiza un flujo de vigilancia en directo.
- El visor usa las capacidades de reproducción del navegador. La compatibilidad de códecs depende del navegador.
- El tamaño máximo configurado por archivo es 250 MB; archivos grandes pueden consumir memoria del navegador.

## Ejecutar localmente

1. Descarga o clona el repositorio.
2. Abre `index.html` en un navegador moderno. Si el navegador restringe módulos ES al abrir archivos directamente, ejecuta un servidor estático local (por ejemplo, la extensión Live Server de VS Code, que es opcional y gratuita) o publica el repositorio en GitHub Pages.
3. Selecciona una imagen o un video de prueba.
4. Cambia el perfil de área para revisar la configuración demostrativa.
5. Usa «Exportar resumen» para guardar la actividad de la sesión.

No es necesario instalar paquetes ni ejecutar `npm install` para esta etapa.

## Publicar en GitHub

1. Crea un repositorio nuevo llamado `VisionEPP`.
2. Sube los archivos y carpetas de este proyecto a la raíz del repositorio.
3. En GitHub, abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**, elige `main` y la carpeta `/ (root)`, y guarda.
5. Espera a que GitHub Pages publique el sitio. La dirección tendrá la forma `https://TU-USUARIO.github.io/VisionEPP/`.

La publicación pública expone el código y cualquier archivo que se suba al repositorio. No incluyas grabaciones reales, imágenes de trabajadores identificables, secretos ni archivos privados.

## Estructura

```text
VisionEPP/
├── index.html
├── README.md
├── .gitignore
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── config.js
    ├── detector.js
    ├── evidence.js
    └── rules.js
```

## Siguiente etapa

Integrar un modelo de detección compatible con navegador y con licencia revisada, evaluar su rendimiento con material de prueba y mostrar cajas/clases con umbral de confianza. Un detector general de objetos no necesariamente reconoce correctamente todos los EPP; puede requerirse un modelo especializado y un conjunto de validación propio.

## Seguridad y normativa

Los requisitos de EPP dependen de la evaluación de riesgos, la tarea y la normativa vigente aplicable. La NOM-031-STPS-2011 sobre construcción y las disposiciones aplicables de equipo de protección personal deben revisarse con el responsable de Seguridad y Salud en el Trabajo antes de usar perfiles como reglas operativas. El resultado visual de un modelo no certifica que un equipo cumpla una norma.
