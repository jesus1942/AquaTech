import React, { useState } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';
import WeatherWidget from './WeatherWidget.jsx';
import CalendarModal from './CalendarModal.jsx';
import ReportesModal from './ReportesModal.jsx';
import TarifarioModal from './TarifarioModal.jsx';

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
  const [showTarifario, setShowTarifario] = useState(false);
  const [showReportes, setShowReportes] = useState(false);

  // Formatear litros a m³ si es muy grande
  const aguaDisplay = aguaMovida >= 1000 
    ? `${(aguaMovida / 1000).toLocaleString()} m³` 
    : `${aguaMovida.toLocaleString()} L`;

  return (
    <div className="space-y-6">
      {showCal && <CalendarModal onClose={() => setShowCal(false)} />}
      {showReportes && <ReportesModal onClose={() => setShowReportes(false)} />}
      {showTarifario && <TarifarioModal onClose={() => setShowTarifario(false)} />}
      
      {/* 1. Resumen (Stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* ... stats existentes ... */}
        <div className="card rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Citas Hoy</p>
          <p className="text-2xl font-bold text-theme">{citasHoy.length}</p>
        </div>
        <div className="card rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Clientes</p>
          <p className="text-2xl font-bold text-theme">{clientes.length}</p>
        </div>
        <div 
          className="card rounded-2xl p-4 shadow-sm flex flex-col justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative" 
          onClick={(e) => { e.preventDefault(); setShowTarifario(true); }}
        >
           {/* Click directo para abrir tarifario */}
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Ingresos</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {Math.round(ingresosHoy).toLocaleString()} <span className="text-xs font-normal text-muted">{moneda}</span>
          </p>
        </div>
        <div className="card rounded-2xl p-4 shadow-sm flex flex-col justify-center bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800">
          <p className="text-xs text-cyan-700 dark:text-cyan-300 uppercase tracking-wider mb-1">Agua Tratada (Mes)</p>
          <p className="text-xl font-bold text-cyan-800 dark:text-cyan-200">
            {aguaDisplay}
          </p>
        </div>
      </div>

      {/* 2. Próximas Citas */}
      {/* ... */}
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
      
      {/* Accesos Rápidos */}
      <div className="grid grid-cols-2 gap-3">
          <button 
             className="card p-4 rounded-2xl shadow-sm border border-theme flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left relative"
             onClick={(e) => { e.preventDefault(); setShowTarifario(true); }}
          >
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="text-left">
                      <span className="block text-sm font-bold text-theme group-hover:text-blue-600 transition-colors">Ver Costos</span>
                      <span className="block text-[10px] text-muted">Tarifario Base</span>
                  </div>
              </div>
              <svg className="w-5 h-5 text-muted group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          
          <div 
            className="card p-4 rounded-2xl shadow-sm border border-theme flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowReportes(true)}
          >
              {/* Placeholder para futura feature */}
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div className="text-left">
                  <span className="block text-sm font-bold text-theme">Reportes</span>
                  <span className="block text-[10px] text-muted">Ver estadísticas</span>
              </div>
          </div>
      </div>

      {/* 3. Clima */}
      <WeatherWidget />
    </div>
  );
}
