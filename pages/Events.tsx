import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Reveal } from '../Reveal';
import { Calendar, ExternalLink } from 'lucide-react';

interface EventItem {
  id: number;
  title: string;
  date: string;
  startDate?: string;
  endDate?: string;
  desc: string;
  type: string;
  link?: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, []);

  const currentDate = new Date();
  // Vynulujeme čas pro spravedlivé porovnání s daty z DB
  currentDate.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <Helmet>
        <title>Akce v okolí | Ubytování Mutěnice</title>
        <meta name="description" content="Poznejte mutěnické vinařské akce. Vinobraní, Mutěnické búdy dokořán a spousta dalšího dění v jihomoravském kraji." />
      </Helmet>
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-light text-black mb-8 font-serif text-center uppercase tracking-wider">Akce & Události</h1>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto font-light leading-relaxed">
            Sledujte, co se u nás a v okolí děje. Mutěnice jsou živou obcí s bohatým kulturním a vinařským programem po celý rok.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event, idx) => {
            let isPast = false;
            
            // Check if the event is strictly in the past
            if (event.endDate) {
               isPast = new Date(event.endDate) < currentDate;
            } else if (event.startDate) {
               isPast = new Date(event.startDate) < currentDate;
            }

            const isMainEvent = event.title.toLowerCase().includes('degustace vína u spřáteleného vinařství');

            return (
              <Reveal key={idx} delay={idx * 0.1}>
                <div className={`group border transition-all duration-500 p-8 relative overflow-hidden flex flex-col h-full
                  ${isMainEvent ? 'border-amber-700 bg-amber-50 shadow-md transform scale-[1.02]' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl'}
                  ${isPast ? 'opacity-60 grayscale' : 'hover:border-amber-700'}
                `}>
                  {isMainEvent && (
                    <div className="absolute top-0 right-0 bg-amber-700 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1">
                      Doporučujeme
                    </div>
                  )}
                  {isPast && (
                    <div className="absolute top-0 right-0 bg-stone-700 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1">
                      Proběhlo
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${isMainEvent ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900'}`}>
                      {event.type}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar size={16} />
                      <span className={isMainEvent ? 'text-amber-800 font-bold' : ''}>{event.date}</span>
                    </div>
                  </div>
                  
                  <h3 className={`text-2xl font-serif mb-4 uppercase tracking-tight transition-colors 
                    ${isPast ? 'text-stone-600' : 'text-black group-hover:text-amber-700'} 
                    ${isMainEvent ? 'text-amber-900 group-hover:text-black' : ''}`}>
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-500 font-light text-sm leading-relaxed mb-8 flex-grow">{event.desc}</p>
                  
                  <div className={`pt-6 border-t ${isMainEvent ? 'border-amber-200' : 'border-gray-100'} flex items-center justify-between`}>
                     <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Mutěnice</span>
                     {event.link && !isPast ? (
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-amber-700 flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all hover:text-amber-900">
                          Více informací <ExternalLink size={14} />
                        </a>
                     ) : event.link && isPast ? (
                        <span className="text-stone-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                          Archiv <ExternalLink size={14} />
                        </span>
                     ) : null}
                  </div>
                </div>
              </Reveal>
            );
          })}
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
