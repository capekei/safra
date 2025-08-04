import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface ProvinceMapProps {
  selectedProvince?: number;
  onProvinceSelect?: (provinceId: number) => void;
  showStats?: boolean;
  provinceStats?: Record<number, number>;
}

// Dominican Republic provinces with approximate SVG path positions
const provinceData = [
  { id: 1, name: "Azua", code: "AZ", cx: 200, cy: 220 },
  { id: 2, name: "Bahoruco", code: "BH", cx: 130, cy: 240 },
  { id: 3, name: "Barahona", code: "BR", cx: 150, cy: 260 },
  { id: 4, name: "Dajabón", code: "DJ", cx: 180, cy: 120 },
  { id: 5, name: "Distrito Nacional", code: "DN", cx: 320, cy: 210 },
  { id: 6, name: "Duarte", code: "DU", cx: 340, cy: 140 },
  { id: 7, name: "Elías Piña", code: "EP", cx: 120, cy: 180 },
  { id: 8, name: "El Seibo", code: "ES", cx: 420, cy: 200 },
  { id: 9, name: "Espaillat", code: "ET", cx: 300, cy: 120 },
  { id: 10, name: "Hato Mayor", code: "HM", cx: 400, cy: 220 },
  { id: 11, name: "Hermanas Mirabal", code: "HMB", cx: 320, cy: 140 },
  { id: 12, name: "Independencia", code: "IN", cx: 100, cy: 220 },
  { id: 13, name: "La Altagracia", code: "LA", cx: 460, cy: 200 },
  { id: 14, name: "La Romana", code: "LR", cx: 440, cy: 240 },
  { id: 15, name: "La Vega", code: "LV", cx: 280, cy: 160 },
  { id: 16, name: "María Trinidad Sánchez", code: "MTS", cx: 360, cy: 120 },
  { id: 17, name: "Monseñor Nouel", code: "MN", cx: 260, cy: 180 },
  { id: 18, name: "Monte Cristi", code: "MC", cx: 140, cy: 100 },
  { id: 19, name: "Monte Plata", code: "MP", cx: 340, cy: 180 },
  { id: 20, name: "Pedernales", code: "PD", cx: 80, cy: 260 },
  { id: 21, name: "Peravia", code: "PV", cx: 240, cy: 220 },
  { id: 22, name: "Puerto Plata", code: "PP", cx: 240, cy: 100 },
  { id: 23, name: "Samaná", code: "SM", cx: 380, cy: 140 },
  { id: 24, name: "Sánchez Ramírez", code: "SR", cx: 300, cy: 180 },
  { id: 25, name: "San Cristóbal", code: "SC", cx: 280, cy: 220 },
  { id: 26, name: "San José de Ocoa", code: "SJO", cx: 220, cy: 200 },
  { id: 27, name: "San Juan", code: "SJ", cx: 160, cy: 180 },
  { id: 28, name: "San Pedro de Macorís", code: "SPM", cx: 380, cy: 240 },
  { id: 29, name: "Santiago", code: "ST", cx: 260, cy: 140 },
  { id: 30, name: "Santiago Rodríguez", code: "STR", cx: 200, cy: 120 },
  { id: 31, name: "Santo Domingo", code: "SD", cx: 340, cy: 220 },
  { id: 32, name: "Valverde", code: "VV", cx: 220, cy: 120 },
];

export function ProvinceMap({ 
  selectedProvince, 
  onProvinceSelect, 
  showStats = false,
  provinceStats = {} 
}: ProvinceMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<number | null>(null);

  const getProvinceColor = (provinceId: number) => {
    if (selectedProvince === provinceId) return "#00ff00";
    if (hoveredProvince === provinceId) return "#00dd00";
    if (showStats && provinceStats[provinceId]) {
      const maxValue = Math.max(...Object.values(provinceStats));
      const intensity = provinceStats[provinceId] / maxValue;
      return `rgba(0, 255, 0, ${0.2 + intensity * 0.6})`;
    }
    return "#e5e7eb";
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Mapa de República Dominicana</h3>
      <div className="relative w-full aspect-[2/1]">
        <svg 
          viewBox="0 0 500 300" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified Dominican Republic outline */}
          <path
            d="M 50 150 Q 100 100, 200 100 T 400 100 Q 480 120, 480 180 Q 480 240, 400 260 Q 300 280, 200 260 Q 100 240, 50 200 Z"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          
          {/* Province circles */}
          {provinceData.map((province) => (
            <g key={province.id}>
              <circle
                cx={province.cx}
                cy={province.cy}
                r="15"
                fill={getProvinceColor(province.id)}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredProvince(province.id)}
                onMouseLeave={() => setHoveredProvince(null)}
                onClick={() => onProvinceSelect?.(province.id)}
              />
              <text
                x={province.cx}
                y={province.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium pointer-events-none"
                fill="#374151"
              >
                {province.code}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Tooltip */}
        {hoveredProvince && (
          <div className="absolute bg-black/80 text-white px-2 py-1 rounded text-sm pointer-events-none"
               style={{
                 left: provinceData.find(p => p.id === hoveredProvince)!.cx,
                 top: provinceData.find(p => p.id === hoveredProvince)!.cy - 30,
                 transform: 'translateX(-50%)'
               }}>
            {provinceData.find(p => p.id === hoveredProvince)!.name}
            {showStats && provinceStats[hoveredProvince] && (
              <div className="text-xs text-gray-300">
                {provinceStats[hoveredProvince]} elementos
              </div>
            )}
          </div>
        )}
      </div>
      
      {showStats && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
            <span>Baja actividad</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Alta actividad</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}