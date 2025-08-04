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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X, Bell, Mail, Smartphone } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

// Category interface
interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  createdAt: string;
}

// User Preferences interface
interface UserPreferences {
  id: number;
  userId: string;
  categories: string[];
  keywords: string[];
  notifications: {
    breaking: boolean;
    daily: boolean;
    weekly: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const preferencesSchema = z.object({
  categories: z.array(z.string()).min(1, "Selecciona al menos una categoría"),
  keywords: z.array(z.string()).default([]),
  notifications: z.object({
    breaking: z.boolean(),
    daily: z.boolean(),
    weekly: z.boolean(),
  }),
});

type PreferencesForm = z.infer<typeof preferencesSchema>;

export default function NewsPreferences() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [newKeyword, setNewKeyword] = useState("");

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
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<UserPreferences>({
    queryKey: ['/api/user/preferences'],
    enabled: isAuthenticated,
  });

  const form = useForm<PreferencesForm>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      categories: [],
      keywords: [],
      notifications: {
        breaking: true,
        daily: false,
        weekly: false,
      },
    },
  });

  // Update form when preferences are loaded
  useEffect(() => {
    if (preferences) {
      form.reset({
        categories: preferences.categories || [],
        keywords: preferences.keywords || [],
        notifications: preferences.notifications || {
          breaking: true,
          daily: false,
          weekly: false,
        },
      });
    }
  }, [preferences, form]);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: PreferencesForm) => {
      return apiRequest("PUT", "/api/user/preferences", data);
    },
    onSuccess: () => {
      toast({
        title: "¡Preferencias guardadas!",
        description: "Tu feed de noticias ha sido personalizado",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PreferencesForm) => {
    submitMutation.mutate(data);
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const currentKeywords = form.getValues('keywords');
      if (!currentKeywords.includes(newKeyword.trim())) {
        form.setValue('keywords', [...currentKeywords, newKeyword.trim()]);
      }
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues('keywords');
    form.setValue('keywords', currentKeywords.filter(k => k !== keyword));
  };

  if (authLoading || preferencesLoading) {
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
        title="Preferencias de Noticias - SafraReport" 
        description="Personaliza tu feed de noticias según tus intereses"
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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Preferencias de Noticias</h1>
            <p className="text-gray-600">Personaliza tu feed según tus intereses</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Categories */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Categorías de Interés</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona las categorías que te interesan para recibir noticias personalizadas
                </p>
                
                <FormField
                  control={form.control}
                  name="categories"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-4">
                        {categories.map((category: any) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="categories"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={category.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category.slug)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, category.slug])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== category.slug
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {category.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </GlassCard>

              {/* Keywords */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Palabras Clave</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Añade palabras clave para recibir noticias sobre temas específicos
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Ej: economía, deportes, tecnología"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addKeyword}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="px-3 py-1 cursor-pointer hover:bg-red-100"
                            onClick={() => removeKeyword(keyword)}
                          >
                            {keyword}
                            <X className="w-3 h-3 ml-2" />
                          </Badge>
                        ))}
                      </div>
                      {field.value.length === 0 && (
                        <p className="text-sm text-gray-500">
                          No has añadido palabras clave
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </GlassCard>

              {/* Notifications */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Notificaciones</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Configura cómo quieres recibir las noticias
                </p>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notifications.breaking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Bell className="w-4 h-4 text-red-600" />
                            Noticias de Última Hora
                          </FormLabel>
                          <FormDescription>
                            Recibe notificaciones inmediatas de eventos importantes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notifications.daily"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            Resumen Diario
                          </FormLabel>
                          <FormDescription>
                            Recibe un resumen diario con las noticias más importantes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notifications.weekly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-green-600" />
                            Resumen Semanal
                          </FormLabel>
                          <FormDescription>
                            Recibe un resumen semanal con lo más destacado
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </GlassCard>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Guardando..." : "Guardar Preferencias"}
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