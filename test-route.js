import express from 'express';
const app = express();
try {
  app.get('*', (req, res) => res.send('ok'));
  console.log('SUCCESS with *');
} catch (e) {
  console.log('ERROR with *:', e.message);
}
try {
  app.get('*all', (req, res) => res.send('ok'));
  console.log('SUCCESS with *all');
} catch (e) {
  console.log('ERROR with *all:', e.message);
}
try {
  app.get('(.*)', (req, res) => res.send('ok'));
  console.log('SUCCESS with (.*)');
} catch (e) {
  console.log('ERROR with (.*):', e.message);
}
try {
  app.get('/*', (req, res) => res.send('ok'));
  console.log('SUCCESS with /*');
} catch (e) {
  console.log('ERROR with /*:', e.message);
}
