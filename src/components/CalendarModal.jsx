import React, { useMemo, useState } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';
import { ChevronLeftIcon, ChevronRightIcon } from './icons.jsx';

export default function CalendarModal({ onClose }) {
  const { visitas, config } = useAppStore();
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-gray-800">Calendario</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Cerrar</button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
              <ChevronLeftIcon />
            </button>
            <div className="text-lg font-semibold text-gray-800 capitalize">{monthLabel}</div>
            <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
              <ChevronRightIcon />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs text-gray-500">
            <div className="text-center">Dom</div>
            <div className="text-center">Lun</div>
            <div className="text-center">Mar</div>
            <div className="text-center">Mié</div>
            <div className="text-center">Jue</div>
            <div className="text-center">Vie</div>
            <div className="text-center">Sáb</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((d, idx) => {
              if (!d) return <div key={idx} className="h-16 bg-gray-50 rounded-xl" />;
              const key = d.toISOString().slice(0,10);
              const count = byDay.get(key)?.length || 0;
              const totalIngresos = (byDay.get(key) || []).reduce((s, v) => s + (v.precioEstimado || 0), 0);
              const isToday = key === new Date().toISOString().slice(0,10);
              const isSelected = selectedKey === key;
              return (
                <button
                  key={idx}
                  onClick={() => setSelected(d)}
                  className={`h-16 rounded-xl border flex flex-col items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} ${isToday ? 'ring-2 ring-blue-300' : ''}`}
                >
                  <div className="text-sm font-semibold text-gray-800">{d.getDate()}</div>
                  {count > 0 && (
                    <div className="text-[10px] text-gray-600">{count} citas</div>
                  )}
                  {totalIngresos > 0 && (
                    <div className="text-[10px] text-gray-500">{moneda} {Math.round(totalIngresos).toLocaleString()}</div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold text-gray-700">
                {selected ? selected.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona un día'}
              </div>
              {selected && (
                <div className="text-xs text-gray-500">
                  {moneda} {Math.round(ingresosSel).toLocaleString()}
                </div>
              )}
            </div>
            {selected && (
              <ul className="space-y-2 max-h-40 overflow-auto">
                {selectedVisits.map(v => (
                  <li key={v.id} className="flex justify-between text-sm bg-white border rounded-lg p-2">
                    <span className="text-gray-800">{v.tipo}</span>
                    <span className="text-gray-500">{new Date(v.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </li>
                ))}
                {selectedVisits.length === 0 && <p className="text-xs text-gray-500">Sin citas</p>}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
