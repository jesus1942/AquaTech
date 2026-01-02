import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';
// import { LocalNotifications } from '@capacitor/local-notifications';

export default function AgendaView({ onSelectCliente }) {
  const { clientes, visitas, agregarVisita, getTarifaPorTarea, config } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  
  // Estado para el formulario de nueva cita
  const [nuevaCita, setNuevaCita] = useState({
    clienteId: '',
    fecha: '',
    hora: '',
    tipo: 'Mantenimiento',
    notas: ''
  });

  const ahora = new Date();
  const citasFuturas = visitas
    .filter(v => new Date(v.fecha) >= new Date(ahora.setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Función auxiliar para abrir WhatsApp (reutilizable)
  const abrirWhatsApp = (cita) => {
    const cliente = clientes.find(c => c.id === cita.clienteId);
    if (!cliente) return;

    const fechaObj = new Date(cita.fecha);
    const fechaStr = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const horaStr = fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const mensaje = `Hola ${cliente.nombre}, te escribo para confirmar nuestro turno de *${cita.tipo}* para el día *${fechaStr}* a las *${horaStr}*.`;
    const url = `https://wa.me/${cliente.telefono}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevaCita.clienteId || !nuevaCita.fecha || !nuevaCita.hora) return;

    // Combinar fecha y hora
    const fechaHora = new Date(`${nuevaCita.fecha}T${nuevaCita.hora}`);
    
    // Crear la visita en el store
    const precioBase = getTarifaPorTarea(nuevaCita.tipo);
    const visita = {
        clienteId: nuevaCita.clienteId,
        fecha: fechaHora.toISOString(),
        tipo: nuevaCita.tipo,
        notas: nuevaCita.notas,
        esFutura: true,
        tarea: nuevaCita.tipo,
        precioEstimado: precioBase
    };
    agregarVisita(visita);

    // Feedback visual rápido
    // alert("Cita agendada correctamente."); // Quitamos el alert para que sea más fluido

    // Automatización: Abrir WhatsApp inmediatamente
    abrirWhatsApp(visita);

    setShowForm(false);
    setNuevaCita({ clienteId: '', fecha: '', hora: '', tipo: 'Mantenimiento', notas: '' });
  };

  const enviarWhatsAppManual = (e, cita) => {
    e.stopPropagation(); 
    abrirWhatsApp(cita);
  };

  const handleCardClick = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente && onSelectCliente) {
        onSelectCliente(cliente);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-2">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Agenda</h2>
            <p className="text-sm text-gray-500">Organiza tus próximas visitas</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-lg hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2"
        >
          {showForm ? 'Cancelar' : '+ Nueva Cita'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 animate-fade-in-up">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Agendar Visita</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Cliente</label>
                    <div className="relative">
                        <select 
                            className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 appearance-none"
                            value={nuevaCita.clienteId}
                            onChange={e => setNuevaCita({...nuevaCita, clienteId: e.target.value})}
                            required
                        >
                            <option value="">Seleccionar Cliente...</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Fecha</label>
                        <input 
                            type="date" 
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium text-base focus:ring-2 focus:ring-blue-500 min-h-[56px]"
                            value={nuevaCita.fecha}
                            onChange={e => setNuevaCita({...nuevaCita, fecha: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Hora</label>
                        <input 
                            type="time" 
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium text-base focus:ring-2 focus:ring-blue-500 min-h-[56px]"
                            value={nuevaCita.hora}
                            onChange={e => setNuevaCita({...nuevaCita, hora: e.target.value})}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Tipo de Trabajo</label>
                    <div className="relative">
                        <select 
                            className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 appearance-none"
                            value={nuevaCita.tipo}
                            onChange={e => setNuevaCita({...nuevaCita, tipo: e.target.value})}
                        >
                            <option value="Mantenimiento">Mantenimiento (Limpieza/Químicos)</option>
                            <option value="Instalación">Instalación Equipos</option>
                            <option value="Reparación">Reparación</option>
                            <option value="Visita Técnica">Visita Técnica</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                    Confirmar y Enviar WhatsApp
                </button>
            </form>
        </div>
      )}

      <div className="space-y-4">
        {citasFuturas.length === 0 && !showForm && (
                <div className="text-center py-16 px-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"></rect><path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round"></path></svg>
                </div>
                <h3 className="text-gray-900 font-bold text-lg">Todo despejado</h3>
                <p className="text-gray-500 mt-1">No tienes citas programadas próximamente.</p>
                <button onClick={() => setShowForm(true)} className="mt-4 text-blue-600 font-semibold text-sm">Crear primera cita</button>
                </div>
        )}

        {citasFuturas.map(cita => {
            const cliente = clientes.find(c => c.id === cita.clienteId);
            const fechaObj = new Date(cita.fecha);
            return (
                <div 
                    key={cita.id} 
                    onClick={() => handleCardClick(cita.clienteId)}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex justify-between items-center group cursor-pointer active:scale-[0.98] transform transition-transform"
                >
                    <div className="flex gap-4 items-center">
                        <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold uppercase">{fechaObj.toLocaleDateString('es-ES', {month: 'short'})}</span>
                            <span className="text-xl font-bold leading-none">{fechaObj.getDate()}</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{cita.tipo}</p>
                            <h4 className="font-bold text-gray-900 text-lg leading-tight">{cliente ? cliente.nombre : 'Cliente Eliminado'}</h4>
                            <div className="text-gray-500 text-sm font-medium mt-1">
                                {fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hs
                            </div>
                            {typeof cita.precioEstimado === 'number' && (
                              <div className="text-xs text-gray-500 mt-1">
                                {(config?.moneda || 'ARS')} {Math.round(cita.precioEstimado).toLocaleString()}
                              </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={(e) => enviarWhatsAppManual(e, cita)}
                        className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm active:scale-90"
                        title="Confirmar por WhatsApp"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </button>
                </div>
            );
        })}
      </div>
    </div>
  );
}
