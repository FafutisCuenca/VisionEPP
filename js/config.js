
/**
 * VisionEPP - Configuración del piloto.
 *
 * Catálogos de zonas, actividades, funciones del personal y EPP.
 *
 * IMPORTANTE:
 * - Los requisitos de EPP son propuestas iniciales orientativas.
 * - Deben validarse con Seguridad y Salud en el Trabajo (SST),
 *   la evaluación de riesgos y las disposiciones aplicables.
 * - Este archivo no ejecuta inteligencia artificial.
 * - No genera detecciones ni determina el cumplimiento de una persona.
 * - La ausencia de una detección nunca debe interpretarse por sí sola
 *   como ausencia del elemento de protección.
 */

export const APP_CONFIG = {
  name: 'VisionEPP',
  version: '0.1.0',

  // -------------------------------------------------------
  // 1. ARCHIVOS ADMITIDOS
  // -------------------------------------------------------

  acceptedImageTypes: [
    'image/jpeg',
    'image/png',
    'image/webp'
  ],

  acceptedVideoTypes: [
    'video/mp4',
    'video/webm'
  ],

  maxFileSizeMB: 250,

  // -------------------------------------------------------
  // 2. CATÁLOGO DE EPP
  //
  // Se conservan los cinco elementos originales.
  // Los nuevos elementos amplían las opciones de evaluación.
  // -------------------------------------------------------

  ppeItems: [
    {
      id: 'casco',
      name: 'Casco',
      symbol: '⛑',
      note: 'Protección de la cabeza'
    },
    {
      id: 'chaleco',
      name: 'Chaleco',
      symbol: '🦺',
      note: 'Alta visibilidad cuando corresponda'
    },
    {
      id: 'lentes',
      name: 'Lentes',
      symbol: '🥽',
      note: 'Protección ocular según el riesgo'
    },
    {
      id: 'guantes',
      name: 'Guantes',
      symbol: '🧤',
      note: 'Tipo adecuado para la tarea'
    },
    {
      id: 'botas',
      name: 'Botas',
      symbol: '🥾',
      note: 'Calzado de seguridad adecuado'
    },
    {
      id: 'arnes',
      name: 'Arnés y sistema anticaídas',
      symbol: '🪢',
      note: 'Sistema seleccionado para el riesgo de caída'
    },
    {
      id: 'careta_soldar',
      name: 'Careta de soldar',
      symbol: '🥽',
      note: 'Protección facial y ocular para soldadura'
    },
    {
      id: 'ropa_proteccion',
      name: 'Ropa de protección',
      symbol: '👕',
      note: 'Material y características según la tarea'
    },
    {
      id: 'proteccion_auditiva',
      name: 'Protección auditiva',
      symbol: '🎧',
      note: 'Cuando la evaluación de exposición lo requiera'
    },
    {
      id: 'proteccion_facial',
      name: 'Protección facial',
      symbol: '🛡️',
      note: 'Careta o protección compatible con el riesgo'
    },
    {
      id: 'respirador',
      name: 'Protección respiratoria',
      symbol: '😷',
      note: 'Tipo definido según el agente y la exposición'
    }
  ],

  // -------------------------------------------------------
  // 3. FUNCIONES DEL PERSONAL
  //
  // Son categorías iniciales para clasificar el contexto.
  // No representan acreditaciones ni autorizaciones laborales.
  // -------------------------------------------------------

  roles: {
    trabajador: {
      id: 'trabajador',
      name: 'Trabajador operativo',
      description: 'Realiza tareas operativas en la zona.'
    },

    operador: {
      id: 'operador',
      name: 'Operador de equipo',
      description: 'Opera maquinaria o equipo de trabajo.'
    },

    supervisor: {
      id: 'supervisor',
      name: 'Supervisor',
      description: 'Supervisa actividades y condiciones de trabajo.'
    }
  },

  // -------------------------------------------------------
  // 4. CATÁLOGO DE ACTIVIDADES
  //
  // roleIds controla qué funciones aparecen para cada
  // actividad en el selector dependiente.
  //
  // ppeRequirements contiene propuestas por evaluar, no
  // detecciones ni dictámenes de cumplimiento.
  // -------------------------------------------------------

  activities: {
    transito_obra: {
      id: 'transito_obra',
      name: 'Tránsito y circulación en obra',
      description: 'Desplazamiento por zonas de trabajo.',
      roleIds: [
        'trabajador',
        'operador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'casco',
          reason: 'Evaluar la exposición a golpes o caída de objetos.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'botas',
          reason: 'Evaluar los riesgos para los pies.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'chaleco',
          reason: 'Evaluar la visibilidad frente a vehículos y equipos.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    },

    trabajo_operativo: {
      id: 'trabajo_operativo',
      name: 'Trabajo operativo general',
      description: 'Ejecución de labores generales de obra.',
      roleIds: [
        'trabajador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'casco',
          reason: 'Evaluar los riesgos para la cabeza.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'botas',
          reason: 'Evaluar los riesgos para los pies.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'chaleco',
          reason: 'Evaluar si se requiere alta visibilidad.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    },

    recepcion_materiales: {
      id: 'recepcion_materiales',
      name: 'Recepción de materiales',
      description: 'Recepción, revisión y preparación de materiales.',
      roleIds: [
        'trabajador',
        'operador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'casco',
          reason: 'Evaluar la exposición a objetos y materiales.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'botas',
          reason: 'Evaluar golpes, aplastamiento y otros riesgos para los pies.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'guantes',
          reason: 'Evaluar los riesgos de manipulación de materiales.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'chaleco',
          reason: 'Evaluar la interacción con vehículos y equipos móviles.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    },

    carga_descarga: {
      id: 'carga_descarga',
      name: 'Carga y descarga de materiales',
      description: 'Movimiento y manipulación de materiales.',
      roleIds: [
        'trabajador',
        'operador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'casco',
          reason: 'Evaluar el riesgo de caída o impacto de objetos.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'botas',
          reason: 'Evaluar el riesgo de aplastamiento y golpes.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'guantes',
          reason: 'Evaluar cortes, abrasión y manipulación.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'chaleco',
          reason: 'Evaluar la visibilidad durante las maniobras.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    },

    almacenamiento: {
      id: 'almacenamiento',
      name: 'Almacenamiento de materiales',
      description: 'Acomodo, organización y resguardo de materiales.',
      roleIds: [
        'trabajador',
        'operador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'botas',
          reason: 'Evaluar los riesgos por caída o movimiento de materiales.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'guantes',
          reason: 'Evaluar los riesgos durante la manipulación.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'casco',
          reason: 'Evaluar los riesgos asociados con materiales almacenados.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    },

    movimiento_materiales: {
      id: 'movimiento_materiales',
      name: 'Movimiento de materiales',
      description: 'Traslado manual o mediante equipos.',
      roleIds: [
        'trabajador',
        'operador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'botas',
          reason: 'Evaluar los riesgos durante el traslado.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'guantes',
          reason: 'Evaluar los riesgos de contacto y manipulación.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'chaleco',
          reason: 'Evaluar la visibilidad en zonas con equipos móviles.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    },

    acceso_altura: {
      id: 'acceso_altura',
      name: 'Acceso a zona elevada',
      description: 'Acceso mediante escaleras, plataformas u otros medios.',
      roleIds: [
        'trabajador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'casco',
          reason: 'Evaluar los riesgos de golpes y caída de objetos.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'botas',
          reason: 'Evaluar las condiciones de apoyo y el riesgo de resbalón.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'arnes',
          reason: 'Determinar si el sistema anticaídas es necesario según la evaluación de riesgos.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    },

    trabajo_altura: {
      id: 'trabajo_altura',
      name: 'Ejecución de trabajo en altura',
      description: 'Trabajo en una posición con riesgo de caída.',
      roleIds: [
        'trabajador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'casco',
          reason: 'Evaluar los riesgos para la cabeza.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'botas',
          reason: 'Evaluar las condiciones de apoyo y los riesgos de la tarea.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'arnes',
          reason: 'Evaluar el sistema de protección contra caídas aplicable.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    },

    corte_esmerilado: {
      id: 'corte_esmerilado',
      name: 'Corte o esmerilado',
      description: 'Uso de herramientas que pueden producir partículas.',
      roleIds: [
        'trabajador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'lentes',
          reason: 'Evaluar la protección ocular frente a partículas.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'proteccion_facial',
          reason: 'Evaluar si se requiere protección facial adicional.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'guantes',
          reason: 'Evaluar la compatibilidad de los guantes con la herramienta y la tarea.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'botas',
          reason: 'Evaluar los riesgos para los pies.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'proteccion_auditiva',
          reason: 'Evaluar la exposición al ruido.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'respirador',
          reason: 'Evaluar la exposición a polvo o partículas respirables.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    },

    soldadura: {
      id: 'soldadura',
      name: 'Soldadura',
      description: 'Trabajo con procesos de soldadura.',
      roleIds: [
        'trabajador',
        'supervisor'
      ],
      ppeRequirements: [
        {
          ppeId: 'careta_soldar',
          reason: 'Evaluar la protección ocular y facial específica para el proceso.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'guantes',
          reason: 'Evaluar los guantes apropiados para soldadura.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'ropa_proteccion',
          reason: 'Evaluar la protección frente a calor, chispas y proyecciones.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'botas',
          reason: 'Evaluar los riesgos para los pies.',
          validationStatus: 'pendiente_validacion_SST'
        },
        {
          ppeId: 'respirador',
          reason: 'Evaluar la exposición a humos y contaminantes.',
          validationStatus: 'pendiente_validacion_SST'
        }
      ]
    }
  },

  // -------------------------------------------------------
  // 5. CATÁLOGO DE ZONAS
  //
  // activityIds determina las actividades disponibles
  // después de elegir una zona.
  // -------------------------------------------------------

  zones: {
    obra_general: {
      id: 'obra_general',
      name: 'Obra general',
      description: 'Zonas comunes de circulación y trabajo.',
      activityIds: [
        'transito_obra',
        'trabajo_operativo'
      ]
    },

    descarga_materiales: {
      id: 'descarga_materiales',
      name: 'Descarga de materiales',
      description: 'Recepción y movimiento de materiales.',
      activityIds: [
        'recepcion_materiales',
        'carga_descarga'
      ]
    },

    almacen: {
      id: 'almacen',
      name: 'Almacén',
      description: 'Almacenamiento y distribución de materiales.',
      activityIds: [
        'almacenamiento',
        'movimiento_materiales'
      ]
    },

    trabajo_altura: {
      id: 'trabajo_altura',
      name: 'Trabajo en altura',
      description: 'Acceso y ejecución de labores en altura.',
      activityIds: [
        'acceso_altura',
        'trabajo_altura'
      ]
    },

    corte_esmerilado: {
      id: 'corte_esmerilado',
      name: 'Área de corte o esmerilado',
      description: 'Zona de uso de herramientas de corte.',
      activityIds: [
        'corte_esmerilado'
      ]
    },

    soldadura: {
      id: 'soldadura',
      name: 'Área de soldadura',
      description: 'Zona destinada a trabajos de soldadura.',
      activityIds: [
        'soldadura'
      ]
    }
  },

  // -------------------------------------------------------
  // 6. PERFILES ORIGINALES
  //
  // Se conservan los cuatro perfiles existentes y sus
  // propiedades para mantener compatibilidad con rules.js.
  // -------------------------------------------------------

  profiles: {
    general: {
      title: 'Obra general',
      description: 'Perfil inicial para evaluación visual.',
      items: [
        'Casco',
        'Chaleco',
        'Botas'
      ],
      note: 'Confirmar con el análisis de riesgos y las reglas de la obra.'
    },

    altura: {
      title: 'Trabajo en altura',
      description: 'Perfil orientativo para tareas en altura.',
      items: [
        'Casco',
        'Chaleco',
        'Botas',
        'Protección contra caídas'
      ],
      note: 'El arnés y sistema anticaídas no se pueden validar de forma fiable con cualquier cámara.'
    },

    corte: {
      title: 'Corte o esmerilado',
      description: 'Perfil orientativo para trabajos con proyección de partículas.',
      items: [
        'Casco',
        'Lentes o careta adecuados',
        'Guantes apropiados',
        'Botas'
      ],
      note: 'El tipo de protección depende de la tarea, herramienta y evaluación de riesgos.'
    },

    soldadura: {
      title: 'Soldadura',
      description: 'Perfil orientativo para tareas de soldadura.',
      items: [
        'Careta de soldar',
        'Guantes de soldador',
        'Ropa de protección',
        'Botas'
      ],
      note: 'La detección visual no confirma el nivel de protección ni la condición del equipo.'
    }
  },

  // -------------------------------------------------------
  // 7. ESTADO DE LA CONFIGURACIÓN
  // -------------------------------------------------------

  evaluation: {
    mode: 'configuracion_orientativa',
    requirementsValidated: false,
    detectorIntegrated: false,
    simulatedDetections: false,
    requiresHumanReview: true,

    disclaimer:
      'Los requisitos de EPP son propuestas iniciales pendientes de validación. ' +
      'La configuración no constituye una evaluación normativa ni una detección visual. ' +
      'Los resultados futuros deberán distinguir entre detectado, no detectado ' +
      'y no verificable, con revisión humana.'
  }
};
