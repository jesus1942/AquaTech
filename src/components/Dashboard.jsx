import React, { useState } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';
import WeatherWidget from './WeatherWidget.jsx';
import CalendarModal from './CalendarModal.jsx';

export default function Dashboard() {
  const { clientes, getCitasHoy, getIngresosEstimados, config, setConfig, tarifario, setTarifario } = useAppStore();
  const citasHoy = getCitasHoy();
  const ingresosHoy = getIngresosEstimados(
    new Date(new Date().setHours(0,0,0,0)),
    new Date(new Date().setHours(23,59,59,999))
  );
  const moneda = config?.moneda || 'ARS';
  const [showCal, setShowCal] = useState(false);
  const [latInput, setLatInput] = useState(config?.weatherLocation?.lat ?? -34.6037);
  const [lonInput, setLonInput] = useState(config?.weatherLocation?.lon ?? -58.3816);
  const cities = [
    { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
    { name: 'Córdoba', lat: -31.4201, lon: -64.1888 },
    { name: 'Rosario', lat: -32.9442, lon: -60.6505 },
    { name: 'Mar del Plata', lat: -38.0055, lon: -57.5426 },
    { name: 'Mendoza', lat: -32.8908, lon: -68.8272 }
  ];

  return (
    <div className="space-y-6">
      {showCal && <CalendarModal onClose={() => setShowCal(false)} />}
      
      {/* 1. Resumen (Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted">Citas Hoy</p>
          <p className="text-2xl font-bold text-theme">{citasHoy.length}</p>
        </div>
        <div className="card rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted">Clientes</p>
          <p className="text-2xl font-bold text-theme">{clientes.length}</p>
        </div>
        <div className="card rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted">Ingresos Hoy</p>
          <p className="text-2xl font-bold text-theme">
            {moneda} {Math.round(ingresosHoy).toLocaleString()}
          </p>
        </div>
      </div>

      {/* 2. Próximas Citas */}
      <div className="card rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-theme mb-3">Próximas Citas</h3>
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowCal(true)}
            className="px-3 py-2 btn-primary rounded-lg text-xs"
          >
            Ver Calendario
          </button>
        </div>
        <ul className="space-y-3">
          {citasHoy.slice(0,3).map(c => (
            <li key={c.id} className="flex justify-between items-center">
              <span className="text-theme text-sm">
                {new Date(c.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              <span className="text-muted text-xs">{c.tipo}</span>
            </li>
          ))}
          {citasHoy.length === 0 && (
            <p className="text-muted text-sm">No hay citas para hoy.</p>
          )}
        </ul>
      </div>

      {/* 3. Clima */}
      <WeatherWidget />

      {/* 4. Configuración (Ubicación y Tarifario) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-theme mb-3">Ubicación Clima</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted">Ciudad</label>
              <select
                className="p-2 rounded-lg w-full"
                onChange={(e) => {
                  const city = cities.find(c => c.name === e.target.value);
                  if (city) {
                    setLatInput(city.lat);
                    setLonInput(city.lon);
                    setConfig({ ...config, weatherLocation: { lat: city.lat, lon: city.lon } });
                  }
                }}
              >
                <option value="">Seleccionar ciudad</option>
                {cities.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">Coordenadas</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={latInput}
                  onChange={(e) => setLatInput(parseFloat(e.target.value))}
                  className="flex-1 p-2 rounded-lg"
                  placeholder="Latitud"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={lonInput}
                  onChange={(e) => setLonInput(parseFloat(e.target.value))}
                  className="flex-1 p-2 rounded-lg"
                  placeholder="Longitud"
                />
                <button
                  onClick={() => setConfig({ ...config, weatherLocation: { lat: latInput, lon: lonInput } })}
                  className="px-3 py-2 btn-primary rounded-lg text-sm"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-theme mb-3">Tarifario</h3>
          <div className="grid grid-cols-1 gap-3">
            {tarifario.map((t, idx) => (
              <div key={t.tarea} className="flex items-center justify-between gap-2">
                <span className="text-sm text-theme">{t.tarea}</span>
                <input
                  type="number"
                  className="w-24 p-2 rounded-lg text-right"
                  value={t.precioBase}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const next = [...tarifario];
                    next[idx] = { ...next[idx], precioBase: val };
                    setTarifario(next);
                  }}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            Precios estimados para nuevas citas.
          </p>
        </div>
      </div>
    </div>
  );
}
