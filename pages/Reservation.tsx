import React, { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { addDays, format, getMonth, differenceInDays } from 'date-fns';
import { Helmet } from 'react-helmet-async';
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
  const [guests, setGuests] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');
  const [submitted, setSubmitted] = useState(false);
  const [successPrice, setSuccessPrice] = useState<number>(0);
  
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [nights, setNights] = useState(0);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error('Failed to fetch bookings', err));
  }, []);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string, discount: string } | null>(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [isPromoChecking, setIsPromoChecking] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);

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

  useEffect(() => {
    let price = estimatedPrice;
    if (appliedPromo) {
        if (appliedPromo.discount.includes('%')) {
            const percent = parseInt(appliedPromo.discount.replace('%', ''));
            price = Math.floor(price * (1 - percent / 100));
        } else if (appliedPromo.discount.includes('Kč') || appliedPromo.discount.includes('CZK')) {
            const amount = parseInt(appliedPromo.discount.replace(/\\D/g, ''));
            price = Math.max(0, price - amount);
        }
    }
    setFinalPrice(price);
  }, [estimatedPrice, appliedPromo]);

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

  const handleRangeSelect = (newRange: DateRange | undefined) => {
    if (!newRange) {
      setRange(undefined);
      return;
    }
    if (newRange.from && newRange.to) {
      const start = new Date(newRange.from);
      start.setHours(0,0,0,0);
      const end = new Date(newRange.to);
      end.setHours(0,0,0,0);
      
      const overlap = disabledDays.some(disabledDay => {
        const d = new Date(disabledDay);
        d.setHours(0,0,0,0);
        return d >= start && d <= end;
      });
      
      if (overlap) {
        setRange({ from: newRange.from });
        return;
      }
    }
    setRange(newRange);
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setIsPromoChecking(true);
    setPromoMessage('');
    try {
      const res = await fetch('/api/check-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCodeInput.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedPromo({ code: promoCodeInput.trim(), discount: data.discount });
        setPromoMessage(`Slevový kód uplatněn: ${data.discount}`);
        setPromoCodeInput('');
      } else {
        setPromoMessage(data.error || 'Neplatný kód');
        setAppliedPromo(null);
      }
    } catch {
      setPromoMessage('Chyba při ověřování kódu');
    } finally {
      setIsPromoChecking(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoMessage('');
  };

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
      guests: guests,
      paymentMethod: paymentMethod === 'transfer' ? 'převodem' : 'hotově',
      promoCode: appliedPromo ? appliedPromo.code : '',
      notes: `${message}\n\nPočet hostů: ${guests}\nDoplatek: ${paymentMethod === 'transfer' ? 'Převodem' : 'Hotově'}${appliedPromo ? `\nUplatněn promo kód: ${appliedPromo.code} (${appliedPromo.discount})` : ''}`,
      status: 'pending' 
    };

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        if (response.ok) {
          setSuccessPrice(finalPrice);
          setSubmitted(true);
          setRange(undefined);
          setName('');
          setEmail('');
          setPhone('');
          setMessage('');
          setAppliedPromo(null);
        } else {
          alert('Chyba při odesílání rezervace.');
        }
    } catch (error) {
        alert('Chyba při odesílání rezervace.');
    }
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <Helmet>
        <title>Rezervace ubytování | Ubytování Mutěnice</title>
        <meta name="description" content="Rezervujte si svůj pobyt V SRDCI VINIC online. Vyberte si termín ubytování v Mutěnicích a zažijte skvělou dovolenou na jižní Moravě." />
      </Helmet>
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
                  onSelect={handleRangeSelect}
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
                <h3 className="text-2xl font-serif text-black mb-4 uppercase tracking-wider">Rezervace odeslána</h3>
                <p className="text-gray-600 font-light mb-8 max-w-sm leading-relaxed">
                  Děkujeme! Vaši poptávku jsme přijali. Pro závazné potvrzení prosím uhraďte zálohu (50 %). Zbylá část bude doplacena při příjezdu dle Vaší volby.
                </p>
                
                <div className="bg-white p-6 rounded-md shadow-sm mb-8 mx-auto inline-block border border-gray-100 max-w-md w-full">
                  <p className="font-bold text-xs uppercase tracking-widest text-amber-700 mb-4">Platba zálohy přes QR kód</p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SPD*1.0*ACC%3ACZ8555000000008029338001*AM%3A${Math.floor(successPrice / 2)}.00*CC%3ACZK*MSG%3AZaloha%20ubytovani`} 
                    alt="QR kód pro platbu zálohy" 
                    className="mx-auto w-40 h-40"
                  />
                  
                  <div className="mt-6 border-t border-gray-100 pt-4 text-left text-xs space-y-2">
                    <div className="flex justify-between items-center text-amber-900 font-serif mb-2 bg-amber-50/50 p-2 border border-amber-100/50">
                      <span className="text-[10px] uppercase tracking-wider text-amber-800 font-sans font-bold">Záloha 50% k úhradě:</span>
                      <strong className="text-base font-bold">{Math.floor(successPrice / 2).toLocaleString('cs-CZ')} Kč</strong>
                    </div>
                    <p className="flex justify-between border-t border-gray-50 pt-2">
                      <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">Číslo účtu:</span>
                      <span className="font-mono text-black font-semibold">8029338001 / 5500</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">Banka:</span>
                      <span className="text-black">Raiffeisenbank</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">IBAN:</span>
                      <span className="font-mono text-black text-[10px]">CZ85 5500 0000 0080 2933 8001</span>
                    </p>
                  </div>

                  <p className="text-[10px] text-gray-400 mt-6 leading-relaxed text-center">
                    Zaslali jsme Vám také e-mail s nejrůznějšími informacemi a platebními údaji.
                  </p>
                </div>

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
                        <input 
                        type="number" 
                        required
                        min="1"
                        max="8"
                        value={guests}
                        onChange={e => setGuests(parseInt(e.target.value))}
                        placeholder="&nbsp;"
                        className="peer w-full bg-transparent border-b border-gray-200 py-3 text-black focus:outline-none focus:border-amber-700 transition-colors" 
                        />
                        <label className="absolute left-0 top-3 text-xs uppercase tracking-widest text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-amber-700 peer-[:not(:placeholder-shown)]:-top-4">Počet hostů</label>
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

                    <div className="bg-gray-50 p-4 border border-gray-100 flex flex-col gap-4">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Máte promo kód?</label>
                      {appliedPromo ? (
                        <div className="flex justify-between items-center bg-green-50 text-green-800 p-3 border border-green-200">
                          <span className="text-sm">
                            <strong className="uppercase font-bold tracking-widest">{appliedPromo.code}</strong>: {appliedPromo.discount}
                          </span>
                          <button type="button" onClick={handleRemovePromo} className="text-xs uppercase font-bold tracking-widest hover:underline">Odstranit</button>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <input 
                            type="text" 
                            name="promo"
                            id="promoInputFields"
                            autoComplete="off"
                            value={promoCodeInput}
                            onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                            placeholder="Vložte kód"
                            className="bg-white border text-sm uppercase border-gray-200 p-3 flex-1 focus:outline-none focus:border-amber-700"
                          />
                          <button 
                            type="button" 
                            onClick={handleApplyPromo}
                            disabled={isPromoChecking}
                            className="bg-black text-white px-6 uppercase text-[10px] font-bold tracking-widest hover:bg-amber-900 transition-colors disabled:opacity-50"
                          >
                            Použít
                          </button>
                        </div>
                      )}
                      {promoMessage && !appliedPromo && <p className="text-xs text-amber-700">{promoMessage}</p>}
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-light text-gray-600 mb-6 bg-gray-50 border border-gray-100 p-4 leading-relaxed">
                        <strong className="text-black font-medium">Záloha 50 % z ceny pobytu </strong>se hradí předem prostřednictvím QR kódu nebo převodem (podklady obdržíte emailem po odeslání rezervace). Níže si prosím vyberte, jakou formou preferujete doplácet zbylých 50 % při příjezdu.
                      </p>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-4">Doplatek (50%) při příjezdu</label>
                      <div className="flex flex-col sm:flex-row gap-6">
                        <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-all flex-1 ${paymentMethod === 'transfer' ? 'border-amber-700 bg-amber-50' : 'border-gray-100 hover:border-gray-300'}`}>
                          <input 
                            type="radio" 
                            name="payment" 
                            checked={paymentMethod === 'transfer'} 
                            onChange={() => setPaymentMethod('transfer')}
                            className="accent-amber-700"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-widest text-black">Převodem před příjezdem</span>
                            <span className="text-[10px] text-gray-400">Zašleme Vám výzvu na doplatek</span>
                          </div>
                        </label>
                        <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-all flex-1 ${paymentMethod === 'cash' ? 'border-amber-700 bg-amber-50' : 'border-gray-100 hover:border-gray-300'}`}>
                          <input 
                            type="radio" 
                            name="payment" 
                            checked={paymentMethod === 'cash'} 
                            onChange={() => setPaymentMethod('cash')}
                            className="accent-amber-700"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-widest text-black">Hotově na místě</span>
                            <span className="text-[10px] text-gray-400">Při předání klíčů</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                      {range?.from && range?.to && nights >= 2 && (
                          <div className="mb-10 p-6 bg-amber-50 border border-amber-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-amber-800 font-bold mb-1">Vybraný termín ({nights} noci)</p>
                              <p className="text-black font-serif text-lg">{format(range.from, 'd. MMMM', { locale: cs })} – {format(range.to, 'd. MMMM yyyy', { locale: cs })}</p>
                            </div>
                            <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 border-amber-200/50 pt-4 md:pt-0">
                                <div className="space-y-2">
                                  <div className="flex justify-between md:justify-end gap-8">
                                    <span className="text-[10px] uppercase tracking-widest text-amber-800 font-bold">Celková cena:</span>
                                    <span className="font-serif text-amber-900">{finalPrice.toLocaleString('cs-CZ')} Kč</span>
                                  </div>
                                  <div className="flex justify-between md:justify-end gap-8">
                                    <span className="text-[10px] uppercase tracking-widest text-amber-800 font-bold">Záloha (50 % předem):</span>
                                    <span className="font-serif text-amber-900 font-bold">{(finalPrice / 2).toLocaleString('cs-CZ')} Kč</span>
                                  </div>
                                  <div className="flex justify-between md:justify-end gap-8">
                                    <span className="text-[10px] uppercase tracking-widest text-amber-800 font-bold">Doplatek ({paymentMethod === 'cash' ? 'hotově' : 'převodem'}):</span>
                                    <span className="font-serif text-amber-900">{(finalPrice / 2).toLocaleString('cs-CZ')} Kč</span>
                                  </div>
                                </div>
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
