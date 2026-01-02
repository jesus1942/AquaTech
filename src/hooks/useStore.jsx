import React, { createContext, useContext, useState, useEffect } from 'react';

// Hook interno para localStorage (sin cambios)
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

// 1. Crear el Contexto
const AppContext = createContext();

// 2. Crear el Provider
export function AppProvider({ children }) {
  const [clientes, setClientes] = useLocalStorage('clientes', []);
  const [visitas, setVisitas] = useLocalStorage('visitas', []);
  const [tarifario, setTarifario] = useLocalStorage('tarifario', [
    { tarea: 'Mantenimiento', precioBase: 0 },
    { tarea: 'Instalación', precioBase: 0 },
    { tarea: 'Reparación', precioBase: 0 },
    { tarea: 'Visita Técnica', precioBase: 0 },
  ]);
  const [config, setConfig] = useLocalStorage('config', {
    moneda: 'ARS',
    weatherLocation: null,
    theme: 'light',
    version: 1,
  });

  useEffect(() => {
    if (tarifario.every(t => t.precioBase === 0)) {
      setTarifario([
        { tarea: 'Mantenimiento', precioBase: 8000 },
        { tarea: 'Instalación', precioBase: 20000 },
        { tarea: 'Reparación', precioBase: 12000 },
        { tarea: 'Visita Técnica', precioBase: 5000 },
      ]);
    }
    if (clientes.length === 0) {
      const demo = {
        nombre: 'Cliente Demo',
        telefono: '5491112345678',
        direccion: 'Av. Siempre Viva 123',
        volumenPiscina: 30000,
        tipoPiscina: 'Residencial',
        notas: 'Prueba de datos',
      };
      agregarCliente(demo);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agregarCliente = (cliente) => {
    const nuevoCliente = { 
        ...cliente, 
        id: Date.now().toString(), 
        createdAt: new Date().toISOString(),
        notas: cliente.notas || '',
        ubicacion: cliente.ubicacion || null
    };
    setClientes((prev) => [...prev, nuevoCliente]);
    return nuevoCliente;
  };

  const agregarVisita = (visita) => {
    const nuevaVisita = { 
        ...visita,
        id: Date.now().toString(),
        fecha: visita.fecha || new Date().toISOString(),
        tarea: visita.tarea || 'Mantenimiento',
        precioEstimado: visita.precioEstimado ?? null,
        photos: visita.photos || []
    };
    setVisitas((prev) => [...prev, nuevaVisita]);
  };

  const actualizarCliente = (id, patch) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const getVisitasPorCliente = (clienteId) => {
    return visitas
        .filter(v => v.clienteId === clienteId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  const getTarifaPorTarea = (tarea) => {
    const entry = tarifario.find(t => t.tarea === tarea);
    return entry ? entry.precioBase : 0;
  };

  const getCitasHoy = () => {
    const inicio = new Date();
    inicio.setHours(0,0,0,0);
    const fin = new Date();
    fin.setHours(23,59,59,999);
    return visitas.filter(v => {
      const f = new Date(v.fecha);
      return f >= inicio && f <= fin;
    });
  };

  const getIngresosEstimados = (inicio, fin) => {
    const citas = visitas.filter(v => {
      const f = new Date(v.fecha);
      return (!inicio || f >= inicio) && (!fin || f <= fin);
    });
    return citas.reduce((sum, v) => sum + (v.precioEstimado || 0), 0);
  };

  const value = {
    clientes,
    agregarCliente,
    actualizarCliente,
    visitas,
    agregarVisita,
    getVisitasPorCliente,
    tarifario,
    setTarifario,
    config,
    setConfig,
    getTarifaPorTarea,
    getCitasHoy,
    getIngresosEstimados
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// 3. Hook para consumir el contexto
export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore debe usarse dentro de un AppProvider');
  }
  return context;
}
