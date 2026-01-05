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
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-theme/50">
        <h4 className="font-bold text-theme text-lg">Calculadora Química</h4>
        <div className="text-right">
             <span className="text-xs text-muted block uppercase tracking-wider">Volumen</span>
             <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{parseInt(cliente.volumenPiscina).toLocaleString()} L</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider text-center">pH</label>
            <input 
                type="number" step="0.1" 
                className="w-full h-14 border border-theme rounded-2xl text-center text-xl font-bold bg-surface text-theme focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all" 
                value={medicion.ph}
                onChange={e => setMedicion({...medicion, ph: e.target.value})}
                placeholder="7.2"
            />
        </div>
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider text-center">Cloro</label>
            <input 
                type="number" step="0.1" 
                className="w-full h-14 border border-theme rounded-2xl text-center text-xl font-bold bg-surface text-theme focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all" 
                value={medicion.cloro}
                onChange={e => setMedicion({...medicion, cloro: e.target.value})}
                placeholder="1.5"
            />
        </div>
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider text-center">Alcalinidad</label>
            <input 
                type="number" 
                className="w-full h-14 border border-theme rounded-2xl text-center text-xl font-bold bg-surface text-theme focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all" 
                value={medicion.alcalinidad}
                onChange={e => setMedicion({...medicion, alcalinidad: e.target.value})}
                placeholder="-"
            />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Evidencia Fotográfica</label>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Botón de carga estilizado */}
            <label className="flex-shrink-0 w-24 h-24 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group">
                <div className="bg-white dark:bg-gray-700 p-2 rounded-full mb-1 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wide">Agregar</span>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        const reads = await Promise.all(files.map(file => new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.readAsDataURL(file);
                        })));
                        setPhotos([...photos, ...reads]);
                    }}
                />
            </label>

            {/* Previsualización de fotos */}
            {photos.map((src, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-theme shadow-sm group">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                            onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                            className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors transform hover:scale-110"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <button 
        onClick={calcular}
        className="w-full btn-primary py-4 rounded-2xl text-base font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <span>⚡️</span> Calcular Dosis
      </button>

      {recomendacion && (
        <div className="mt-6 animate-fade-in-up">
            <div className="relative overflow-hidden p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                        <h5 className="font-bold text-blue-900 dark:text-blue-100 text-lg leading-none">Diagnóstico</h5>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5 font-medium">Receta generada automáticamente</p>
                    </div>
                </div>
                
                <div className="space-y-3 relative z-10">
                    {recomendacion.acciones.map((acc, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                            <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-300 font-bold text-[10px]">
                                {i + 1}
                            </div>
                            <span className="text-sm text-theme leading-snug font-medium">{acc}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <button
                onClick={() => onGuardarMedicion(recomendacion)}
                className="w-full mt-4 bg-emerald-600 text-white py-4 rounded-2xl text-base font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                Guardar en Historial
            </button>
        </div>
      )}
    </div>
  );
}
