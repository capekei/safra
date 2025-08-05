import { useState } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Activity,
  Calendar,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "banned" | "pending";
  createdAt: string;
  lastLogin: string | null;
  balance: number;
  stats?: {
    articles: number;
    classifieds: number;
    reviews: number;
  };
}

interface CreateUserFormData {
  username: string;
  email: string;
  password?: string;
  role: User["role"];
}

interface ApiError {
  message: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const api = useApiClient();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<User["role"]>("user");
  const [selectedStatus, setSelectedStatus] = useState<User["status"]>("active");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);

  const [formData, setFormData] = useState<CreateUserFormData>({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  // Fetch users
  const { data: users, isLoading, error: usersError } = useQuery<User[], ApiError>({
    queryKey: ["admin-users", { role: selectedRole, status: selectedStatus, search: searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRole !== "user") params.append("role", selectedRole);
      if (selectedStatus !== "active") params.append("status", selectedStatus);
      if (searchTerm) params.append("search", searchTerm);
      return api.get(`/admin/users?${params.toString()}`);
    },
  });

  // Create user mutation
  const createMutation = useMutation<User, ApiError, CreateUserFormData>({
    mutationFn: (data: CreateUserFormData) => api.post("/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Usuario Creado",
        description: "El nuevo usuario ha sido creado exitosamente.",
        variant: "default",
      });
      setShowCreateDialog(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "user",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al Crear Usuario",
        description: error?.message || "Ocurrió un error inesperado. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateMutation = useMutation<User, ApiError, Partial<CreateUserFormData>>({
    mutationFn: (data: Partial<CreateUserFormData>) => api.put(`/admin/users/${selectedUser?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Usuario Actualizado",
        description: "Los datos del usuario han sido actualizados.",
        variant: "default",
      });
      setShowEditDialog(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error al Actualizar",
        description: error?.message || "No se pudo actualizar el usuario. Verifique los datos e intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation<void, ApiError, string>({
    mutationFn: (userId: string) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Usuario Eliminado",
        description: "El usuario ha sido eliminado permanentemente.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al Eliminar",
        description: error?.message || "No se pudo eliminar el usuario. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeVariant = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "moderator":
        return "Moderador";
      default:
        return "Usuario";
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-2">
              Administra usuarios, roles y permisos
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rol</label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as "user" | "admin" | "moderator")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuarios</SelectItem>
                    <SelectItem value="moderator">Moderadores</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as "active" | "banned" | "pending")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="banned">Baneados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">Cargando usuarios...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell">ID</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Balance</TableHead>
                    <TableHead className="hidden lg:table-cell">Creado</TableHead>
                    <TableHead className="hidden xl:table-cell">Último Login</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="hidden md:table-cell">{user.id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          {user.username}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(user.balance || 0)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {format(new Date(user.createdAt), "PPpp", { locale: es })}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {user.lastLogin
                          ? format(new Date(user.lastLogin), "PPpp", { locale: es })
                          : "Nunca"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser(user);
                              setFormData({
                                username: user.username,
                                email: user.email,
                                password: "",
                                role: user.role,
                              });
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (
                                confirm(
                                  "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
                                )
                              ) {
                                deleteMutation.mutate(user.id);
                              }
                            }}
                            disabled={user.role === "admin"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completa los datos para crear un nuevo usuario.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre de usuario</Label>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="juanperez"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="juan@example.com"
                />
              </div>
              <div>
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label>Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as User["role"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={
                  !formData.username ||
                  !formData.email ||
                  !formData.password ||
                  createMutation.isPending
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {createMutation.isPending ? "Creando..." : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Actualiza los datos del usuario. Deja la contraseña en blanco para
                mantener la actual.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre de usuario</Label>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Nueva contraseña (opcional)</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Dejar en blanco para mantener"
                />
              </div>
              <div>
                <Label>Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as User["role"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedUser(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (selectedUser) {
                    const { password, ...rest } = formData;
                    const updateData: Partial<CreateUserFormData> = { ...rest };
                    if (password) {
                      updateData.password = password;
                    }
                    updateMutation.mutate(updateData);
                  }
                }}
                disabled={!formData.username || !formData.email || updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}