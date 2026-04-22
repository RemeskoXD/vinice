import React from 'react';
import { ArrowRight, ChevronRight, Wine, Home as HomeIcon, MapPin, Calendar as CalendarIcon, Wifi, Car, Coffee, Wind, Tv, Utensils, Sun, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '../Reveal';
import { DayPicker } from 'react-day-picker';
import { cs } from 'date-fns/locale';
import { addDays } from 'date-fns';

interface Booking {
  startDate: string;
  endDate: string;
  status: string;
}

const Home: React.FC = () => {
  const [bookings, setBookings] = React.useState<Booking[]>([]);

  React.useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error(err));
  }, []);

  const disabledDays = bookings.flatMap(b => {
    if (b.status === 'cancelled') return [];
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    const days = [];
    let current = start;
    while (current <= end) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    return days;
  });

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Vinice Mutěnice" 
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full px-6 md:px-12 flex flex-col justify-center h-full max-w-[1800px] mx-auto">
          <div className="max-w-4xl">
            <Reveal delay={0.2}>
              <h1 className="text-5xl md:text-8xl font-light mb-8 leading-tight tracking-tight text-white font-serif uppercase">
                V SRDCI<br />
                <span className="font-thin opacity-80 italic">VINIC</span>
              </h1>
              <div className="w-24 h-px bg-amber-600 mb-8"></div>
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                <p className="text-xl md:text-2xl text-white font-light max-w-xl leading-relaxed opacity-90">
                  Pronájem domu v Mutěnicích.<br/>
                  Užijte si soukromí a klid vinařského kraje.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/rezervace" className="group flex items-center px-8 py-4 bg-amber-700 text-white hover:bg-white hover:text-black transition-all duration-500 shadow-lg hover:shadow-xl">
                  <span className="font-bold uppercase tracking-widest text-xs">Rezervovat pobyt</span>
                  <ArrowRight size={16} className="ml-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <Link to="/akce" className="group flex items-center px-8 py-4 border border-white text-white hover:bg-white hover:text-black transition-all duration-500">
                  <span className="font-bold uppercase tracking-widest text-xs">Kalendář akcí</span>
                  <ChevronRight size={16} className="ml-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white text-black py-20 border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6">
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="flex items-center gap-6 group cursor-default">
                 <div className="text-amber-800 group-hover:text-amber-600 transition-colors duration-500 transform group-hover:scale-110 ease-out will-change-transform">
                    <HomeIcon size={40} strokeWidth={1} />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1 text-black">Celý dům pro vás</h3>
                    <p className="text-gray-500 text-sm font-light group-hover:text-black transition-colors duration-300">Naprosté soukromí pro vaši rodinu či přátele.</p>
                 </div>
              </div>
              <div className="flex items-center gap-6 group md:border-l md:border-gray-100 md:pl-12 cursor-default">
                 <div className="text-amber-800 group-hover:text-amber-600 transition-colors duration-500 transform group-hover:scale-110 ease-out will-change-transform">
                    <Wine size={40} strokeWidth={1} />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1 text-black">Vlastní vinotéka</h3>
                    <p className="text-gray-500 text-sm font-light group-hover:text-black transition-colors duration-300">V domě najdete placenou vinotéku s místními víny.</p>
                 </div>
              </div>
              <div className="flex items-center gap-6 group md:border-l md:border-gray-100 md:pl-12 cursor-default">
                 <div className="text-amber-800 group-hover:text-amber-600 transition-colors duration-500 transform group-hover:scale-110 ease-out will-change-transform">
                    <MapPin size={40} strokeWidth={1} />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1 text-black">Srdce Mutěnic</h3>
                    <p className="text-gray-500 text-sm font-light group-hover:text-black transition-colors duration-300">Pár kroků od slavných vinných sklepů.</p>
                 </div>
              </div>
          </Reveal>
        </div>
      </section>

      {/* Intro Statement & Rooms */}
      <section className="py-32 bg-white px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <Reveal>
               <h2 className="text-3xl md:text-5xl font-light text-black leading-tight mb-8 font-serif">
                 VÍTEJTE V <span className="italic text-amber-700 uppercase tracking-tighter">MUTĚNICÍCH</span>
               </h2>
               <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed max-w-4xl mx-auto mb-12">
                 Nabízíme vám pronájem útulného domu v klidné části obce Mutěnice. 
                 Ideální pro rodiny, cyklisty i firemní teambuildingy. Dům pojme pohodlně 
                 <span className="text-black font-medium"> 6 až 8 hostů</span>.
               </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <Reveal className="space-y-12">
                <div className="relative group p-8 border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-amber-700 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                    <span className="text-2xl font-serif text-amber-800">01</span>
                  </div>
                  <h3 className="text-xl font-serif mb-4 uppercase tracking-wide">Přízemí</h3>
                  <p className="text-gray-500 font-light text-sm leading-relaxed mb-4">
                    Klidová zóna s <span className="text-black font-medium">ložnicí s manželskou postelí</span> a prostorným obývacím pokojem s <span className="text-black font-medium">rozkládacím gaučem</span>. 
                  </p>
                  <p className="text-xs text-amber-800 font-bold uppercase tracking-widest">+ Plně vybavená kuchyně, TV a koupelna</p>
                </div>
                
                <div className="relative group p-8 border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-amber-700 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                    <span className="text-2xl font-serif text-amber-800">02</span>
                  </div>
                  <h3 className="text-xl font-serif mb-4 uppercase tracking-wide">Patro</h3>
                  <p className="text-gray-500 font-light text-sm leading-relaxed mb-4">
                    Dvě samostatné ložnice pro maximální soukromí. <span className="text-black font-medium">Pokoj se dvěma lůžky</span> a velký pokoj s <span className="text-black font-medium">manželskou postelí a možností přistýlky</span>.
                  </p>
                  <p className="text-xs text-amber-800 font-bold uppercase tracking-widest">+ Krásný výhled na vinohrady</p>
                </div>
                <div className="pt-4">
                   <Link to="/galerie" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-2 hover:text-amber-700 hover:border-amber-700 transition-all">
                      Prohlédnout pokoje <ArrowRight size={14} />
                   </Link>
                </div>
             </Reveal>
             <Reveal delay={0.2} className="relative">
               <div className="relative z-10">
                 <img 
                   src="https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                   alt="Interiér" 
                   className="rounded-sm shadow-2xl relative z-20"
                 />
                 <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-50 rounded-full -z-10 animate-pulse"></div>
                 <div className="absolute -bottom-8 -left-8 bg-amber-900 text-white p-10 z-30 shadow-xl">
                    <p className="text-4xl font-serif mb-1">6–8</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 leading-none">Kapacita hostů</p>
                 </div>
               </div>
             </Reveal>
          </div>
        </div>
      </section>

      {/* Availability Mini Calendar */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
             <Reveal className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-serif text-black mb-6 uppercase tracking-wider">Obsazenost</h2>
                <p className="text-gray-500 font-light mb-10 leading-relaxed">
                  Podívejte se, kdy u nás máme volno. Kalendář aktualizujeme denně. Pokud máte vybraný termín, neváhejte nám poslat poptávku co nejdříve.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-6 bg-white border border-gray-100 rounded-sm">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Příjezd</p>
                      <p className="text-lg font-serif">od 15:00</p>
                   </div>
                   <div className="p-6 bg-white border border-gray-100 rounded-sm">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Odjezd</p>
                      <p className="text-lg font-serif">do 10:00</p>
                   </div>
                </div>
                <Link to="/rezervace" className="inline-block bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors shadow-lg">
                   Přejít k rezervaci
                </Link>
             </Reveal>
             <Reveal delay={0.2} className="lg:w-1/2 bg-white p-8 shadow-2xl border border-gray-100">
                <div className="flex justify-center flex-col items-center">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-amber-800 mb-8 flex items-center gap-2">
                    <CalendarIcon size={16} /> Aktuální volné termíny
                  </h3>
                  <style>{`
                    .hp-rdp { margin: 0; --rdp-cell-size: 44px; --rdp-accent-color: #78350f; }
                    .hp-rdp .rdp-day_selected { background-color: transparent !important; color: inherit; }
                    .hp-rdp .rdp-day_disabled { text-decoration: line-through; opacity: 0.3; color: gray; }
                  `}</style>
                  <DayPicker
                    mode="single"
                    className="hp-rdp"
                    locale={cs}
                    disabled={disabledDays}
                    fromMonth={new Date()}
                  />
                  <div className="mt-8 pt-6 border-t border-gray-100 w-full flex justify-between text-[10px] uppercase tracking-widest font-bold text-gray-400">
                     <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-200"></span> Volno</span>
                     <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400 line-through"></span> Obsazeno</span>
                  </div>
                </div>
             </Reveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-6xl mx-auto">
           <Reveal className="text-center mb-20">
             <h2 className="text-3xl md:text-4xl font-serif text-black uppercase tracking-widest mb-4">Co o nás říkají hosté</h2>
             <div className="flex justify-center gap-1 text-amber-500">
               {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
             </div>
           </Reveal>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Martina S.", date: "Září 2026", text: "Krásný, čistý dům v klidné části. Velké plus za vinotéku přímo v objektu a možnost degustace, kterou nám majitelé domluvili." },
                { name: "Jakub H.", date: "Srpen 2026", text: "Ideální pro partu cyklistů. Úschovna kol je bezpečná a posezení u grilu bylo každý večer perfektní. Určitě se vrátíme." },
                { name: "Lucie K.", date: "Červen 2026", text: "Dům je prostorný a velmi pěkně zařízený. Káva po ránu s výhledem na vinice byl nepopsatelný zážitek." }
              ].map((review, idx) => (
                <Reveal key={idx} delay={idx * 0.1} className="bg-gray-50 p-8 border border-gray-100 relative group hover:bg-white hover:shadow-xl transition-all duration-500">
                   <Quote className="absolute top-6 right-6 text-amber-100 group-hover:text-amber-200 transition-colors" size={40} />
                   <p className="text-gray-600 font-light text-sm italic mb-8 leading-relaxed relative z-10">"{review.text}"</p>
                   <div>
                      <p className="font-bold text-sm uppercase tracking-widest text-black">{review.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{review.date}</p>
                   </div>
                </Reveal>
              ))}
           </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-24 bg-gray-900 border-y border-white/5 text-white">
        <div className="max-w-[1600px] mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-serif mb-16 text-center uppercase tracking-widest">Špičkové Vybavení</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-16 gap-x-8">
            {[
              { icon: <Wifi size={32} strokeWidth={1} />, label: "Wi-Fi připojení" },
              { icon: <Car size={32} strokeWidth={1} />, label: "Parkování u domu" },
              { icon: <Wind size={32} strokeWidth={1} />, label: "Klimatizace" },
              { icon: <Utensils size={32} strokeWidth={1} />, label: "Vybavená kuchyně" },
              { icon: <Coffee size={32} strokeWidth={1} />, label: "Kávovar" },
              { icon: <Tv size={32} strokeWidth={1} />, label: "Smart TV" },
              { icon: <Wine size={32} strokeWidth={1} />, label: "Vlastní vinotéka" },
              { icon: <MapPin size={32} strokeWidth={1} />, label: "Úschovna kol" },
            ].map((item, idx) => (
              <Reveal key={idx} delay={idx * 0.1} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-amber-500 group-hover:border-amber-700 group-hover:bg-amber-700/10 transition-all duration-300">
                  {item.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Image Grid / Preview */}
      <section className="w-full bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Reveal width="full">
            <div className="h-[60vh] md:h-[80vh] overflow-hidden relative group">
              <img 
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                alt="Interiér" 
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500"></div>
              <div className="absolute bottom-12 left-12 z-20">
                <h3 className="text-4xl md:text-6xl font-serif text-white mb-2">INTERIÉR</h3>
                <Link to="/galerie" className="text-white text-sm uppercase tracking-widest border-b border-white pb-1 hover:text-amber-200 hover:border-amber-200 transition-colors">Prohlédnout galerii</Link>
              </div>
            </div>
          </Reveal>
          <Reveal width="full" delay={0.1}>
            <div className="h-[60vh] md:h-[80vh] overflow-hidden relative group">
              <img 
                src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                alt="Exteriér" 
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500"></div>
              <div className="absolute bottom-12 left-12 z-20">
                <h3 className="text-4xl md:text-6xl font-serif text-white mb-2">OKOLÍ</h3>
                <Link to="/tipy" className="text-white text-sm uppercase tracking-widest border-b border-white pb-1 hover:text-amber-200 hover:border-amber-200 transition-colors">Kam na výlet</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center px-6">
            <Reveal>
              <CalendarIcon size={48} strokeWidth={1} className="mx-auto mb-6 text-black" />
              <h2 className="text-3xl md:text-5xl font-serif text-black mb-8">NAPLÁNUJTE SI POBYT</h2>
              <p className="text-gray-500 font-light text-lg mb-12">
                Podívejte se na volné termíny a rezervujte si ubytování včas.
              </p>
              <Link to="/rezervace" className="inline-block bg-black text-white px-12 py-4 uppercase font-bold tracking-widest hover:bg-amber-700 transition-colors duration-300 text-xs">
                 Rezervovat termín
              </Link>
            </Reveal>
          </div>
      </section>

      {/* Map Section */}
      <section className="w-full bg-white relative pb-0">
        <div className="max-w-6xl mx-auto px-6 py-24">
           <Reveal className="text-center mb-16">
              <h2 className="text-3xl font-serif text-black uppercase tracking-widest mb-4">Najdete nás v srdci Mutěnic</h2>
              <p className="text-gray-500 font-light">Vinařská 1264, 696 11 Mutěnice</p>
           </Reveal>
           <div className="w-full h-[500px] bg-gray-100 relative shadow-2xl border border-gray-100">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2617.962071960252!2d17.026416615865243!3d48.90562400539304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471329369ec9057b%3A0xc3d8a68ba7a59af!2zVmluYcWZw2vDoSAxMjY0LCA2OTYgMTEgTXV0xJtuaWNl!5e0!3m2!1scs!2scz!4v1700000000000!5m2!1scs!2scz&z=17" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Mutěnice"
            ></iframe>
            <div className="absolute bottom-8 left-8 bg-white p-8 shadow-2xl border border-gray-100 max-w-xs hidden md:block">
              <h3 className="font-serif text-2xl text-amber-900 mb-2 uppercase tracking-tight">V srdci vinic</h3>
              <p className="text-sm text-gray-500 font-light mb-6">Pár minut chůze od vinných sklepů a cyklostezek.</p>
              <a href="https://maps.google.com/?q=Mutěnice+Vinařská+1264" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] bg-black text-white px-6 py-3 hover:bg-amber-800 transition-colors">
                <MapPin size={14} /> Navigovat
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;