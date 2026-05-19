import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import multer from 'multer';

let transporter: nodemailer.Transporter;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  nodemailer.createTestAccount().then((testAccount) => {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }).catch(console.error);
}

const dbPath = process.env.DB_PATH || 'bookings.db';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
let db = new Database(dbPath);
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
  const upload = multer({ storage: multer.memoryStorage() });

  app.post('/api/admin/restore-db', upload.single('dbFile'), (req, res) => {
    const password = req.body.heslo || req.body.password;
    const adminPassword = process.env.ADMIN_PASSWORD || 'vinice123';

    if (!password || password !== adminPassword) {
      return res.status(403).json({ error: 'Nepovolený přístup. Špatné heslo.' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Nebyl nahrán žádný soubor.' });
    }

    const tempBackupPath = `${dbPath}.bak`;
    let oldDbClosed = false;

    try {
      // 1. Close current DB connection
      db.close();
      oldDbClosed = true;

      // 2. Create temporary backup of current db file if it exists
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tempBackupPath);
      }

      // 3. Overwrite the DB file with the uploaded database buffer
      fs.writeFileSync(dbPath, req.file.buffer);

      // 4. Try to re-open DB connection
      db = new Database(dbPath);
      
      // Let's test if the DB is actually readable by running a simple query
      db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

      // Clean up temporary backup since new DB is successfully open and verified
      if (fs.existsSync(tempBackupPath)) {
        fs.unlinkSync(tempBackupPath);
      }

      console.log('Databáze byla úspěšně obnovena ze zálohy.');
      return res.json({ success: true, message: 'Databáze byla úspěšně obnovena.' });

    } catch (error: any) {
      console.error('Chyba při obnovování databáze:', error);

      // Try to recover from the backup
      try {
        if (oldDbClosed) {
          try {
            db.close();
          } catch {}
        }
        
        if (fs.existsSync(tempBackupPath)) {
          fs.copyFileSync(tempBackupPath, dbPath);
          db = new Database(dbPath);
          fs.unlinkSync(tempBackupPath);
        } else {
          // If no backup existed, just re-open whatever we had or make empty one
          db = new Database(dbPath);
        }
      } catch (recoveryErr) {
        console.error('Kritická chyba při obnově původní databáze:', recoveryErr);
      }

      return res.status(500).json({ 
        error: `Chyba při obnově databáze: ${error.message || 'Neplatný soubor databáze'}` 
      });
    }
  });

  app.get('/zaloha', (req, res) => {
    const password = req.query.heslo || req.query.password;
    const adminPassword = process.env.ADMIN_PASSWORD || 'vinice123';
    
    if (!password || password !== adminPassword) {
      return res.status(403).send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #fafaf9; color: #333; margin: 0;">
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">Nepovolený přístup</h1>
              <p>Pro stažení zálohy zadejte správné heslo v parametru adrese, např.:</p>
              <code style="background: #f3f4f6; padding: 0.5rem; display: inline-block; border-radius: 4px; border: 1px solid #e5e7eb; margin-top: 0.5rem;">/zaloha?heslo=tvoje_heslo</code>
            </div>
          </body>
        </html>
      `);
    }

    if (fs.existsSync(dbPath)) {
      res.download(dbPath, 'bookings-backup.db');
    } else {
      res.status(404).send('Databázový soubor nenalezen.');
    }
  });

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
      const { differenceInDays, getMonth, addDays } = require('date-fns');
      const start = new Date(startDate);
      const end = new Date(endDate);
      let totalPrice = 0;
      let current = new Date(start);
      while (current < end) {
        const month = getMonth(current);
        if (month >= 3 && month <= 9) totalPrice += 6000;
        else totalPrice += 4500;
        current = addDays(current, 1);
      }
      
      if (promoCode) {
        const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ? AND isActive = 1').get(promoCode) as any;
        if (promo && (!promo.expiresAt || new Date(promo.expiresAt) >= new Date())) {
          if (promo.discount.includes('%')) {
            const percent = parseInt(promo.discount.replace('%', ''));
            totalPrice = Math.floor(totalPrice * (1 - percent / 100));
          } else if (promo.discount.includes('Kč') || promo.discount.includes('CZK')) {
            const amount = parseInt(promo.discount.replace(/\\D/g, ''));
            totalPrice = Math.max(0, totalPrice - amount);
          }
        }
      }
      const depositPrice = Math.floor(totalPrice / 2);

      const stmt = db.prepare('INSERT INTO bookings (startDate, endDate, customerName, customerEmail, customerPhone, notes, guests, paymentMethod, promoCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(startDate, endDate, customerName, customerEmail, customerPhone || '', notes || '', guests || 2, paymentMethod || 'hotově', promoCode || null);
      
      if (customerEmail) {
        try {
          const textVersion = `
Vážený zákazníku ${customerName},

Vaši poptávku jsme úspěšně přijali. Během 48 hodin Vám potvrdíme rezervaci.

Užitečné informace pro Váš pobyt:
- Kuřáci u nás najdou azyl na terase. Vnitřní prostory jsou plně nekuřácké, ale elektronické cigarety jsou povoleny.
- Víno s sebou nevozte, ve sklepě ho máme pro Vás připraveno dostatek! :D

Odkaz na QR platbu zálohy (50 % - ${depositPrice} Kč): https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SPD*1.0*ACC%3ACZ8555000000008029338001*AM%3A${depositPrice}.00*CC%3ACZK*MSG%3AZaloha%20ubytovani
Nebo prosím zašlete platbu bankovním převodem na účet:
Částka k platbě (Záloha 50 %): ${depositPrice} Kč
Číslo účtu: 8029338001/5500
Banka: Raiffeisenbank
IBAN: CZ85 5500 0000 0080 2933 8001
SWIFT/BIC: RZBCCZPP

Vybraný způsob doplatku zbylých 50 % (${totalPrice - depositPrice} Kč): ${paymentMethod}

Ubytovatelé na Vás budou čekat. 

Fakturační a ubytovací údaje:
V SRDCI VINIC
Sklepní ulice
696 11 Mutěnice

Storno podmínky:
Při zrušení rezervace méně než 7 dní před příjezdem je záloha nevratná. Děkujeme za pochopení.

Těšíme se na Váš pobyt!

S pozdravem,
V SRDCI VINIC
`.trim();

          const mailOptions = {
            from: process.env.SMTP_USER || '"V SRDCI VINIC" <info@vsrdcivinic.cz>',
            to: customerEmail,
            subject: 'Potvrzení poptávky ubytování - V SRDCI VINIC',
            text: textVersion,
            html: `
              <html><body>
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://web2.itnahodinu.cz/vinice/1/logo.webp" alt="V SRDCI VINIC" style="max-height: 80px;" />
                </div>
                <h2 style="color: #b45309;">Děkujeme za Vaši poptávku ubytování!</h2>
                <p>Vážený zákazníku ${customerName},</p>
                <p>Vaši poptávku jsme úspěšně přijali. Během <b>48 hodin</b> Vám potvrdíme rezervaci.</p>
                <div style="background: #fdf5e6; border-left: 4px solid #b45309; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0;"><b>Užitečné informace pro Váš pobyt:</b></p>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 5px;">Kuřáci u nás najdou azyl na terase. Vnitřní prostory jsou plně nekuřácké, ale elektronické cigarety jsou povoleny.</li>
                    <li>Víno s sebou nevozte, ve sklepě ho máme pro Vás připraveno dostatek! :D</li>
                  </ul>
                </div>
                <p>Pro závazné potvrzení prosíme o uhrazení zálohy (50 % - <b>${depositPrice} Kč</b>). Zde je QR kód pro platbu, nebo můžete využít bankovní údaje níže:</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SPD*1.0*ACC%3ACZ8555000000008029338001*AM%3A${depositPrice}.00*CC%3ACZK*MSG%3AZaloha%20ubytovani" alt="QR kód pro platbu zálohy" style="display: block; margin: 20px auto; width: 150px; height: 150px;" />
                <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <p style="margin: 0 0 5px 0;"><b>Částka k platbě (Záloha 50 %):</b> ${depositPrice} Kč</p>
                  <p style="margin: 0 0 5px 0;"><b>Číslo účtu:</b> 8029338001/5500</p>
                  <p style="margin: 0 0 5px 0;"><b>Banka:</b> Raiffeisenbank</p>
                  <p style="margin: 0 0 5px 0;"><b>IBAN:</b> CZ85 5500 0000 0080 2933 8001</p>
                  <p style="margin: 0;"><b>SWIFT/BIC:</b> RZBC CZ PP</p>
                </div>
                <p>Vybraný způsob doplatku zbylých 50 % (<b>${totalPrice - depositPrice} Kč</b>): <b>${paymentMethod}</b></p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #555;">
                  <p><b>Důležité informace a podmínky dodání</b></p>
                  <p><b>Adresa ubytování:</b><br />
                  V SRDCI VINIC<br />
                  Sklepní ulice<br />
                  696 11 Mutěnice</p>
                  <p><b>Storno podmínky:</b><br />
                  V případě zrušení rezervace do 7 dnů před plánovaným příjezdem je záloha nevratná. Pokud zrušíte dříve, celou zálohu bez prodlení vrátíme. Děkujeme za respektování našich pravidel.</p>
                </div>
                
                <p>Těšíme se na Váš pobyt!</p>
                <br />
                <p>S pozdravem,</p>
                <p><b>V SRDCI VINIC</b></p>
              </div>
              </body></html>
            `
          };
          const info = await transporter.sendMail(mailOptions);
          console.log(`Poptávkový e-mail odeslán na ${customerEmail}`);
          if (info.messageId && !process.env.SMTP_HOST) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          }
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
          try {
            const textVersionPotvrzeni = `
Vážený zákazníku ${booking.customerName},

velmi nás to těší, Vaše rezervace v termínu ${booking.startDate} - ${booking.endDate} byla právě závazně potvrzena.

Užitečné informace pro Váš pobyt:
- Kuřáci u nás najdou azyl na terase. Vnitřní prostory jsou plně nekuřácké, ale elektronické cigarety jsou povoleny.
- Víno s sebou nevozte, ve sklepě ho máme pro Vás připraveno dostatek! :D

Na místě na Vás bude čekat ubytovatel, který Vám předá klíče a ukáže Vám prostory včetně našeho vinného sklípku.

Fakturační a ubytovací údaje:
V SRDCI VINIC
Sklepní ulice
696 11 Mutěnice

Storno podmínky: Při zrušení méně než 7 dní před příjezdem propadá záloha.

Těšíme se na Vás!

S pozdravem,
V SRDCI VINIC
`.trim();

            const mailOptions = {
              from: process.env.SMTP_USER || '"V SRDCI VINIC" <info@vsrdcivinic.cz>',
              to: booking.customerEmail,
              subject: 'Potvrzení rezervace ubytování - V SRDCI VINIC',
              text: textVersionPotvrzeni,
              html: `
                <html>
                <body>
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://web2.itnahodinu.cz/vinice/1/logo.webp" alt="V SRDCI VINIC" style="max-height: 80px;" />
                  </div>
                  <h2 style="color: #166534;">Vaše rezervace byla potvrzena!</h2>
                  <p>Vážený zákazníku ${booking.customerName},</p>
                  <p>velmi nás to těší, Vaše rezervace v termínu <b>${booking.startDate} - ${booking.endDate}</b> byla právě závazně potvrzena.</p>
                  <div style="background: #fdf5e6; border-left: 4px solid #b45309; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><b>Užitečné informace pro Váš pobyt:</b></p>
                    <ul style="margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 5px;">Kuřáci u nás najdou azyl na terase. Vnitřní prostory jsou plně nekuřácké, ale elektronické cigarety jsou povoleny.</li>
                      <li>Víno s sebou nevozte, ve sklepě ho máme pro Vás připraveno dostatek! :D</li>
                    </ul>
                  </div>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #555;">
                    <p><b>Důležité informace a kontakt:</b></p>
                    <p><b>Místo pobytu:</b><br />
                    V SRDCI VINIC<br />
                    Sklepní ulice<br />
                    696 11 Mutěnice</p>
                  </div>
                  
                  <p>Těšíme se na Vás!</p>
                  <br />
                  <p>S pozdravem,</p>
                  <p><b>V SRDCI VINIC</b></p>
                </div>
                </body>
                </html>
              `
            };
            const info = await transporter.sendMail(mailOptions);
            console.log(`Potvrzovací e-mail odeslán na ${booking.customerEmail}`);
            if (info.messageId && !process.env.SMTP_HOST) {
              console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            }
          } catch (mailError) {
            console.error('Email send error:', mailError);
          }
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
        const textVersionThanks = `
Vážený zákazníku ${booking.customerName},

děkujeme, že jste si vybrali naše ubytování V SRDCI VINIC.

Pokud bylo vše v pořádku, budeme moc rádi, když nás doporučíte svým přátelům nebo nám zanecháte recenzi na našem Instagramu:
👉 https://www.instagram.com/vsrdci_vinic/

Zpětnou vazbu uvítáme, pomáhá nám to poskytovat ještě lepší péči.

Těšíme se na Vaši případnou další návštěvu!

S pozdravem,
V SRDCI VINIC
Sklepní ulice
696 11 Mutěnice
`.trim();

        const mailOptions = {
          from: process.env.SMTP_USER || '"V SRDCI VINIC" <info@vsrdcivinic.cz>',
          to: booking.customerEmail,
          subject: 'Děkujeme za návštěvu - V SRDCI VINIC',
          text: textVersionThanks,
          html: `
            <html>
            <body>
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://web2.itnahodinu.cz/vinice/1/logo.webp" alt="V SRDCI VINIC" style="max-height: 80px;" />
              </div>
              <h2 style="color: #b45309;">Děkujeme za návštěvu!</h2>
              <p>Vážený zákazníku ${booking.customerName},</p>
              <p>děkujeme, že jste si vybrali naše ubytování V SRDCI VINIC.</p>
              <p>Pokud bylo vše v pořádku, budeme moc rádi, když nás doporučíte svým přátelům nebo nám zanecháte recenzi. Veškerá zpětná vazba je pro nás nesmírně ceněná.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.instagram.com/vsrdci_vinic/" style="background-color: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Napsat recenzi na Instagram</a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #555;">
                    <p><b>Kontaktní údaje:</b></p>
                    <p>V SRDCI VINIC<br />
                    Sklepní ulice<br />
                    696 11 Mutěnice</p>
              </div>
              
              <p>Těšíme se na Vaši případnou další návštěvu!</p>
              <br />
              <p>S pozdravem,</p>
              <p><b>V SRDCI VINIC</b></p>
            </div>
            </body>
            </html>
          `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Poděkování e-mailem odesláno na ${booking.customerEmail}`);
        if (info.messageId && !process.env.SMTP_HOST) {
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        res.json({ success: true });
      } catch (mailError) {
        console.error('Email send error:', mailError);
        res.status(500).json({ error: 'Failed to send polite email' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/bookings/:id/send-deposit-paid', async (req, res) => {
    const { id } = req.params;
    try {
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as any;
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (!booking.customerEmail || booking.customerEmail === 'admin@local') return res.status(400).json({ error: 'No valid email attached to this booking' });

      try {
        const textVersion = `
Vážený zákazníku ${booking.customerName},

potvrzujeme přijetí zálohy na Váš pobyt ve V SRDCI VINIC.
Termín Vašeho pobytu: ${booking.startDate} - ${booking.endDate}

Těšíme se na Vás!

S pozdravem,
V SRDCI VINIC
`.trim();

        const mailOptions = {
          from: process.env.SMTP_USER || '"V SRDCI VINIC" <info@vsrdcivinic.cz>',
          to: booking.customerEmail,
          subject: 'Záloha přijata - V SRDCI VINIC',
          text: textVersion,
          html: `
            <html><body>
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://web2.itnahodinu.cz/vinice/1/logo.webp" alt="V SRDCI VINIC" style="max-height: 80px;" />
              </div>
              <h2 style="color: #166534;">Záloha byla úspěšně přijata!</h2>
              <p>Vážený zákazníku ${booking.customerName},</p>
              <p>potvrzujeme přijetí zálohy na Váš pobyt u nás.</p>
              <p>Váš termín pobytu: <b>${booking.startDate} - ${booking.endDate}</b></p>
              <p>Těšíme se na Vás!</p>
              <br />
              <p>S pozdravem,</p>
              <p><b>V SRDCI VINIC</b></p>
            </div></body></html>
          `
        };
        const info = await transporter.sendMail(mailOptions);
        if (info.messageId && !process.env.SMTP_HOST) {
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        res.json({ success: true });
      } catch (mailError) {
        console.error('Email send error:', mailError);
        res.status(500).json({ error: 'Failed to send email' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/bookings/:id/send-fully-paid', async (req, res) => {
    const { id } = req.params;
    try {
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as any;
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (!booking.customerEmail || booking.customerEmail === 'admin@local') return res.status(400).json({ error: 'No valid email attached to this booking' });

      try {
        const textVersion = `
Vážený zákazníku ${booking.customerName},

potvrzujeme úhradu celé částky za Váš pobyt ve V SRDCI VINIC.
Vše je tedy nyní zaplaceno, velmi Vám děkujeme.

Pokud máte další dotazy, neváhejte nás kontaktovat.

S pozdravem,
V SRDCI VINIC
`.trim();

        const mailOptions = {
          from: process.env.SMTP_USER || '"V SRDCI VINIC" <info@vsrdcivinic.cz>',
          to: booking.customerEmail,
          subject: 'Pobyt plně uhrazen - V SRDCI VINIC',
          text: textVersion,
          html: `
            <html><body>
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://web2.itnahodinu.cz/vinice/1/logo.webp" alt="V SRDCI VINIC" style="max-height: 80px;" />
              </div>
              <h2 style="color: #166534;">Pobyt plně uhrazen!</h2>
              <p>Vážený zákazníku ${booking.customerName},</p>
              <p>potvrzujeme přijetí úhrady celé částky za Váš pobyt.</p>
              <p>Vše je tedy nyní v pořádku zaplaceno, velmi Vám děkujeme.</p>
              <br />
              <p>S pozdravem,</p>
              <p><b>V SRDCI VINIC</b></p>
            </div></body></html>
          `
        };
        const info = await transporter.sendMail(mailOptions);
        if (info.messageId && !process.env.SMTP_HOST) {
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        res.json({ success: true });
      } catch (mailError) {
        console.error('Email send error:', mailError);
        res.status(500).json({ error: 'Failed to send email' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/bookings/:id/cancel-with-message', async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    try {
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as any;
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      const stmt = db.prepare('UPDATE bookings SET status = ? WHERE id = ?');
      stmt.run('cancelled', id);

      if (booking.customerEmail && booking.customerEmail !== 'admin@local') {
        try {
          const textVersion = `
Vážený zákazníku ${booking.customerName},

Vaše rezervace v termínu ${booking.startDate} - ${booking.endDate} ubytování V SRDCI VINIC byla stornována.

Případná poznámka ubytovatele:
${message || 'Bez další poznámky'}

S pozdravem,
V SRDCI VINIC
`.trim();

          const mailOptions = {
            from: process.env.SMTP_USER || '"V SRDCI VINIC" <info@vsrdcivinic.cz>',
            to: booking.customerEmail,
            subject: 'Zrušení rezervace ubytování - V SRDCI VINIC',
            text: textVersion,
            html: `
              <html><body>
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://web2.itnahodinu.cz/vinice/1/logo.webp" alt="V SRDCI VINIC" style="max-height: 80px;" />
                </div>
                <h2 style="color: #dc2626;">Vaše rezervace byla stornována!</h2>
                <p>Vážený zákazníku ${booking.customerName},</p>
                <p>Vaše rezervace v termínu <b>${booking.startDate} - ${booking.endDate}</b> byla stornována.</p>
                <div style="background: #fdf2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0;"><b>Zpráva ubytovatele:</b></p>
                  <p style="margin: 0; white-space: pre-wrap;">${message || 'Bez další poznámky'}</p>
                </div>
                <br />
                <p>S pozdravem,</p>
                <p><b>V SRDCI VINIC</b></p>
              </div></body></html>
            `
          };
          const info = await transporter.sendMail(mailOptions);
          if (info.messageId && !process.env.SMTP_HOST) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          }
        } catch (mailError) {
          console.error('Email send error:', mailError);
        }
      }
      res.json({ success: true });
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
