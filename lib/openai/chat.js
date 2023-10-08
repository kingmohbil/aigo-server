const env = require('dotenv').config().parsed;
const OpenAI = require('openai');

const chatGPT = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const chat = async (message) => {
  try {
    const chatCompletion = await chatGPT.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 45,
      messages: [
        { role: 'system', content: 'You are a tour guide assistant, if any question about petro, petrol, pet, or petrock considred about petra city in jordan.' },
        { role: 'user', content: message },
      ],
    });

    const answer = chatCompletion.choices[0].message.content;
    return Promise.resolve(answer);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = { chat };
