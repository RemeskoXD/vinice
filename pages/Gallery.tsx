import React, { useState } from 'react';
import { Reveal } from '../Reveal';
import { X } from 'lucide-react';

const categories = [
  { id: 'all', name: 'Vše' },
  { id: 'ext', name: 'Exteriér' },
  { id: 'int', name: 'Interiér' },
  { id: 'wine', name: 'Vinný sklep' }
];

const imageData = [
  { src: "https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", cat: 'ext' },
  { src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", cat: 'int' },
  { src: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", cat: 'ext' },
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", cat: 'int' },
  { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", cat: 'wine' },
  { src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", cat: 'int' },
  { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", cat: 'int' },
  { src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", cat: 'int' },
  { src: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", cat: 'wine' }
];

const Gallery: React.FC = () => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState('all');

  const filteredImages = activeCat === 'all' 
    ? imageData 
    : imageData.filter(img => img.cat === activeCat);

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-[1600px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-light text-black mb-12 font-serif uppercase tracking-tighter">FOTOGALERIE</h1>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 border-b border-gray-100 pb-8">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`text-[10px] uppercase tracking-[0.3em] font-bold pb-2 transition-all duration-300 relative ${
                    activeCat === cat.id ? 'text-amber-800' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {cat.name}
                  {activeCat === cat.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-800"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredImages.map((img, idx) => (
            <Reveal key={`${img.src}-${idx}`} delay={idx * 0.05}>
              <div 
                className="aspect-square md:aspect-[4/5] overflow-hidden bg-gray-50 group cursor-pointer relative shadow-sm border border-gray-100"
                onClick={() => setLightboxImg(img.src)}
              >
                <img 
                  src={img.src} 
                  alt={`Gallery image ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                <div className="absolute inset-0 bg-amber-900/0 group-hover:bg-amber-900/10 transition-colors duration-500 flex items-center justify-center pointer-events-none">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-all duration-500 uppercase tracking-[0.2em] text-[10px] font-bold border-b border-white/50 pb-2 translate-y-4 group-hover:translate-y-0">Zvětšit detail</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[101]"
            onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }}
          >
            <X size={40} strokeWidth={1} />
          </button>
          <img 
            src={lightboxImg} 
            alt="Enlarged view" 
            className="max-w-full max-h-full object-contain cursor-default shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
