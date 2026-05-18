const Database = require('better-sqlite3');
const db = new Database('bookings.db');

try {
  db.exec('ALTER TABLE events ADD COLUMN link TEXT;');
} catch (e) {
  console.log('Column link might already exist', e);
}

db.exec('DELETE FROM events;');

const events = [
  { title: 'Den otevřených sklepů', date: '25. dubna 2026', startDate: '2026-04-25', desc: 'Tradiční jarní otevírání sklepů v Mutěnicích s možností degustace vín přímo od vinařů v jejich autentických sklepech.', type: 'wine', link: 'https://www.vinozmutenic.cz/akce/den-otevrenych-sklepu' },
  { title: 'Ameriky mezi sklepy', date: '14. - 17. května 2026', startDate: '2026-05-14', endDate: '2026-05-17', desc: 'Netradiční setkání a přehlídka klasických amerických vozů v unikátních kulisách mutěnských vinohradů a vinných sklepů, spojená s ochutnávkou.', type: 'culture', link: 'https://www.kudyznudy.cz/akce/ameriky-mezi-sklepy-2026-charitativni-akce-v-muten?utm_source=google&utm_medium=cpc&utm_campaign=MGNS_PMAX_Index%3A%20Akce_SS&utm_id=21750560350&gad_source=1&gad_campaignid=21740420382&gbraid=0AAAAADAmipuYHTZuxfRBga1hOqZKR5pZO&gclid=Cj0KCQjwzqXQBhD2ARIsAKrIeU_p0TLA0ICbPljvblJGwtZ4odErXvaA1Sx-4xTZOE8eJ9jKd9VAHl0aAjAFEALw_wcB' },
  { title: 'Při měsíčku na skleničku', date: '6. června 2026', startDate: '2026-06-06', desc: 'Večerní a noční putování po sklepech s romantickou atmosférou, hudbou a skvělým vínem při měsíčku.', type: 'wine', link: 'https://www.vinarskecentrum.cz/o-vine/vinarske-akce/LT7gdd9IS_OUtT5vOCRgaA-akce-pri-mesicku-na-sklenicku' },
  { title: 'Víno mezi řádky', date: '13. června 2026', startDate: '2026-06-13', desc: 'Příjemná degustace vína přímo ve vinohradu s doprovodným programem. Vychutnejte si víno tam, kde se rodí.', type: 'wine', link: 'https://www.vinarskecentrum.cz/o-vine/vinarske-akce/XVg93u4EQtKKBIQXEsxFTA-akce-vino-mezi-radky' },
  { title: 'Festival Mezi Sklepy', date: '19. - 20. června 2026', startDate: '2026-06-19', endDate: '2026-06-20', desc: 'Velký letní hudební a vinařský festival v areálu vinných sklepů s bohatým kulturním programem, koncerty a lokální gastronomií.', type: 'culture', link: 'https://festivalmezisklepy.cz/' },
  { title: 'Noc pod Mutěnskou horů', date: '4. července 2026', startDate: '2026-07-04', desc: 'Večerní zábava, víno a hudba pod širým nebem s posezením u cimbálu a skvělým vínem z místní produkce.', type: 'culture', link: 'https://www.vinarskecentrum.cz/o-vine/vinarske-akce/F_iqMj7dRw2xkNvWl2f0Vg-akce-noc-pod-mutensku-horu' },
  { title: 'Mutěnické vinobraní', date: '4. - 6. září 2026', startDate: '2026-09-04', endDate: '2026-09-06', desc: 'Tradiční slavnost sklizně hroznů s historickým průvodem, folklorem, spoustou burčáku a krajovými dobrotami.', type: 'wine', link: 'https://www.jizni-morava.cz/cz/kalendar-akci/o82166-mutenicke-vinobrani' },
  { title: 'Burčákový pochod', date: '10. října 2026', startDate: '2026-10-10', desc: 'Populární turistický pochod mezi vinicemi s mnoha zastávkami s ochutnávkou letošního burčáku.', type: 'sport', link: 'https://www.facebook.com/events/bur%C4%8D%C3%A1kov%C3%BD-pochod-mut%C4%9Bnice-10102026/2290137114798900/' },
  { title: 'Svatokateřinské slavnosti vína', date: '14. listopadu 2026', startDate: '2026-11-14', desc: 'Svěcení a vůbec první ochutnávka mladých vín z nového ročníku obvykle spojená se zabijačkovými specialitami a zhodnocením úrody.', type: 'wine', link: 'https://www.vinozmutenic.cz/14-11-2026-svatokaterinske-slavnosti-vina' }
];

try {
  db.exec('ALTER TABLE events ADD COLUMN startDate TEXT;');
} catch(e) {}
try {
  db.exec('ALTER TABLE events ADD COLUMN endDate TEXT;');
} catch(e) {}

const stmt = db.prepare('INSERT INTO events (title, date, startDate, endDate, desc, type, link) VALUES (?, ?, ?, ?, ?, ?, ?)');

for (const event of events) {
  stmt.run(event.title, event.date, event.startDate || null, event.endDate || null, event.desc, event.type, event.link);
}

console.log('Events properly seeded with dates and links.');
