import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Video, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoDropzoneProps {
  videos: File[];
  setVideos: (videos: File[]) => void;
  existingVideos: { id: number; url: string }[];
  onRemoveExisting: (id: number) => void;
  maxVideos?: number;
  maxSizeMB?: number;
}

export function VideoDropzone({ 
  videos, 
  setVideos, 
  existingVideos, 
  onRemoveExisting,
  maxVideos = 3,
  maxSizeMB = 50 
}: VideoDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxVideos - videos.length - existingVideos.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    setVideos([...videos, ...filesToAdd]);
  }, [videos, existingVideos, maxVideos, setVideos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    maxFiles: maxVideos - videos.length - existingVideos.length,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalVideos = videos.length + existingVideos.length;

  return (
    <div className="space-y-4">
      {totalVideos < maxVideos && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Suelta los videos aquí'
              : 'Arrastra videos o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Máximo {maxVideos} videos, {maxSizeMB}MB cada uno. {totalVideos}/{maxVideos} utilizados.
          </p>
        </div>
      )}

      {(existingVideos.length > 0 || videos.length > 0) && (
        <div className="space-y-2">
          {existingVideos.map((video) => (
            <div key={video.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">Video existente</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                onClick={() => onRemoveExisting(video.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {videos.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                onClick={() => removeVideo(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}