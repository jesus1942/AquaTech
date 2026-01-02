import React, { useState } from 'react';

export default function CalculadoraQuimica({ cliente, onGuardarMedicion }) {
  const [medicion, setMedicion] = useState({
    ph: '',
    cloro: '',
    alcalinidad: ''
  });
  
  const [recomendacion, setRecomendacion] = useState(null);
  const [photos, setPhotos] = useState([]);

  const calcular = () => {
    const vol = parseFloat(cliente.volumenPiscina) || 0;
    if (vol === 0) {
        alert("El cliente no tiene volumen de piscina registrado.");
        return;
    }

    const ph = parseFloat(medicion.ph);
    const cloro = parseFloat(medicion.cloro);
    const alc = medicion.alcalinidad ? parseFloat(medicion.alcalinidad) : null;
    
    let recs = [];

    // 1. Corrección de Alcalinidad (Prioridad Alta)
    // Rango ideal: 80 - 120 ppm
    if (alc !== null) {
        if (alc < 80) {
            // Subir Alcalinidad con Bicarbonato de Sodio
            // Aprox 17g/m3 sube 10ppm
            const falta = 100 - alc; // Apuntar a 100 ppm
            const gramosBicarbonato = (falta * 1.7 * (vol / 1000)).toFixed(0);
            recs.push(`Alcalinidad Baja (${alc} ppm). Agregar ${gramosBicarbonato}g de Bicarbonato de Sodio. (Esperar 2hs antes de corregir pH).`);
        } else if (alc > 140) {
            // Bajar Alcalinidad con Ácido
            // Es complejo, pero aprox 20ml/m3 baja 10ppm (varía mucho)
            recs.push(`Alcalinidad Alta (${alc} ppm). Agregar ácido lentamente y airear el agua.`);
        } else {
            recs.push(`Alcalinidad Correcta (${alc} ppm).`);
        }
    } else {
        recs.push(`Sin dato de Alcalinidad. La corrección de pH podría ser imprecisa.`);
    }

    // 2. Corrección de pH
    // pH ideal: 7.2 - 7.6
    if (!isNaN(ph)) {
        if (ph < 7.2) {
            // Subir pH (Carbonato de Sodio - Soda Solvay)
            const diferencia = 7.2 - ph;
            // Si la alcalinidad es baja, se necesita menos. Si es alta, más.
            // Usamos factor estándar si no hay dato.
            const gramos = (diferencia * 10 * 10 * (vol / 1000)).toFixed(0); 
            recs.push(`pH Bajo (${ph}). Agregar ${gramos}g de Elevador de pH (Soda Solvay).`);
        } else if (ph > 7.6) {
            // Bajar pH (Ácido Clorhídrico/Muriático)
            const diferencia = ph - 7.6;
            const ml = (diferencia * 10 * 10 * (vol / 1000)).toFixed(0);
            recs.push(`pH Alto (${ph}). Agregar ${ml}cc de Reductor de pH (Ácido).`);
        } else {
            recs.push(`pH Correcto (${ph}).`);
        }
    }

    // 3. Corrección de Cloro
    // Cloro ideal: 1.0 - 3.0 ppm
    if (!isNaN(cloro)) {
        if (cloro < 1.0) {
            // Subir Cloro (Cloro granulado 60% aprox 2g/m3 sube 1ppm)
            const falta = 1.5 - cloro; // Apuntar a 1.5
            const gramos = (falta * 2 * (vol / 1000)).toFixed(0);
            recs.push(`Cloro Bajo (${cloro}). Agregar ${gramos}g de Cloro Granulado.`);
        } else if (cloro > 3.0) {
            recs.push(`Cloro Alto (${cloro}). No agregar cloro por hoy.`);
        } else {
            recs.push(`Cloro Correcto (${cloro}).`);
        }
    }

    if (recs.length === 0) {
        recs.push("Ingresa valores para calcular.");
    }

    const resultado = {
        fecha: new Date().toISOString(),
        valores: { ...medicion },
        acciones: recs,
        clienteId: cliente.id,
        photos
    };

    setRecomendacion(resultado);
    if (onGuardarMedicion) {
        // Pasamos el resultado pero NO guardamos automáticamente, dejamos que el usuario decida con el botón "Guardar Visita" en el componente padre, o agregamos un botón aquí.
        // En la implementación actual de App.jsx, onGuardarMedicion guarda directo.
        // Vamos a devolver el resultado para que el padre lo maneje.
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 shadow-sm">
      <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">Calculadora Química</h4>
      <p className="text-xs text-gray-500 mb-3">
        Volumen: <span className="font-semibold">{parseInt(cliente.volumenPiscina).toLocaleString()} L</span> ({cliente.tipoPiscina})
      </p>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">pH</label>
            <input 
                type="number" step="0.1" 
                className="w-full p-2 border rounded text-center text-base focus:ring-2 focus:ring-blue-500 outline-none" 
                value={medicion.ph}
                onChange={e => setMedicion({...medicion, ph: e.target.value})}
                placeholder="7.2"
            />
        </div>
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cloro (ppm)</label>
            <input 
                type="number" step="0.1" 
                className="w-full p-2 border rounded text-center text-base focus:ring-2 focus:ring-blue-500 outline-none" 
                value={medicion.cloro}
                onChange={e => setMedicion({...medicion, cloro: e.target.value})}
                placeholder="1.5"
            />
        </div>
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Alcalinidad</label>
            <input 
                type="number" 
                className="w-full p-2 border rounded text-center text-base focus:ring-2 focus:ring-blue-500 outline-none" 
                value={medicion.alcalinidad}
                onChange={e => setMedicion({...medicion, alcalinidad: e.target.value})}
                placeholder="Opcional"
            />
        </div>
      </div>

      <div className="mt-2">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Fotos (opcional)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            const reads = await Promise.all(files.map(file => new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(file);
            })));
            setPhotos(reads);
          }}
          className="mt-1 text-sm"
        />
      </div>

      <div className="flex gap-2">
          <button 
            onClick={calcular}
            className="flex-1 bg-indigo-600 text-white py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Calcular Dosis
          </button>
      </div>

      {recomendacion && (
        <div className="mt-4 animate-fade-in">
            <div className="p-3 bg-white border border-indigo-100 rounded-lg shadow-sm">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Diagnóstico y Receta:</h5>
                <ul className="space-y-2">
                    {recomendacion.acciones.map((acc, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span>{acc}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            <button
                onClick={() => onGuardarMedicion(recomendacion)}
                className="w-full mt-3 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                Guardar en Historial
            </button>
        </div>
      )}
    </div>
  );
}
