// todo some kind of settings or config object to help us manage the rest of the app and calculate stuff...
//  Optional
// The system instructions that the assistant uses. The maximum length is 256,000 characters.
// Define the structure for CreateAssistantRequest
// Extend CreateAssistantRequest to ensure optional fields have proper defaults

// current    ly enabled models:
/**
 * Allowed models
Only these models can be used in this project.
gpt-4-turbo-preview
gpt-4o
gpt-4
gpt-3.5-turbo-16k
gpt-4-turbo-2024-04-09
gpt-4-turbo
 */

// Model Alias,	Context Window,	Max Output Tokens,	Description	Use Case
// gpt-4o	128,000 tokens	16,384 tokens	High-intelligence, versatile flagship model.	Complex tasks, research, structured outputs.
// gpt-4o-mini	128,000 tokens	16,384 tokens	Fast, affordable, smaller model.	Cost-effective tasks, fine-tuning.
// o1	200,000 tokens	100,000 tokens	Advanced reasoning with step-by-step logic.	Solving hard problems, detailed reasoning.
// o1-mini	128,000 tokens	65,536 tokens	Affordable reasoning for specialized tasks.	Fast reasoning, smaller contexts.
// gpt-4-turbo	128,000 tokens	4,096 tokens	Optimized for cost and shorter responses.	Budget-friendly conversational tasks.
// gpt-4	8,192 tokens	8,192 tokens	Older high-intelligence model.	Short, focused tasks, limited context.
// gpt-3.5-turbo	16,385 tokens	4,096 tokens	Economical, fast, and reliable.	Lightweight, budget-friendly tasks.
// TODO: expand a bit, add more available models... as we maybe want to try the MINI too
