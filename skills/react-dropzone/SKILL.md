---
name: react-dropzone
description: >
  Drag-and-drop file uploads with react-dropzone v14.
  Trigger: When implementing file upload components, drag-and-drop zones, or handling file selections.
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
  scope: [ui]
  auto_invoke: "Implementing file upload components with react-dropzone"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Component Structure

```
src/components/DragAndDrop/
├── index.tsx              # Main component
├── types.ts               # Props interfaces
├── constants.ts           # Allowed formats, max size
├── FileItem.tsx           # Individual file display
├── DropzonePlaceholder.tsx # Empty state UI
└── UploadActionBar.tsx    # Upload button bar
```

## Core Implementation

```tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';

interface DropzoneProps {
  onFilesSelected?: (files: File[]) => void;
  onUpload?: (files: File[]) => void;
  maxSize?: number;
  isUploading?: boolean;
  multiple?: boolean;
  accept?: Record<string, string[]>;
}

const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  onUpload,
  maxSize = 50 * 1024 * 1024,
  isUploading = false,
  multiple = false,
  accept = { 'application/zip': ['.zip'] },
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onFilesSelected?.(files);
  }, [files, onFilesSelected]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[], _event: DropEvent) => {
      if (isUploading) return;

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`El archivo es demasiado grande. El máximo es ${maxSize / (1024 * 1024)}MB.`);
        } else {
          setError('Tipo de archivo no permitido o error al cargar.');
        }
        return;
      }

      setError(null);
      setFiles(multiple ? (prev) => [...prev, ...acceptedFiles] : [acceptedFiles[0]]);
    },
    [maxSize, isUploading, multiple],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    disabled: isUploading,
    accept,
    multiple,
  });

  const removeFile = (index: number) => {
    if (isUploading) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUpload = () => {
    if (files.length > 0 && onUpload && !isUploading) {
      onUpload(files);
    }
  };

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {/* Render UI based on files.length and isDragActive */}
    </div>
  );
};
```

## State Management

| State | Type | Purpose |
|-------|------|---------|
| `files` | `File[]` | Selected files ready for upload |
| `error` | `string \| null` | Validation error message |
| `isUploading` | `boolean` | External loading state (from hook) |

## Error Handling

```tsx
const onDrop = useCallback(
  (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errorCode = rejection.errors[0]?.code;
      
      const errorMessages: Record<string, string> = {
        'file-too-large': `Tamaño máximo: ${maxSize / (1024 * 1024)}MB`,
        'file-invalid-type': 'Tipo de archivo no permitido',
        'too-many-files': 'Demasiados archivos seleccionados',
      };
      
      setError(errorMessages[errorCode] || 'Error al cargar el archivo');
      return;
    }
    
    setError(null);
    // Handle accepted files...
  },
  [maxSize],
);
```

## Props Interface

```tsx
interface DragAndDropProps {
  onFilesSelected?: (files: File[]) => void;
  onUpload?: (files: File[]) => void;
  maxSize?: number;
  isUploading?: boolean;
}
```

## Single vs Multiple Files

| Mode | `multiple` prop | `setFiles` logic |
|------|-----------------|------------------|
| Single file | `false` | `setFiles([acceptedFiles[0]])` |
| Multiple files | `true` | `setFiles((prev) => [...prev, ...acceptedFiles])` |

## Styling States

```tsx
className={`
  relative flex flex-col items-center justify-center
  rounded-2xl border-2 border-dashed p-12
  transition-all duration-300
  
  ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
  
  ${isDragActive && !isDisabled 
    ? 'border-primary-500 bg-primary-50/60' 
    : 'hover:bg-primary-100/60 hover:border-primary-400 bg-primary-100/30 border-primary-200'}
    
  ${error ? 'border-red-300 bg-red-50/50' : ''}
  ${files.length > 0 ? 'border-green-300 bg-green-50/50' : ''}
`}
```

## File Upload Hook Pattern

```tsx
export const useFileUpload = ({ isAdmin = true }: UseFileUploadProps = {}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const toastId = toast.loading('Subiendo documento...');

    try {
      await uploadFiles(files);
      toast.success('Archivo subido con éxito', { id: toastId });
      setSelectedFiles([]);
      setUploadCount((prev) => prev + 1);
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return { selectedFiles, isUploading, uploadCount, handleFilesSelected, handleUpload };
};
```

## Critical Rules

1. **Always use `useCallback`** for `onDrop` handler with proper dependencies
2. **Sync files to parent** via `useEffect` when files change
3. **Check `isUploading`** before any state modifications
4. **Clear error** when new valid files are dropped
5. **Use `e.stopPropagation()`** on remove button to prevent dropzone trigger
6. **Disable interactions** when `isUploading` is true

## Key Dependencies

```json
{
  "react-dropzone": "14.3.8"
}
```
