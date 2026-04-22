import React from 'react';
import { Reveal } from '../Reveal';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: "Jak probíhá platba?",
    a: "Zálohu 50% přijímáme převodem na účet po potvrzení rezervace. Doplatek se hradí výhradně v hotovosti na místě při příjezdu. Pro firmy je po předchozí domluvě možná platba fakturou."
  },
  {
    q: "Jak je to s úklidem?",
    a: "Standardní závěrečný úklid (povlečení, ručníky) je v ceně. Žádáme hosty o základní úklid při odjezdu (vynést koše, vysvléknout povlečení). V případě potřeby generálního úklidu si vyhrazujeme právo účtovat příplatek 1 000 Kč."
  },
  {
    q: "Je v domě víno?",
    a: "Ano, k dispozici je placená samoobslužná vinotéka s výběrem kvalitních místních vín."
  },
  {
    q: "Můžeme vzít s sebou psa?",
    a: "Ano, vychovaní domácí mazlíčci jsou povoleni pouze po předchozí domluvě. Prosíme o informaci v poznámce rezervace."
  },
  {
    q: "Děláte firemní akce?",
    a: "Ano, dům je ideální pro menší teambuildingy. Lze domluvit i řízenou degustaci u místního vinaře."
  }
];

const Pricing: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-light text-black mb-4 font-serif text-center uppercase tracking-wider">Ceník</h1>
          <p className="text-gray-500 text-center mb-16 font-light uppercase tracking-[0.2em] text-xs">Cena za pronájem celého objektu</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Off Season */}
          <Reveal delay={0.1}>
            <div className="border border-gray-100 p-12 bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-500 text-center">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Mimo sezóna</h3>
              <p className="text-sm font-serif italic text-amber-900 mb-6 font-bold underline decoration-amber-200 underline-offset-4">Listopad – Březen</p>
              <div className="text-5xl font-serif mb-6 text-black">4 500 Kč</div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-10">za noc / objekt</p>
              <ul className="text-sm space-y-4 text-gray-600 font-light mb-8">
                <li className="flex items-center justify-center gap-2"><Check size={14} className="text-amber-700" /> Celý dům (kapacita 6+2)</li>
                <li className="flex items-center justify-center gap-2"><Check size={14} className="text-amber-700" /> Ložní prádlo a ručníky</li>
                <li className="flex items-center justify-center gap-2"><Check size={14} className="text-amber-700" /> Energie a Wi-Fi připojení</li>
              </ul>
            </div>
          </Reveal>

          {/* Main Season */}
          <Reveal delay={0.2}>
            <div className="border border-amber-100 p-12 bg-amber-50/30 hover:bg-white hover:shadow-2xl transition-all duration-500 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-700 text-white text-[10px] uppercase font-bold px-4 py-1 tracking-widest">Nejoblíbenější</div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-amber-800 mb-4">Hlavní sezóna</h3>
              <p className="text-sm font-serif italic text-amber-900 mb-6 font-bold underline decoration-amber-400 underline-offset-4">Duben – Říjen</p>
              <div className="text-5xl font-serif mb-6 text-black">6 000 Kč</div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-10">za noc / objekt</p>
              <ul className="text-sm space-y-4 text-gray-600 font-light mb-8">
                <li className="flex items-center justify-center gap-2"><Check size={14} className="text-amber-700" /> Celý dům (kapacita 6+2)</li>
                <li className="flex items-center justify-center gap-2"><Check size={14} className="text-amber-700" /> Venkovní posezení s grilováním</li>
                <li className="flex items-center justify-center gap-2"><Check size={14} className="text-amber-700" /> Klimatizace v ceně</li>
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.3} className="max-w-4xl mx-auto mb-24">
            <div className="bg-gray-900 text-white p-12 text-center md:text-left flex flex-col md:flex-row gap-8 items-center justify-between border-l-8 border-amber-700">
                <div>
                   <h3 className="text-2xl font-serif mb-4 uppercase tracking-wide">Platba a příjezdy</h3>
                   <p className="text-gray-400 font-light text-sm leading-relaxed max-w-lg">
                     Po potvrzení termínu se hradí 50% záloha. <br className="hidden md:block"/>
                     <span className="text-amber-500 font-bold">Doplatek se hradí v hotovosti při převzetí klíčů.</span><br/>
                     Firmám rádi připravíme fakturu po předchozí domluvě.
                   </p>
                </div>
                <div className="shrink-0 text-center bg-white/5 p-6 border border-white/10">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Zvíře po domluvě</p>
                    <p className="text-lg font-serif text-white">Domluvíme se osobně</p>
                </div>
            </div>
        </Reveal>

        {/* FAQ Section */}
        <Reveal delay={0.4} className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-12 uppercase tracking-wide">Často se ptáte</h2>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-100">
                <button 
                  className="w-full text-left py-6 flex justify-between items-center focus:outline-none group"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className={`font-medium transition-all duration-300 ${openFaq === idx ? 'text-amber-700 pl-2' : 'text-black group-hover:text-amber-700'}`}>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={20} className="text-amber-700" /> : <ChevronDown size={20} className="text-gray-300" />}
                </button>
                {openFaq === idx && (
                  <div className="pb-8 text-gray-500 font-light text-sm leading-relaxed pl-2 bg-gray-50/50 p-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default Pricing;
