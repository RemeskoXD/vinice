const fs = require('fs'); 
let c = fs.readFileSync('pages/Tips.tsx', 'utf8'); 
c = c.replace(/https:\/\/www\.google\.com\/maps\/embed\?pb=[^"]+/g, 'https://maps.google.com/maps?q=Vina%C5%99sk%C3%A1%201264,%20696%2011%20Mut%C4%9Bnice&t=&z=16&ie=UTF8&iwloc=&output=embed'); 
fs.writeFileSync('pages/Tips.tsx', c);
