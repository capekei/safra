import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X, Star, Building, Search } from "lucide-react";
import { useDropzone } from "react-dropzone";

const postReviewSchema = z.object({
  businessName: z.string().min(2, "Ingresa el nombre del negocio"),
  businessId: z.string().optional(),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  rating: z.string().min(1, "Selecciona una calificación"),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  content: z.string().min(20, "La reseña debe tener al menos 20 caracteres"),
  priceRange: z.string().optional(),
  wouldRecommend: z.boolean().default(true),
});

type PostReviewForm = z.infer<typeof postReviewSchema>;

export default function PostReview() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "No autorizado",
        description: "Iniciando sesión...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch business categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/business-categories'],
  });

  const form = useForm<PostReviewForm>({
    resolver: zodResolver(postReviewSchema),
    defaultValues: {
      wouldRecommend: true,
    },
  });

  // Business search
  const searchBusinesses = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/businesses/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Image upload handling
  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 3)); // Max 3 images
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 3,
  });

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: PostReviewForm) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, String(value));
        }
      });

      // Add business ID if selected
      if (selectedBusiness) {
        formData.append('businessId', String(selectedBusiness.id));
      }

      // Add images
      images.forEach((img) => {
        formData.append(`images`, img.file);
      });

      const response = await fetch('/api/user/reviews', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al publicar');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Reseña publicada!",
        description: "Tu reseña ha sido enviada para revisión",
      });
      setTimeout(() => {
        window.location.href = '/cuenta/panel';
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostReviewForm) => {
    submitMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-32 pb-20 px-4">
          <GlassCard className="p-8 max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Escribir Reseña - SafraReport" 
        description="Comparte tu experiencia sobre negocios locales en SafraReport"
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Escribir Reseña</h1>
            <p className="text-gray-600">Comparte tu experiencia para ayudar a otros usuarios</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Business Information */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Información del Negocio</h2>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Negocio</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input 
                              placeholder="Ej: Restaurante El Mesón" 
                              className="pl-10"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                searchBusinesses(e.target.value);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Escribe el nombre del negocio para buscarlo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Search Results */}
                  {(isSearching || searchResults.length > 0) && (
                    <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                      {isSearching ? (
                        <p className="text-sm text-gray-500 p-2">Buscando...</p>
                      ) : (
                        <>
                          {searchResults.map((business) => (
                            <button
                              key={business.id}
                              type="button"
                              onClick={() => {
                                setSelectedBusiness(business);
                                form.setValue('businessName', business.name);
                                form.setValue('categoryId', String(business.categoryId));
                                setSearchResults([]);
                              }}
                              className="w-full text-left p-2 hover:bg-gray-100 rounded flex justify-between items-center"
                            >
                              <div>
                                <p className="font-medium">{business.name}</p>
                                <p className="text-sm text-gray-500">{business.address}</p>
                              </div>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Verificado
                              </span>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setSearchResults([]);
                              setSelectedBusiness(null);
                            }}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm text-gray-600"
                          >
                            <Search className="w-4 h-4 inline mr-1" />
                            Usar nombre ingresado (negocio nuevo)
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría del Negocio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat: any) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </GlassCard>

              {/* Rating */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Tu Calificación</h2>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calificación General</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(String(star))}
                                className="p-2 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    Number(field.value) >= star
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Toca las estrellas para calificar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rango de Precios (opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un rango" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">$ - Económico</SelectItem>
                            <SelectItem value="2">$$ - Moderado</SelectItem>
                            <SelectItem value="3">$$$ - Costoso</SelectItem>
                            <SelectItem value="4">$$$$ - Muy Costoso</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </GlassCard>

              {/* Review Content */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Tu Reseña</h2>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título de la Reseña</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Excelente servicio y comida deliciosa" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tu Experiencia</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cuéntanos sobre tu experiencia en este lugar..."
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Sé específico y honesto. Las reseñas detalladas ayudan más
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wouldRecommend"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Recomendarías este lugar?</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "true")} 
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Sí, lo recomiendo</SelectItem>
                            <SelectItem value="false">No, no lo recomiendo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </GlassCard>

              {/* Images */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Fotos (opcional)</h2>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">
                    {isDragActive 
                      ? "Suelta las imágenes aquí" 
                      : "Arrastra fotos aquí o haz clic para seleccionar"}
                  </p>
                  <p className="text-sm text-gray-500">Máximo 3 imágenes</p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Publicando..." : "Publicar Reseña"}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}