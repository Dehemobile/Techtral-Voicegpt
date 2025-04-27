
import express from "express";
import bodyParser from "body-parser";
import { OpenAI } from "openai";
import twilio from "twilio";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/voice", async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const userSpeech = req.body.SpeechResult || "Hello";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: userSpeech }],
  });

  const aiResponse = completion.choices[0].message.content;
  const elevenlabsAudioUrl = await generateElevenLabsAudio(aiResponse);

  twiml.play(elevenlabsAudioUrl);

  res.type("text/xml");
  res.send(twiml.toString());
});

async function generateElevenLabsAudio(text) {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  const response = await axios({
    method: "POST",
    url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    data: {
      text: text,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    },
  });

  return response.data.audio_url;
}

app.listen(port, () => {
  console.log(`VoiceBot AI server listening on port ${port}`);
});
