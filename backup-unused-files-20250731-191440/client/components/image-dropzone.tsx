import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageDropzoneProps {
  images: File[];
  setImages: (images: File[]) => void;
  existingImages: { id: number; url: string }[];
  onRemoveExisting: (id: number) => void;
  maxImages?: number;
}

export function ImageDropzone({ 
  images, 
  setImages, 
  existingImages, 
  onRemoveExisting,
  maxImages = 5 
}: ImageDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxImages - images.length - existingImages.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    setImages([...images, ...filesToAdd]);
  }, [images, existingImages, maxImages, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: maxImages - images.length - existingImages.length,
  });

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const totalImages = images.length + existingImages.length;

  return (
    <div className="space-y-4">
      {totalImages < maxImages && (
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
              ? 'Suelta las imágenes aquí'
              : 'Arrastra imágenes o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Máximo {maxImages} imágenes. {totalImages}/{maxImages} utilizadas.
          </p>
        </div>
      )}

      {(existingImages.length > 0 || images.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {existingImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.url}
                alt=""
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveExisting(img.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}