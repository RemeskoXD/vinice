import React, { useState } from 'react';
import { Reveal } from '../Reveal';
import { MapPin, Info, Wine, Bike, ExternalLink, Navigation, Compass, Car } from 'lucide-react';

interface Tip {
  title: string;
  desc: string;
  dist: string;
  img: string;
  webLink?: string;
  mapsLink: string;
  portierTip: string;
  category: 'walking' | 'biking' | 'driving';
  badge?: string;
}

const tips: Tip[] = [
  {
    title: "Mutěnské „Búdy“ – Pod Búdama",
    desc: "Unikátní areál s více než 500 vinnými sklepy přímo pod tvými okny. Je to labyrint chutí a historie, kde se čas zastavil mezi malovanými žudry.",
    dist: "0,1 km",
    img: "https://cdn.kudyznudy.cz/files/1b/1b359929-8947-417d-805b-3e7c4ae823de.webp",
    mapsLink: "https://www.google.com/maps/dir/%22Vina%C5%99sk%C3%A1+1264,+Mut%C4%9Bnice%22/Mut%C4%9Bnice+vinn%C3%A9+sklepy",
    portierTip: "Nezůstávej jen na hlavní cestě. Zahni do bočních uliček, kde se večer často zpívá u skleničky a kde najdeš ty nejkrásnější malované žúdra.",
    category: 'walking'
  },
  {
    title: "Rozhledna Vyšicko",
    desc: "Dominanta Mutěnic, ze které uvidíš jako na dlani celé vinohrady i vrcholky Pálavy. Krásná procházka přímo z našeho domu.",
    dist: "1,8 km",
    img: "https://web2.itnahodinu.cz/vinice/rozhledna1.jpg",
    mapsLink: "https://www.google.com/maps/dir/%22Vina%C5%99sk%C3%A1+1264,+Mut%C4%9Bnice%22/Rozhledna+Vy%C5%A1icko",
    portierTip: "Vem si s sebou láhev našeho veltlínu. Nahoře u rozhledny jsou lavičky, které přímo vybízejí k tichému rozjímání u skleničky.",
    category: 'walking',
    badge: "Nejoblíbenější místo pro západ slunce"
  },
  {
    title: "Cyklostezka Mutěnka",
    desc: "Dokonale rovná cesta po bývalé železnici vedoucí vinohrady směrem na Kyjov. Ideální pro ranní běh nebo pohodový výlet na kole.",
    dist: "0,2 km",
    img: "https://web2.itnahodinu.cz/vinice/103.jpg",
    mapsLink: "https://www.google.com/maps/dir/%22Vina%C5%99sk%C3%A1+1264,+Mut%C4%9Bnice%22/Cyklostezka+Mut%C4%9Bnka",
    portierTip: "Půjč si u nás kolo a vyraz hned po snídani, dokud je rosa na vinicích a vzduch voní bylinkami.",
    category: 'biking'
  },
  {
    title: "Slovanské hradiště v Mikulčicích",
    desc: "Místo, kde se psaly dějiny Velké Moravy. Magická atmosféra mezi vykopávkami chrámů v lužním lese s vůní historie.",
    dist: "15,5 km",
    img: "https://web2.itnahodinu.cz/vinice/104.jpg",
    mapsLink: "https://www.google.com/maps/dir/%22Vina%C5%99sk%C3%A1+1264,+Mut%C4%9Bnice%22/Slovansk%C3%A9+hradi%C5%A1t%C4%9B+v+Mikul%C4%8Dic%C3%ADch",
    portierTip: "Vylez na vyhlídkovou věž – uvidíš odtud meandry řeky Moravy a s trochou štěstí i slovenské Karpaty.",
    category: 'driving'
  },
  {
    title: "Templářské sklepy Čejkovice",
    desc: "Gigantické historické sklepení založené ve 13. století, kde zraje víno v obrovských dubových sudech. Dotkni se historie.",
    dist: "7,2 km",
    img: "https://web2.itnahodinu.cz/vinice/105.jpg",
    webLink: "https://www.templarske-sklepy.cz/",
    mapsLink: "https://www.google.com/maps/dir/%22Vina%C5%99sk%C3%A1+1264,+Mut%C4%9Bnice%22/Templ%C3%A1%C5%99sk%C3%A9+sklepy+%C4%8Cejkovice",
    portierTip: "Sonnentor už tam máš, ale po bylinkách doporučuji sejít do podzemí. Ta teplota a vůně dřeva jsou nezapomenutelné.",
    category: 'driving'
  },
  {
    title: "Sonnentor – Bylinkový ráj",
    desc: "Zážitkový areál s výrobou čajů a bylinek. Prohlídky, skvostná zahrada a příjemná kavárna s výhledem na Čejkovice.",
    dist: "7,5 km",
    img: "https://web2.itnahodinu.cz/vinice/110.jpg",
    webLink: "https://www.sonnentor.com/cs-cz",
    mapsLink: "https://www.google.com/maps/dir/%22Vina%C5%99sk%C3%A1+1264,+Mut%C4%9Bnice%22/Sonnentor+%C4%8Cejkovice",
    portierTip: "Zkus jejich bylinkovou limonádu na terase. Je to ten nejlepší restart po celodenním výletě.",
    category: 'driving'
  },
  {
    title: "Zámek Milotice",
    desc: "Jeden z nejkrásnějších barokních areálů v České republice, známý jako Perla jihovýchodní Moravy. Unikátní zahrada a nádherné interiéry.",
    dist: "10,2 km",
    img: "https://web2.itnahodinu.cz/vinice/111.webp",
    webLink: "https://www.zamek-milotice.cz/",
    mapsLink: "https://www.google.com/maps/dir/%22Vina%C5%99sk%C3%A1+1264,+Mut%C4%9Bnice%22/Z%C3%A1mek+Milotice",
    portierTip: "Půjčte si přímo na zámku dobové kostýmy a projděte se v nich v zahradách. Ten pocit šlechtice za to stojí!",
    category: 'driving'
  },
  {
    title: "Vinné sklepy Plže Petrov",
    desc: "Historické vinné sklepy s typickým bílo-modrým zdobením, které jsou národní kulturní památkou. Pohádkový areál přímo ve vinici.",
    dist: "16,4 km",
    img: "https://web2.itnahodinu.cz/vinice/114.webp",
    mapsLink: "https://www.google.com/maps/dir/%22Vina%C5%99sk%C3%A1+1264,+Mut%C4%9Bnice%22/Pl%C5%BEe+Petrov",
    portierTip: "Zajeďte sem v podvečer. Ta modrá barva na pozadí zapadajícího slunce je rájem pro každého fotografa.",
    category: 'driving'
  },
  {
    title: "Levandulová farma Starovičky",
    desc: "Kousek Provence na Moravě. Nekonečná pole levandule, která omámí vaše smysly svou vůní a barvou přímo pod Pálavou.",
    dist: "24,5 km",
    img: "https://web2.itnahodinu.cz/vinice/113.jpg",
    webLink: "https://www.levandulezmoravy.cz/",
    mapsLink: "https://www.google.com/maps/dir/%22Vina%C5%99sk%C3%A1+1264,+Mut%C4%9Bnice%22/Levandulov%C3%A1+farma+Starovi%C4%8Dky",
    portierTip: "Kup si v jejich obchůdku levandulovou zmrzlinu a sedni si na okraj pole. Je to ta nejlepší relaxace pod širým nebem.",
    category: 'driving'
  }
];

const Tips: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'walking' | 'biking' | 'driving'>('all');

  const filteredTips = activeCategory === 'all' ? tips : tips.filter(tip => tip.category === activeCategory);

  const categories = [
    { id: 'all', label: 'Všechny zážitky', icon: <Compass size={16} /> },
    { id: 'walking', label: 'Pěšky po Mutěnicích', icon: <MapPin size={16} /> },
    { id: 'biking', label: 'Na kole za vínem', icon: <Bike size={16} /> },
    { id: 'driving', label: 'Autem za kulturou', icon: <Car size={16} /> },
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-light text-black mb-8 font-serif uppercase tracking-wider">Tipy na zážitky</h1>
            <p className="text-gray-500 max-w-2xl mx-auto font-light leading-relaxed mb-12">
              Jižní Morava není jen o místě na spaní, je o emocích, které si odvezeš. Jako tvůj portýr jsem pro tebe vybral místa, která dělají náš kraj autentickým.
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 border-b border-gray-100 pb-8">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full border ${
                    activeCategory === cat.id 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 mb-24">
          {filteredTips.map((tip, idx) => (
            <Reveal key={tip.title} delay={idx * 0.1}>
              <div className="group flex flex-col h-full bg-white transition-all duration-500">
                <div className="h-[400px] overflow-hidden mb-8 relative">
                  <img 
                    src={tip.img} 
                    alt={tip.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  {/* Badge */}
                  {tip.badge && (
                    <div className="absolute top-6 left-6 z-10">
                      <span className="bg-amber-600 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 shadow-xl">
                        {tip.badge}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-3 text-white">
                      <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                        {tip.category === 'walking' && <MapPin size={14} />}
                        {tip.category === 'biking' && <Bike size={14} />}
                        {tip.category === 'driving' && <Car size={14} />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{tip.dist} z apartmánu</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-grow">
                  <h3 className="text-2xl font-serif text-black mb-5 group-hover:text-amber-800 transition-colors uppercase tracking-tight leading-tight">
                    {tip.title}
                  </h3>
                  <p className="text-gray-700 font-normal text-[15px] leading-relaxed mb-8">
                    {tip.desc}
                  </p>
                  
                  {/* Portier Tip - Refined for better readability */}
                  <div className="bg-amber-50/50 p-6 border-l-4 border-amber-600 mb-8 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900 mb-2 flex items-center gap-2">
                       <Compass size={12} className="text-amber-600" /> Tahák portýra
                    </p>
                    <p className="text-gray-800 text-[14px] font-medium leading-relaxed italic">
                      "{tip.portierTip}"
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-auto flex flex-wrap gap-5 items-center">
                    <a 
                      href={tip.mapsLink} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-900 transition-all"
                    >
                      <Navigation size={12} /> Naplánovat trasu
                    </a>
                    {tip.webLink && (
                      <a 
                        href={tip.webLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black flex items-center gap-2 transition-colors"
                      >
                         Web <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4} className="bg-stone-900 p-8 md:p-20 text-white flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-grow space-y-8">
                <div className="inline-block border border-amber-500/30 px-4 py-1 text-amber-500 text-[10px] uppercase tracking-[0.3em]">
                  Personal Service
                </div>
                <h2 className="text-4xl md:text-5xl font-serif leading-tight">Chceš zažít něco extra?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                        <Wine className="text-amber-500" size={32} />
                        <p className="font-bold text-xs uppercase tracking-widest">Degustace u sousedů</p>
                        <p className="text-gray-400 text-sm font-light leading-relaxed">Rádi pro tebe u našich spřátelených vinařů domluvíme soukromou ochutnávku vín přímo u nich ve sklepě.</p>
                    </div>
                    <div className="space-y-4">
                        <Bike className="text-amber-500" size={32} />
                        <p className="font-bold text-xs uppercase tracking-widest">Cyklovýlety na klíč</p>
                        <p className="text-gray-400 text-sm font-light leading-relaxed">Půjčíme ti kola přímo v objektu a poradíme trasu, kde nebudeš potkávat davy turistů.</p>
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-1/3">
                <div className="bg-white p-10 text-black text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                    <Info className="mx-auto text-amber-600 mb-6" size={40} strokeWidth={1} />
                    <h4 className="font-serif text-2xl mb-4">Interaktivní mapa okolí</h4>
                    <p className="text-gray-500 text-xs font-light leading-relaxed mb-8">Máš raději všechny body pohromadě? Podívej se na naši mapu okolí se všemi zajímavými místy.</p>
                    <a 
                      href="https://www.google.com/maps/search/turistick%C3%A9+c%C3%ADle+Mut%C4%9Bnice/@48.905624,17.0264166,13z" 
                      target="_blank" 
                      rel="noreferrer"
                      className="block w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors"
                    >
                      Otevřít v Google Maps
                    </a>
                </div>
            </div>
        </Reveal>

        <Reveal delay={0.6} className="mt-32">
           <div className="text-center mb-16">
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-800 mb-4 block">Lokalita</span>
             <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-widest">Kde nás najdeš</h2>
           </div>
           
           <div className="w-full h-[600px] bg-gray-100 shadow-2xl relative">
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2617.962071960252!2d17.026416615865243!3d48.90562400539304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471329369ec9057b%3A0xc3d8a68ba7a59af!2zVmluYcWZw2vDoSAxMjY0LCA2OTYgMTEgTXV0xJtuaWNl!5e0!3m2!1scs!2scz!4v1700000000000!5m2!1scs!2scz&z=17" 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen={true} 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               className="grayscale contrast-125 invert-[5%] opacity-90"
             ></iframe>
             <div className="absolute bottom-8 right-8 z-10">
               <a 
                 href="https://maps.google.com/?q=Vinařská+1264,+Mutěnice" 
                 target="_blank" 
                 rel="noreferrer" 
                 className="bg-black text-white px-10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-amber-800 transition-all flex items-center gap-4 shadow-3xl"
               >
                 <Navigation size={16} /> Spustit navigaci
               </a>
             </div>
           </div>
        </Reveal>
      </div>
    </div>
  );
};

export default Tips;
