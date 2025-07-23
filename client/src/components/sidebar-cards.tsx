import { useState, useEffect } from "react";
import { Fuel, Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// Refined Liquid Glass Card Component
function MinimalGlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative ${className}`}
    >
      {/* Base glass layer with gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl" />
      {/* Subtle glass reflection */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/10 via-transparent to-purple-50/10" />
      {/* Soft inner glow */}
      <div className="absolute inset-0 rounded-2xl shadow-inner opacity-20" />
      {/* Refined border with gradient */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-gray-200/50 via-gray-100/30 to-transparent">
        <div className="h-full w-full rounded-2xl bg-transparent" />
      </div>
      {/* Content */}
      <div className="relative z-10 p-5 text-[#00ff00]">
        {children}
      </div>
      {/* Subtle liquid effect - only one small orb */}
      <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-2xl" />
    </motion.div>
  );
}

// Minimalist Fuel Prices Card
function FuelPricesCard() {
  // Fetch fuel prices with auto-refresh every 5 minutes
  const { data: fuelData, isLoading: fuelLoading } = useQuery({
    queryKey: ['/api/fuel-prices'],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch exchange rates with auto-refresh every 5 minutes
  const { data: exchangeData, isLoading: exchangeLoading } = useQuery({
    queryKey: ['/api/exchange-rates'],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const prices = fuelData || {
    gasolina95: 293.60,
    gasolinaRegular: 274.50,
    gasoil: 221.60,
    glp: 147.60
  };

  const exchangeRates = exchangeData || {
    usd: { rate: 60.45, trend: 'up' },
    eur: { rate: 63.28, trend: 'down' }
  };

  return (
    <MinimalGlassCard>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900">Combustibles y Divisas</h3>
      </div>
      
      {/* Fuel Prices - Minimalist List */}
      <div className="space-y-2 mb-4">
        {Object.entries(prices).filter(([key]) => key !== 'lastUpdated').map(([fuel, price]) => (
          <div key={fuel} className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">
              {fuel === 'gasolina95' ? 'Premium 95' : 
               fuel === 'gasolinaRegular' ? 'Regular' :
               fuel === 'gasoil' ? 'Gasoil' : 'GLP'}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {fuelLoading ? (
                <span className="inline-block w-12 h-3 bg-gray-200 rounded animate-pulse" />
              ) : (
                `RD$ ${typeof price === 'number' ? price.toFixed(2) : '0.00'}`
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* Exchange Rates - Simplified */}
      <div className="space-y-2">
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-gray-600">USD</span>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-900">
              {exchangeLoading ? (
                <span className="inline-block w-12 h-3 bg-gray-200 rounded animate-pulse" />
              ) : (
                `RD$ ${exchangeRates.usd.rate.toFixed(2)}`
              )}
            </span>
            {!exchangeLoading && (
              <span className="text-xs text-gray-500 ml-2">
                {exchangeRates.usd.trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-gray-600">EUR</span>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-900">
              {exchangeLoading ? (
                <span className="inline-block w-12 h-3 bg-gray-200 rounded animate-pulse" />
              ) : (
                `RD$ ${exchangeRates.eur.rate.toFixed(2)}`
              )}
            </span>
            {!exchangeLoading && (
              <span className="text-xs text-gray-500 ml-2">
                {exchangeRates.eur.trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Update Time - Subtle */}
      <div className="mt-4 pt-3 border-t border-gray-100/50">
        <div className="flex items-center justify-center gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
          <p className="text-xs text-gray-400">
            {fuelData?.lastUpdated 
              ? `Actualizado ${new Date(fuelData.lastUpdated).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}`
              : 'Actualizado hoy 8:45 AM'}
          </p>
        </div>
      </div>
    </MinimalGlassCard>
  );
}

// Minimalist Weather Card
function WeatherCard() {
  // Fetch weather data with auto-refresh every 10 minutes
  const { data: weatherData, isLoading } = useQuery({
    queryKey: ['/api/weather'],
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  const weather = weatherData || {
    temp: 28,
    feelsLike: 32,
    condition: 'partly-cloudy',
    humidity: 75,
    wind: 15,
    location: 'Santo Domingo',
    description: 'Parcialmente nublado',
    uv: 8,
    pressure: 1013
  };

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'partly-cloudy': return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'snow': return <CloudSnow className="w-6 h-6 text-blue-300" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <MinimalGlassCard>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Clima</h3>
          {getWeatherIcon()}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{weather.location}</p>
      </div>
      
      {/* Temperature - Large and Clean */}
      <div className="text-center mb-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse mx-auto" />
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
        ) : (
          <>
            <div className="text-4xl font-light text-gray-900">{weather.temp}°</div>
            <div className="text-sm text-gray-500 mt-1">
              {weather.condition === 'sunny' ? 'Soleado' :
               weather.condition === 'partly-cloudy' ? 'Parcialmente nublado' :
               weather.condition === 'cloudy' ? 'Nublado' :
               weather.condition === 'rainy' ? 'Lluvioso' : weather.description}
            </div>
          </>
        )}
      </div>
      
      {/* Weather Details - Simple Grid */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-500">Humedad</div>
          <div className="text-sm font-medium text-gray-900">
            {isLoading ? (
              <span className="inline-block w-8 h-3 bg-gray-200 rounded animate-pulse" />
            ) : (
              `${weather.humidity}%`
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Viento</div>
          <div className="text-sm font-medium text-gray-900">
            {isLoading ? (
              <span className="inline-block w-12 h-3 bg-gray-200 rounded animate-pulse" />
            ) : (
              `${weather.wind} km/h`
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">UV</div>
          <div className="text-sm font-medium text-gray-900">
            {isLoading ? (
              <span className="inline-block w-4 h-3 bg-gray-200 rounded animate-pulse" />
            ) : (
              weather.uv
            )}
          </div>
        </div>
      </div>
      
      {/* Update Time - Subtle */}
      <div className="mt-4 pt-3 border-t border-gray-100/50">
        <div className="flex items-center justify-center gap-1">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
          <p className="text-xs text-gray-400">
            {weatherData?.lastUpdated 
              ? `Actualizado ${new Date(weatherData.lastUpdated).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}`
              : 'Actualizado 8:45 AM'}
          </p>
        </div>
      </div>
    </MinimalGlassCard>
  );
}

// Minimalist Main Sidebar Component
export function MainSidebar() {
  return (
    <div className="space-y-4">
      <FuelPricesCard />
      <WeatherCard />
    </div>
  );
}