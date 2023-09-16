const express = require('express');
const router = express.Router();
const { speech_to_text, text_to_speech } = require('../lib/google/speech_api');

router.post('/', async function (req, res) {
  try {
    console.log('api reached');
    const { fileBuffer } = req.body;

    if (!fileBuffer) throw new Error('File not found');

    const text = await speech_to_text(fileBuffer);

    audioContent = await text_to_speech(text);

    res.json({ audioFile: audioContent });
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
});

module.exports = router;
