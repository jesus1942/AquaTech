import React, { useEffect, useState } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';
import { SunIcon, MoonIcon, CloudIcon, CloudRainIcon } from './icons.jsx';

export default function WeatherWidget() {
  const { config, setConfig } = useAppStore();
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

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
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
      const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
      
      try {
        const res = await Promise.race([fetch(url), timeout(8000)]);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        const weatherData = {
          temp: data?.current?.temperature_2m,
          isDay: data?.current?.is_day,
          tmax: data?.daily?.temperature_2m_max?.[0],
          tmin: data?.daily?.temperature_2m_min?.[0],
          code: data?.current?.weathercode ?? data?.daily?.weathercode?.[0]
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
          isDay: 1, // wttr.in no da is_day directo, asumimos día o calculamos por hora si fuera crítico
          tmax: parseFloat(daily.maxtempC),
          tmin: parseFloat(daily.mintempC),
          code: 0 // wttr usa códigos distintos, simplificamos a 0 (sol) o mapeamos si es necesario
        };
        setWeather(weatherData);
        setError(null);
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('Sin conexión para clima');
        return;
      }
      setError('Sin conexión para clima');
    }
  };

  useEffect(() => {
    loadWeather();
  }, [config?.weatherLocation]);

  const iconEl = (() => {
    if (weather?.code === 61 || weather?.code === 63 || weather?.code === 65) return <CloudRainIcon className="w-7 h-7 text-gray-700" />;
    if (weather?.isDay) return <SunIcon className="w-7 h-7 text-yellow-500" />;
    return <MoonIcon className="w-7 h-7 text-gray-700" />;
  })();

  return (
    <div className="card rounded-2xl p-4 shadow-sm flex items-center gap-4">
      <div>{iconEl}</div>
      <div>
        <p className="text-sm text-muted">Clima Hoy</p>
        {error && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted">{error}</p>
            <button
              onClick={loadWeather}
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
          </p>
        )}
      </div>
    </div>
  );
}
