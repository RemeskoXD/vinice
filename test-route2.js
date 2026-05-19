import express from 'express';
import http from 'http';

const app = express();
app.get('*all', (req, res) => res.send('matched ' + req.params.all));
const server = app.listen(3030, () => {
  http.get('http://localhost:3030/some/path.css', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Response:', data);
      server.close();
    });
  });
});
