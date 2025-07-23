import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, User } from "lucide-react";

interface Author {
  id: number;
  name: string;
  email: string;
  bio?: string;
  createdAt: string;
  articleCount?: number;
}

export default function AdminAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null);
  const [reassignToAuthor, setReassignToAuthor] = useState<string>("");
  const [availableAuthors, setAvailableAuthors] = useState<Author[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchAuthors();
  }, [search]);

  const fetchAuthors = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/authors?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching authors");
      }

      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los autores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (author: Author) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      // First check if author has articles
      const checkResponse = await fetch(`/api/admin/authors/${author.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!checkResponse.ok) {
        const error = await checkResponse.json();
        
        // If author has articles, show dialog to reassign
        if (error.availableAuthors && error.articleCount > 0) {
          setDeletingAuthor(author);
          setAvailableAuthors(error.availableAuthors);
          setShowReassignDialog(true);
          return;
        } else {
          throw new Error(error.message || "Error deleting author");
        }
      } else {
        toast({
          title: "Éxito",
          description: "Autor eliminado correctamente",
        });
        fetchAuthors();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el autor",
        variant: "destructive",
      });
    }
  };

  const handleReassignAndDelete = async () => {
    if (!reassignToAuthor || !deletingAuthor) return;

    try {
      const token = localStorage.getItem("adminToken");
      const deleteResponse = await fetch(`/api/admin/authors/${deletingAuthor.id}?reassignTo=${reassignToAuthor}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!deleteResponse.ok) {
        const deleteError = await deleteResponse.json();
        throw new Error(deleteError.message || "Error deleting author");
      }
      
      toast({
        title: "Éxito",
        description: `Autor eliminado y artículos reasignados correctamente`,
      });
      
      setShowReassignDialog(false);
      setDeletingAuthor(null);
      setReassignToAuthor("");
      fetchAuthors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el autor",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      email: author.email,
      bio: author.bio || "",
    });
    setShowEditDialog(true);
  };

  const handleNewAuthor = () => {
    setEditingAuthor(null);
    setFormData({
      name: "",
      email: "",
      bio: "",
    });
    setShowEditDialog(true);
  };

  const handleSaveAuthor = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingAuthor 
        ? `/api/admin/authors/${editingAuthor.id}`
        : "/api/admin/authors";
      
      const response = await fetch(url, {
        method: editingAuthor ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error saving author");
      }

      toast({
        title: "Éxito",
        description: editingAuthor 
          ? "Autor actualizado correctamente" 
          : "Autor creado correctamente",
      });

      setShowEditDialog(false);
      setEditingAuthor(null);
      fetchAuthors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el autor",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Autores</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los autores de artículos
            </p>
          </div>
          <Button variant="glass" className="gap-2" onClick={handleNewAuthor}>
            <Plus className="h-4 w-4" />
            Nuevo Autor
          </Button>
        </div>

        {/* Search */}
        <GlassCard className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </GlassCard>

        {/* Authors Table */}
        <GlassCard className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando autores...</p>
            </div>
          ) : authors.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron autores</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Biografía</TableHead>
                    <TableHead>Artículos</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authors.map((author) => (
                    <TableRow key={author.id}>
                      <TableCell>
                        <div className="font-medium">{author.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">{author.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {author.bio || "Sin biografía"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{author.articleCount || 0}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(author.createdAt).toLocaleDateString("es-DO")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(author)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Editar autor"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(author)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar autor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </GlassCard>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-xl">
            <DialogHeader className="pb-4 border-b border-gray-100/50">
              <DialogTitle className="text-xl font-bold">
                {editingAuthor ? "Editar Autor" : "Nuevo Autor"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingAuthor 
                  ? "Modifica los detalles del autor" 
                  : "Crea un nuevo autor para los artículos"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nombre *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo del autor"
                  className="bg-white/80 border-gray-200/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="bg-white/80 border-gray-200/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Biografía</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Breve biografía del autor (opcional)"
                  rows={4}
                  className="bg-white/80 border-gray-200/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center gap-3 pt-4 mt-4 border-t border-gray-200/50">
                <p className="text-sm text-gray-500">* Campos requeridos</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingAuthor(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="glass" 
                    onClick={handleSaveAuthor}
                    disabled={!formData.name || !formData.email}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                  >
                    {editingAuthor ? "Actualizar" : "Crear Autor"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reassignment Dialog */}
        <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
          <DialogContent className="max-w-md bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-xl">
            <DialogHeader className="pb-4 border-b border-gray-100/50">
              <DialogTitle className="text-xl font-bold">
                Reasignar Artículos
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {deletingAuthor && `El autor "${deletingAuthor.name}" tiene artículos que deben ser reasignados antes de eliminarlo.`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Selecciona el autor al que se reasignarán los artículos:
                </label>
                <Select
                  value={reassignToAuthor}
                  onValueChange={setReassignToAuthor}
                >
                  <SelectTrigger className="bg-white/80 border-gray-200/50">
                    <SelectValue placeholder="Selecciona un autor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAuthors.map((author) => (
                      <SelectItem key={author.id} value={author.id.toString()}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReassignDialog(false);
                    setDeletingAuthor(null);
                    setReassignToAuthor("");
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="glass" 
                  onClick={handleReassignAndDelete}
                  disabled={!reassignToAuthor}
                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
                >
                  Reasignar y Eliminar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}