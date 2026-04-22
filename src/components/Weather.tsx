import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<{ temp: number; description: string } | null>(null);

  useEffect(() => {
    // Mutenice coordinates: 48.9056, 17.0264
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.9056&longitude=17.0264&current_weather=true')
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
          const code = data.current_weather.weathercode;
          let desc = 'Polojasno';
          if (code === 0) desc = 'Jasno';
          else if (code <= 3) desc = 'Polojasno';
          else if (code <= 48) desc = 'Mlha';
          else if (code <= 67) desc = 'Déšť';
          else if (code <= 77) desc = 'Sníh';
          else desc = 'Bouřka';

          setWeather({
            temp: Math.round(data.current_weather.temperature),
            description: desc
          });
        }
      })
      .catch(() => {
        // Fallback or handle error
      });
  }, []);

  if (!weather) return null;

  const getIcon = () => {
    const desc = weather.description.toLowerCase();
    if (desc.includes('jasno')) return <Sun className="text-amber-400" size={24} />;
    if (desc.includes('polojasno')) return <Cloud className="text-gray-300" size={24} />;
    if (desc.includes('déšť')) return <CloudRain className="text-blue-400" size={24} />;
    if (desc.includes('sníh')) return <CloudSnow className="text-white" size={24} />;
    return <Wind className="text-amber-200" size={24} />;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-sm border border-white/10 flex items-center gap-3">
      {getIcon()}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Mutěnice dnes</p>
        <p className="text-xl font-serif">{weather.temp}°C <span className="text-xs font-sans opacity-70 ml-1">{weather.description}</span></p>
      </div>
    </div>
  );
};

export default Weather;
