const Database = require('better-sqlite3');
const db = new Database('bookings.db');

db.exec('DELETE FROM events;');

const events = [
  { title: 'Den otevřených sklepů', date: '25. dubna 2026', desc: 'Tradiční jarní otevírání sklepů v Mutěnicích s možností degustace vín přímo od vinařů v jejich autentických sklepech.', type: 'wine' },
  { title: 'Ameriky mezi sklepy', date: '14. - 17. května 2026', desc: 'Netradiční setkání a přehlídka klasických amerických vozů v unikátních kulisách mutěnských vinohradů a vinných sklepů, spojená s ochutnávkou.', type: 'culture' },
  { title: 'Při měsíčku na skleničku', date: '6. června 2026', desc: 'Večerní a noční putování po sklepech s romantickou atmosférou, hudbou a skvělým vínem při měsíčku.', type: 'wine' },
  { title: 'Víno mezi řádky', date: '13. června 2026', desc: 'Příjemná degustace vína přímo ve vinohradu s doprovodným programem. Vychutnejte si víno tam, kde se rodí.', type: 'wine' },
  { title: 'Festival Mezi Sklepy', date: '19. - 20. června 2026', desc: 'Velký letní hudební a vinařský festival v areálu vinných sklepů s bohatým kulturním programem, koncerty a lokální gastronomií.', type: 'culture' },
  { title: 'Noc pod Mutěnskou horů', date: '4. července 2026', desc: 'Večerní zábava, víno a hudba pod širým nebem s posezením u cimbálu a skvělým vínem z místní produkce.', type: 'culture' },
  { title: 'Mutěnické vinobraní', date: '4. - 6. září 2026', desc: 'Tradiční slavnost sklizně hroznů s historickým průvodem, folklorem, spoustou burčáku a krajovými dobrotami.', type: 'wine' },
  { title: 'Burčákový pochod', date: '10. října 2026', desc: 'Populární turistický pochod mezi vinicemi s mnoha zastávkami s ochutnávkou letošního burčáku.', type: 'sport' },
  { title: 'Svatokateřinské slavnosti vína', date: '14. listopadu 2026', desc: 'Svěcení a vůbec první ochutnávka mladých vín z nového ročníku obvykle spojená se zabijačkovými specialitami a zhodnocením úrody.', type: 'wine' }
];

const stmt = db.prepare('INSERT INTO events (title, date, desc, type) VALUES (?, ?, ?, ?)');

for (const event of events) {
  stmt.run(event.title, event.date, event.desc, event.type);
}

console.log('Events properly seeded.');
