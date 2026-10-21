/**
 * Contrato del futuro detector. En esta etapa no hay modelo cargado y no se
 * generan detecciones ficticias. La etapa 2 implementará un adaptador real.
 */
export class EppDetector {
  async initialize() {
    throw new Error('El detector de IA todavía no está integrado. Esta función se habilitará en la etapa 2.');
  }

  async analyzeImage(_imageElement) {
    throw new Error('Análisis de imagen no disponible hasta integrar y validar el modelo de IA.');
  }

  async analyzeVideoFrame(_videoElement) {
    throw new Error('Análisis de fotogramas no disponible hasta integrar y validar el modelo de IA.');
  }
}
