// // Example usage
// async function exampleAssistantOperations() {
//   const assistantPayload: CreateGptAssistantRequest = {
//     model: 'gpt-4o',
//     instructions: 'You are a helpful math assistant.',
//     name: 'Math Tutor',
//     description: 'An assistant for learning and understanding math.',
//     tools: [
//       {
//         type: 'code_interpreter',
//       },
//       {
//         type: 'function',
//         function: {
//           name: 'calculate_area',
//           description: 'Calculate the area of geometric shapes.',
//           parameters: {
//             shape: 'string',
//             dimensions: 'object',
//           },
//         },
//       },
//     ],
//     metadata: { subject: 'math', level: 'advanced' },
//     temperature: 0.7,
//     top_p: 0.9,
//   };

//   // Create an assistant
//   const newAssistant = await createAssistant(assistantPayload);

//   // Retrieve the assistant by ID
//   const fetchedAssistant = await getAssistantById(newAssistant.id);

//   // Update the assistant
//   if (fetchedAssistant) {
//     await updateAssistant(fetchedAssistant.id, { name: 'Advanced Math Tutor', description: 'A more advanced math assistant.' });
//   }

//   // Delete the assistant
//   if (fetchedAssistant) {
//     await deleteAssistant(fetchedAssistant.id);
//   }
// }

// Uncomment to run the example
// exampleAssistantOperations();
