import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import AgendaView from './AgendaView';
import ListaClientes from './ListaClientes';
import AquaTechManager from './AquaTechManager';
import TarifarioModal from './TarifarioModal'; // Importar el modal
import { useAppStore } from '../hooks/useStore';

export default function App() {
  const [view, setView] = useState('dashboard'); // dashboard, agenda, clientes, detalle
  const [showTarifario, setShowTarifario] = useState(false); // Estado para el modal
  const { 
    clienteSeleccionado, 
    setClienteSeleccionado,
    config,
    setConfig
  } = useAppStore();

  // Efecto para tema oscuro
  useEffect(() => {
    if (config.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.darkMode]);

  const renderView = () => {
    if (clienteSeleccionado) return <AquaTechManager />;
    switch(view) {
      case 'dashboard': return <Dashboard />;
      case 'agenda': return <AgendaView />;
      case 'clientes': return <ListaClientes onSelectCliente={setClienteSeleccionado} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {showTarifario && <TarifarioModal onClose={() => setShowTarifario(false)} />}
      
      {/* Header Mobile First */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2" onClick={() => { setView('dashboard'); setClienteSeleccionado(null); }}>
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">AquaTech</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowTarifario(true)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Tarifario"
            >
               <span className="text-lg">💲</span>
            </button>
            <button 
              onClick={() => setConfig({...config, darkMode: !config.darkMode})}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {config.darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
    </div>
  );
}
