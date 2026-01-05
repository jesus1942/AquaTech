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
                <div className="card p-5 rounded-2xl shadow-sm border border-theme">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-theme leading-tight">{clienteSeleccionado.nombre}</h2>
                            <p className="text-muted text-sm mt-1">{clienteSeleccionado.direccion || 'Sin dirección'}</p>
                        </div>
                        <button 
                            onClick={() => setClienteSeleccionado(null)}
                            className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-muted hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <a 
                            href={`https://wa.me/${clienteSeleccionado.telefono}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold text-center hover:bg-green-600 transition-colors shadow-sm active:scale-95"
                        >
                            WhatsApp
                        </a>
                        <a 
                            href={`tel:${clienteSeleccionado.telefono}`}
                            className="flex-1 bg-gray-100 dark:bg-gray-700 text-theme py-2.5 rounded-xl text-sm font-bold text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm active:scale-95"
                        >
                            Llamar
                        </a>
                    </div>

                    <div className="mt-5 pt-4 border-t border-theme/50">
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Notas Privadas</label>
                      <textarea
                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-theme text-theme placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        rows={2}
                        value={clienteSeleccionado.notas || ''}
                        onChange={(e) => {
                          const notas = e.target.value;
                          actualizarCliente(clienteSeleccionado.id, { notas });
                          setClienteSeleccionado({ ...clienteSeleccionado, notas });
                        }}
                        placeholder="Códigos de acceso, horarios, mascotas..."
                      />
                    </div>
                </div>

                {/* Calculadora (Integrada visualmente) */}
                <div className="card p-5 rounded-2xl shadow-sm border border-theme">
                    <CalculadoraQuimica 
                        cliente={clienteSeleccionado} 
                        onGuardarMedicion={handleGuardarMedicion}
                    />
                </div>

                {/* Historial */}
                <div className="card p-5 rounded-2xl shadow-sm border border-theme">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-theme">Historial</h3>
                        <span className="text-xs font-medium text-muted bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                            {historial.length} visitas
                        </span>
                    </div>
                    
                    <div className="space-y-4">
                        {historial.length === 0 && (
                            <div className="text-center py-8">
                                <div className="bg-gray-50 dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p className="text-muted text-sm">No hay visitas registradas aún.</p>
                            </div>
                        )}
                        {historial.map(visita => (
                            <div key={visita.id} className="relative pl-4 border-l-2 border-blue-200 dark:border-blue-800 py-1">
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-surface"></div>
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-theme text-sm">{visita.tipo}</p>
                                    <span className="text-xs text-muted">{new Date(visita.fecha).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-muted leading-relaxed">{visita.notas}</p>
                                {visita.valores && (
                                    <div className="mt-2 flex gap-2">
                                        {visita.valores.ph && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">pH {visita.valores.ph}</span>}
                                        {visita.valores.cloro && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Cl {visita.valores.cloro}</span>}
                                    </div>
                                )}
                                {visita.photos && visita.photos.length > 0 && (
                                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {visita.photos.slice(0,3).map((src, idx) => (
                                      <img key={idx} src={src} alt="visita" className="w-12 h-12 object-cover rounded-lg border border-theme" />
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
