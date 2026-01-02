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
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal, mode: 'cors' });
      const data = await res.json();
      clearTimeout(timer);
      setWeather({
        temp: data?.current?.temperature_2m,
        isDay: data?.current?.is_day,
        tmax: data?.daily?.temperature_2m_max?.[0],
        tmin: data?.daily?.temperature_2m_min?.[0],
        code: data?.daily?.weathercode?.[0]
      });
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: {
        temp: data?.current?.temperature_2m,
        isDay: data?.current?.is_day,
        tmax: data?.daily?.temperature_2m_max?.[0],
        tmin: data?.daily?.temperature_2m_min?.[0],
        code: data?.daily?.weathercode?.[0]
      }}));
      setError(null);
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
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
      <div>{iconEl}</div>
      <div>
        <p className="text-sm text-gray-500">Clima Hoy</p>
        {error && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={loadWeather}
              className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
            >
              Reintentar
            </button>
          </div>
        )}
        {!error && (
          <p className="text-lg font-bold text-gray-900">
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
