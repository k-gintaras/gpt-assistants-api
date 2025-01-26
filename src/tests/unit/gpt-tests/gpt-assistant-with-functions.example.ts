// import OpenAI, { CreateAssistantRequest } from 'openai';

// // Initialize OpenAI Client
// const openai = new OpenAI(process.env.OPENAI_API_KEY!);

// // Define the structure for an Assistant
// interface Assistant {
//   id: string;
//   name?: string;
//   description?: string;
//   instructions?: string;
// }

// // Define function schema for JSON output
// interface FunctionSchema {
//   name: string;
//   description: string;
//   parameters: {
//     type: string;
//     properties: Record<string, any>;
//     required: string[];
//   };
// }

// // Function to create an assistant with structured output capability
// async function createAssistantWithFunction(name: string, instructions: string, functionSchema: FunctionSchema): Promise<Assistant> {
//   const payload: CreateAssistantRequest = {
//     model: 'gpt-4o',
//     instructions,
//     name,
//     tools: [{ type: 'function', function: functionSchema }],
//   };

//   const response = await openai.assistants.create(payload);
//   console.log('Assistant with function created:', response);
//   return {
//     id: response.id,
//     name: response.name,
//     description: response.description,
//     instructions: response.instructions,
//   };
// }

// // Define your function for outputting JSON
// const functionSchema: FunctionSchema = {
//   name: 'WeatherInfo',
//   description: 'Provides current weather information in JSON format',
//   parameters: {
//     type: 'object',
//     properties: {
//       location: { type: 'string', description: 'Location for weather data' },
//       temperature: { type: 'number', description: 'Current temperature' },
//       conditions: { type: 'string', description: 'Weather conditions' },
//     },
//     required: ['location', 'temperature', 'conditions'],
//   },
// };

// // // Example usage
// // async function exampleFunctionIntegration() {
// //   const assistant = await createAssistantWithFunction('Weather Assistant', 'You provide weather information in JSON format only.', functionSchema);

// //   console.log('Created Assistant:', assistant);
// // }

// // Uncomment to run the example
// // exampleFunctionIntegration();

// import OpenAI from 'openai';

// const openai = new OpenAI(process.env.OPENAI_API_KEY!);

// // Define assistant with function capability
// async function createAssistantWithFunction() {
//   const assistant = await openai.assistants.create({
//     model: 'gpt-4o',
//     name: 'Weather Assistant',
//     instructions: 'You can ask about current weather and I will use my weather function.',
//     tools: [
//       {
//         type: 'function',
//         function: {
//           name: 'getWeather',
//           description: 'Get the current weather for a specific location',
//           parameters: {
//             type: 'object',
//             properties: {
//               location: {
//                 type: 'string',
//                 description: 'The city and country, e.g., New York, USA',
//               },
//             },
//             required: ['location'],
//           },
//         },
//       },
//     ],
//   });

//   console.log('Assistant created:', assistant);
// }

// // Create the assistant
// createAssistantWithFunction();
// async function handleThreadWithFunction() {
//   // Create a new thread
//   const threadResponse = await openai.threads.create({
//     messages: [
//       { role: 'system', content: 'You are a helpful assistant.' },
//       { role: 'user', content: 'What is the weather in Los Angeles?' },
//     ],
//   });

//   const threadId = threadResponse.id;

//   // Run the assistant with function call ability
//   const runResponse = await openai.threads.runs.create({
//     thread_id: threadId,
//     assistant_id: 'your-assistant-id',
//   });

//   const actions = runResponse.required_action;

//   // Check if the assistant wants to call a function
//   if (actions && actions.type === 'function_call') {
//     const { name, arguments } = actions.details;

//     if (name === 'getWeather') {
//       const location = arguments.location;
//       const weatherInfo = getCurrentWeather(location);

//       // Submit the function output
//       await openai.threads.runs.submit_tool_outputs(threadId, {
//         tool_outputs: [
//           {
//             tool_call_id: actions.tool_call_id,
//             output: weatherInfo,
//           },
//         ],
//       });

//       console.log('Function executed and output submitted:', weatherInfo);
//     }
//   }
// }

// // Run the function-enabled thread
// handleThreadWithFunction();
