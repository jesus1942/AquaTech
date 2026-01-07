import React, { useMemo } from 'react';
import { useAppStore } from '../hooks/useStore';

export default function ReportesModal({ onClose }) {
  const { visitas, clientes, config } = useAppStore();
  const moneda = config?.moneda || 'ARS';

  const stats = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    // 1. Ingresos por Mes (Últimos 6)
    const ingresosPorMes = {};
    const meses = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        ingresosPorMes[key] = 0;
        meses.push({ key, label: d.toLocaleDateString('es-ES', { month: 'short' }) });
    }

    visitas.forEach(v => {
        const d = new Date(v.fecha);
        if (d >= sixMonthsAgo) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (ingresosPorMes[key] !== undefined) {
                ingresosPorMes[key] += (v.precioEstimado || 0);
            }
        }
    });

    const maxIngreso = Math.max(...Object.values(ingresosPorMes), 1);

    // 2. Top Clientes
    const visitasPorCliente = {};
    visitas.forEach(v => {
        visitasPorCliente[v.clienteId] = (visitasPorCliente[v.clienteId] || 0) + 1;
    });
    const topClientes = Object.entries(visitasPorCliente)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id, count]) => {
            const c = clientes.find(cli => cli.id === id);
            return { nombre: c?.nombre || 'Desconocido', count };
        });

    // 3. Distribución de Tareas
    const tareas = {};
    visitas.forEach(v => {
        tareas[v.tipo] = (tareas[v.tipo] || 0) + 1;
    });
    const totalVisitas = visitas.length || 1;

    return { ingresosPorMes, meses, maxIngreso, topClientes, tareas, totalVisitas };
  }, [visitas, clientes]);

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl border-t sm:border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reportes</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estadísticas de tu negocio</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Gráfico de Ingresos */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Ingresos (6 meses)</h4>
            <div className="flex items-end justify-between h-40 gap-2">
                {stats.meses.map(({ key, label }) => {
                    const val = stats.ingresosPorMes[key];
                    const height = `${(val / stats.maxIngreso) * 100}%`;
                    return (
                        <div key={key} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="w-full relative bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden h-full flex items-end">
                                <div 
                                    style={{ height: height || '2px' }} 
                                    className="w-full bg-blue-500 dark:bg-blue-600 transition-all duration-500 group-hover:bg-blue-400"
                                ></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
                            {/* Tooltip simple */}
                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-16 bg-black text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity z-10">
                                {moneda} {val.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Top Clientes */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Top Clientes</h4>
                <div className="space-y-3">
                    {stats.topClientes.map((c, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${i===0 ? 'bg-yellow-500' : i===1 ? 'bg-gray-400' : 'bg-orange-700'}`}>
                                    {i+1}
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[80px]">{c.nombre}</span>
                            </div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{c.count} v</span>
                        </div>
                    ))}
                    {stats.topClientes.length === 0 && <p className="text-xs text-gray-400">Sin datos aún.</p>}
                </div>
            </div>

            {/* Distribución */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Tareas</h4>
                <div className="space-y-2">
                    {Object.entries(stats.tareas).slice(0,4).map(([tarea, count]) => (
                        <div key={tarea}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600 dark:text-gray-400">{tarea}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{Math.round((count/stats.totalVisitas)*100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div style={{ width: `${(count/stats.totalVisitas)*100}%` }} className="h-full bg-purple-500 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}