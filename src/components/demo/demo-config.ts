export const DEMO_MEDIA_CONFIG = {
  previewImageSrc: '/images/hero/paro-cero-hero.jpg',
  previewDurationLabel: '02:40',
  previewTitle: 'Vista previa de flujo operativo PM0',
  previewDescription:
    'Un recorrido corto por la trazabilidad de OT, indicadores de backlog y decisiones de priorizacion por criticidad.',
  fullVideoUrl: '',
  fullVideoTitle: 'Demo ejecutiva PM0 - recorrido completo',
} as const;

// Reemplaza DEMO_MEDIA_CONFIG.fullVideoUrl con la URL real del video
// (por ejemplo un embed de Vimeo/YouTube) para mostrar el contenido final.
export const hasRealDemoVideo = DEMO_MEDIA_CONFIG.fullVideoUrl.length > 0;
