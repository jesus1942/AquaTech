import React, { useMemo, useState } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';
import { ChevronLeftIcon, ChevronRightIcon } from './icons.jsx';

export default function CalendarModal({ onClose }) {
  const { visitas, config, clientes } = useAppStore();
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(null);
  const moneda = config?.moneda || 'ARS';

  const byDay = useMemo(() => {
    const map = new Map();
    visitas.forEach(v => {
      const d = new Date(v.fecha);
      const key = d.toISOString().slice(0,10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(v);
    });
    return map;
  }, [visitas]);

  const monthDays = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startIdx = first.getDay();
    const total = last.getDate();
    const days = [];
    for (let i = 0; i < startIdx; i++) {
      days.push(null);
    }
    for (let d = 1; d <= total; d++) {
      days.push(new Date(year, month, d));
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  }, [current]);

  const monthLabel = useMemo(() => {
    return current.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }, [current]);

  const selectedKey = selected ? selected.toISOString().slice(0,10) : null;
  const selectedVisits = selectedKey ? (byDay.get(selectedKey) || []) : [];
  const ingresosSel = selectedVisits.reduce((s, v) => s + (v.precioEstimado || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="w-full sm:max-w-lg bg-surface border border-theme rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme">
          <h3 className="text-xl font-bold text-theme">Calendario</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-5 overflow-y-auto">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))} 
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-theme"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="text-lg font-bold text-theme capitalize">{monthLabel}</div>
            <button 
              onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))} 
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-theme"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted uppercase tracking-wide py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6">
            {monthDays.map((d, idx) => {
              if (!d) return <div key={idx} className="aspect-square bg-transparent" />;
              
              const key = d.toISOString().slice(0,10);
              const count = byDay.get(key)?.length || 0;
              const isToday = key === new Date().toISOString().slice(0,10);
              const isSelected = selectedKey === key;
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelected(d)}
                  className={`
                    relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all
                    ${isSelected 
                      ? 'bg-blue-600 text-white shadow-lg scale-105 z-10' 
                      : 'bg-gray-50 dark:bg-gray-800 text-theme hover:bg-gray-100 dark:hover:bg-gray-700'}
                    ${isToday && !isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
                  `}
                >
                  <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-theme'}`}>
                    {d.getDate()}
                  </span>
                  {count > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(Math.min(count, 3))].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-blue-500'}`} 
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-theme transition-all">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Detalle del día</span>
                <h4 className="text-lg font-bold text-theme mt-1 capitalize">
                  {selected ? selected.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona un día'}
                </h4>
              </div>
              {selected && ingresosSel > 0 && (
                <div className="text-right">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Estimado</span>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {moneda} {Math.round(ingresosSel).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {selected ? (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {selectedVisits.map(v => (
                  <div key={v.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-theme shadow-sm">
                    <div className="w-2 h-10 bg-blue-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-theme truncate">{v.tipo}</p>
                      <p className="text-xs text-muted truncate">
                        {clientes.find(c => c.id === v.clienteId)?.nombre || 'Cliente desconocido'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-theme">
                        {new Date(v.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
                {selectedVisits.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted text-sm">No hay citas programadas para este día.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted text-sm">Toca un día en el calendario para ver detalles.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
