/** Configuración local del piloto. Perfiles demostrativos, no dictámenes normativos. */
export const APP_CONFIG = {
  name: 'VisionEPP',
  version: '0.1.0',
  acceptedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  acceptedVideoTypes: ['video/mp4', 'video/webm'],
  maxFileSizeMB: 250,
  ppeItems: [
    { id: 'casco', name: 'Casco', symbol: '⛑', note: 'Cabeza visible' },
    { id: 'chaleco', name: 'Chaleco', symbol: '🦺', note: 'Torso visible' },
    { id: 'lentes', name: 'Lentes', symbol: '🥽', note: 'Rostro visible' },
    { id: 'guantes', name: 'Guantes', symbol: '🧤', note: 'Manos visibles' },
    { id: 'botas', name: 'Botas', symbol: '🥾', note: 'Pies visibles' }
  ],
  profiles: {
    general: { title: 'Obra general', description: 'Perfil inicial para evaluación visual.', items: ['Casco', 'Chaleco', 'Botas'], note: 'Confirmar con el análisis de riesgos y las reglas de la obra.' },
    altura: { title: 'Trabajo en altura', description: 'Perfil orientativo para tareas en altura.', items: ['Casco', 'Chaleco', 'Botas', 'Protección contra caídas'], note: 'El arnés y sistema anticaídas no se pueden validar de forma fiable con cualquier cámara.' },
    corte: { title: 'Corte o esmerilado', description: 'Perfil orientativo para trabajos con proyección de partículas.', items: ['Casco', 'Lentes o careta adecuados', 'Guantes apropiados', 'Botas'], note: 'El tipo de protección depende de la tarea, herramienta y evaluación de riesgos.' },
    soldadura: { title: 'Soldadura', description: 'Perfil orientativo para tareas de soldadura.', items: ['Careta de soldar', 'Guantes de soldador', 'Ropa de protección', 'Botas'], note: 'La detección visual no confirma el nivel de protección ni la condición del equipo.' }
  }
};
