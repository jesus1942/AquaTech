import React, { useState } from 'react';
import { useAppStore } from '../hooks/useStore';

export default function TarifarioModal({ onClose }) {
  const { tarifario, setTarifario, config } = useAppStore();
  const moneda = config?.moneda || 'ARS';
  
  // Inicializar estado con fallback por si tarifario es null/undefined
  const [localTarifario, setLocalTarifario] = useState(() => {
    if (Array.isArray(tarifario)) return tarifario;
    return [];
  });

  // Si el store se actualiza (o carga tarde), actualizar local si no hemos editado aun?
  // Mejor no sobreescribir edición en curso. 
  // Pero si llega null, mostrar loading o error.

  const handleSave = () => {
    setTarifario(localTarifario);
    onClose();
  };

  if (!Array.isArray(localTarifario) || localTarifario.length === 0) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl">
                 <p className="text-red-500 mb-4">Error: No hay datos de tarifario.</p>
                 <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cerrar</button>
             </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tarifario Base</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Precios sugeridos para nuevas citas</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {localTarifario.map((item, idx) => (
            <div key={item.tarea} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="font-medium text-gray-700 dark:text-gray-200">{item.tarea}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-medium">{moneda}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className="w-28 p-2 rounded-lg text-right font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                  value={item.precioBase}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const valStr = e.target.value;
                    const val = valStr === '' ? 0 : parseFloat(valStr);
                    const next = [...localTarifario];
                    next[idx] = { ...next[idx], precioBase: val };
                    setLocalTarifario(next);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
                Guardar Cambios
            </button>
        </div>
      </div>
    </div>
  );
}