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
  const [expanded, setExpanded] = useState(false);

  const loadWeather = async () => {
    try {
      let lat = -34.6037, lon = -58.3816;
      if (config?.weatherLocation?.lat && config?.weatherLocation?.lon) {
        lat = config.weatherLocation.lat;
        lon = config.weatherLocation.lon;
      } else if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setConfig({ ...config, weatherLocation: { lat: latitude, lon: longitude } });
          },
          () => {}
        );
      }
      const cacheKey = `weatherCache:${lat},${lon}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < 30 * 60 * 1000) {
          setWeather(parsed.data);
          setError(null);
          return;
        }
      }
      // Fetch extended data
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weathercode,relative_humidity_2m,surface_pressure,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,uv_index_max&timezone=auto`;
      const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
      
      try {
        const res = await Promise.race([fetch(url), timeout(5000)]);
        if (!res.ok) throw new Error('API Error');
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
        // Fallback a wttr.in (JSON)
        const res2 = await fetch(`https://wttr.in/${lat},${lon}?format=j1`);
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
      }
    } catch (e) {
      // ...
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
                {weather ? `${Math.round(weather.temp)}°C` : '...'} 
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
        </div>
        <div>
          {expanded ? <ChevronUpIcon className="text-muted" /> : <ChevronDownIcon className="text-muted" />}
        </div>
      </div>

      {expanded && weather && !error && (
        <div className="mt-4 pt-4 border-t border-theme animate-fade-in-up">
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
