import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Trash2, Plus, Users, Calendar, TrendingUp } from 'lucide-react';

interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  status: string;
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Manual booking form
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');
  const [manualName, setManualName] = useState('Admin Blokace');

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
    if (password === 'vinice123') { // Simple hardcoded password for demo
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
          customerName: manualName,
          customerEmail: 'admin@local',
          status: 'confirmed'
        })
      });
      fetchBookings();
      setManualStart('');
      setManualEnd('');
    } catch (error) {
      alert('Chyba při přidávání');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-serif mb-6 text-center">Administrace</h1>
          <input
            type="password"
            placeholder="Heslo"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border p-3 mb-4"
          />
          <button type="submit" className="w-full bg-black text-white p-3 uppercase font-bold text-xs tracking-widest">
            Přihlásit
          </button>
        </form>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => new Date(b.startDate) >= new Date()).length;
  const totalBookings = bookings.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif">Správa rezervací</h1>
            <button onClick={() => setIsAuthenticated(false)} className="text-sm text-red-600 hover:underline">Odhlásit</button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 shadow-sm flex items-center gap-4 border-l-4 border-black">
            <div className="p-3 bg-gray-100 rounded-full text-black">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Nadcházející</p>
              <p className="text-2xl font-bold">{upcomingBookings}</p>
            </div>
          </div>
          <div className="bg-white p-6 shadow-sm flex items-center gap-4 border-l-4 border-amber-700">
            <div className="p-3 bg-amber-50 rounded-full text-amber-700">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Celkem rezervací</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
          </div>
          <div className="bg-white p-6 shadow-sm flex items-center gap-4 border-l-4 border-green-600">
            <div className="p-3 bg-green-50 rounded-full text-green-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Stav systému</p>
              <p className="text-2xl font-bold text-green-600">Aktivní</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add New */}
          <div className="bg-white p-8 shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} /> Přidat blokaci / rezervaci</h2>
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Od</label>
                <input type="date" required value={manualStart} onChange={e => setManualStart(e.target.value)} className="w-full border p-2" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Do</label>
                <input type="date" required value={manualEnd} onChange={e => setManualEnd(e.target.value)} className="w-full border p-2" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Poznámka / Jméno</label>
                <input type="text" required value={manualName} onChange={e => setManualName(e.target.value)} className="w-full border p-2" />
              </div>
              <button type="submit" className="w-full bg-black text-white py-3 uppercase font-bold text-xs tracking-widest hover:bg-gray-800">
                Přidat
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Seznam rezervací</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th className="py-3">Termín</th>
                    <th className="py-3">Jméno</th>
                    <th className="py-3">Email</th>
                    <th className="py-3 text-right">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 text-sm font-medium">
                        {format(new Date(booking.startDate), 'd.M.yyyy')} - {format(new Date(booking.endDate), 'd.M.yyyy')}
                      </td>
                      <td className="py-4 text-sm">{booking.customerName}</td>
                      <td className="py-4 text-sm text-gray-500">{booking.customerEmail}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Smazat"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">Žádné rezervace</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
