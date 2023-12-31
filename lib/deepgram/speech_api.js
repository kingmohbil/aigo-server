const env = require('dotenv').config().parsed;
const { Deepgram } = require('@deepgram/sdk');

// Mimetype for the file you want to transcribe
// Only necessary if transcribing a local file
// Example: audio/wav
const mimetype = 'audio/mpeg';

// Initialize the Deepgram SDK
const deepgram = new Deepgram(env.DEEPGRAM_API_KEY);

async function speech_to_text(buffer, lang = 'en-US') {
  // Set the source
  source = {
    buffer,
    mimetype: mimetype,
  };
  try {
    const response = await deepgram.transcription.preRecorded(source, {
      smart_format: true,
      language: lang,
      model: lang === 'en-US' ? 'nova' : 'general',
    });
    if (response.results.channels.length === 0)
      return Promise.resolve(
        `Tell him to repeat what he said in this country code language ${lang}`
      );
    return Promise.resolve(
      response.results.channels[0].alternatives[0].transcript
    );
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

module.exports = { speech_to_text };
