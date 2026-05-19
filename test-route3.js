import express from 'express';
const app = express();
try {
  app.get('/:splat(*)', (req, res) => res.send('ok'));
  console.log('SUCCESS with /:splat(*)');
} catch (e) {
  console.log('ERROR with /:splat(*):', e.message);
}
try {
  app.get('(.*)', (req, res) => res.send('ok'));
  console.log('SUCCESS with (.*)');
} catch (e) {
  console.log('ERROR with (.*):', e.message);
}
try {
  app.get('*', (req, res) => res.send('ok'));
}catch(e){console.log('ERROR with *', e.message)}

try {
  app.get(/^(.*)$/, (req, res) => res.send('ok regex'));
  console.log('SUCCESS with RegExp');
} catch(e) {
  console.log('ERROR with RegExp', e.message);
}
