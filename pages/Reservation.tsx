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
    const month = getMonth(current); // 0 = Leden, 5 = Červen, 8 = Září
    if (month >= 5 && month <= 8) {
      total += 6000; // Hlavní sezóna
    } else {
      total += 4500; // Mimo sezónu
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
      status: 'pending' 
    };

    try {
        await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        setSubmitted(true);
        setRange(undefined);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
    } catch (error) {
        alert('Chyba při odesílání rezervace.');
    }
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-light text-black mb-16 font-serif text-center">REZERVACE</h1>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Calendar Section */}
          <Reveal delay={0.1}>
            <div className="bg-gray-50 p-8 rounded-none border border-gray-100">
              <h3 className="text-xl font-serif mb-6 text-center">Vyberte termín</h3>
              <div className="flex justify-center">
                <style>{`
                  .rdp {
                    --rdp-cell-size: 40px;
                    --rdp-accent-color: #b45309;
                    --rdp-background-color: #fef3c7;
                    margin: 0;
                  }
                  .rdp-day_selected:not([disabled]), .rdp-day_selected:focus:not([disabled]), .rdp-day_selected:active:not([disabled]), .rdp-day_selected:hover:not([disabled]) {
                    background-color: var(--rdp-accent-color);
                    color: white;
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
                    today: 'font-bold text-amber-700'
                  }}
                />
              </div>
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Minimální délka pobytu: 2 noci</p>
                <div className="flex items-center justify-center gap-4 mt-2">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-700 rounded-full"></span> Vybráno</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-300 rounded-full opacity-50"></span> Obsazeno</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Form Section */}
          <Reveal delay={0.2}>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-green-50 border border-green-100">
                <h3 className="text-2xl font-serif text-green-800 mb-4">Poptávka odeslána!</h3>
                <p className="text-green-700 mb-8">
                  Děkujeme za váš zájem. Brzy vás budeme kontaktovat na uvedený email pro potvrzení termínu a doladění detailů.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold uppercase tracking-widest border-b border-green-800 pb-1 text-green-800 hover:text-black hover:border-black transition-colors"
                >
                  Nová rezervace
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-serif mb-8">Kontaktní údaje</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="group">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Jméno a Příjmení</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 py-3 text-black focus:outline-none focus:border-black transition-colors" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
                        <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 py-3 text-black focus:outline-none focus:border-black transition-colors" 
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Telefon</label>
                        <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 py-3 text-black focus:outline-none focus:border-black transition-colors" 
                        />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Zpráva (nepovinné)</label>
                    <textarea 
                      rows={4} 
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 py-3 text-black focus:outline-none focus:border-black transition-colors" 
                    />
                  </div>
                  
                  <div className="pt-4">
                      {range?.from && range?.to && nights >= 2 && (
                          <div className="mb-6 p-4 bg-gray-50 border border-gray-100 flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">Vybraný termín ({nights} noci):</p>
                              <p className="text-black font-bold">{format(range.from, 'd.M.yyyy')} - {format(range.to, 'd.M.yyyy')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Odhadovaná cena:</p>
                              <p className="text-2xl font-serif text-amber-700">{estimatedPrice.toLocaleString('cs-CZ')} Kč</p>
                            </div>
                          </div>
                      )}
                      {range?.from && range?.to && nights < 2 && (
                          <p className="text-sm text-red-500 mb-4">
                              Minimální délka pobytu jsou 2 noci.
                          </p>
                      )}
                      <button 
                        type="submit" 
                        disabled={nights < 2}
                        className="w-full bg-black text-white py-4 uppercase font-bold tracking-widest hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300 text-xs"
                      >
                        Odeslat nezávaznou poptávku
                      </button>
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
