import { useState } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Calendar,
  Activity,
  Filter,
  Download,
  Search,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: number | null;
  details: string | null;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
}

const actionIcons: Record<string, any> = {
  create: CheckCircle,
  update: Edit,
  delete: Trash2,
  view: Eye,
  login: Shield,
  logout: Shield,
  approve: CheckCircle,
  reject: XCircle,
  export: Download,
};

export default function AdminAudit() {
  const api = useApiClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [dateRange, setDateRange] = useState("today");

  // Fetch audit logs
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/audit-logs", searchTerm, selectedAction, selectedEntity, selectedUser, dateRange],
    queryFn: () => {
      const params = new URLSearchParams({
        search: searchTerm,
        action: selectedAction,
        entity: selectedEntity,
        user: selectedUser,
        dateRange: dateRange,
      });
      return api.get(`/admin/audit-logs?${params.toString()}`);
    },
  });

  // Export logs function
  const handleExport = async () => {
    const params = new URLSearchParams({
      search: searchTerm,
      action: selectedAction,
      entity: selectedEntity,
      user: selectedUser,
      format: "csv",
    });
    
    try {
      const response = await api.raw(`/api/admin/audit-logs/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Failed to export audit log", error);
    }
  };

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  const getActionColor = (action: string, success: boolean) => {
    if (!success) return "text-red-600";
    
    switch (action) {
      case "delete":
        return "text-red-600";
      case "create":
      case "approve":
        return "text-green-600";
      case "update":
      case "edit":
        return "text-blue-600";
      case "reject":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getEntityBadgeVariant = (entity: string): any => {
    switch (entity) {
      case "article":
        return "default";
      case "classified":
        return "secondary";
      case "review":
        return "outline";
      case "user":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Registro de Auditoría</h1>
            <p className="text-gray-600 mt-2">
              Historial completo de acciones administrativas y actividad del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Acciones Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs?.stats?.today || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Últimas 24 horas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Usuarios Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs?.stats?.activeUsers || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usuarios únicos hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Errores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {logs?.stats?.errors || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Acciones fallidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Más Activo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium truncate">
                {logs?.stats?.mostActiveUser || "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usuario con más acciones
              </p>
            </CardContent>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar en detalles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Acción</label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="create">Crear</SelectItem>
                    <SelectItem value="update">Actualizar</SelectItem>
                    <SelectItem value="delete">Eliminar</SelectItem>
                    <SelectItem value="approve">Aprobar</SelectItem>
                    <SelectItem value="reject">Rechazar</SelectItem>
                    <SelectItem value="login">Iniciar Sesión</SelectItem>
                    <SelectItem value="logout">Cerrar Sesión</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Entidad</label>
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="article">Artículos</SelectItem>
                    <SelectItem value="classified">Clasificados</SelectItem>
                    <SelectItem value="review">Reseñas</SelectItem>
                    <SelectItem value="user">Usuarios</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Usuario</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {logs?.users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="week">Última Semana</SelectItem>
                    <SelectItem value="month">Último Mes</SelectItem>
                    <SelectItem value="all">Todo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">Cargando registros...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.data?.map((log: AuditLog) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {format(new Date(log.timestamp), "dd MMM HH:mm:ss", {
                            locale: es,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{log.userName}</div>
                            <div className="text-xs text-gray-500">{log.userRole}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-2 ${getActionColor(log.action, log.success)}`}>
                          {getActionIcon(log.action)}
                          <span className="capitalize">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEntityBadgeVariant(log.entity)}>
                          {log.entity}
                          {log.entityId && ` #${log.entityId}`}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm">
                          {log.details || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs?.data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No se encontraron registros
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}