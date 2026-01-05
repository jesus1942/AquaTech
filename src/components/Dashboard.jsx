import React, { useState } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';
import WeatherWidget from './WeatherWidget.jsx';
import CalendarModal from './CalendarModal.jsx';

export default function Dashboard() {
  const { clientes, getCitasHoy, getIngresosEstimados, config, getAguaMovidaMensual } = useAppStore();
  const citasHoy = getCitasHoy();
  const ingresosHoy = getIngresosEstimados(
    new Date(new Date().setHours(0,0,0,0)),
    new Date(new Date().setHours(23,59,59,999))
  );
  const aguaMovida = getAguaMovidaMensual();
  const moneda = config?.moneda || 'ARS';
  const [showCal, setShowCal] = useState(false);

  // Formatear litros a m³ si es muy grande
  const aguaDisplay = aguaMovida >= 1000 
    ? `${(aguaMovida / 1000).toLocaleString()} m³` 
    : `${aguaMovida.toLocaleString()} L`;

  return (
    <div className="space-y-6">
      {showCal && <CalendarModal onClose={() => setShowCal(false)} />}
      
      {/* 1. Resumen (Stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Citas Hoy</p>
          <p className="text-2xl font-bold text-theme">{citasHoy.length}</p>
        </div>
        <div className="card rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Clientes</p>
          <p className="text-2xl font-bold text-theme">{clientes.length}</p>
        </div>
        <div className="card rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Ingresos</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {Math.round(ingresosHoy).toLocaleString()} <span className="text-xs font-normal text-muted">{moneda}</span>
          </p>
        </div>
        <div className="card rounded-2xl p-4 shadow-sm flex flex-col justify-center bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-300 uppercase tracking-wider mb-1">Agua (Mes)</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-200">
            {aguaDisplay}
          </p>
        </div>
      </div>

      {/* 2. Próximas Citas */}
      <div className="card rounded-2xl p-5 shadow-sm border border-theme">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-theme uppercase tracking-wider">Próximas Citas</h3>
            <button
                onClick={() => setShowCal(true)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-theme rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                Ver Calendario
            </button>
        </div>
        <ul className="space-y-3">
          {citasHoy.slice(0,3).map(c => (
            <li key={c.id} className="flex justify-between items-center p-3 bg-surface rounded-xl border border-theme/50">
              <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 rounded-full bg-blue-500"></div>
                  <span className="text-theme text-sm font-medium">
                    {new Date(c.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hs
                  </span>
              </div>
              <span className="text-muted text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">{c.tipo}</span>
            </li>
          ))}
          {citasHoy.length === 0 && (
            <div className="text-center py-6">
                <p className="text-muted text-sm">No hay citas para hoy.</p>
            </div>
          )}
        </ul>
      </div>

      {/* 3. Clima */}
      <WeatherWidget />
    </div>
  );
}
