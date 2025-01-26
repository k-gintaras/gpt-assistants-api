// const express = require('express');
// const bodyParser = require('body-parser');
// const { Configuration, OpenAIApi } = require('openai');
// require('dotenv').config();

// const app = express();
// app.use(bodyParser.json());

// // Initialize OpenAI API
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// // GPT API Logic
// const handleGPTRequest = async ({ level, prompt, history = [], instructions = '', functionDetails = {} }) => {
//   let messages = [];
//   let model = 'gpt-3.5-turbo'; // Default model

//   switch (level) {
//     case 'basic':
//       // Use a simple prompt for completions
//       return await openai.createCompletion({
//         model: 'text-davinci-003', // Faster and cheaper for simple completions
//         prompt,
//         max_tokens: 100,
//         temperature: 0.7,
//       });

//     case 'chat':
//       // Chat format with limited history
//       messages = history.concat({ role: 'user', content: prompt });
//       break;

//     case 'assistant':
//       // Advanced assistant, full history and instructions
//       messages = [{ role: 'system', content: instructions }, ...history, { role: 'user', content: prompt }];
//       model = 'gpt-4'; // Use a smarter model for better reasoning
//       break;

//     case 'function':
//       // Handle function-specific prompts and integrations
//       const { name, params } = functionDetails;
//       messages = [{ role: 'system', content: `Use the function '${name}' with parameters: ${JSON.stringify(params)}` }, ...history, { role: 'user', content: prompt }];
//       break;

//     default:
//       throw new Error(`Unknown intellect level: ${level}`);
//   }

//   // Call GPT API
//   return await openai.createChatCompletion({
//     model,
//     messages,
//     max_tokens: 200, // Adjust based on response length
//     temperature: 0.7, // Adjust creativity
//   });
// };

// // API Route
// app.post('/api/gpt', async (req, res) => {
//   const { intellect_level, prompt, history, instructions, functionDetails } = req.body;

//   try {
//     const response = await handleGPTRequest({
//       level: intellect_level,
//       prompt,
//       history,
//       instructions,
//       functionDetails,
//     });

//     res.status(200).json({ response: response.data });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to process the request.' });
//   }
// });

// // Start Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
