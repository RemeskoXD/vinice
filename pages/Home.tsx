import React from 'react';
import { ArrowRight, ChevronRight, Wine, Home as HomeIcon, MapPin, Calendar, Wifi, Car, Coffee, Wind, Tv, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '../Reveal';

const Home: React.FC = () => {
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
              <h1 className="text-5xl md:text-8xl font-light mb-8 leading-tight tracking-tight text-white font-serif">
                V SRDCI<br />
                <span className="font-thin opacity-80">VINICE</span>
              </h1>
              <div className="w-24 h-px bg-white mb-8"></div>
              <p className="text-xl md:text-2xl mb-12 text-white font-light max-w-xl leading-relaxed opacity-90">
                Pronájem rodinného domu v Mutěnicích.<br/>
                Užijte si klid a pohodu uprostřed vinařské oblasti.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/rezervace" className="group flex items-center px-8 py-4 bg-white text-black hover:bg-amber-700 hover:text-white transition-all duration-500 shadow-lg hover:shadow-xl">
                  <span className="font-bold uppercase tracking-widest text-xs">Rezervovat termín</span>
                  <ArrowRight size={16} className="ml-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <Link to="/galerie" className="group flex items-center px-8 py-4 border border-white text-white hover:bg-white hover:text-black transition-all duration-500">
                  <span className="font-bold uppercase tracking-widest text-xs">Prohlédnout dům</span>
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
                 <div className="text-black group-hover:text-amber-700 transition-colors duration-500 transform group-hover:scale-110 ease-out will-change-transform">
                    <HomeIcon size={40} strokeWidth={1} />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1 text-black">Celý dům pro vás</h3>
                    <p className="text-gray-500 text-sm font-light group-hover:text-black transition-colors duration-300">Soukromí a pohodlí rodinného domu.</p>
                 </div>
              </div>
              <div className="flex items-center gap-6 group md:border-l md:border-gray-100 md:pl-12 cursor-default">
                 <div className="text-black group-hover:text-amber-700 transition-colors duration-500 transform group-hover:scale-110 ease-out will-change-transform">
                    <Wine size={40} strokeWidth={1} />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1 text-black">Vinařská oblast</h3>
                    <p className="text-gray-500 text-sm font-light group-hover:text-black transition-colors duration-300">Přímo v centru dění Mutěnic.</p>
                 </div>
              </div>
              <div className="flex items-center gap-6 group md:border-l md:border-gray-100 md:pl-12 cursor-default">
                 <div className="text-black group-hover:text-amber-700 transition-colors duration-500 transform group-hover:scale-110 ease-out will-change-transform">
                    <MapPin size={40} strokeWidth={1} />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1 text-black">Skvělá lokalita</h3>
                    <p className="text-gray-500 text-sm font-light group-hover:text-black transition-colors duration-300">Blízko sklepů i cyklostezek.</p>
                 </div>
              </div>
          </Reveal>
        </div>
      </section>

      {/* Intro Statement */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
             <h2 className="text-3xl md:text-5xl font-light text-black leading-tight mb-8 font-serif">
               VÍTEJTE V <span className="italic text-amber-700">MUTĚNICÍCH</span>
             </h2>
             <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed mb-12">
               Nabízíme vám ubytování v nově zrekonstruovaném rodinném domě, který se nachází v klidné části obce Mutěnice, 
               přímo v srdci vinařského kraje. Ideální místo pro rodinnou dovolenou, cyklovýlety nebo posezení s přáteli u dobrého vína.
               <span className="text-black font-medium"> Zažijte atmosféru jižní Moravy na vlastní kůži.</span>
             </p>
             <Link to="/tipy" className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-amber-700 hover:border-amber-700 transition-colors">
                Tipy na výlety
             </Link>
          </Reveal>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-16 text-center">VYBAVENÍ DOMU</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { icon: <Wifi size={32} strokeWidth={1} />, label: "Rychlá Wi-Fi" },
              { icon: <Car size={32} strokeWidth={1} />, label: "Parkování u domu" },
              { icon: <Wind size={32} strokeWidth={1} />, label: "Klimatizace" },
              { icon: <Utensils size={32} strokeWidth={1} />, label: "Plně vybavená kuchyň" },
              { icon: <Coffee size={32} strokeWidth={1} />, label: "Kávovar" },
              { icon: <Tv size={32} strokeWidth={1} />, label: "Smart TV" },
            ].map((item, idx) => (
              <Reveal key={idx} delay={idx * 0.1} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 text-black group-hover:border-amber-700 group-hover:text-amber-700 transition-colors duration-300 shadow-sm group-hover:shadow-md">
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
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
              <Calendar size={48} strokeWidth={1} className="mx-auto mb-6 text-black" />
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
      <section className="w-full h-[400px] md:h-[500px] bg-gray-100 relative">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d41883.33325619376!2d16.99547145!3d48.9036733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47132a7b1b1b1b1b%3A0x400af0f6615b9b0!2sMut%C4%9Bnice!5e0!3m2!1scs!2scz!4v1650000000000!5m2!1scs!2scz" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={false} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa Mutěnice"
        ></iframe>
        <div className="absolute top-8 left-8 bg-white p-6 shadow-xl max-w-xs hidden md:block">
          <h3 className="font-serif text-xl mb-2">V srdci vinice</h3>
          <p className="text-sm text-gray-500 font-light mb-4">Vinařská 1264<br/>696 11 Mutěnice</p>
          <a href="https://maps.google.com/?q=Mutěnice+Vinařská+1264" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:text-black transition-colors">
            Otevřít v navigaci
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;