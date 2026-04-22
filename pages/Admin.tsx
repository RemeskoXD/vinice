import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Trash2, Plus, Users, Calendar, TrendingUp, Phone, Mail, MessageSquare } from 'lucide-react';

interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  status: string;
}

const ADMIN_PASSWORD = 'vinice123'; // V produkci doporučujeme přesunout do .env jako VITE_ADMIN_PASSWORD

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Manual booking form
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = () => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
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
                <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-wider">Správa rezervací</h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-2">V srdci vinic – Dashboard</p>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)} 
              className="text-[10px] font-bold uppercase tracking-widest bg-white border border-gray-200 px-6 py-2 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
            >
              Odhlásit se
            </button>
        </div>

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
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {booking.status === 'confirmed' ? 'Potvrzeno' : 'Čeká na vyřízení'}
                          </span>
                        </td>
                        <td className="py-6 align-top">
                          <p className="text-sm font-bold text-black mb-2">{booking.customerName}</p>
                          <div className="space-y-1">
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
                          <div className="flex justify-end items-center gap-2">
                            <button 
                              onClick={() => {
                                const data = `Příjemce: V srdci vinic\nČástka: ${new Date(booking.startDate).getMonth() >= 3 && new Date(booking.startDate).getMonth() <= 9 ? '3000' : '2250'}\nZpráva: Rezervace ${booking.customerName}`;
                                window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`, '_blank');
                              }}
                              className="bg-white border border-gray-100 p-2.5 text-gray-400 hover:text-amber-700 hover:border-amber-100 hover:bg-amber-50/50 transition-all rounded-sm shadow-sm"
                              title="QR Platba (Záloha)"
                            >
                              <TrendingUp size={16} strokeWidth={1.5} />
                            </button>
                            <button 
                              onClick={() => handleDelete(booking.id)}
                              className="bg-white border border-gray-100 p-2.5 text-gray-300 hover:text-red-700 hover:border-red-100 hover:bg-red-50/50 transition-all rounded-sm shadow-sm"
                              title="Odstranit záznam"
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
      </div>
    </div>
  );
};

export default Admin;
