const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const RadioStation = require('radio-station');

const server = http.createServer(app);
const io = new Server(server);

const port = 8080;

(async () => {
  const radio = await RadioStation.create({
    pathWorkDir: path.join(__dirname, 'tracks-data-folder'),
    isLauncher: false,
    mainPort: port
  });

  await radio.track.loads(
    path.join(__dirname, '/tracks-for-load')
  );

  app.get('/radio', (req, res) => {
    radio.addListener(req, res);
  });

  io.on('connection', async (socket) => {
    radio.onUse((info) => {
      socket.emit('onUse', info);
    });
  });

  app.get('/picture', async (req, res) => {
    radio.picture(req, res);
  });

  app.get('/info', async (req, res) => {
    radio.info(req, res);
  });

  // Serve static files
  app.use('/', express.static(__dirname + '/public'));

  server.listen(port, () => {
    console.log(`open: http://localhost:${port}`);
  });
})();
