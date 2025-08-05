import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Database,
  PlayCircle,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Code,
  Table,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApiClient } from "@/lib/api";

interface TableInfo {
  tableName: string;
  rowCount: number;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
  }>;
}

export default function AdminDatabase() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const { toast } = useToast();
  const api = useApiClient();

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fetchDatabaseInfo = async () => {
    try {
      const data = await api.get("/admin/database/info");
      setTables(data.tables);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la base de datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una consulta SQL",
        variant: "destructive",
      });
      return;
    }

    setQueryLoading(true);
    try {
      const result = await api.post("/admin/database/query", { query: sqlQuery });
      setQueryResult(result);
      
      toast({
        title: "Éxito",
        description: "Consulta ejecutada correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error ejecutando la consulta",
        variant: "destructive",
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const runMigrations = async () => {
    try {
      await api.post("/admin/database/migrate", {});

      toast({
        title: "Éxito",
        description: "Migraciones ejecutadas correctamente",
      });

      setShowMigrationDialog(false);
      fetchDatabaseInfo();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron ejecutar las migraciones",
        variant: "destructive",
      });
    }
  };

  const exportDatabase = async () => {
    try {
      const response = await api.raw("/admin/database/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `safra_report_backup_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast({
        title: "Éxito",
        description: "La exportación de la base de datos ha comenzado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar la base de datos",
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
            <h1 className="text-3xl font-bold text-gray-900">Base de Datos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona y monitorea la base de datos PostgreSQL
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowMigrationDialog(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Migraciones
            </Button>
            <Button
              variant="glass"
              className="gap-2"
              onClick={() => setShowBackupDialog(true)}
            >
              <Database className="h-4 w-4" />
              Backup
            </Button>
          </div>
        </div>

        {/* Database Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tablas</p>
                <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
              </div>
              <Table className="h-8 w-8 text-blue-600" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Registros Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tables.reduce((sum, table) => sum + table.rowCount, 0).toLocaleString()}
                </p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-sm font-medium text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="h-4 w-4" />
                  Conectado
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-green-600" />
            </div>
          </GlassCard>
        </div>

        {/* SQL Query Editor */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Editor SQL
          </h2>
          
          <div className="space-y-4">
            <Textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="SELECT * FROM articles LIMIT 10;"
              className="font-mono text-sm"
              rows={6}
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Solo consultas SELECT están permitidas para seguridad
              </p>
              <Button
                variant="glass"
                onClick={executeQuery}
                disabled={queryLoading}
                className="gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                {queryLoading ? "Ejecutando..." : "Ejecutar"}
              </Button>
            </div>

            {queryResult && (
              <div className="mt-4 overflow-x-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Resultados ({queryResult.rowCount} filas)
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {queryResult.fields?.map((field: any) => (
                          <th key={field.name} className="px-4 py-2 text-left font-medium">
                            {field.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows?.slice(0, 10).map((row: any, idx: number) => (
                        <tr key={idx} className="border-t">
                          {Object.values(row).map((value: any, cellIdx: number) => (
                            <td key={cellIdx} className="px-4 py-2">
                              {value?.toString() || "NULL"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {queryResult.rows?.length > 10 && (
                    <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
                      Mostrando solo las primeras 10 filas
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Tables Schema */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Esquema de Tablas</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando información...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tables.map((table) => (
                <div key={table.tableName} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">{table.tableName}</h3>
                    <span className="text-sm text-gray-600">
                      {table.rowCount.toLocaleString()} registros
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {table.columns.slice(0, 6).map((col) => (
                        <div key={col.name} className="flex items-center gap-1">
                          <span className="font-mono">{col.name}</span>
                          <span className="text-xs text-gray-400">({col.type})</span>
                        </div>
                      ))}
                    </div>
                    {table.columns.length > 6 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{table.columns.length - 6} columnas más
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Migration Dialog */}
        <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ejecutar Migraciones</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de ejecutar las migraciones pendientes? Esto actualizará
                el esquema de la base de datos.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowMigrationDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={runMigrations}>
                Ejecutar Migraciones
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Backup Dialog */}
        <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestión de Backups</DialogTitle>
              <DialogDescription>
                Exporta o importa datos de la base de datos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <Button
                variant="glass"
                className="w-full gap-2"
                onClick={() => {
                  exportDatabase();
                  setShowBackupDialog(false);
                }}
              >
                <Download className="h-4 w-4" />
                Exportar Base de Datos (JSON)
              </Button>
              
              <Button
                variant="outline"
                className="w-full gap-2"
                disabled
              >
                <Upload className="h-4 w-4" />
                Importar Base de Datos (Próximamente)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}