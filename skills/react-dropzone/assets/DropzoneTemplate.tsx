'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
import { CheckCircle2, AlertCircle } from 'lucide-react';

import { DropzoneProps } from './types';
import { DEFAULT_MAX_SIZE, DEFAULT_ACCEPT } from './constants';
import FileItem from './FileItem';
import DropzonePlaceholder from './DropzonePlaceholder';
import UploadActionBar from './UploadActionBar';

const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  onUpload,
  maxSize = DEFAULT_MAX_SIZE,
  isUploading = false,
  multiple = false,
  accept = DEFAULT_ACCEPT,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onFilesSelected?.(files);
  }, [files, onFilesSelected]);

  const isDisabled = isUploading;

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[], _event: DropEvent) => {
      if (isDisabled) return;

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const errorCode = rejection.errors[0]?.code;

        if (errorCode === 'file-too-large') {
          setError(`El archivo es demasiado grande. El máximo es ${maxSize / (1024 * 1024)}MB.`);
        } else if (errorCode === 'file-invalid-type') {
          setError('Tipo de archivo no permitido.');
        } else if (errorCode === 'too-many-files') {
          setError(`Solo se permite ${multiple ? 'múltiples archivos' : 'un archivo'} a la vez.`);
        } else {
          setError('Error al cargar el archivo.');
        }
        return;
      }

      setError(null);
      if (multiple) {
        setFiles((prev) => [...prev, ...acceptedFiles]);
      } else {
        setFiles([acceptedFiles[0]]);
      }
    },
    [maxSize, isDisabled, multiple],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    disabled: isDisabled,
    accept,
    multiple,
  });

  const removeFile = (index: number) => {
    if (isDisabled) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUploadClick = () => {
    if (files.length > 0 && onUpload && !isDisabled) {
      onUpload(files);
    }
  };

  return (
    <div className='space-y-6'>
      <div
        {...getRootProps()}
        className={`shadow-primary-400/10 relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 shadow-inner transition-all duration-300 ${
          isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${
          isDragActive && !isDisabled
            ? 'border-primary-500 bg-primary-50/60'
            : 'hover:bg-primary-100/60 hover:border-primary-400 bg-primary-100/30 border-primary-200'
        } ${error ? 'border-red-300 bg-red-50/50' : ''} ${
          files.length > 0 ? 'border-green-300 bg-green-50/50' : ''
        }`}
      >
        <input {...getInputProps()} />

        {files.length === 0 ? (
          <DropzonePlaceholder isDisabled={isDisabled} />
        ) : (
          <div className='flex w-full max-w-2xl flex-col items-center'>
            <div className='mb-6 flex size-16 items-center justify-center rounded-full bg-green-200/60 text-green-600'>
              <CheckCircle2 size={32} />
            </div>

            <div className='custom-scrollbar max-h-[300px] w-full space-y-3 overflow-y-auto p-3'>
              {files.map((file, index) => (
                <FileItem
                  key={`${file.name}-${index}`}
                  file={file}
                  index={index}
                  isDisabled={isDisabled}
                  onRemove={removeFile}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className='animate-in fade-in slide-in-from-top-2 mt-4 flex items-center gap-2 text-red-500'>
            <AlertCircle size={18} />
            <p className='text-sm font-medium'>{error}</p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <UploadActionBar
          filesCount={files.length}
          isUploading={isUploading}
          isDisabled={isDisabled}
          onUpload={handleUploadClick}
        />
      )}
    </div>
  );
};

export default Dropzone;
