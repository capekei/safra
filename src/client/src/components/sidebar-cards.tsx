import { useState, useEffect } from "react";
import { Fuel, Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

// Type definitions
interface ExchangeRates {
  usd: { rate: number; trend: 'up' | 'down' };
  eur: { rate: number; trend: 'up' | 'down' };
}

interface FuelPrices {
  gasolina95: number;
  gasolinaRegular: number;
  gasoil: number;
  glp: number;
  lastUpdated?: string;
}

interface WeatherData {
  condition: {
    icon: string;
    text: string;
    code: number;
    description: string;
  };
  location: {
    name: string;
    region: string;
  };
  temp: {
    c: number;
    f: number;
  };
  humidity: number;
  wind: {
    kph: number;
    dir: string;
  };
  uv: number;
  lastUpdated: string;
}

// Modern Minimalist SafraReport Card Component
function ModernCard({ 
  children, 
  className = "", 
  headerColor = "bg-gray-50",
  title,
  icon,
  status = "active"
}: { 
  children: React.ReactNode; 
  className?: string;
  headerColor?: string;
  title?: string;
  icon?: React.ReactNode;
  status?: "active" | "loading" | "error";
}) {
  const statusColors = {
    active: "bg-emerald-500",
    loading: "bg-amber-400", 
    error: "bg-red-400"
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-0 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* Modern header with color accent */}
      {title && (
        <div className={`${headerColor} px-5 py-4 border-b border-gray-100/50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/60 backdrop-blur-sm">
                  {icon}
                </div>
              )}
              <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            </div>
            <div className={`w-2 h-2 rounded-full ${statusColors[status]} shadow-sm`} />
          </div>
        </div>
      )}
      
      {/* Content area */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

// Enhanced SafraReport Fuel & Currency Card
function FuelPricesCard() {
  // Fetch fuel prices with auto-refresh every 5 minutes
  const { data: fuelData, isLoading: fuelLoading, error: fuelError } = useQuery<FuelPrices>({
    queryKey: ['/api/fuel-prices'],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch exchange rates with auto-refresh every 5 minutes
  const { data: exchangeData, isLoading: exchangeLoading, error: exchangeError } = useQuery<ExchangeRates>({
    queryKey: ['/api/exchange-rates'],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors with Spanish messages
  useEffect(() => {
    if (fuelError) {
      console.error('Error cargando precios de combustible:', fuelError);
    }
    if (exchangeError) {
      console.error('Error cargando tasas de cambio:', exchangeError);
    }
  }, [fuelError, exchangeError]);

  const prices: FuelPrices = fuelData || {
    gasolina95: 293.60,
    gasolinaRegular: 274.50,
    gasoil: 221.60,
    glp: 147.60
  };

  const exchangeRates: ExchangeRates = exchangeData || {
    usd: { rate: 60.45, trend: 'up' },
    eur: { rate: 63.28, trend: 'down' }
  };

  return (
    <ModernCard
      title="Precios y Divisas"
      icon={<Fuel className="h-4 w-4 text-orange-600" />}
      headerColor="bg-gradient-to-r from-orange-50 to-amber-50"
      status={fuelLoading || exchangeLoading ? 'loading' : 'active'}
    >
      {/* Fuel Prices - Modern grid layout */}
      <div className="space-y-3 mb-5">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Combustibles</div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(prices).filter(([key]) => key !== 'lastUpdated').map(([fuel, price]) => (
            <div key={fuel} className="bg-gray-50/50 rounded-xl p-3 hover:bg-gray-50 transition-colors">
              <div className="text-xs text-gray-500 mb-1">
                {fuel === 'gasolina95' ? 'Premium' : 
                 fuel === 'gasolinaRegular' ? 'Regular' :
                 fuel === 'gasoil' ? 'Gasoil' : 'GLP'}
              </div>
              <div className="font-bold text-gray-900 text-sm">
                {fuelLoading ? (
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                ) : (
                  `RD$ ${typeof price === 'number' ? price.toFixed(2) : '0.00'}`
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400 font-medium">DIVISAS</span>
        </div>
      </div>

      {/* Exchange Rates - Modern card design */}
      <div className="space-y-3">
        {[
          { code: 'USD', name: 'Dólar', data: exchangeRates.usd, color: 'text-blue-600', bg: 'bg-blue-50' },
          { code: 'EUR', name: 'Euro', data: exchangeRates.eur, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map(({ code, name, data, color, bg }) => (
          <div key={code} className={`${bg} rounded-xl p-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${bg.replace('50', '100')} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${color}`}>{code[0]}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">
                {exchangeLoading ? (
                  <div className="w-16 h-4 bg-white/60 rounded animate-pulse" />
                ) : (
                  `RD$ ${data.rate.toFixed(2)}`
                )}
              </span>
              {!exchangeLoading && (
                <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                  data.trend === 'up' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-red-100 text-red-600'
                } text-xs font-bold`}>
                  {data.trend === 'up' ? '↗' : '↘'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Modern status footer */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>
            {fuelData?.lastUpdated 
              ? `Actualizado ${new Date(fuelData.lastUpdated).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}`
              : 'Datos actualizados'}
          </span>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </ModernCard>
  );
}

// Enhanced SafraReport Weather Card
function WeatherCard() {
  // Fetch weather data with auto-refresh every 10 minutes
  const { data: weatherData, isLoading, error } = useQuery<WeatherData>({
    queryKey: ['/api/weather'],
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  // Handle errors with Spanish messages
  useEffect(() => {
    if (error) {
      console.error('Error cargando datos del clima:', error);
    }
  }, [error]);

  const weather: WeatherData = weatherData || {
    temp: { c: 28, f: 82 },
    condition: {
      icon: 'partly-cloudy',
      text: 'Parcialmente nublado', 
      code: 1003,
      description: 'Parcialmente nublado'
    },
    humidity: 75,
    wind: { kph: 15, dir: 'E' },
    location: { name: 'Santo Domingo', region: 'Distrito Nacional' },
    uv: 8,
    lastUpdated: new Date().toISOString()
  };

  const getWeatherIcon = () => {
    switch (weather.condition.icon) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'partly-cloudy': return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'snow': return <CloudSnow className="w-6 h-6 text-blue-300" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <ModernCard
      title="Clima Santo Domingo"
      icon={getWeatherIcon()}
      headerColor="bg-gradient-to-r from-sky-50 to-blue-50"
      status={isLoading ? 'loading' : 'active'}
    >
      {/* Modern temperature display */}
      <div className="text-center mb-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="w-20 h-12 bg-gray-200 rounded-2xl animate-pulse mx-auto" />
            <div className="w-32 h-5 bg-gray-200 rounded-full animate-pulse mx-auto" />
          </div>
        ) : (
          <>
            <div className="relative inline-block">
              <div className="text-5xl font-black text-gray-900 mb-2">
                {weather.temp.c}<span className="text-2xl text-gray-500">°</span>
              </div>
              <div className="absolute -top-1 -right-6 text-xs font-semibold text-gray-400">C</div>
            </div>
            <p className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block">
              {weather.condition.text || weather.condition.description}
            </p>
          </>
        )}
      </div>
      
      {/* Modern weather metrics grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { 
            label: 'Humedad', 
            value: `${weather.humidity}%`, 
            icon: <Droplets className="h-4 w-4 text-cyan-500" />,
            color: 'from-cyan-50 to-blue-50'
          },
          { 
            label: 'Viento', 
            value: `${weather.wind.kph} km/h`, 
            icon: <Wind className="h-4 w-4 text-slate-500" />,
            color: 'from-slate-50 to-gray-50'
          },
          { 
            label: 'UV', 
            value: weather.uv, 
            icon: <Sun className="h-4 w-4 text-yellow-500" />,
            color: 'from-yellow-50 to-orange-50'
          }
        ].map((item, index) => (
          <div key={index} className={`bg-gradient-to-br ${item.color} rounded-xl p-3 text-center`}>
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-white/70 rounded-lg flex items-center justify-center backdrop-blur-sm">
                {item.icon}
              </div>
            </div>
            <div className="text-xs font-medium text-gray-500 mb-1">{item.label}</div>
            <div className="text-sm font-bold text-gray-900">
              {isLoading ? (
                <div className="w-8 h-4 bg-white/50 rounded animate-pulse mx-auto" />
              ) : (
                item.value
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Wind direction - Modern indicator */}
      {!isLoading && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Dirección</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
              <span className="text-sm font-bold text-gray-900">{weather.wind.dir}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Modern status footer */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>
            {weatherData?.lastUpdated 
              ? `Actualizado ${new Date(weatherData.lastUpdated).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}`
              : 'Datos meteorológicos'}
          </span>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </ModernCard>
  );
}

// Modern Minimalist SafraReport Main Sidebar Component
export function MainSidebar() {
  return (
    <ErrorBoundary
      fallback={
        <div className="space-y-5">
          <ModernCard
            title="Error del Sistema"
            icon={<Cloud className="h-4 w-4 text-red-500" />}
            headerColor="bg-gradient-to-r from-red-50 to-pink-50"
            status="error"
          >
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-3">No se pudo cargar la información</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
              >
                Recargar Página
              </button>
            </div>
          </ModernCard>
        </div>
      }
      onError={(error) => console.error('Error en sidebar:', error)}
    >
      <div className="space-y-5">
        <ErrorBoundary
          fallback={
            <ModernCard
              title="Error de Datos"
              icon={<Fuel className="h-4 w-4 text-amber-500" />}
              headerColor="bg-gradient-to-r from-amber-50 to-yellow-50"
              status="error"
            >
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Error cargando precios</p>
              </div>
            </ModernCard>
          }
          onError={(error) => console.error('Error en precios:', error)}
        >
          <FuelPricesCard />
        </ErrorBoundary>
        
        <ErrorBoundary
          fallback={
            <ModernCard
              title="Error Meteorológico"
              icon={<Cloud className="h-4 w-4 text-blue-500" />}
              headerColor="bg-gradient-to-r from-blue-50 to-cyan-50"
              status="error"
            >
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Error cargando clima</p>
              </div>
            </ModernCard>
          }
          onError={(error) => console.error('Error en clima:', error)}
        >
          <WeatherCard />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}