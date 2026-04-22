import React, { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { addDays, format, getMonth, differenceInDays } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Reveal } from '../Reveal';
import 'react-day-picker/dist/style.css';

interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
}

const calculatePrice = (start: Date, end: Date) => {
  let total = 0;
  let current = start;
  // Počítáme noci, takže poslední den (checkout) se nepočítá
  while (current < end) {
    const month = getMonth(current); // 0 = Leden, 3 = Duben, 9 = Říjen
    if (month >= 3 && month <= 9) {
      total += 6000; // Hlavní sezóna (Duben - Říjen)
    } else {
      total += 4500; // Mimo sezónu (Listopad - Březen)
    }
    current = addDays(current, 1);
  }
  return total;
};

const Reservation: React.FC = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [nights, setNights] = useState(0);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error('Failed to fetch bookings', err));
  }, []);

  // Výpočet ceny při změně termínu
  useEffect(() => {
    if (range?.from && range?.to) {
      const n = differenceInDays(range.to, range.from);
      setNights(n);
      if (n >= 2) {
        setEstimatedPrice(calculatePrice(range.from, range.to));
      } else {
        setEstimatedPrice(0);
      }
    } else {
      setNights(0);
      setEstimatedPrice(0);
    }
  }, [range]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!range?.from || !range?.to) {
      alert('Vyberte prosím termín pobytu.');
      return;
    }
    if (nights < 2) {
      alert('Minimální délka pobytu jsou 2 noci.');
      return;
    }

    const bookingData = {
      startDate: range.from.toISOString(),
      endDate: range.to.toISOString(),
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      notes: message,
      status: 'pending' 
    };

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        if (response.ok) {
          setSubmitted(true);
          setRange(undefined);
          setName('');
          setEmail('');
          setPhone('');
          setMessage('');
        } else {
          alert('Chyba při odesílání rezervace.');
        }
    } catch (error) {
        alert('Chyba při odesílání rezervace.');
    }
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-light text-black mb-8 font-serif text-center tracking-wider uppercase">Rezervace</h1>
          <p className="text-center text-gray-400 mb-16 uppercase tracking-[0.2em] text-[10px] font-bold">V srdci vinic</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Calendar Section */}
          <Reveal delay={0.1}>
            <div className="bg-gray-50 p-8 md:p-12 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-serif mb-8 text-center uppercase tracking-wide">Výběr termínu</h3>
              <div className="flex justify-center">
                <style>{`
                  .rdp {
                    --rdp-cell-size: 45px;
                    --rdp-accent-color: #b45309;
                    --rdp-background-color: #fef3c7;
                    margin: 0;
                  }
                  .rdp-day_selected:not([disabled]), .rdp-day_selected:focus:not([disabled]), .rdp-day_selected:active:not([disabled]), .rdp-day_selected:hover:not([disabled]) {
                    background-color: var(--rdp-accent-color);
                    color: white;
                    border-radius: 2px;
                  }
                  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                    background-color: #fafaf9;
                    color: #b45309;
                  }
                `}</style>
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  locale={cs}
                  disabled={disabledDays}
                  min={2}
                  modifiersClassNames={{
                    selected: 'bg-amber-700 text-white',
                    today: 'font-bold text-amber-700 underline decoration-2'
                  }}
                />
              </div>
              <div className="mt-10 px-4">
                <div className="flex flex-col gap-3 text-xs uppercase tracking-widest text-gray-500 font-bold">
                    <div className="flex items-center gap-4">
                        <span className="w-4 h-4 bg-amber-700 rounded-sm"></span>
                        <span>Váš výběr</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="w-4 h-4 bg-gray-200 rounded-sm"></span>
                        <span>Obsazený termín</span>
                    </div>
                    <p className="mt-4 pt-4 border-t border-gray-200 italic font-normal normal-case opacity-70">
                        * Minimální délka pobytu jsou 2 noci.
                    </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Form Section */}
          <Reveal delay={0.2}>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-amber-50 border border-amber-100 min-h-[400px]">
                <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center text-white mb-6 animate-bounce">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-2xl font-serif text-black mb-4 uppercase tracking-wider">Poptávka odeslána</h3>
                <p className="text-gray-600 font-light mb-8 max-w-sm leading-relaxed">
                  Děkujeme! Vaši poptávku jsme přijali. Brzy se vám ozveme na email s potvrzením a informacemi k platbě zálohy.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] bg-black text-white px-8 py-3 hover:bg-amber-800 transition-colors"
                >
                  Nová rezervace
                </button>
              </div>
            ) : (
              <div className="bg-white">
                <h3 className="text-xl font-serif mb-10 uppercase tracking-wide">Vaše údaje</h3>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    <div className="relative group">
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="&nbsp;"
                        className="peer w-full bg-transparent border-b border-gray-200 py-3 text-black focus:outline-none focus:border-amber-700 transition-colors" 
                      />
                      <label className="absolute left-0 top-3 text-xs uppercase tracking-widest text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-amber-700 peer-[:not(:placeholder-shown)]:-top-4">Jméno a Příjmení</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative group">
                          <input 
                          type="email" 
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="&nbsp;"
                          className="peer w-full bg-transparent border-b border-gray-200 py-3 text-black focus:outline-none focus:border-amber-700 transition-colors" 
                          />
                          <label className="absolute left-0 top-3 text-xs uppercase tracking-widest text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-amber-700 peer-[:not(:placeholder-shown)]:-top-4">Email</label>
                      </div>
                      <div className="relative group">
                          <input 
                          type="tel" 
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="&nbsp;"
                          className="peer w-full bg-transparent border-b border-gray-200 py-3 text-black focus:outline-none focus:border-amber-700 transition-colors" 
                          />
                          <label className="absolute left-0 top-3 text-xs uppercase tracking-widest text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-amber-700 peer-[:not(:placeholder-shown)]:-top-4">Telefon</label>
                      </div>
                    </div>

                    <div className="relative group">
                      <textarea 
                        rows={3} 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="&nbsp;"
                        className="peer w-full bg-transparent border-b border-gray-200 py-3 text-black focus:outline-none focus:border-amber-700 transition-colors resize-none" 
                      />
                      <label className="absolute left-0 top-3 text-xs uppercase tracking-widest text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-amber-700 peer-[:not(:placeholder-shown)]:-top-4">Poznámka / Dotaz</label>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                      {range?.from && range?.to && nights >= 2 && (
                          <div className="mb-10 p-6 bg-amber-50 border border-amber-100 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-amber-800 font-bold mb-1">Vybraný termín ({nights} noci)</p>
                              <p className="text-black font-serif text-lg">{format(range.from, 'd. MMMM', { locale: cs })} – {format(range.to, 'd. MMMM yyyy', { locale: cs })}</p>
                            </div>
                            <div className="text-center md:text-right">
                              <p className="text-[10px] uppercase tracking-widest text-amber-800 font-bold mb-1">Odhadovaná cena</p>
                              <p className="text-3xl font-serif text-amber-900">{estimatedPrice.toLocaleString('cs-CZ')} Kč</p>
                            </div>
                          </div>
                      )}
                      
                      <button 
                        type="submit" 
                        disabled={nights < 2}
                        className="w-full bg-black text-white py-5 px-8 uppercase font-bold tracking-[0.2em] hover:bg-amber-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 text-xs shadow-lg"
                      >
                        Odeslat nezávaznou poptávku
                      </button>

                      <p className="mt-6 text-[10px] text-gray-400 text-center uppercase tracking-widest leading-relaxed">
                        Odesláním souhlasíte se zpracováním osobních údajů výhradně pro účely této rezervace.
                      </p>
                  </div>
                </form>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
