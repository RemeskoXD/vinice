import React from 'react';
import { Reveal } from '../Reveal';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

const events = [
  {
    title: "Zahájení sezóny 2026",
    date: "Duben 2026",
    desc: "Oficiální otevření našeho domu pro letošní sezónu. Přijďte si užít jarní vinice.",
    type: "U nás"
  },
  {
    title: "Mutěnické búdy dokořán",
    date: "Červen 2026",
    desc: "Tradiční akce, kdy vinaři v Mutěnicích otevírají své sklepy pro veřejnost. Degustace, hudba a skvělá atmosféra.",
    type: "V obci"
  },
  {
    title: "Vinobraní pod Vyšickem",
    date: "Září 2026",
    desc: "Oslava sklizně hroznů s bohatým kulturním programem, burčákem a folklorními vystoupeními.",
    type: "Místní akce"
  },
  {
    title: "Degustace u místního vinaře",
    date: "Celoročně / na domluvu",
    desc: "Můžeme pro vás domluvit soukromou degustaci v nedalekém sklípku. Poznejte pravou chuť Mutěnic.",
    type: "Zážitek"
  }
];

const Events: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-light text-black mb-8 font-serif text-center uppercase tracking-wider">Akce & Události</h1>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto font-light leading-relaxed">
            Sledujte, co se u nás a v okolí děje. Mutěnice jsou živou obcí s bohatým kulturním a vinařským programem po celý rok.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <div className="group border border-gray-100 p-8 hover:border-amber-700 transition-all duration-500 bg-gray-50/50 hover:bg-white hover:shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-amber-100 text-amber-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                    {event.type}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar size={16} />
                    <span>{event.date}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-black mb-4 group-hover:text-amber-700 transition-colors uppercase tracking-tight">{event.title}</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed mb-8">{event.desc}</p>
                
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                   <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Mutěnice</span>
                   <button className="text-amber-700 flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                     Více informací <ExternalLink size={14} />
                   </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4} className="mt-20 p-12 bg-amber-900 text-white text-center">
           <h2 className="text-3xl font-serif mb-6">Plánujete firemní akci nebo teambuilding?</h2>
           <p className="text-amber-100/80 font-light mb-8 max-w-2xl mx-auto">
             Náš dům je ideálním místem pro menší pracovní kolektivy. Klidné prostředí, možnost degustací a společného grilování.
           </p>
           <button className="bg-white text-amber-900 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-amber-100 transition-colors">
             Poptat firemní akci
           </button>
        </Reveal>
      </div>
    </div>
  );
};

export default Events;
