import React, { useState } from 'react';
import { useAppStore } from '../hooks/useStore.jsx';

export default function ClienteForm({ onCancel, onSuccess }) {
  const { agregarCliente } = useAppStore();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    volumenPiscina: '', // en litros
    tipoPiscina: 'hormigon', // hormigon, fibra, lona
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre) return;
    
    agregarCliente(formData);
    if (onSuccess) onSuccess();
    
    // Reset form
    setFormData({
      nombre: '',
      telefono: '',
      direccion: '',
      volumenPiscina: '',
      tipoPiscina: 'hormigon',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-bold mb-4">Nuevo Cliente</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nombre completo"
          className="w-full p-2 border rounded"
          value={formData.nombre}
          onChange={e => setFormData({...formData, nombre: e.target.value})}
          required
        />
        <input
          type="tel"
          placeholder="Teléfono (549...)"
          className="w-full p-2 border rounded"
          value={formData.telefono}
          onChange={e => setFormData({...formData, telefono: e.target.value})}
        />
        <input
          type="text"
          placeholder="Dirección"
          className="w-full p-2 border rounded"
          value={formData.direccion}
          onChange={e => setFormData({...formData, direccion: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-2">
            <input
            type="number"
            placeholder="Volumen (Litros)"
            className="w-full p-2 border rounded"
            value={formData.volumenPiscina}
            onChange={e => setFormData({...formData, volumenPiscina: e.target.value})}
            />
            <select 
                className="w-full p-2 border rounded"
                value={formData.tipoPiscina}
                onChange={e => setFormData({...formData, tipoPiscina: e.target.value})}
            >
                <option value="hormigon">Hormigón/Pintada</option>
                <option value="fibra">Fibra de Vidrio</option>
                <option value="lona">Lona/Desmontable</option>
                <option value="venecita">Revestida/Venecita</option>
            </select>
        </div>
        
        <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Guardar Cliente
            </button>
            {onCancel && (
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-gray-600">
                Cancelar
                </button>
            )}
        </div>
      </form>
    </div>
  );
}
