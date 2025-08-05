import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Eye, Trash2, CheckCircle, XCircle, MapPin, Phone, Calendar, Clock, Package, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { format } from "date-fns";
import { es } from "date-fns/locale";

const CLASSIFIED_CATEGORIES = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'vehiculos', label: 'Vehículos' },
  { value: 'inmuebles', label: 'Inmuebles' },
  { value: 'empleos', label: 'Empleos' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'hogar', label: 'Hogar y Jardín' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'moda', label: 'Moda y Belleza' },
  { value: 'otros', label: 'Otros' }
];

const CLASSIFIED_STATUS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'expired', label: 'Expirados' },
  { value: 'rejected', label: 'Rechazados' }
];

export default function AdminClassifieds() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const api = useApiClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedClassified, setSelectedClassified] = useState<any>(null);



  // Fetch classifieds
  const { data: classifieds, isLoading } = useQuery({
    queryKey: ['/api/admin/classifieds', selectedCategory, selectedStatus, searchTerm],
    queryFn: () =>
      api.get(`/admin/classifieds?category=${selectedCategory}&status=${selectedStatus}&search=${searchTerm}`),
  });

  // Approve classified mutation
  const approveMutation = useMutation({
        mutationFn: (id: number) => api.post(`/admin/classifieds/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/classifieds'] });
      toast({
        title: "Clasificado aprobado",
        description: "El anuncio ha sido aprobado exitosamente.",
      });
      setSelectedClassified(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo aprobar el clasificado.",
        variant: "destructive",
      });
    }
  });

  // Reject classified mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.post(`/admin/classifieds/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/classifieds'] });
      toast({
        title: "Clasificado rechazado",
        description: "El anuncio ha sido rechazado.",
      });
      setSelectedClassified(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo rechazar el clasificado.",
        variant: "destructive",
      });
    }
  });

  // Delete classified mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/classifieds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/classifieds'] });
      toast({
        title: "Clasificado eliminado",
        description: "El anuncio ha sido eliminado permanentemente.",
      });
      setSelectedClassified(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el clasificado.",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expirado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = CLASSIFIED_CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clasificados</h1>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar clasificados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFIED_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFIED_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>{classifieds?.length || 0} clasificados</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classifieds List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clasificados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : classifieds && classifieds.length > 0 ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {classifieds.map((classified: any) => (
                    <div
                      key={classified.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedClassified(classified)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{classified.title}</h3>
                            {getStatusBadge(classified.status)}
                            <Badge variant="outline">{getCategoryLabel(classified.category)}</Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {classified.description}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(classified.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {classified.location || 'Sin ubicación'}
                            </span>
                            <span className="font-semibold text-green-600">
                              RD$ {classified.price?.toLocaleString() || 'Precio a convenir'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClassified(classified);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron clasificados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classified Detail Dialog */}
        <Dialog open={!!selectedClassified} onOpenChange={() => setSelectedClassified(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Clasificado</DialogTitle>
            </DialogHeader>
            
            {selectedClassified && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedClassified.status)}
                  <Badge variant="outline">{getCategoryLabel(selectedClassified.category)}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-1">{selectedClassified.title}</h3>
                  <p className="text-gray-600">{selectedClassified.description}</p>
                </div>
                
                {selectedClassified.images && selectedClassified.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedClassified.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Precio</p>
                    <p className="font-semibold">
                      RD$ {selectedClassified.price?.toLocaleString() || 'Precio a convenir'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Ubicación</p>
                    <p className="font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedClassified.location || 'Sin ubicación'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Contacto</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedClassified.contactPhone || 'No disponible'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">WhatsApp</p>
                    <p className="font-semibold">
                      {selectedClassified.whatsappNumber || 'No disponible'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Publicado</p>
                    <p className="font-semibold">
                      {format(new Date(selectedClassified.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Expira</p>
                    <p className="font-semibold">
                      {selectedClassified.expiresAt ? 
                        format(new Date(selectedClassified.expiresAt), "dd 'de' MMMM, yyyy", { locale: es }) : 
                        'No especificado'}
                    </p>
                  </div>
                </div>
                
                {selectedClassified.userId && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">
                      Publicado por usuario ID: {selectedClassified.userId}
                    </p>
                  </div>
                )}
                
                <DialogFooter className="flex gap-2">
                  {selectedClassified.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => approveMutation.mutate(selectedClassified.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => {
                          const reason = prompt('Razón del rechazo:');
                          if (reason) {
                            rejectMutation.mutate({ id: selectedClassified.id, reason });
                          }
                        }}
                        disabled={rejectMutation.isPending}
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que quieres eliminar este clasificado?')) {
                        deleteMutation.mutate(selectedClassified.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}