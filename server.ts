import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database('bookings.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    customerName TEXT,
    customerEmail TEXT,
    customerPhone TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' -- 'confirmed', 'pending', 'cancelled'
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/bookings', (req, res) => {
    try {
      const bookings = db.prepare('SELECT * FROM bookings ORDER BY startDate DESC').all();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  app.post('/api/bookings', (req, res) => {
    const { startDate, endDate, customerName, customerEmail, customerPhone, notes } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO bookings (startDate, endDate, customerName, customerEmail, customerPhone, notes) VALUES (?, ?, ?, ?, ?, ?)');
      const info = stmt.run(startDate, endDate, customerName, customerEmail, customerPhone || '', notes || '');
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete booking' });
    }
  });

  app.patch('/api/bookings/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as any;
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      const stmt = db.prepare('UPDATE bookings SET status = ? WHERE id = ?');
      stmt.run(status, id);

      // Pokud je stav 'confirmed' a máme email, nasimulujeme odeslání/zaprotokolování
      if (status === 'confirmed' && booking.customerEmail && booking.customerEmail !== 'admin@local') {
          console.log(`[AUTOMAT] Odesílám potvrzovací e-mail pro: ${booking.customerEmail}`);
          // Poznámka: Reálné odesílání e-mailů by v produkci vyžadovalo nastavení SMTP (např. přes nodemailer)
          // Zde implementujeme logiku, kterou uživatel uvidí jako "automat"
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
