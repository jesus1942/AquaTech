import React, { useState } from 'react';
import ListaClientes from './ListaClientes';
import CalculadoraQuimica from './CalculadoraQuimica';
import AgendaView from './AgendaView';
import Dashboard from './Dashboard';
import { AppProvider, useAppStore } from '../hooks/useStore.jsx';
import { HomeIcon, CalendarIcon, UsersIcon } from './icons.jsx';
import { SunIcon, MoonIcon } from './icons.jsx';

function AppShell() {
  // Estado de Navegación: 'dashboard' | 'agenda' | 'clientes'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const { agregarVisita, getVisitasPorCliente, actualizarCliente, config, setConfig } = useAppStore();
  const isDark = config?.theme === 'dark';
  React.useEffect(() => {
    if (isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDark]);

  const handleGuardarMedicion = (resultado) => {
    agregarVisita({
        tipo: 'Mantenimiento Químico',
        notas: resultado.acciones.join('. '),
        valores: resultado.valores,
        clienteId: resultado.clienteId
    });
    alert('Medición guardada en el historial del cliente');
  };

  const handleSelectClienteDesdeAgenda = (cliente) => {
    setClienteSeleccionado(cliente);
    setActiveTab('clientes'); // Opcional: cambiamos el tab activo para que la barra inferior refleje dónde estamos
  };

  const historial = clienteSeleccionado ? getVisitasPorCliente(clienteSeleccionado.id) : [];

  // Renderizado condicional del contenido principal
  const renderContent = () => {
    // Si hay un cliente seleccionado, SIEMPRE mostramos su detalle, no importa el tab
    // Esto permite "navegar" al cliente desde cualquier lado
    if (clienteSeleccionado) {
        return (
            <div className="space-y-6 pb-20">
                {/* Detalle del Cliente */}
                <div className="card p-4 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold text-theme">{clienteSeleccionado.nombre}</h2>
                    <p className="text-muted">{clienteSeleccionado.direccion}</p>
                    <div className="mt-2 flex gap-2">
                        <a 
                            href={`https://wa.me/${clienteSeleccionado.telefono}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-500 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                            WhatsApp
                        </a>
                        <a 
                            href={`tel:${clienteSeleccionado.telefono}`}
                            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-center py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Llamar
                        </a>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-muted uppercase tracking-wider ml-1">Notas</label>
                      <textarea
                        className="w-full mt-1 p-3 border border-theme rounded-lg bg-surface text-theme placeholder-gray-400"
                        rows={3}
                        value={clienteSeleccionado.notas || ''}
                        onChange={(e) => {
                          const notas = e.target.value;
                          actualizarCliente(clienteSeleccionado.id, { notas });
                          setClienteSeleccionado({ ...clienteSeleccionado, notas });
                        }}
                        placeholder="Ej: Entrar por pasillo lateral. Perro suelto los martes."
                      />
                    </div>
                </div>

                {/* Calculadora */}
                <CalculadoraQuimica 
                    cliente={clienteSeleccionado} 
                    onGuardarMedicion={handleGuardarMedicion}
                />

                {/* Historial */}
                <div>
                    <h3 className="text-lg font-bold text-theme mb-3">Historial de Visitas</h3>
                    <div className="space-y-3">
                        {historial.length === 0 && <p className="text-muted text-sm">Sin visitas registradas.</p>}
                        {historial.map(visita => (
                            <div key={visita.id} className="card p-3 rounded-lg shadow-sm border-l-4 border-indigo-400">
                                <div className="flex justify-between text-xs text-muted mb-1">
                                    <span>{new Date(visita.fecha).toLocaleDateString()}</span>
                                    <span>{new Date(visita.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="font-medium text-theme">{visita.tipo}</p>
                                <p className="text-sm text-muted mt-1">{visita.notas}</p>
                                {visita.valores && (
                                    <div className="mt-2 flex gap-2 text-xs">
                                        {visita.valores.ph && <span className="bg-gray-100 dark:bg-gray-700 text-theme px-2 py-1 rounded">pH: {visita.valores.ph}</span>}
                                        {visita.valores.cloro && <span className="bg-gray-100 dark:bg-gray-700 text-theme px-2 py-1 rounded">Cl: {visita.valores.cloro}</span>}
                                    </div>
                                )}
                                {visita.photos && visita.photos.length > 0 && (
                                  <div className="mt-2 flex gap-2">
                                    {visita.photos.slice(0,3).map((src, idx) => (
                                      <img key={idx} src={src} alt="visita" className="w-16 h-16 object-cover rounded" />
                                    ))}
                                  </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'dashboard') {
        return <Dashboard />;
    }
    if (activeTab === 'agenda') {
        return <AgendaView onSelectCliente={handleSelectClienteDesdeAgenda} />;
    }

    return <ListaClientes onSelectCliente={setClienteSeleccionado} />;
  };

  return (
    <div className="min-h-screen-ios app-bg scroll-touch">
      {/* Header */}
      <header className="app-header p-4 pt-safe shadow-lg sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
            {clienteSeleccionado ? (
                <button 
                    onClick={() => setClienteSeleccionado(null)} 
                    className="text-sm bg-blue-700 px-3 py-1 rounded flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                    ← Volver
                </button>
            ) : (
                <h1 className="text-xl font-bold">AquaTech by Jesus Olguin</h1>
            )}
            <button
              onClick={() => setConfig({ ...config, theme: isDark ? 'light' : 'dark' })}
              className="bg-blue-700 px-3 py-1 rounded flex items-center gap-2 hover:bg-blue-600 transition-colors"
              aria-label="Cambiar tema"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              <span className="text-sm">{isDark ? 'Claro' : 'Oscuro'}</span>
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 max-w-lg md:max-w-5xl mb-16">
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 app-nav shadow-lg z-20 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-lg md:max-w-5xl mx-auto">
            <button 
                onClick={() => { setActiveTab('dashboard'); setClienteSeleccionado(null); }}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'dashboard' && !clienteSeleccionado ? 'text-blue-600' : 'text-gray-400'}`}
            >
                <HomeIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Inicio</span>
            </button>
            <button 
                onClick={() => { setActiveTab('agenda'); setClienteSeleccionado(null); }}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'agenda' && !clienteSeleccionado ? 'text-blue-600' : 'text-gray-400'}`}
            >
                <CalendarIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Agenda</span>
            </button>
            <button 
                onClick={() => { setActiveTab('clientes'); setClienteSeleccionado(null); }}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'clientes' || clienteSeleccionado ? 'text-blue-600' : 'text-gray-400'}`}
            >
                <UsersIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Clientes</span>
            </button>
        </div>
      </nav>
    </div>
  );
}

export default function AquaTechManager() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
