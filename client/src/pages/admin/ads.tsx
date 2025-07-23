import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Target, Eye, MousePointer, DollarSign, Plus, Edit2, Trash2, BarChart3, Upload } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/ui/glass-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const adFormSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  advertiser: z.string().min(1, "El anunciante es requerido"),
  imageUrl: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  targetUrl: z.string().url("URL de destino inválida"),
  placementId: z.string().min(1, "La ubicación es requerida"),
  startDate: z.date(),
  endDate: z.date(),
  targetProvinces: z.array(z.number()).default([]),
  targetCategories: z.array(z.number()).default([]),
  maxImpressions: z.number().optional(),
  maxClicks: z.number().optional(),
  active: z.boolean().default(true),
});

type AdFormData = z.infer<typeof adFormSchema>;

export default function AdminAds() {
  const [selectedPlacements, setSelectedPlacements] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const { toast } = useToast();

  // Fetch ads
  const { data: adsData, isLoading: isLoadingAds } = useQuery({
    queryKey: ["/api/admin/ads", selectedPlacements, searchQuery, selectedStatus],
    queryFn: () =>
      apiRequest(`/api/admin/ads?placement=${selectedPlacements}&search=${searchQuery}&status=${selectedStatus}`),
  });

  // Fetch placements
  const { data: placements } = useQuery({
    queryKey: ["/api/admin/ads/placements"],
  });

  // Fetch provinces and categories for targeting
  const { data: provinces } = useQuery({
    queryKey: ["/api/admin/provinces"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/admin/categories"],
  });

  // Analytics stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/ads/stats"],
  });

  const form = useForm<AdFormData>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      title: "",
      advertiser: "",
      imageUrl: "",
      targetUrl: "",
      placementId: "",
      startDate: new Date(),
      endDate: new Date(),
      targetProvinces: [],
      targetCategories: [],
      active: true,
    },
  });

  // Create/Update ad mutation
  const createAdMutation = useMutation({
    mutationFn: async (data: AdFormData) => {
      const url = editingAd 
        ? `/api/admin/ads/${editingAd.id}`
        : "/api/admin/ads";
      
      return apiRequest(url, {
        method: editingAd ? "PATCH" : "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads/stats"] });
      toast({
        title: editingAd ? "Anuncio actualizado" : "Anuncio creado",
        description: `El anuncio ha sido ${editingAd ? "actualizado" : "creado"} exitosamente`,
      });
      setIsCreateDialogOpen(false);
      setEditingAd(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el anuncio",
        variant: "destructive",
      });
    },
  });

  // Delete ad mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/ads/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads/stats"] });
      toast({
        title: "Anuncio eliminado",
        description: "El anuncio ha sido eliminado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el anuncio",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    form.reset({
      title: ad.title,
      advertiser: ad.advertiser,
      imageUrl: ad.imageUrl || "",
      targetUrl: ad.targetUrl,
      placementId: ad.placementId.toString(),
      startDate: new Date(ad.startDate),
      endDate: new Date(ad.endDate),
      targetProvinces: ad.targetProvinces || [],
      targetCategories: ad.targetCategories || [],
      maxImpressions: ad.maxImpressions || undefined,
      maxClicks: ad.maxClicks || undefined,
      active: ad.active,
    });
    setIsCreateDialogOpen(true);
  };

  const onSubmit = (data: AdFormData) => {
    createAdMutation.mutate(data);
  };

  const getStatusBadge = (ad: any) => {
    const now = new Date();
    const startDate = new Date(ad.startDate);
    const endDate = new Date(ad.endDate);
    
    if (!ad.active) {
      return <Badge variant="outline">Inactivo</Badge>;
    }
    
    if (now < startDate) {
      return <Badge variant="secondary">Programado</Badge>;
    }
    
    if (now > endDate) {
      return <Badge variant="outline">Finalizado</Badge>;
    }
    
    if (ad.maxImpressions && ad.impressions >= ad.maxImpressions) {
      return <Badge variant="outline">Límite alcanzado</Badge>;
    }
    
    if (ad.maxClicks && ad.clicks >= ad.maxClicks) {
      return <Badge variant="outline">Límite alcanzado</Badge>;
    }
    
    return <Badge variant="default">Activo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Anuncios</h1>
          <p className="text-muted-foreground mt-1">
            Administra los anuncios publicitarios de SafraReport
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#00ff00] text-black hover:bg-[#00dd00]"
              onClick={() => {
                setEditingAd(null);
                form.reset();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Anuncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? "Editar Anuncio" : "Crear Nuevo Anuncio"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Anuncio</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Banner promocional..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="advertiser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anunciante</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre de la empresa..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de la Imagen</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://ejemplo.com/imagen.jpg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Destino</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://ejemplo.com/promocion" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="placementId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una ubicación" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {placements?.map((placement: any) => (
                            <SelectItem key={placement.id} value={placement.id.toString()}>
                              {placement.name} ({placement.width}x{placement.height})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Inicio</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona fecha</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Fin</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona fecha</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Segmentación por Provincia</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
                      {provinces?.map((province: any) => (
                        <div key={province.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={form.watch("targetProvinces").includes(province.id)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("targetProvinces");
                              if (checked) {
                                form.setValue("targetProvinces", [...current, province.id]);
                              } else {
                                form.setValue("targetProvinces", current.filter(id => id !== province.id));
                              }
                            }}
                          />
                          <label className="text-sm">{province.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Segmentación por Categoría</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
                      {categories?.map((category: any) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={form.watch("targetCategories").includes(category.id)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("targetCategories");
                              if (checked) {
                                form.setValue("targetCategories", [...current, category.id]);
                              } else {
                                form.setValue("targetCategories", current.filter(id => id !== category.id));
                              }
                            }}
                          />
                          <label className="text-sm">{category.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxImpressions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Límite de Impresiones (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Sin límite" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxClicks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Límite de Clics (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Sin límite" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Anuncio activo
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingAd(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#00ff00] text-black hover:bg-[#00dd00]"
                    disabled={createAdMutation.isPending}
                  >
                    {createAdMutation.isPending ? "Guardando..." : editingAd ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anuncios Activos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAds || 0}</div>
            <p className="text-xs text-muted-foreground">En este momento</p>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impresiones Hoy</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayImpressions?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">+{stats?.impressionGrowth || 0}% vs ayer</p>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics Hoy</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayClicks?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">CTR: {stats?.ctr || 0}%</p>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Est.</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RD${stats?.estimatedRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar anuncios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedPlacements} onValueChange={setSelectedPlacements}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todas las ubicaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                {placements?.map((placement: any) => (
                  <SelectItem key={placement.id} value={placement.id.toString()}>
                    {placement.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="scheduled">Programados</SelectItem>
                <SelectItem value="ended">Finalizados</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlassCard>

      {/* Ads List */}
      <div className="grid gap-4">
        {isLoadingAds ? (
          <div className="text-center py-8">Cargando anuncios...</div>
        ) : adsData?.ads?.length === 0 ? (
          <GlassCard>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron anuncios</p>
            </CardContent>
          </GlassCard>
        ) : (
          adsData?.ads?.map((ad: any) => (
            <GlassCard key={ad.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {ad.imageUrl && (
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        {getStatusBadge(ad)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Anunciante: {ad.advertiser} • Ubicación: {ad.placementName}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {ad.impressions.toLocaleString()} impresiones
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {ad.clicks.toLocaleString()} clics
                        </span>
                        <span className="text-muted-foreground">
                          CTR: {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(ad.startDate), "dd/MM/yyyy")} - {format(new Date(ad.endDate), "dd/MM/yyyy")}
                        </span>
                        {ad.targetProvinces?.length > 0 && (
                          <span>{ad.targetProvinces.length} provincias</span>
                        )}
                        {ad.targetCategories?.length > 0 && (
                          <span>{ad.targetCategories.length} categorías</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/ads/${ad.id}/analytics`}>
                      <Button variant="outline" size="icon">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(ad)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm("¿Estás seguro de eliminar este anuncio?")) {
                          deleteAdMutation.mutate(ad.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}