const fs = require('fs'); 
const files = ['pages/Home.tsx', 'pages/Tips.tsx'];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8'); 
  c = c.replace(/z=16/g, 'z=19'); 
  fs.writeFileSync(file, c);
}
