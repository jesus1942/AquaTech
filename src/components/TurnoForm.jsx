import React, { useState } from 'react';

export default function TurnoForm() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [telefono, setTelefono] = useState('');

  const enviarWhatsApp = (e) => {
    e.preventDefault();
    
    if (!nombre || !fecha || !hora || !telefono) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Formato del mensaje
    const mensaje = `Hola ${nombre}, tu turno ha sido agendado para el día ${fecha} a las ${hora}.`;
    
    // Codificar mensaje para URL
    const mensajeEncoded = encodeURIComponent(mensaje);
    
    // Crear link de WhatsApp (Deep Link)
    // Si el teléfono no tiene código de país, habría que agregarlo. Asumimos que el usuario lo pone o lo manejamos.
    // Para simplificar, usamos el link universal.
    const url = `https://wa.me/${telefono}?text=${mensajeEncoded}`;
    
    // Abrir WhatsApp
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Agendar Nuevo Turno</h2>
      
      <form onSubmit={enviarWhatsApp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Paciente/Cliente</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono (con código de país)</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            placeholder="5491112345678"
          />
          <p className="text-xs text-gray-500">Ej: 54911... para Argentina</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hora</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Enviar Notificación por WhatsApp
        </button>
      </form>
    </div>
  );
}
