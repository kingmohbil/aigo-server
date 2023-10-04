env = require('dotenv').config().parsed;
// Imports the Google Cloud beta client library
const { SpeechClient } = require('@google-cloud/speech').v1p1beta1;
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

const { GoogleAuth, grpc } = require('google-gax');

function getApiKeyCredentials(apiKey) {
  const sslCreds = grpc.credentials.createSsl();
  const googleAuth = new GoogleAuth();
  const authClient = googleAuth.fromAPIKey(apiKey);
  const credentials = grpc.credentials.combineChannelCredentials(
    sslCreds,
    grpc.credentials.createFromGoogleCredential(authClient)
  );
  return credentials;
}

// the credentials for text to speech
const sslCredsForTextToSpeech = getApiKeyCredentials(
  env.GOOGLE_TEXT_TO_SPEECH_KEY || ''
);

// the credentials for speech to text
const sslCredsForSpeechToText = getApiKeyCredentials(
  process.env.GOOGLE_SPEECH_TO_TEXT_KEY || ''
);

const createSpeechClient = () =>
  // Creates a client for speech recognition
  new SpeechClient({
    sslCreds: sslCredsForSpeechToText,
  });

const createTextToSpeechClient = () =>
  // Creates a client for text to speech
  new TextToSpeechClient({ sslCreds: sslCredsForTextToSpeech });

async function speech_to_text(fileBuffer, lang = 'en-US') {
  try {
    // initializing speech to text client
    const client = createSpeechClient();

    const audio = {
      content: fileBuffer,
    };
    const config = {
      enableAutomaticPunctuation: true,
      encoding: 'LINEAR16',
      sampleRateHertz: 24000,
      languageCode: lang,
      model: lang === 'ar-XA' ? 'default' : 'phone_call',
      useEnhanced: true,
    };
    const speechToTextRequest = {
      audio: audio,
      config: config,
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(speechToTextRequest);
    return Promise.resolve(response.results[0].alternatives[0].transcript);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function text_to_speech(text, lang = 'en-US') {
  const client = createTextToSpeechClient();

  const request = {
    audioConfig: {
      // select the type of audio encoding
      audioEncoding: 'LINEAR16',
      effectsProfileId: ['small-bluetooth-speaker-class-device'],
      pitch: 0,
      speakingRate: 0.9,
    },
    input: { text },
    // Select the language and SSML voice gender (optional)
    voice: {
      languageCode: lang,
      name:
        lang === 'en-US'
          ? 'en-US-Wavenet-J'
          : lang === 'ar-XA'
          ? 'ar-XA-Wavenet-C'
          : undefined,
    },
  };
  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  // returns the audio content as a buffer
  return Promise.resolve(response.audioContent);
}

module.exports = { speech_to_text, text_to_speech };
