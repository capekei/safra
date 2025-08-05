import React, { useState, useRef } from 'react';
import { uploadImage, uploadDocument, handleStorageError, StorageResult } from '../../../shared/supabase-storage';

interface UploadButtonProps {
  onUpload: (result: StorageResult<{ path: string; fullPath: string; publicUrl: string }>) => void;
  accept?: string;
  maxSize?: number; // in MB
  bucket?: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  multiple?: boolean;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  onUpload,
  accept = "image/*",
  maxSize = 5,
  bucket = "images",
  className = "",
  children,
  disabled = false,
  multiple = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError("");
    setUploading(true);

    try {
      const file = files[0];
      
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`El archivo es demasiado grande. Máximo ${maxSize}MB permitido.`);
        setUploading(false);
        return;
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `uploads/${timestamp}_${sanitizedName}`;

      // Upload based on file type
      let result: StorageResult<{ path: string; fullPath: string; publicUrl: string }>;
      
      if (file.type.startsWith('image/')) {
        result = await uploadImage(file, filePath, bucket);
      } else {
        result = await uploadDocument(file, filePath, bucket);
      }

      if (result.error) {
        setError(handleStorageError(result.error));
      } else {
        onUpload(result);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error al subir archivo. Intente nuevamente.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const defaultClassName = `
    w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg
    transition-all duration-200 ease-in-out transform hover:scale-105
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
    flex items-center justify-center gap-2
    ${uploading ? 'cursor-wait' : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || uploading}
        className={defaultClassName}
        aria-label={uploading ? "Subiendo archivo..." : "Subir archivo"}
      >
        {uploading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="hidden sm:inline">Subiendo...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {children || <span className="hidden sm:inline">Subir Archivo</span>}
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm z-10">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized upload components
export const ImageUploadButton: React.FC<Omit<UploadButtonProps, 'accept' | 'bucket'>> = (props) => (
  <UploadButton
    {...props}
    accept="image/*"
    bucket="images"
  />
);

export const DocumentUploadButton: React.FC<Omit<UploadButtonProps, 'accept' | 'bucket'>> = (props) => (
  <UploadButton
    {...props}
    accept=".pdf,.doc,.docx,.txt"
    bucket="documents"
  />
);

// Drag and drop upload area
interface UploadAreaProps extends UploadButtonProps {
  height?: string;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  onUpload,
  accept = "image/*",
  maxSize = 5,
  bucket = "images",
  className = "",
  height = "h-32",
  disabled = false,
  multiple = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setError("");
    setUploading(true);

    try {
      const file = files[0];
      
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`El archivo es demasiado grande. Máximo ${maxSize}MB permitido.`);
        setUploading(false);
        return;
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `uploads/${timestamp}_${sanitizedName}`;

      // Upload based on file type
      let result: StorageResult<{ path: string; fullPath: string; publicUrl: string }>;
      
      if (file.type.startsWith('image/')) {
        result = await uploadImage(file, filePath, bucket);
      } else {
        result = await uploadDocument(file, filePath, bucket);
      }

      if (result.error) {
        setError(handleStorageError(result.error));
      } else {
        onUpload(result);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error al subir archivo. Intente nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled || uploading) return;
    
    const files = event.dataTransfer.files;
    handleFiles(files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !uploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const areaClassName = `
    ${height} w-full border-2 border-dashed rounded-lg
    flex flex-col items-center justify-center gap-2 p-4
    transition-all duration-200 ease-in-out
    ${isDragOver 
      ? 'border-green-500 bg-green-50' 
      : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
    }
    ${disabled || uploading 
      ? 'opacity-50 cursor-not-allowed' 
      : 'cursor-pointer'
    }
    ${className}
  `.trim();

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={areaClassName}
      >
        {uploading ? (
          <>
            <svg className="animate-spin h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-gray-600">Subiendo archivo...</p>
          </>
        ) : (
          <>
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 text-center">
              <span className="font-medium text-green-600">Haga clic para subir</span>
              <span className="hidden sm:inline"> o arrastre y suelte</span>
            </p>
            <p className="text-xs text-gray-500">
              Máximo {maxSize}MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm z-10">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
