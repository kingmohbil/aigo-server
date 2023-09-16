env = require('dotenv').config().parsed;

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer();
const app = express();

//* Routers
const googleRouter = require('./routes/google');
const amazonRouter = require('./routes/amazon');
const deepgramRouter = require('./routes/deepgram');

const { speech_to_text } = require('./lib/deepgram/speech_api');
const { text_to_speech } = require('./lib/google/speech_api');
const { chat } = require('./lib/openai/chat');

const HOST = '192.168.0.108';
const PORT = 3000;

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const ws = io.of('/socket');

ws.on('connection', (socket) => {
  console.log(`Socket with id: ${socket.id} connected`);
  ws.to(socket.id).emit('play-question', 'play question started');

  socket.on('stream-voice', async (data) => {
    const question = await speech_to_text(data);
    console.log(`Question: ${question}`);
    const answer = await chat(question);
    console.log(`Answer: ${answer}`);
    const speech = await text_to_speech(answer);
    ws.to(socket.id).emit('text', speech, answer);
  });

  socket.conn.on('close', (reason) => {
    console.log(`Socket with id: ${socket.id} disconnected`);
  });
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.send('welcome');
});

app.use('/google', googleRouter);
app.use('/amazon', amazonRouter);
app.use('/deepgram', deepgramRouter);

server.listen(PORT, HOST, () => {
  console.log(`Server is listening on http://${HOST}:${PORT}`);
});
