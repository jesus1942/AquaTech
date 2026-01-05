import React, { useState } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';
import ClienteForm from './ClienteForm';

export default function ListaClientes({ onSelectCliente }) {
  const { clientes } = useAppStore();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-theme">Mis Clientes</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium"
        >
          {showForm ? '- Cerrar' : '+ Nuevo'}
        </button>
      </div>

      {showForm && <ClienteForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />}

      <div className="grid gap-3">
        {clientes.length === 0 && !showForm && (
            <p className="text-muted text-center py-8">No hay clientes registrados aún.</p>
        )}
        
        {clientes.map(cliente => (
          <div 
            key={cliente.id} 
            onClick={() => onSelectCliente(cliente)}
            className="card p-4 rounded-lg shadow border-l-4 border-blue-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-theme">{cliente.nombre}</h3>
                    <p className="text-sm text-muted">{cliente.direccion || 'Sin dirección'}</p>
                </div>
                {cliente.volumenPiscina && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {parseInt(cliente.volumenPiscina).toLocaleString()} L
                    </span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
