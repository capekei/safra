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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X, Phone, Mail, MessageCircle, MapPin, DollarSign } from "lucide-react";
import { useDropzone } from "react-dropzone";

// Category interface
interface ClassifiedCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

// Province interface  
interface Province {
  id: number;
  name: string;
  code: string;
}

const postClassifiedSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  price: z.string().optional(),
  currency: z.enum(["DOP", "USD"]).default("DOP"),
  contactName: z.string().min(2, "Ingresa tu nombre"),
  contactPhone: z.string().min(10, "Ingresa un número válido"),
  contactWhatsapp: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  provinceId: z.string().min(1, "Selecciona una provincia"),
  municipality: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, "Debes aceptar los términos"),
});

type PostClassifiedForm = z.infer<typeof postClassifiedSchema>;

export default function PostClassified() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

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

  // Fetch categories
  const { data: categories = [] } = useQuery<ClassifiedCategory[]>({
    queryKey: ['/api/classified-categories'],
  });

  // Fetch provinces
  const { data: provinces = [] } = useQuery<Province[]>({
    queryKey: ['/api/provinces'],
  });

  const form = useForm<PostClassifiedForm>({
    resolver: zodResolver(postClassifiedSchema),
    defaultValues: {
      currency: "DOP",
      contactName: user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : "",
      contactEmail: user?.email || "",
    },
  });

  // Image upload handling
  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 5,
  });

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: PostClassifiedForm) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, String(value));
        }
      });

      // Add images
      images.forEach((img, index) => {
        formData.append(`images`, img.file);
      });

      const response = await fetch('/api/user/classifieds', {
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
        title: "¡Clasificado publicado!",
        description: "Tu anuncio ha sido enviado para revisión",
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

  const onSubmit = (data: PostClassifiedForm) => {
    if (images.length === 0) {
      toast({
        title: "Agrega al menos una imagen",
        description: "Los clasificados con imágenes reciben más visitas",
        variant: "destructive",
      });
      return;
    }
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
        title="Publicar Clasificado - SafraReport" 
        description="Publica tu anuncio clasificado gratis en SafraReport"
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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicar Clasificado</h1>
            <p className="text-gray-600">Complete el formulario para publicar su anuncio</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Información del Anuncio</h2>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Anuncio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Toyota Corolla 2020 en excelentes condiciones" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat: ClassifiedCategory) => (
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe tu artículo en detalle..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Incluye detalles importantes como condición, características, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio (opcional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  className="pl-10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moneda</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DOP">DOP</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </GlassCard>

              {/* Images */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Imágenes</h2>
                
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
                      : "Arrastra imágenes aquí o haz clic para seleccionar"}
                  </p>
                  <p className="text-sm text-gray-500">Máximo 5 imágenes (JPG, PNG, WebP)</p>
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

              {/* Contact Information */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input 
                              type="tel" 
                              placeholder="809-555-1234" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactWhatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp (opcional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input 
                              type="tel" 
                              placeholder="809-555-1234" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Los compradores prefieren contactar por WhatsApp
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (opcional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input 
                              type="email" 
                              placeholder="tu@email.com" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </GlassCard>

              {/* Location */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="provinceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una provincia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces.map((prov: Province) => (
                              <SelectItem key={prov.id} value={String(prov.id)}>
                                {prov.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="municipality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Municipio/Sector (opcional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input 
                              placeholder="Ej: Piantini, Los Prados" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </GlassCard>

              {/* Terms */}
              <GlassCard className="p-6">
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Acepto los términos y condiciones de publicación
                        </FormLabel>
                        <FormDescription>
                          Al publicar, confirmas que tu anuncio cumple con nuestras políticas
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </GlassCard>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Publicando..." : "Publicar Clasificado"}
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