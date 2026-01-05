import React, { useEffect, useState } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';
import { 
  SunIcon, MoonIcon, CloudIcon, CloudRainIcon, 
  WindIcon, DropIcon, GaugeIcon, ChevronDownIcon, ChevronUpIcon 
} from './icons.jsx';

export default function WeatherWidget() {
  const { config, setConfig } = useAppStore();
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Nuevo estado de carga
  const [expanded, setExpanded] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [latInput, setLatInput] = useState(config?.weatherLocation?.lat ?? -34.6037);
  const [lonInput, setLonInput] = useState(config?.weatherLocation?.lon ?? -58.3816);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    if (config?.weatherLocation) {
      setLatInput(config.weatherLocation.lat);
      setLonInput(config.weatherLocation.lon);
    }
  }, [config?.weatherLocation]);

  // ... cities array ...

  const handleSaveLocation = (e) => {
    e.stopPropagation();
    setConfig({ ...config, weatherLocation: { lat: latInput, lon: lonInput } });
  };

  const loadWeather = async () => {
    // 1. Mostrar caché INMEDIATAMENTE si existe (Stale-While-Revalidate)
    let lat = config?.weatherLocation?.lat ?? -34.6037;
    let lon = config?.weatherLocation?.lon ?? -58.3816;
    const cacheKey = `weatherCache:${lat},${lon}`;
    const cached = localStorage.getItem(cacheKey);
    let hasCache = false;

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setWeather(parsed.data); // Mostrar datos viejos ya
        setLoading(false);       // Quitar skeleton ya
        setError(null);
        hasCache = true;
        
        // Si el caché es reciente (< 1 hora), no hacemos fetch
        if (Date.now() - parsed.ts < 60 * 60 * 1000) {
          return;
        }
      } catch (e) {
        console.error("Cache corrupto", e);
      }
    }

    // 2. Si no hay caché, mostramos loading. Si hay caché, loading ya es false (silent update)
    if (!hasCache) setLoading(true);

    try {
      // Fetch extended data
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weathercode,relative_humidity_2m,surface_pressure,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,uv_index_max&timezone=auto`;
      const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
      
      try {
        const res = await Promise.race([fetch(url), timeout(3000)]);
        if (!res.ok) throw new Error('API Error ' + res.status);
        const data = await res.json();
        
        const weatherData = {
          temp: data?.current?.temperature_2m,
          isDay: data?.current?.is_day,
          tmax: data?.daily?.temperature_2m_max?.[0],
          tmin: data?.daily?.temperature_2m_min?.[0],
          code: data?.current?.weathercode ?? data?.daily?.weathercode?.[0],
          humidity: data?.current?.relative_humidity_2m,
          pressure: data?.current?.surface_pressure,
          wind: data?.current?.wind_speed_10m,
          uv: data?.daily?.uv_index_max?.[0],
          forecast: data?.daily?.time?.slice(1, 6).map((t, i) => ({
            date: t,
            max: data.daily.temperature_2m_max[i + 1],
            min: data.daily.temperature_2m_min[i + 1],
            code: data.daily.weathercode[i + 1]
          }))
        };

        setWeather(weatherData);
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: weatherData }));
        setError(null);
      } catch (err) {
        console.warn('Open-Meteo falló, probando wttr.in...', err);
        // Si falla y teníamos caché, nos quedamos con el caché (silenciosamente)
        if (hasCache) return;
        
        try {
          // Usar HTTPS explícitamente y añadir encabezados para evitar problemas de CORS/Mixed Content
          const res2 = await Promise.race([
              fetch(`https://wttr.in/${lat},${lon}?format=j1`, { mode: 'cors' }), 
              timeout(3000)
          ]);
          
          if (!res2.ok) throw new Error('Fallback failed');
          const data2 = await res2.json();
          const current = data2.current_condition[0];
          const daily = data2.weather[0];
          
          const weatherData = {
            temp: parseFloat(current.temp_C),
            isDay: 1, 
            tmax: parseFloat(daily.maxtempC),
            tmin: parseFloat(daily.mintempC),
            code: 0,
            humidity: parseFloat(current.humidity),
            pressure: parseFloat(current.pressure),
            wind: parseFloat(current.windspeedKmph),
            uv: parseFloat(daily.uvIndex),
            source: 'backup',
            forecast: data2.weather.slice(1).map(d => ({
              date: d.date,
              max: parseFloat(d.maxtempC),
              min: parseFloat(d.mintempC),
              code: 0
            }))
          };
          setWeather(weatherData);
          setError(null);
        } catch (err2) {
          console.error('Ambos proveedores fallaron', err2);
          if (!hasCache) setError('Sin conexión');
        }
      }
    } catch (e) {
      console.error('Error general en WeatherWidget', e);
      if (!hasCache) setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [config?.weatherLocation]);

  const getWeatherIcon = (code, isDay = true) => {
    if (code === 61 || code === 63 || code === 65) return <CloudRainIcon className="w-6 h-6 text-blue-500" />;
    if (code === 0 || code === 1) return isDay ? <SunIcon className="w-6 h-6 text-yellow-500" /> : <MoonIcon className="w-6 h-6 text-gray-400" />;
    return <CloudIcon className="w-6 h-6 text-gray-400" />;
  };

  const iconEl = (() => {
    if (!weather) return <MoonIcon className="w-7 h-7 text-gray-300" />;
    if (weather.code === 61 || weather.code === 63 || weather.code === 65) return <CloudRainIcon className="w-8 h-8 text-blue-500" />;
    if (weather.isDay) return <SunIcon className="w-8 h-8 text-yellow-500" />;
    return <MoonIcon className="w-8 h-8 text-gray-600" />;
  })();

  return (
    <div 
      className={`card rounded-2xl p-4 shadow-sm transition-all duration-300 cursor-pointer ${expanded ? 'bg-white/50 dark:bg-black/20' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {loading ? (
            // Skeleton Loader
            <div className="flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : (
            // Contenido Real
            <>
              <div>{iconEl}</div>
              <div>
                <p className="text-sm text-muted">Clima Hoy</p>
                {error && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted">{error}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setError(null); setWeather(null); loadWeather(); }}
                      className="text-xs px-2 py-1 rounded hover:bg-gray-200"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
                {!error && (
                  <p className="text-lg font-bold text-theme">
                    {weather ? `${Math.round(weather.temp)}°C` : '--'} 
                    <span className="text-xs text-gray-500 ml-2">
                      {weather ? `Max ${Math.round(weather.tmax)}° / Min ${Math.round(weather.tmin)}°` : ''}
                    </span>
                    {weather?.source === 'backup' && (
                      <span className="block text-[10px] text-orange-500 font-normal">
                        ⚠️ Fuente alternativa
                      </span>
                    )}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        <div>
          {expanded ? <ChevronUpIcon className="text-muted" /> : <ChevronDownIcon className="text-muted" />}
        </div>
      </div>

      {expanded && weather && !error && (
        <div className="mt-4 pt-4 border-t border-theme animate-fade-in-up">
          {/* Header de Configuración de Ubicación (Minimalista) */}
          <div className="flex items-center justify-between mb-4" onClick={e => e.stopPropagation()}>
             <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-muted uppercase tracking-wider">Ubicación</span>
               <button 
                 onClick={() => setShowLocationSettings(!showLocationSettings)}
                 className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-blue-500"
                 title="Cambiar ubicación"
               >
                 <svg className={`w-4 h-4 transition-transform ${showLocationSettings ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
               </button>
             </div>
             <span className="text-xs text-theme truncate max-w-[150px] font-medium">
               {cities.find(c => Math.abs(c.lat - latInput) < 0.1 && Math.abs(c.lon - lonInput) < 0.1)?.name || `${latInput.toFixed(2)}, ${lonInput.toFixed(2)}`}
             </span>
          </div>

          {/* Panel de Configuración Desplegable */}
          {showLocationSettings && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-theme/50 animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col gap-3">
                {/* Opción 1: Ciudad o GPS */}
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2.5 rounded-lg text-sm bg-surface border-theme text-theme min-w-0 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => {
                      const city = cities.find(c => c.name === e.target.value);
                      if (city) {
                        setLatInput(city.lat);
                        setLonInput(city.lon);
                        setConfig({ ...config, weatherLocation: { lat: city.lat, lon: city.lon } });
                        setShowLocationSettings(false); // Auto-cerrar al seleccionar ciudad
                      }
                    }}
                    value={cities.find(c => Math.abs(c.lat - latInput) < 0.1 && Math.abs(c.lon - lonInput) < 0.1)?.name || ""}
                  >
                    <option value="">Seleccionar ciudad...</option>
                    {cities.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if ('geolocation' in navigator) {
                        setLocLoading(true);
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const { latitude, longitude } = pos.coords;
                            setConfig({ ...config, weatherLocation: { lat: latitude, lon: longitude } });
                            setLocLoading(false);
                            setShowLocationSettings(false); // Auto-cerrar al encontrar
                          },
                          (err) => {
                            setLocLoading(false);
                            alert('Error: ' + err.message);
                          },
                          { timeout: 10000, enableHighAccuracy: true }
                        );
                      } else {
                        alert('Geolocalización no soportada');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0 shadow-sm active:scale-95"
                    disabled={locLoading}
                    title="Usar mi ubicación actual"
                  >
                    {locLoading ? '...' : '📍 GPS'}
                  </button>
                </div>

                {/* Opción 2: Coordenadas Manuales (Más sutil) */}
                <div className="pt-2 border-t border-theme/20">
                   <p className="text-[10px] text-muted mb-1.5 uppercase tracking-wide">Avanzado: Coordenadas</p>
                   <div className="flex gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input
                        type="number"
                        step="0.0001"
                        value={latInput}
                        onChange={(e) => setLatInput(parseFloat(e.target.value))}
                        className="w-full p-2 rounded-lg text-xs bg-surface border-theme text-theme min-w-0 shadow-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        value={lonInput}
                        onChange={(e) => setLonInput(parseFloat(e.target.value))}
                        className="w-full p-2 rounded-lg text-xs bg-surface border-theme text-theme min-w-0 shadow-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Lon"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        handleSaveLocation(e);
                        setShowLocationSettings(false);
                      }}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-theme rounded-lg text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shrink-0 shadow-sm"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detalles Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <WindIcon className="w-5 h-5 mx-auto text-blue-400 mb-1" />
              <span className="text-xs text-muted block">Viento</span>
              <span className="text-xs font-bold text-theme">{Math.round(weather.wind)} km/h</span>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <DropIcon className="w-5 h-5 mx-auto text-blue-400 mb-1" />
              <span className="text-xs text-muted block">Humedad</span>
              <span className="text-xs font-bold text-theme">{weather.humidity}%</span>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <GaugeIcon className="w-5 h-5 mx-auto text-purple-400 mb-1" />
              <span className="text-xs text-muted block">Presión</span>
              <span className="text-xs font-bold text-theme">{Math.round(weather.pressure)} hPa</span>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <SunIcon className="w-5 h-5 mx-auto text-orange-400 mb-1" />
              <span className="text-xs text-muted block">UV</span>
              <span className="text-xs font-bold text-theme">{weather.uv?.toFixed(1) || '-'}</span>
            </div>
          </div>

          {/* Pronóstico */}
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Pronóstico Extendido</h4>
          <div className="space-y-2">
            {weather.forecast?.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <span className="text-sm text-theme w-24">
                  {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long' })}
                </span>
                {getWeatherIcon(day.code)}
                <div className="flex gap-3 text-sm">
                  <span className="font-bold text-theme">{Math.round(day.max)}°</span>
                  <span className="text-muted">{Math.round(day.min)}°</span>
                </div>
              </div>
            ))}
            {(!weather.forecast || weather.forecast.length === 0) && (
              <p className="text-xs text-muted text-center py-2">Pronóstico no disponible</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
