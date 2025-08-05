import React, { useState, useRef } from 'react';

interface UploadResult {
  success: boolean;
  data?: { path: string; fullPath: string; publicUrl: string };
  error?: string;
}

interface UploadButtonProps {
  onUpload: (result: UploadResult) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  multiple?: boolean;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  onUpload,
  accept = 'image/*',
  maxSize = 5,
  className = '',
  children,
  disabled = false,
  multiple = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onUpload({
        success: false,
        error: `File size exceeds ${maxSize}MB limit`
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      onUpload({
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl: data.publicUrl
        }
      });

    } catch (error) {
      onUpload({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={`${className} ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isUploading ? 'Uploading...' : (children || 'Upload File')}
      </button>
    </>
  );
};