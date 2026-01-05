
export const analyzeWaterQuality = (imageFile) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    img.src = url;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Redimensionar para rendimiento (análisis rápido)
      canvas.width = 200;
      canvas.height = 200;
      ctx.drawImage(img, 0, 0, 200, 200);
      
      const imageData = ctx.getImageData(0, 0, 200, 200);
      const data = imageData.data;
      
      let blueCyanPixels = 0;
      let greenBrownPixels = 0;
      let brightnessTotal = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        brightnessTotal += (r + g + b) / 3;

        // Detección de Tonos (Heurística simple)
        // Azul/Cyan: Azul dominante o Azul+Verde altos (Cyan)
        if (b > r + 20 && (b >= g - 30)) { 
            blueCyanPixels++;
        }
        // Verde/Marrón (Algas o Tierra): Verde muy dominante o Rojo+Verde altos
        else if (g > b + 20 && g > r + 20) {
            greenBrownPixels++;
        }
      }
      
      const totalPixels = 200 * 200;
      const blueRatio = blueCyanPixels / totalPixels;
      const greenRatio = greenBrownPixels / totalPixels;
      const avgBrightness = brightnessTotal / totalPixels;
      
      URL.revokeObjectURL(url);

      // Criterios de "Cristalino"
      // 1. Predominancia de azules/celestes sobre verdes/marrones
      // 2. Brillo suficiente (el agua limpia refleja luz o deja ver fondo claro)
      
      const isClean = (blueRatio > greenRatio) && (blueRatio > 0.15) && (avgBrightness > 40);
      
      let message = "";
      if (isClean) {
          message = "Agua Cristalina: Tonos azules detectados.";
      } else {
          if (greenRatio > blueRatio) message = "Posible presencia de algas (Tonos verdes).";
          else if (avgBrightness <= 40) message = "Imagen demasiado oscura para analizar.";
          else message = "No se detecta claridad suficiente (Tonos neutros).";
      }

      resolve({
        isClean,
        score: Math.round(blueRatio * 100),
        details: { blueRatio, greenRatio, avgBrightness },
        message
      });
    };
    
    img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
    };
  });
};