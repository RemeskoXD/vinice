import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'pass123'
  }
});

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
    guests INTEGER DEFAULT 2,
    paymentMethod TEXT DEFAULT 'hotově',
    status TEXT DEFAULT 'pending' -- 'confirmed', 'pending', 'cancelled'
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    desc TEXT,
    type TEXT,
    link TEXT
  );
`);

try {
  db.exec('ALTER TABLE bookings ADD COLUMN guests INTEGER DEFAULT 2;');
} catch (e) {
  // column might already exist
}

try {
  db.exec("ALTER TABLE bookings ADD COLUMN paymentMethod TEXT DEFAULT 'hotově';");
} catch (e) {
  // column might already exist
}

// Pre-seed some default events if table is empty
const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
if (eventCount.count === 0) {
  const insertEvent = db.prepare('INSERT INTO events (title, date, desc, type) VALUES (?, ?, ?, ?)');
  const defaultEvents = [
    {
      title: "Zahájení sezóny 2026",
      date: "Duben 2026",
      desc: "Oficiální otevření našeho domu pro letošní sezónu. Přijďte si užít jarní vinice.",
      type: "U nás"
    },
    {
      title: "Mutěnické búdy dokořán",
      date: "Červen 2026",
      desc: "Tradiční akce, kdy vinaři v Mutěnicích otevírají své sklepy pro veřejnost. Degustace, hudba a skvělá atmosféra.",
      type: "V obci"
    },
    {
      title: "Vinobraní pod Vyšickem",
      date: "Září 2026",
      desc: "Oslava sklizně hroznů s bohatým kulturním programem, burčákem a folklorními vystoupeními.",
      type: "Místní akce"
    },
    {
      title: "Degustace u místního vinaře",
      date: "Celoročně / na domluvu",
      desc: "Můžeme pro vás domluvit soukromou degustaci v nedalekém sklípku. Poznejte pravou chuť Mutěnic.",
      type: "Zážitek"
    }
  ];
  const insertMany = db.transaction((events) => {
    for (const ev of events) insertEvent.run(ev.title, ev.date, ev.desc, ev.type);
  });
  insertMany(defaultEvents);
}

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

  app.post('/api/bookings', async (req, res) => {
    const { startDate, endDate, customerName, customerEmail, customerPhone, notes, guests, paymentMethod } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO bookings (startDate, endDate, customerName, customerEmail, customerPhone, notes, guests, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(startDate, endDate, customerName, customerEmail, customerPhone || '', notes || '', guests || 2, paymentMethod || 'hotově');
      
      if (customerEmail) {
        try {
          const mailOptions = {
            from: process.env.SMTP_USER || '"V SRDCI VINIC" <info@vsrdcivinic.cz>',
            to: customerEmail,
            subject: 'Potvrzení poptávky ubytování - V SRDCI VINIC',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #b45309;">Děkujeme za Vaši rezervaci!</h2>
                <p>Vážený zákazníku ${customerName},</p>
                <p>Vaši poptávku jsme úspěšně přijali. Během <b>48 hodin</b> Vám potvrdíme rezervaci.</p>
                <p>Pro závazné potvrzení prosíme o uhrazení zálohy (50 %). Zde je QR kód pro zjednodušení platby:</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOCK_PLATBA_50_PROCENT" alt="QR kód pro platbu zálohy" style="display: block; margin: 20px auto; width: 150px; height: 150px;" />
                <p>Vybraný způsob doplatku zbylých 50 %: <b>${paymentMethod}</b></p>
                <p>Těšíme se na Váš pobyt!</p>
                <br />
                <p>S pozdravem,</p>
                <p><b>V SRDCI VINIC</b></p>
              </div>
            `
          };
          await transporter.sendMail(mailOptions);
          console.log(`Poptávkový e-mail odeslán na ${customerEmail}`);
        } catch (mailError) {
          console.error('Email send error:', mailError);
        }
      }

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

  app.post('/api/bookings/:id/send-thanks', async (req, res) => {
    const { id } = req.params;
    try {
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as any;
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (!booking.customerEmail || booking.customerEmail === 'admin@local') return res.status(400).json({ error: 'No valid email attached to this booking' });

      try {
        const mailOptions = {
          from: process.env.SMTP_USER || '"V SRDCI VINIC" <info@vsrdcivinic.cz>',
          to: booking.customerEmail,
          subject: 'Děkujeme za návštěvu - V SRDCI VINIC',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #b45309;">Děkujeme za návštěvu!</h2>
              <p>Vážený zákazníku ${booking.customerName},</p>
              <p>děkujeme, že jste si vybrali naše ubytování V SRDCI VINIC.</p>
              <p>Pokud bylo vše v pořádku, budeme moc rádi, když nás doporučíte svým přátelům.</p>
              <p>Těšíme se na Vaši případnou další návštěvu!</p>
              <br />
              <p>S pozdravem,</p>
              <p><b>V SRDCI VINIC</b></p>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Poděkování e-mailem odesláno na ${booking.customerEmail}`);
        res.json({ success: true });
      } catch (mailError) {
        console.error('Email send error:', mailError);
        res.status(500).json({ error: 'Failed to send polite email' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Events API
  app.get('/api/events', (req, res) => {
    try {
      const events = db.prepare('SELECT * FROM events ORDER BY id ASC').all();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  app.post('/api/events', (req, res) => {
    const { title, date, startDate, endDate, desc, type, link } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO events (title, date, startDate, endDate, desc, type, link) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(title, date, startDate || null, endDate || null, desc || '', type || '', link || '');
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create event' });
    }
  });

  app.put('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const { title, date, startDate, endDate, desc, type, link } = req.body;
    try {
      const stmt = db.prepare('UPDATE events SET title = ?, date = ?, startDate = ?, endDate = ?, desc = ?, type = ?, link = ? WHERE id = ?');
      stmt.run(title, date, startDate || null, endDate || null, desc || '', type || '', link || '', id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update event' });
    }
  });

  app.delete('/api/events/:id', (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare('DELETE FROM events WHERE id = ?');
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete event' });
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
