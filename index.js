
// Voicebot TECHTRAL – v1.0
// Framework: Node.js with Express
// Function: Handle incoming Twilio calls, play TTS via ElevenLabs, collect user data

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { twiml: { VoiceResponse } } = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Config – ElevenLabs API key și Voice ID Lea
const ELEVEN_API_KEY = 'sk-VjvM4x9QBhg6SXB9ZYgZTxJHtfqYctwR0QUh92A7n2sJ3UXK';
const ELEVEN_VOICE_ID = {
  de: 'EXAVITQu4vr4xnSDxMaL',  // Lea – German
  en: 'EXAVITQu4vr4xnSDxMaL'   // Lea – English (fallback)
};

// Generate TTS audio
async function generateTTS(text, lang = 'de') {
  const voiceId = ELEVEN_VOICE_ID[lang] || ELEVEN_VOICE_ID['de'];
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await axios.post(url, {
    text,
    model_id: 'eleven_monolingual_v1',
    voice_settings: { stability: 0.45, similarity_boost: 0.7 }
  }, {
    headers: {
      'xi-api-key': ELEVEN_API_KEY,
      'Content-Type': 'application/json'
    },
    responseType: 'arraybuffer'
  });
  return response.data;
}

// Endpoint pentru Twilio – primire apel
app.post('/voice', async (req, res) => {
  const response = new VoiceResponse();

  // Mesajul inițial (în germană)
  const welcomeText = 'Willkommen bei TECHTRAL. Bleiben Sie bitte kurz dran. Wir stellen Ihnen ein paar Fragen, damit wir Ihnen besser helfen können.';

  const gather = response.gather({ input: 'speech', action: '/handle-name', method: 'POST', language: 'de-DE' });
  gather.say({ language: 'de-DE', voice: 'Polly.Vicki' }, welcomeText);

  res.type('text/xml');
  res.send(response.toString());
});

// Temporar – răspuns când se colectează numele
app.post('/handle-name', (req, res) => {
  const response = new VoiceResponse();
  const name = req.body.SpeechResult || 'Kunde';
  response.say({ language: 'de-DE', voice: 'Polly.Vicki' }, `Danke ${name}. Ein Ticket wird erstellt.`);
  res.type('text/xml');
  res.send(response.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TECHTRAL Voicebot listening on port ${PORT}`));
