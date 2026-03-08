export const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

export const DEFAULT_ACCEPT = {
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/vnd.rar': ['.rar'],
};

export const ACCEPTED_FORMATS_TEXT = 'ZIP, RAR';

export const ERROR_MESSAGES: Record<string, string> = {
  'file-too-large': 'El archivo es demasiado grande.',
  'file-invalid-type': 'Tipo de archivo no permitido.',
  'too-many-files': 'Demasiados archivos seleccionados.',
};
