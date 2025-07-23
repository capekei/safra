import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ModerationItem {
  id: number;
  entityType: string;
  entityId: number;
  status: string;
  submittedBy: string;
  createdAt: string;
  entity: any;
}

export default function AdminModeration() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchModerationQueue();
  }, []);

  const fetchModerationQueue = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/moderation?status=pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching moderation queue");
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la cola de moderación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (itemId: number, status: "approved" | "rejected") => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/moderation/${itemId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes: moderationNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Error moderating content");
      }

      toast({
        title: "Éxito",
        description: status === "approved" 
          ? "Contenido aprobado correctamente" 
          : "Contenido rechazado",
      });

      setShowDetails(false);
      setSelectedItem(null);
      setModerationNotes("");
      fetchModerationQueue();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo moderar el contenido",
        variant: "destructive",
      });
    }
  };

  const renderEntityDetails = (item: ModerationItem) => {
    if (!item.entity) return null;

    if (item.entityType === "classified") {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{item.entity.title}</h3>
          <p className="text-gray-600">{item.entity.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Precio:</span> {item.entity.currency} {item.entity.price}
            </div>
            <div>
              <span className="font-medium">Contacto:</span> {item.entity.contactName}
            </div>
            <div>
              <span className="font-medium">Teléfono:</span> {item.entity.contactPhone}
            </div>
            <div>
              <span className="font-medium">WhatsApp:</span> {item.entity.contactWhatsapp || "N/A"}
            </div>
          </div>
        </div>
      );
    }

    if (item.entityType === "review") {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{item.entity.title || "Sin título"}</h3>
          <div className="flex items-center gap-2">
            <span className="font-medium">Calificación:</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < item.entity.rating ? "text-yellow-500" : "text-gray-300"}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-gray-600">{item.entity.content}</p>
          <div className="text-sm text-gray-500">
            <p>Por: {item.entity.reviewerName}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cola de Moderación</h1>
          <p className="text-gray-600 mt-1">
            Revisa y modera el contenido enviado por usuarios
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-yellow-600" />
            </div>
          </GlassCard>
        </div>

        {/* Moderation Queue */}
        <GlassCard className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando elementos...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay elementos pendientes de moderación</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contenido</TableHead>
                    <TableHead>Enviado por</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.entityType === "classified" 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-purple-100 text-purple-600"
                        }`}>
                          {item.entityType === "classified" ? "Clasificado" : "Reseña"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">
                            {item.entity?.title || item.entity?.content?.substring(0, 50) + "..."}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {item.submittedBy || "Anónimo"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(new Date(item.createdAt), "dd MMM yyyy", { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            onClick={() => handleModeration(item.id, "approved")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleModeration(item.id, "rejected")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </GlassCard>

        {/* Detail Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Contenido</DialogTitle>
              <DialogDescription>
                Revisa el contenido antes de aprobarlo o rechazarlo
              </DialogDescription>
            </DialogHeader>
            
            {selectedItem && (
              <div className="space-y-4">
                {renderEntityDetails(selectedItem)}
                
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas de moderación (opcional)
                  </label>
                  <Textarea
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                    placeholder="Agrega notas sobre tu decisión..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleModeration(selectedItem.id, "rejected")}
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="glass"
                    onClick={() => handleModeration(selectedItem.id, "approved")}
                  >
                    Aprobar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}