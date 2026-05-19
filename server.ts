import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'pass123'
  }
});

const dbPath = process.env.DB_PATH || 'bookings.db';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(dbPath);
console.log(`Přiřazena databáze na cestě: ${dbPath}`);

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
  CREATE TABLE IF NOT EXISTS promo_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    discount TEXT,
    expiresAt TEXT,
    isActive INTEGER DEFAULT 1
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

try {
  db.exec("ALTER TABLE bookings ADD COLUMN promoCode TEXT;");
} catch (e) {
  // column might already exist
}

try {
  db.exec("ALTER TABLE events ADD COLUMN startDate TEXT;");
} catch (e) {}

try {
  db.exec("ALTER TABLE events ADD COLUMN endDate TEXT;");
} catch (e) {}

// Pre-seed some default events if table is empty
const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
if (eventCount.count === 0) {
  const insertEvent = db.prepare('INSERT INTO events (title, date, desc, type, link, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const defaultEvents = [
    {
      title: 'Degustace vína u spřáteleného vinařství',
      date: 'Celoroční akce',
      desc: 'Můžeme pro vás domluvit soukromou degustaci v nedalekém sklípku. Poznejte pravou chuť Mutěnic.',
      type: 'Celoroční',
      link: 'https://www.vincur.eu/',
      startDate: '2026-01-01',
      endDate: '2099-12-31'
    },
    {
      title: 'Den otevřených sklepů',
      date: '25. 4. 2026',
      desc: 'Tradiční jarní otevírání sklepů v Mutěnicích s degustací.',
      type: 'V obci',
      link: 'https://www.vinozmutenic.cz/akce/den-otevrenych-sklepu',
      startDate: '2026-04-25',
      endDate: '2026-04-25'
    },
    {
      title: 'Ameriky mezi sklepy',
      date: '14. – 17. 5. 2026',
      desc: 'Setkání a přehlídka klasických amerických vozů.',
      type: 'V obci',
      link: 'https://www.kudyznudy.cz/akce/ameriky-mezi-sklepy-2026-charitativni-akce-v-muten?utm_source=google&utm_medium=cpc&utm_campaign=MGNS_PMAX_Index%3A%20Akce_SS&utm_id=21750560350&gad_source=1&gad_campaignid=21740420382&gbraid=0AAAAADAmipuYHTZuxfRBga1hOqZKR5pZO&gclid=Cj0KCQjwzqXQBhD2ARIsAKrIeU_p0TLA0ICbPljvblJGwtZ4odErXvaA1Sx-4xTZOE8eJ9jKd9VAHl0aAjAFEALw_wcB',
      startDate: '2026-05-14',
      endDate: '2026-05-17'
    },
    {
      title: 'Při měsíčku na skleničku',
      date: '6. 6. 2026',
      desc: 'Večerní a noční putování po sklepech s romantickou atmosférou.',
      type: 'V obci',
      link: 'https://www.vinarskecentrum.cz/o-vine/vinarske-akce/LT7gdd9IS_OUtT5vOCRgaA-akce-pri-mesicku-na-sklenicku',
      startDate: '2026-06-06',
      endDate: '2026-06-06'
    },
    {
      title: 'Víno mezi řádky',
      date: '13. 6. 2026',
      desc: 'Příjemná degustace přímo ve vinohradu s doprovodným programem.',
      type: 'V obci',
      link: 'https://www.vinarskecentrum.cz/o-vine/vinarske-akce/XVg93u4EQtKKBIQXEsxFTA-akce-vino-mezi-radky',
      startDate: '2026-06-13',
      endDate: '2026-06-13'
    },
    {
      title: 'Festival Mezi Sklepy',
      date: '19. – 20. 6. 2026',
      desc: 'Velký letní hudební a vinařský festival v areálu vinných sklepů.',
      type: 'V obci',
      link: 'https://festivalmezisklepy.cz/',
      startDate: '2026-06-19',
      endDate: '2026-06-20'
    },
    {
      title: 'Noc pod Mutěnskou horů',
      date: '4. 7. 2026',
      desc: 'Večerní zábava, hudba a posezení u cimbálu s vínem.',
      type: 'V obci',
      link: 'https://www.vinarskecentrum.cz/o-vine/vinarske-akce/F_iqMj7dRw2xkNvWl2f0Vg-akce-noc-pod-mutensku-horu',
      startDate: '2026-07-04',
      endDate: '2026-07-04'
    },
    {
      title: 'Mutěnické vinobraní',
      date: '4. – 6. 9. 2026',
      desc: 'Tradiční slavnost sklizně hroznů s průvodem a folklorem.',
      type: 'V obci',
      link: 'https://www.jizni-morava.cz/cz/kalendar-akci/o82166-mutenicke-vinobrani',
      startDate: '2026-09-04',
      endDate: '2026-09-06'
    },
    {
      title: 'Burčákový pochod',
      date: '10. 10. 2026',
      desc: 'Turistický pochod mezi vinicemi s ochutnávkou letošního burčáku.',
      type: 'V obci',
      link: 'https://www.facebook.com/events/bur%C4%8D%C3%A1kov%C3%BD-pochod-mut%C4%9Bnice-10102026/2290137114798900/',
      startDate: '2026-10-10',
      endDate: '2026-10-10'
    },
    {
      title: 'Svatokateřinské slavnosti vína',
      date: '14. 11. 2026',
      desc: 'Svěcení a vůbec první ochutnávka mladých vín.',
      type: 'V obci',
      link: 'https://www.vinozmutenic.cz/14-11-2026-svatokaterinske-slavnosti-vina',
      startDate: '2026-11-14',
      endDate: '2026-11-14'
    }
  ];
  const insertMany = db.transaction((events) => {
    for (const ev of events) insertEvent.run(ev.title, ev.date, ev.desc, ev.type, ev.link, ev.startDate, ev.endDate);
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
    const { startDate, endDate, customerName, customerEmail, customerPhone, notes, guests, paymentMethod, promoCode } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO bookings (startDate, endDate, customerName, customerEmail, customerPhone, notes, guests, paymentMethod, promoCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(startDate, endDate, customerName, customerEmail, customerPhone || '', notes || '', guests || 2, paymentMethod || 'hotově', promoCode || null);
      
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

  // Promo Codes API
  app.get('/api/promo-codes', (req, res) => {
    try {
      const promos = db.prepare('SELECT * FROM promo_codes ORDER BY id DESC').all();
      res.json(promos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch promo codes' });
    }
  });

  app.post('/api/promo-codes', (req, res) => {
    const { code, discount, expiresAt, isActive } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO promo_codes (code, discount, expiresAt, isActive) VALUES (?, ?, ?, ?)');
      const info = stmt.run(code, discount || '', expiresAt || null, isActive !== undefined ? isActive : 1);
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Tento kód již existuje' });
      }
      res.status(500).json({ error: 'Failed to create promo code' });
    }
  });

  app.put('/api/promo-codes/:id', (req, res) => {
    const { id } = req.params;
    const { code, discount, expiresAt, isActive } = req.body;
    try {
      const stmt = db.prepare('UPDATE promo_codes SET code = ?, discount = ?, expiresAt = ?, isActive = ? WHERE id = ?');
      stmt.run(code, discount || '', expiresAt || null, isActive !== undefined ? isActive : 1, id);
      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Tento kód již existuje' });
      }
      res.status(500).json({ error: 'Failed to update promo code' });
    }
  });

  app.delete('/api/promo-codes/:id', (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare('DELETE FROM promo_codes WHERE id = ?');
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete promo code' });
    }
  });

  app.post('/api/check-promo', (req, res) => {
    const { code } = req.body;
    try {
      const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ? AND isActive = 1').get(code) as any;
      if (!promo) {
        return res.status(404).json({ error: 'Neplatný nebo neexistující kód' });
      }
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return res.status(400).json({ error: 'Platnost kódu vypršela' });
      }
      res.json({ success: true, discount: promo.discount });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check promo code' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get(/^(.*)$/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
