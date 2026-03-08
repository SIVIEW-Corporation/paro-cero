export interface DropzoneProps {
  onFilesSelected?: (files: File[]) => void;
  onUpload?: (files: File[]) => void;
  maxSize?: number;
  isUploading?: boolean;
  multiple?: boolean;
  accept?: Record<string, string[]>;
}

export interface FileItemProps {
  file: File;
  index: number;
  isDisabled: boolean;
  onRemove: (index: number) => void;
}

export interface UploadActionBarProps {
  filesCount: number;
  isUploading: boolean;
  isDisabled: boolean;
  onUpload: () => void;
}

export interface DropzonePlaceholderProps {
  isDisabled: boolean;
}
