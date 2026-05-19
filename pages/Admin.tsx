import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Trash2, Plus, Users, Calendar, TrendingUp, Phone, Mail, MessageSquare, X, Landmark, Receipt, Edit2, Eye, CheckCircle, CheckSquare } from 'lucide-react';

interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  guests?: number;
  paymentMethod?: string;
  status: string;
}

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

interface PromoCode {
  id: number;
  code: string;
  discount: string;
  expiresAt: string | null;
  isActive: number;
}

const ADMIN_PASSWORD = 'vinice123'; // V produkci doporučujeme přesunout do .env jako VITE_ADMIN_PASSWORD

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'events' | 'promos'>('bookings');
  
  // Manual booking form
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  
  // Event form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState('U nás');
  const [eventLink, setEventLink] = useState('');
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  // Promo form
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoExpiresAt, setPromoExpiresAt] = useState('');
  const [promoIsActive, setPromoIsActive] = useState(true);
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);

  const [showPaymentFor, setShowPaymentFor] = useState<Booking | null>(null);
  const [showDetailsFor, setShowDetailsFor] = useState<Booking | null>(null);
  const [cancelBookingFor, setCancelBookingFor] = useState<Booking | null>(null);
  const [cancelMessage, setCancelMessage] = useState('');
  
  const [sendingAction, setSendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
      fetchEvents();
      fetchPromos();
    }
  }, [isAuthenticated]);

  const fetchBookings = () => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error(err));
  };

  const fetchEvents = () => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  };

  const fetchPromos = () => {
    fetch('/api/promo-codes')
      .then(res => res.json())
      .then(data => setPromos(data))
      .catch(err => console.error(err));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Špatné heslo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Opravdu smazat tuto rezervaci?')) return;
    
    try {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      fetchBookings();
    } catch (error) {
      alert('Chyba při mazání');
    }
  };

  const handleConfirm = async (id: number) => {
    if (!confirm('Chcete tuto rezervaci potvrdit? Hostovi bude odeslán e-mail.')) return;
    try {
      await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' })
      });
      fetchBookings();
    } catch (error) {
      alert('Chyba při potvrzování');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Opravdu chcete tuto rezervaci stornovat? Termín se opět uvolní.')) return;
    try {
      await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      fetchBookings();
    } catch (error) {
      alert('Chyba při stornování');
    }
  };

  const handleCancelWithMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelBookingFor) return;
    try {
      setSendingAction('cancel');
      await fetch(`/api/bookings/${cancelBookingFor.id}/cancel-with-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cancelMessage })
      });
      fetchBookings();
      setCancelBookingFor(null);
      setCancelMessage('');
    } catch (error) {
      alert('Chyba při stornování');
    } finally {
      setSendingAction(null);
    }
  };

  const handleSendDepositPaid = async (id: number) => {
    if (!confirm('Odeslat potvrzení o přijetí zálohy hostovi na e-mail?')) return;
    setSendingAction(`deposit-${id}`);
    try {
      const res = await fetch(`/api/bookings/${id}/send-deposit-paid`, { method: 'POST' });
      if (res.ok) alert('Potvrzení úspěšně odesláno.');
      else alert('E-mail se nepodařilo odeslat.');
    } catch (error) {
      alert('Chyba při odesílání e-mailu.');
    } finally {
      setSendingAction(null);
    }
  };

  const handleSendFullyPaid = async (id: number) => {
    if (!confirm('Odeslat potvrzení o plné úhradě hostovi na e-mail?')) return;
    setSendingAction(`fully-${id}`);
    try {
      const res = await fetch(`/api/bookings/${id}/send-fully-paid`, { method: 'POST' });
      if (res.ok) alert('Poděkování úspěšně odesláno.');
      else alert('E-mail se nepodařilo odeslat.');
    } catch (error) {
      alert('Chyba při odesílání e-mailu.');
    } finally {
      setSendingAction(null);
    }
  };

  const [sendingThanks, setSendingThanks] = useState<number | null>(null);
  const handleSendThanks = async (id: number) => {
    if (!confirm('Odeslat poděkování hostovi na e-mail?')) return;
    setSendingThanks(id);
    try {
      const res = await fetch(`/api/bookings/${id}/send-thanks`, { method: 'POST' });
      if (res.ok) {
        alert('Poděkování bylo úspěšně odesláno.');
      } else {
        alert('E-mail se nepodařilo odeslat. Možná není k dispozici adresa zadána zákazníkem.');
      }
    } catch (error) {
      alert('Chyba při odesílání e-mailu.');
    } finally {
      setSendingThanks(null);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: new Date(manualStart).toISOString(),
          endDate: new Date(manualEnd).toISOString(),
          customerName: manualName || 'Blokace termínu',
          customerEmail: 'admin@local',
          customerPhone: manualPhone,
          notes: manualNotes,
          status: 'confirmed'
        })
      });
      fetchBookings();
      setManualStart('');
      setManualEnd('');
      setManualName('');
      setManualPhone('');
      setManualNotes('');
    } catch (error) {
      alert('Chyba při přidávání');
    }
  };

  const handleEventSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: eventTitle,
      date: eventDate,
      startDate: eventStartDate,
      endDate: eventEndDate,
      desc: eventDesc,
      type: eventType,
      link: eventLink
    };
    
    try {
      if (editingEventId) {
        await fetch(`/api/events/${editingEventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      fetchEvents();
      handleEventCancel();
    } catch (error) {
      alert('Chyba při ukládání akce');
    }
  };

  const handleEventDelete = async (id: number) => {
    if (!confirm('Opravdu smazat tuto akci?')) return;
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (error) {
      alert('Chyba při mazání');
    }
  };

  const handleEventEdit = (evt: EventItem) => {
    setEditingEventId(evt.id);
    setEventTitle(evt.title);
    setEventDate(evt.date);
    setEventStartDate(evt.startDate || '');
    setEventEndDate(evt.endDate || '');
    setEventDesc(evt.desc);
    setEventType(evt.type);
    setEventLink(evt.link || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventCancel = () => {
    setEditingEventId(null);
    setEventTitle('');
    setEventDate('');
    setEventStartDate('');
    setEventEndDate('');
    setEventDesc('');
    setEventType('U nás');
    setEventLink('');
  };

  const handlePromoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: promoCode,
      discount: promoDiscount,
      expiresAt: promoExpiresAt,
      isActive: promoIsActive ? 1 : 0
    };
    
    try {
      const res = editingPromoId 
        ? await fetch(`/api/promo-codes/${editingPromoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        : await fetch('/api/promo-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Chyba při ukládání');
      }
      
      fetchPromos();
      handlePromoCancel();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handlePromoDelete = async (id: number) => {
    if (!confirm('Opravdu smazat tento kód?')) return;
    try {
      await fetch(`/api/promo-codes/${id}`, { method: 'DELETE' });
      fetchPromos();
    } catch (error) {
      alert('Chyba při mazání');
    }
  };

  const handlePromoEdit = (promo: PromoCode) => {
    setEditingPromoId(promo.id);
    setPromoCode(promo.code);
    setPromoDiscount(promo.discount);
    setPromoExpiresAt(promo.expiresAt || '');
    setPromoIsActive(promo.isActive === 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePromoCancel = () => {
    setEditingPromoId(null);
    setPromoCode('');
    setPromoDiscount('');
    setPromoExpiresAt('');
    setPromoIsActive(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
        <form onSubmit={handleLogin} className="bg-white p-12 shadow-2xl w-full max-w-md border-t-8 border-amber-900 rounded-sm">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif mb-2 uppercase tracking-widest">Administrace</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">V srdci vinic</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Přístupové heslo</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-b border-gray-200 p-3 focus:outline-none focus:border-amber-900 transition-colors"
                autoFocus
              />
            </div>
            <button type="submit" className="w-full bg-black text-white py-4 uppercase font-bold text-xs tracking-[0.2em] hover:bg-amber-900 transition-colors shadow-lg">
              Přihlásit se
            </button>
          </div>
        </form>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => b.status !== 'cancelled' && new Date(b.startDate) >= new Date()).length;
  const totalBookings = bookings.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 md:px-12">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-wider">Administrace</h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-2">V srdci vinic – Dashboard</p>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)} 
              className="text-[10px] font-bold uppercase tracking-widest bg-white border border-gray-200 px-6 py-2 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
            >
              Odhlásit se
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-12">
          <button 
            onClick={() => setActiveTab('bookings')} 
            className={`px-8 py-4 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'bookings' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
          >
            Rezervace
          </button>
          <button 
            onClick={() => setActiveTab('events')} 
            className={`px-8 py-4 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'events' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
          >
            Akce
          </button>
          <button 
            onClick={() => setActiveTab('promos')} 
            className={`px-8 py-4 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'promos' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
          >
            Promo kódy
          </button>
        </div>

        {activeTab === 'bookings' ? (
          <>
            {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 shadow-sm flex items-center gap-6 border-l-8 border-amber-900 rounded-sm">
            <div className="p-4 bg-amber-50 rounded-sm text-amber-900">
              <Calendar size={32} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Nadcházející</p>
              <p className="text-3xl font-serif text-black">{upcomingBookings}</p>
            </div>
          </div>
          <div className="bg-white p-8 shadow-sm flex items-center gap-6 border-l-8 border-black rounded-sm">
            <div className="p-4 bg-gray-50 rounded-sm text-black">
              <Users size={32} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Registrované v systému</p>
              <p className="text-3xl font-serif text-black">{totalBookings}</p>
            </div>
          </div>
          <div className="bg-white p-8 shadow-sm flex items-center gap-6 border-l-8 border-green-600 rounded-sm">
            <div className="p-4 bg-green-50 rounded-sm text-green-600">
              <TrendingUp size={32} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Stav systému</p>
              <p className="text-xl font-serif text-green-600 uppercase tracking-widest">Aktivní</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          {/* Add New */}
          <div className="xl:col-span-1">
            <div className="bg-white p-8 shadow-sm sticky top-32">
              <h2 className="text-lg font-serif mb-8 flex items-center gap-3 uppercase tracking-wider">
                <Plus size={20} className="text-amber-700" /> Nová Blokace
              </h2>
              <form onSubmit={handleManualAdd} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Příjezd</label>
                  <input type="date" required value={manualStart} onChange={e => setManualStart(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Odjezd</label>
                  <input type="date" required value={manualEnd} onChange={e => setManualEnd(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Jméno / Účel</label>
                  <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Blokace, Úklid..." className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Telefon (volitelné)</label>
                  <input type="tel" value={manualPhone} onChange={e => setManualPhone(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Interní poznámka</label>
                  <textarea rows={2} value={manualNotes} onChange={e => setManualNotes(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700 resize-none font-light text-sm" />
                </div>
                <button type="submit" className="w-full bg-black text-white py-4 uppercase font-bold text-[10px] tracking-widest hover:bg-amber-900 transition-colors shadow-md mt-4">
                  Zaslat do kalendáře
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="xl:col-span-3">
            <div className="bg-white p-8 md:p-12 shadow-sm min-h-[600px]">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-serif uppercase tracking-wider">Seznam všech termínů</h2>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Seřazeno od nejnovějších</div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="pb-6 w-48">Termín pobytu</th>
                      <th className="pb-6">Zákazník / Kontakt</th>
                      <th className="pb-6">Poznámka hosta / Interní</th>
                      <th className="pb-6 text-right">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="group hover:bg-amber-50/30 transition-colors">
                        <td className="py-6 align-top">
                          <p className="text-sm font-serif text-black mb-1">
                            {format(new Date(booking.startDate), 'd. M. yyyy')} – {format(new Date(booking.endDate), 'd. M. yyyy')}
                          </p>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {booking.status === 'confirmed' ? 'Potvrzeno' : 
                             booking.status === 'cancelled' ? 'Stornováno' : 
                             'Čeká na vyřízení'}
                          </span>
                        </td>
                        <td className="py-6 align-top">
                          <p className="text-sm font-bold text-black mb-2">{booking.customerName}</p>
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 text-xs text-amber-700 font-medium mb-2">
                               <Users size={12} /> {booking.guests || 2} osob
                               <span className="text-gray-300">|</span> 
                               <Landmark size={12} /> {booking.paymentMethod || 'hotově'}
                             </div>
                             {booking.customerEmail && (
                               <a href={`mailto:${booking.customerEmail}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-amber-700 transition-colors">
                                 <Mail size={12} /> {booking.customerEmail}
                               </a>
                             )}
                             {booking.customerPhone && (
                               <a href={`tel:${booking.customerPhone}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-amber-700 transition-colors">
                                 <Phone size={12} /> {booking.customerPhone}
                               </a>
                             )}
                          </div>
                        </td>
                        <td className="py-6 align-top max-w-xs">
                          {booking.notes ? (
                            <div className="flex gap-2 text-gray-500 font-light text-xs leading-relaxed italic">
                               <MessageSquare size={14} className="shrink-0 text-amber-600 mt-0.5" />
                               <p>{booking.notes}</p>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-[10px] uppercase font-bold tracking-widest italic">Bez poznámky</span>
                          )}
                        </td>
                        <td className="py-6 text-right align-top">
                            <div className="flex justify-end items-center gap-1.5 flex-wrap w-full">
                              <button 
                                onClick={() => setShowDetailsFor(booking)}
                                className="bg-white border border-gray-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-sm shadow-sm flex items-center"
                                title="Detail rezervace (Očičko)"
                              >
                                <Eye size={16} strokeWidth={1.5} />
                              </button>
                              
                              {booking.status === 'pending' && (
                                <button 
                                  onClick={() => handleConfirm(booking.id)}
                                  className="bg-green-600 text-white p-2 text-[10px] uppercase font-bold tracking-widest hover:bg-green-700 transition-all rounded-sm shadow-sm"
                                  title="Potvrdit rezervaci"
                                >
                                  Potvrdit
                                </button>
                              )}
                              
                              {booking.status === 'confirmed' && (
                                <>
                                  <button 
                                    onClick={() => handleSendDepositPaid(booking.id)}
                                    disabled={sendingAction === `deposit-${booking.id}`}
                                    className={`bg-white border border-amber-200 p-2 text-[10px] uppercase font-bold tracking-widest transition-all rounded-sm shadow-sm ${sendingAction === `deposit-${booking.id}` ? 'text-gray-300' : 'text-amber-700 hover:bg-amber-50'}`}
                                    title="Záloha zaplacena a potvrzení termínu"
                                  >
                                    <CheckSquare size={14} className="inline mr-1" />Záloha
                                  </button>
                                  <button 
                                    onClick={() => handleSendFullyPaid(booking.id)}
                                    disabled={sendingAction === `fully-${booking.id}`}
                                    className={`bg-white border border-green-200 p-2 text-[10px] uppercase font-bold tracking-widest transition-all rounded-sm shadow-sm ${sendingAction === `fully-${booking.id}` ? 'text-gray-300' : 'text-green-700 hover:bg-green-50'}`}
                                    title="Zaplaceno vše, potvrzení platby"
                                  >
                                    <CheckCircle size={14} className="inline mr-1" />Více / Vše
                                  </button>
                                </>
                              )}

                              {booking.status !== 'cancelled' && (
                                <button 
                                  onClick={() => setCancelBookingFor(booking)}
                                  className="bg-white border border-gray-200 p-2 text-[10px] uppercase font-bold tracking-widest text-red-600 hover:bg-red-50 transition-all rounded-sm shadow-sm"
                                  title="Stornovat rezervaci se zprávou"
                                >
                                  Storno
                                </button>
                              )}
                              
                              <button 
                                onClick={() => setShowPaymentFor(booking)}
                                className="bg-white border border-gray-100 p-2 text-gray-400 hover:text-amber-700 hover:bg-amber-50/50 transition-all rounded-sm shadow-sm"
                                title="Vygenerovat podklady k platbě"
                              >
                                <Receipt size={16} strokeWidth={1.5} />
                              </button>
                              
                              <button 
                                onClick={() => handleSendThanks(booking.id)}
                                disabled={sendingThanks === booking.id}
                                className={`bg-white border border-gray-100 p-2 transition-all rounded-sm shadow-sm flex items-center ${sendingThanks === booking.id ? 'text-gray-300' : 'text-gray-400 hover:text-amber-700 hover:bg-amber-50/50'}`}
                                title="Odeslat e-mail 'Děkujeme za návštěvu' (recenze na IG)"
                              >
                                <Mail size={16} strokeWidth={1.5} />
                              </button>
                              
                              <button 
                                onClick={() => handleDelete(booking.id)}
                                className="bg-white border border-gray-100 p-2 text-gray-300 hover:text-red-700 hover:bg-red-50/50 transition-all rounded-sm shadow-sm"
                                title="Odstranit záznam kompletně"
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-gray-300">
                          <div className="flex flex-col items-center gap-4">
                            <Calendar size={48} strokeWidth={1} className="opacity-20" />
                            <p className="text-xs uppercase tracking-[0.2em] font-bold">Zatím žádné rezervace</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
          </>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
            {/* Add/Edit Event */}
            <div className="xl:col-span-1">
              <div className="bg-white p-8 shadow-sm sticky top-32">
                <h2 className="text-lg font-serif mb-8 flex items-center gap-3 uppercase tracking-wider">
                  <Plus size={20} className="text-amber-700" /> {editingEventId ? 'Upravit Akci' : 'Nová Akce'}
                </h2>
                <form onSubmit={handleEventSave} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Název akce</label>
                    <input type="text" required value={eventTitle} onChange={e => setEventTitle(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Termín</label>
                    <input type="text" required placeholder="Např. Duben 2026" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Počátek (pro automatické skrývání)</label>
                      <input type="date" value={eventStartDate} onChange={e => setEventStartDate(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700 text-xs text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Konec</label>
                      <input type="date" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700 text-xs text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Odkaz (volitelný)</label>
                    <input type="url" placeholder="https://" value={eventLink} onChange={e => setEventLink(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Typ / Místo</label>
                    <input type="text" required placeholder="Např. U nás, V obci, Místní akce" value={eventType} onChange={e => setEventType(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Popis</label>
                    <textarea rows={4} required value={eventDesc} onChange={e => setEventDesc(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700 resize-none font-light text-sm" />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-black text-white py-4 uppercase font-bold text-[10px] tracking-widest hover:bg-amber-900 transition-colors shadow-md">
                      {editingEventId ? 'Uložit' : 'Přidat'}
                    </button>
                    {editingEventId && (
                      <button type="button" onClick={handleEventCancel} className="bg-gray-100 text-gray-600 px-6 py-4 uppercase font-bold text-[10px] tracking-widest hover:bg-gray-200 transition-colors shadow-md">
                        Zrušit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* List Events */}
            <div className="xl:col-span-3">
              <div className="bg-white p-8 md:p-12 shadow-sm min-h-[600px]">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-xl font-serif uppercase tracking-wider">Seznam vytvořených akcí</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        <th className="pb-6 w-48">Akce a Termín</th>
                        <th className="pb-6">Popis</th>
                        <th className="pb-6 text-right">Správa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {events.map((evt) => (
                        <tr key={evt.id} className="group hover:bg-amber-50/30 transition-colors">
                          <td className="py-6 align-top">
                            <p className="text-sm font-bold text-black mb-1">{evt.title}</p>
                            <p className="text-xs text-gray-500">{evt.date}</p>
                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 mt-2 inline-block">
                              {evt.type}
                            </span>
                          </td>
                          <td className="py-6 align-top max-w-md">
                             <p className="text-sm font-light text-gray-600 leading-relaxed">{evt.desc}</p>
                          </td>
                          <td className="py-6 text-right align-top">
                            <div className="flex justify-end items-center gap-2">
                              <button 
                                onClick={() => handleEventEdit(evt)}
                                className="bg-white border border-gray-100 p-2.5 text-gray-400 hover:text-amber-700 hover:border-amber-100 hover:bg-amber-50/50 transition-all rounded-sm shadow-sm"
                                title="Upravit"
                              >
                                <Edit2 size={16} strokeWidth={1.5} />
                              </button>
                              <button 
                                onClick={() => handleEventDelete(evt.id)}
                                className="bg-white border border-gray-100 p-2.5 text-gray-300 hover:text-red-700 hover:border-red-100 hover:bg-red-50/50 transition-all rounded-sm shadow-sm"
                                title="Odstranit"
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {events.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-16 text-center text-gray-300">
                            <div className="flex flex-col items-center gap-4">
                              <Calendar size={48} strokeWidth={1} className="opacity-20" />
                              <p className="text-xs uppercase tracking-[0.2em] font-bold">Zatím žádné akce</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
            {/* Add/Edit Promo */}
            <div className="xl:col-span-1">
              <div className="bg-white p-8 shadow-sm text-sm">
                <h2 className="text-lg font-serif mb-8 flex items-center gap-3 uppercase tracking-wider">
                  <Plus size={20} className="text-amber-700" /> {editingPromoId ? 'Upravit promo kód' : 'Nový promo kód'}
                </h2>
                <form onSubmit={handlePromoSave} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Kód (např. LÉTO26)</label>
                    <input type="text" required value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700 uppercase" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Sleva (popis)</label>
                    <input type="text" required placeholder="Např. -10 %" value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Expirace (volitelně)</label>
                    <input type="date" value={promoExpiresAt} onChange={e => setPromoExpiresAt(e.target.value)} className="w-full border-b border-gray-100 p-2 focus:outline-none focus:border-amber-700 text-gray-500" />
                  </div>
                  <div className="flex items-center gap-3 pb-2 pt-2">
                    <input type="checkbox" id="promoActive" checked={promoIsActive} onChange={e => setPromoIsActive(e.target.checked)} className="w-4 h-4 text-amber-700 focus:ring-amber-500 border-gray-300 rounded" />
                    <label htmlFor="promoActive" className="text-xs uppercase tracking-widest text-gray-600 font-bold">Kód je aktivní</label>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-black text-white py-4 uppercase font-bold text-[10px] tracking-widest hover:bg-amber-900 transition-colors shadow-md">
                      {editingPromoId ? 'Uložit' : 'Přidat'}
                    </button>
                    {editingPromoId && (
                      <button type="button" onClick={handlePromoCancel} className="bg-gray-100 text-gray-600 px-6 py-4 uppercase font-bold text-[10px] tracking-widest hover:bg-gray-200 transition-colors shadow-md">
                        Zrušit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* List Promos */}
            <div className="xl:col-span-3">
              <div className="bg-white p-8 md:p-12 shadow-sm min-h-[600px]">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-xl font-serif uppercase tracking-wider">Správa promo kódů</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        <th className="pb-6">Kód</th>
                        <th className="pb-6">Sleva</th>
                        <th className="pb-6">Platnost</th>
                        <th className="pb-6">Stav</th>
                        <th className="pb-6 text-right">Správa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {promos.map((promo) => (
                        <tr key={promo.id} className="group hover:bg-amber-50/30 transition-colors">
                          <td className="py-6 align-top">
                            <p className="text-sm font-bold text-black uppercase tracking-widest">{promo.code}</p>
                          </td>
                          <td className="py-6 align-top">
                             <p className="text-sm font-light text-gray-600 leading-relaxed">{promo.discount}</p>
                          </td>
                          <td className="py-6 align-top text-sm font-light text-gray-600">
                             {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Bez expirace'}
                          </td>
                          <td className="py-6 align-top">
                             <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {promo.isActive ? 'Aktivní' : 'Neaktivní'}
                             </span>
                          </td>
                          <td className="py-6 text-right align-top">
                            <div className="flex justify-end items-center gap-2">
                              <button 
                                onClick={() => handlePromoEdit(promo)}
                                className="bg-white border border-gray-100 p-2.5 text-gray-400 hover:text-amber-700 hover:border-amber-100 hover:bg-amber-50/50 transition-all rounded-sm shadow-sm"
                                title="Upravit"
                              >
                                <Edit2 size={16} strokeWidth={1.5} />
                              </button>
                              <button 
                                onClick={() => handlePromoDelete(promo.id)}
                                className="bg-white border border-gray-100 p-2.5 text-gray-300 hover:text-red-700 hover:border-red-100 hover:bg-red-50/50 transition-all rounded-sm shadow-sm"
                                title="Odstranit"
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {promos.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-gray-300">
                            <div className="flex flex-col items-center gap-4">
                              <p className="text-xs uppercase tracking-[0.2em] font-bold">Zatím žádné promo kódy</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentFor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setShowPaymentFor(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-serif mb-2 text-black">Podklady k platbě</h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-8">
                Host: <span className="text-black">{showPaymentFor.customerName}</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-center bg-gray-50 p-6 border border-gray-100">
                <div className="flex justify-center bg-white p-4">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`SPD*1.0*ACC:CZ8555000000008029338001*AM:${new Date(showPaymentFor.startDate).getMonth() >= 3 && new Date(showPaymentFor.startDate).getMonth() <= 9 ? '3000.00' : '2250.00'}*CC:CZK*MSG:Zaloha V Srdci Vinic`)}`}
                    alt="QR kód pro platbu"
                    className="w-40 h-40 object-contain"
                  />
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Částka zálohy</p>
                    <p className="text-3xl font-serif text-black">{new Date(showPaymentFor.startDate).getMonth() >= 3 && new Date(showPaymentFor.startDate).getMonth() <= 9 ? '3000' : '2250'} Kč</p>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Číslo účtu</span>
                      <span className="text-sm">8029338001/5500</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Banka</span>
                      <span>Raiffeisenbank</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-8">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-1">IBAN</span>
                    <span className="font-mono">CZ85 5500 0000 0080 2933 8001</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">SWIFT / BIC</span>
                    <span className="font-mono">RZBC CZ PP</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-amber-50 text-amber-900 border border-amber-200 p-4 rounded-sm flex items-start gap-4">
                 <Landmark size={20} className="shrink-0 mt-0.5" />
                 <p className="text-xs leading-relaxed">
                   <strong>Alternativa (Platba hotově)</strong><br />
                   Zákazník má možnost uhradit pobyt (případně doplatek kromě zálohy) také hotově přímo na místě při příjezdu a předání klíčů.
                 </p>
              </div>

              <button 
                onClick={() => setShowPaymentFor(null)}
                className="w-full mt-8 bg-black text-white py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-amber-900 transition-colors"
               >
                 Zavřít podklady
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {cancelBookingFor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => {
                setCancelBookingFor(null);
                setCancelMessage('');
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-serif mb-2 text-red-600">Stornovat rezervaci</h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-8">
                Host: <span className="text-black">{cancelBookingFor.customerName}</span>
              </p>
              
              <form onSubmit={handleCancelWithMessage}>
                <div className="mb-6 border border-red-100 bg-red-50/50 p-4 rounded-sm">
                  <label className="block text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-3">Zpráva zákazníkovi k důvodu stornování (volitelné)</label>
                  <textarea 
                    rows={4} 
                    value={cancelMessage}
                    onChange={e => setCancelMessage(e.target.value)}
                    placeholder="Např. Bohužel Vám musíme stornovat termín z důvodu nemoci... (Text bude součástí e-mailu)"
                    className="w-full border border-red-200 bg-white p-3 focus:outline-none focus:border-red-500 font-light text-sm shadow-inner"
                  />
                </div>
                
                <p className="text-xs text-gray-500 mb-6 flex items-start gap-2 leading-relaxed">
                   <CheckSquare size={16} className="text-red-500 shrink-0 mt-0.5" />
                   <span>Kliknutím na tlačítko se rezervace trvale změní na "Stornováno" a zákazníkovi odejde e-mail s Vaší případnou poznámkou.</span>
                </p>

                <button 
                  type="submit"
                  disabled={sendingAction === 'cancel'}
                  className={`w-full text-white py-4 text-[10px] uppercase font-bold tracking-widest transition-colors shadow-lg ${sendingAction === 'cancel' ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                 >
                   {sendingAction === 'cancel' ? 'Odesílám...' : 'Potvrdit storno a odeslat e-mail'}
                 </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Booking Modal (Eye) */}
      {showDetailsFor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowDetailsFor(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-serif mb-2 text-black flex items-center gap-3">
                 <Eye className="text-amber-700" size={24} /> Detail rezervace
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-8">
                ID: <span className="text-black">#{showDetailsFor.id}</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Host</p>
                  <p className="text-lg font-serif">{showDetailsFor.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Termín</p>
                  <p className="font-bold whitespace-nowrap">{format(new Date(showDetailsFor.startDate), 'd. M. yyyy')} – {format(new Date(showDetailsFor.endDate), 'd. M. yyyy')}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-5 rounded-sm">
                   <Mail className="text-amber-700 shrink-0" size={20} />
                   <div>
                     <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">E-mail</span>
                     <span className="font-medium text-black">{showDetailsFor.customerEmail || 'Nevyplněn'}</span>
                   </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-5 rounded-sm">
                   <Phone className="text-amber-700 shrink-0" size={20} />
                   <div>
                     <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Telefon</span>
                     <span className="font-medium text-black">{showDetailsFor.customerPhone || 'Nevyplněn'}</span>
                   </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-5 rounded-sm">
                   <Users className="text-amber-700 shrink-0" size={20} />
                   <div>
                     <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Počet osob</span>
                     <span className="font-medium text-black">{showDetailsFor.guests || 2}</span>
                   </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-5 rounded-sm">
                   <Landmark className="text-amber-700 shrink-0" size={20} />
                   <div>
                     <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Preferovaná platba doplatku</span>
                     <span className="font-medium text-black">{showDetailsFor.paymentMethod || 'Nevyplněna'}</span>
                   </div>
                </div>
                
                {showDetailsFor.notes && (
                  <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-sm mt-8">
                    <span className="text-[10px] text-amber-900 uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2">
                       <MessageSquare size={14} /> Poznámka od hosta
                    </span>
                    <p className="text-gray-700 italic font-light leading-relaxed">{showDetailsFor.notes}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowDetailsFor(null)}
                className="w-full mt-10 bg-black text-white py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-amber-900 transition-colors shadow-lg shadow-black/10"
               >
                 Zavřít detail
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
