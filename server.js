env = require('dotenv').config().parsed;

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);

const { speech_to_text } = require('./lib/deepgram/speech_api');
const {
  text_to_speech,
  speech_to_text: GoogleSpeech,
} = require('./lib/google/speech_api');
const { chat } = require('./lib/openai/chat');

const PORT = 3000;

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const ws = io.of('/');

ws.on('connection', (socket) => {
  console.log(`Socket with id: ${socket.id} connected`);
  ws.to(socket.id).emit('play-question', 'play question started');

  socket.on(
    'stream-voice',
    async (data, lang = { speech: 'en-US', text: 'en-US' }) => {
      let question = '';
      try {
        if (lang.speech === 'ar-XA')
          question = await GoogleSpeech(data, lang.speech);
        else question = await speech_to_text(data, lang.speech);

        console.log(`Question: ${question}`);

        const answer = await chat(question);
        console.log(`Answer: ${answer}`);

        const speech = await text_to_speech(answer, lang.text);
        ws.to(socket.id).emit('text', speech, answer, question);
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    }
  );

  socket.conn.on('close', (reason) => {
    console.log(
      `Socket with id: ${socket.id} disconnected with reason: ${reason}`
    );
  });
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
