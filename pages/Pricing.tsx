import React from 'react';
import { Reveal } from '../Reveal';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: "Je v ceně zahrnutý úklid?",
    a: "Ano, závěrečný úklid, lůžkoviny a ručníky jsou zahrnuty v ceně pobytu. Při pobytech delších než 7 dní nabízíme výměnu ručníků zdarma."
  },
  {
    q: "Kdy je check-in a check-out?",
    a: "Standardní check-in je od 15:00, check-out do 10:00. Po předchozí domluvě a podle obsazenosti se rádi přizpůsobíme vašim potřebám."
  },
  {
    q: "Můžeme si s sebou vzít psa?",
    a: "Ano, vychovaní domácí mazlíčci jsou u nás vítáni. Prosíme jen o předchozí domluvu při rezervaci. Účtujeme jednorázový poplatek 500 Kč za úklid."
  },
  {
    q: "Je možné platit kartou?",
    a: "Zálohu přijímáme převodem na účet. Doplatek je možný uhradit převodem před příjezdem, nebo v hotovosti na místě. Platební terminál zatím nemáme."
  }
];

const Pricing: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-light text-black mb-8 font-serif text-center">CENÍK</h1>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
            Ceny jsou uvedeny za celý objekt. Minimální délka pobytu jsou 2 noci.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Standard Season */}
          <Reveal delay={0.1}>
            <div className="border border-gray-200 p-12 hover:border-black transition-colors duration-300">
              <h3 className="text-2xl font-serif mb-4">MIMO SEZÓNU</h3>
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-8">Říjen - Květen</p>
              <div className="text-5xl font-light mb-8">4.500 Kč <span className="text-lg text-gray-400">/ noc</span></div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-4 text-gray-600 font-light">
                  <Check size={16} className="text-amber-700" /> Kapacita až 8 osob
                </li>
                <li className="flex items-center gap-4 text-gray-600 font-light">
                  <Check size={16} className="text-amber-700" /> Parkování zdarma
                </li>
                <li className="flex items-center gap-4 text-gray-600 font-light">
                  <Check size={16} className="text-amber-700" /> Wi-Fi připojení
                </li>
                <li className="flex items-center gap-4 text-gray-600 font-light">
                  <Check size={16} className="text-amber-700" /> Vybavená kuchyně
                </li>
              </ul>
            </div>
          </Reveal>

          {/* High Season */}
          <Reveal delay={0.2}>
            <div className="border border-black p-12 bg-gray-50">
              <h3 className="text-2xl font-serif mb-4">HLAVNÍ SEZÓNA</h3>
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-8">Červen - Září</p>
              <div className="text-5xl font-light mb-8">6.000 Kč <span className="text-lg text-gray-400">/ noc</span></div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-4 text-gray-600 font-light">
                  <Check size={16} className="text-amber-700" /> Kapacita až 8 osob
                </li>
                <li className="flex items-center gap-4 text-gray-600 font-light">
                  <Check size={16} className="text-amber-700" /> Parkování zdarma
                </li>
                <li className="flex items-center gap-4 text-gray-600 font-light">
                  <Check size={16} className="text-amber-700" /> Wi-Fi připojení
                </li>
                <li className="flex items-center gap-4 text-gray-600 font-light">
                  <Check size={16} className="text-amber-700" /> Venkovní gril a terasa
                </li>
                <li className="flex items-center gap-4 text-gray-600 font-light">
                  <Check size={16} className="text-amber-700" /> Klimatizace
                </li>
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.3} className="mt-16 text-center">
            <h3 className="text-xl font-serif mb-4">Doplňkové informace</h3>
            <p className="text-gray-500 font-light max-w-2xl mx-auto mb-4">
                Při rezervaci se hradí záloha 50% z ceny pobytu. Doplatek na místě nebo převodem před příjezdem.
                Storno podmínky: Zrušení 30 dní předem zdarma, méně než 30 dní propadá záloha.
            </p>
        </Reveal>

        {/* FAQ Section */}
        <Reveal delay={0.4} className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-12">Často kladené dotazy</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 bg-gray-50">
                <button 
                  className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="font-medium text-black">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={20} className="text-amber-700" /> : <ChevronDown size={20} className="text-gray-400" />}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-gray-600 font-light text-sm leading-relaxed">
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
