const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer();

const { speech_to_text } = require('../lib/deepgram/speech_api');
const { text_to_speech } = require('../lib/google/speech_api');

router.post('/', upload.single('file'), async function (req, res) {
  try {
    const text = await speech_to_text(req.file.buffer);

    audioContent = await text_to_speech(text);

    res.json({ audioFile: audioContent });
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
});

module.exports = router;
