import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui/glass-card";
import { ChevronDown, Send, Star, Heart, Bookmark } from "lucide-react";

export default function UIShowcase() {
  const [selectValue, setSelectValue] = useState("");
  const { toast } = useToast();

  const showToast = (variant: "default" | "destructive" = "default") => {
    toast({
      title: variant === "default" ? "Notificación exitosa" : "Error encontrado",
      description: variant === "default" 
        ? "Los cambios se han guardado correctamente." 
        : "Hubo un problema al procesar tu solicitud.",
      variant,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SafraReport UI Components
          </h1>
          <p className="text-lg text-gray-600">
            Componentes modernizados con diseño Liquid Glass
          </p>
        </div>

        {/* Buttons Section */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Botones</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Botón Principal</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="glass">Glass Effect</Button>
            <Button variant="destructive">Destructivo</Button>
            <Button size="sm">Pequeño</Button>
            <Button size="lg">Grande</Button>
            <Button variant="glass">
              <Send className="mr-2 h-4 w-4" />
              Con Icono
            </Button>
          </div>
        </GlassCard>

        {/* Dropdowns Section */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dropdowns</h2>
          <div className="flex flex-wrap gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glass">
                  Menu Dropdown
                  <ChevronDown className="ml-2 h-4 w-4 dropdown-trigger-icon" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-dropdown">
                <DropdownMenuItem className="glass-dropdown-item">
                  <Star className="mr-3 h-4 w-4" />
                  Favoritos
                </DropdownMenuItem>
                <DropdownMenuItem className="glass-dropdown-item">
                  <Heart className="mr-3 h-4 w-4" />
                  Me gusta
                </DropdownMenuItem>
                <DropdownMenuItem className="glass-dropdown-item">
                  <Bookmark className="mr-3 h-4 w-4" />
                  Guardados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Primera Opción</SelectItem>
                <SelectItem value="option2">Segunda Opción</SelectItem>
                <SelectItem value="option3">Tercera Opción</SelectItem>
                <SelectItem value="option4">Cuarta Opción</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Forms Section */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Formularios</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input de texto
              </label>
              <Input placeholder="Escribe algo aquí..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área de texto
              </label>
              <Textarea 
                placeholder="Escribe un mensaje más largo aquí..." 
                rows={4}
              />
            </div>
          </div>
        </GlassCard>

        {/* Toast Section */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Notificaciones Toast</h2>
          <div className="flex gap-4">
            <Button onClick={() => showToast("default")} variant="glass">
              Mostrar Toast Exitoso
            </Button>
            <Button onClick={() => showToast("destructive")} variant="destructive">
              Mostrar Toast de Error
            </Button>
          </div>
        </GlassCard>

        {/* Glass Cards Section */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Glass Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2">Card Básica</h3>
              <p className="text-gray-600 text-sm">
                Esta es una tarjeta con efecto glass básico.
              </p>
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2">Card Hover</h3>
              <p className="text-gray-600 text-sm">
                Esta tarjeta tiene efectos hover mejorados.
              </p>
            </GlassCard>
            <GlassCard className="p-6 border-primary/30">
              <h3 className="font-semibold mb-2">Card Acentuada</h3>
              <p className="text-gray-600 text-sm">
                Esta tarjeta tiene un borde con color de acento.
              </p>
            </GlassCard>
          </div>
        </GlassCard>

        {/* Interactive Demo */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Demo Interactivo</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Formulario de contacto</h3>
                <div className="space-y-4">
                  <Input placeholder="Nombre completo" />
                  <Input type="email" placeholder="Correo electrónico" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Asunto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Consulta General</SelectItem>
                      <SelectItem value="support">Soporte Técnico</SelectItem>
                      <SelectItem value="feedback">Retroalimentación</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Tu mensaje..." rows={4} />
                  <Button className="w-full" variant="glass">
                    Enviar Mensaje
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold mb-3">Estadísticas</h3>
                <GlassCard className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Visitas totales</span>
                    <span className="text-2xl font-bold text-primary">12,543</span>
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Artículos publicados</span>
                    <span className="text-2xl font-bold text-primary">847</span>
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Usuarios activos</span>
                    <span className="text-2xl font-bold text-primary">3,291</span>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}