import React from 'react';
import { Reveal } from '../Reveal';
import { MapPin } from 'lucide-react';

const tips = [
  {
    title: "Vinné sklepy Plže",
    desc: "Unikátní areál historických vinných sklepů v Petrově. Památková rezervace lidové architektury.",
    dist: "15 km",
    img: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Zámek Milotice",
    desc: "Barokní zámek s krásnou zahradou a oranžérií. Ideální pro romantické procházky.",
    dist: "10 km",
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Lednicko-valtický areál",
    desc: "Památka UNESCO. Rozsáhlý park, zámky Lednice a Valtice, Minaret a další památky.",
    dist: "25 km",
    img: "https://images.unsplash.com/photo-1546519638-68e109498ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Baťův kanál",
    desc: "Možnost zapůjčení lodiček nebo projížďky na výletní lodi. Cyklostezka podél kanálu.",
    dist: "12 km",
    img: "https://images.unsplash.com/photo-1544985336-3958961f68d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Rozhledna Vyšicko",
    desc: "Výhled na vinice a Pálavu. Krásná procházka přímo z Mutěnic.",
    dist: "2 km",
    img: "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Aquapark Hodonín",
    desc: "Moderní koupaliště a krytý bazén pro celou rodinu.",
    dist: "12 km",
    img: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const Tips: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-[1600px] mx-auto px-6">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-light text-black mb-16 font-serif text-center">TIPY NA VÝLETY</h1>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {tips.map((tip, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <div className="group cursor-pointer">
                <div className="h-[300px] overflow-hidden bg-gray-100 mb-6 relative">
                  <img 
                    src={tip.img} 
                    alt={tip.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> {tip.dist}
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-black mb-2 group-hover:text-amber-700 transition-colors">{tip.title}</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed">{tip.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tips;
