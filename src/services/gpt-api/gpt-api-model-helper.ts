export interface PromptEvaluation {
  estimatedInputTokens: number;
  requiredOutputTokens: number;
  intelligenceLevel: 'basic' | 'intermediate' | 'advanced';
  suggestedModel: string;
  availableResponseTokens: number;
  isFeasible: boolean;
  recommendations: string[];
}

export interface Model {
  alias: string;
  contextWindow: number; // Maximum tokens for context (input + output)
  maxOutputTokens: number;
  description: string;
  useCase: string;
}

/**
 * Model Definitions
 */
export const models: Record<string, Model> = {
  'gpt-4o': {
    alias: 'gpt-4o',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    description: 'High-intelligence, versatile flagship model.',
    useCase: 'Complex tasks, research, structured outputs.',
  },
  'gpt-4o-mini': {
    alias: 'gpt-4o-mini',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    description: 'Fast, affordable, smaller model.',
    useCase: 'Cost-effective tasks, fine-tuning.',
  },
  o1: {
    alias: 'o1',
    contextWindow: 200000,
    maxOutputTokens: 100000,
    description: 'Advanced reasoning with step-by-step logic.',
    useCase: 'Solving hard problems, detailed reasoning.',
  },
  'o1-mini': {
    alias: 'o1-mini',
    contextWindow: 128000,
    maxOutputTokens: 65536,
    description: 'Affordable reasoning for specialized tasks.',
    useCase: 'Fast reasoning, smaller contexts.',
  },
  'gpt-4-turbo': {
    alias: 'gpt-4-turbo',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    description: 'Optimized for cost and shorter responses.',
    useCase: 'Budget-friendly conversational tasks.',
  },
  'gpt-3.5-turbo-16k': {
    alias: 'gpt-3.5-turbo-16k',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    description: 'Economical, fast, and reliable.',
    useCase: 'Lightweight, budget-friendly tasks.',
  },
};

/**
 * Calculate token usage and suggest a model.
 * @param inputTokens - Estimated number of tokens in the input prompt.
 * @param outputTokens - Desired number of tokens in the model's response.
 * @param intelligence - Required intelligence level for the task.
 * @returns A `PromptEvaluation` object.
 */
export function evaluatePrompt(inputTokens: number, outputTokens: number, intelligence: 'basic' | 'intermediate' | 'advanced'): PromptEvaluation {
  const selectedModelAlias = intelligence === 'advanced' ? 'gpt-4o' : intelligence === 'intermediate' ? 'gpt-4-turbo' : 'gpt-3.5-turbo-16k';

  const selectedModel = models[selectedModelAlias];
  const totalRequiredTokens = inputTokens + outputTokens;
  const availableResponseTokens = selectedModel.contextWindow - inputTokens;
  const isFeasible = totalRequiredTokens <= selectedModel.contextWindow;

  const recommendations: string[] = [];
  if (!isFeasible) {
    recommendations.push(`Reduce input or output. Total tokens (${totalRequiredTokens}) exceed the context window (${selectedModel.contextWindow}) of the selected model (${selectedModel.alias}).`);
  }
  if (availableResponseTokens < outputTokens) {
    recommendations.push(`Output exceeds available space (${availableResponseTokens}). Consider reducing desired output length.`);
  }

  return {
    estimatedInputTokens: inputTokens,
    requiredOutputTokens: outputTokens,
    intelligenceLevel: intelligence,
    suggestedModel: selectedModel.alias,
    availableResponseTokens,
    isFeasible,
    recommendations,
  };
}

/**
 * Estimate token count from text.
 * @param text - Input text to calculate token usage.
 * @returns Estimated token count.
 */
export function estimateTokens(text: string): number {
  const avgCharsPerToken = 4; // Average 4 characters per token for English text
  return Math.ceil(text.length / avgCharsPerToken);
}

/**
 * Get models capable of handling a given input-output requirement.
 * @param inputTokens - Estimated input token size.
 * @param outputTokens - Required output token size.
 * @returns List of suitable models.
 */
export function getSuitableModels(inputTokens: number, outputTokens: number): Model[] {
  return Object.values(models).filter((model) => inputTokens + outputTokens <= model.contextWindow && outputTokens <= model.maxOutputTokens);
}

/**
 * Estimate tokens based on word count.
 * @param words - Number of words in the text.
 * @returns Estimated token count.
 */
export function estimateTokensFromWords(words: number): number {
  const avgWordsPerToken = 0.75; // Roughly ¾ of a word per token
  return Math.ceil(words / avgWordsPerToken);
}

/**
 * Estimate token usage for various response sizes.
 * @param inputWords - Number of words in the input text.
 * @param responseSize - Expected response size ('sentence', 'paragraph', 'page', 'multi-page').
 * @returns Estimated input and output token count.
 */
export function estimateTokensForResponse(inputWords: number, responseSize: 'sentence' | 'paragraph' | 'page' | 'multi-page'): { inputTokens: number; outputTokens: number; totalTokens: number } {
  const responseWordEstimates: Record<typeof responseSize, number> = {
    sentence: 20, // Approx. 20 words per sentence
    paragraph: 150, // Approx. 150 words per paragraph
    page: 300, // Approx. 300 words per page
    'multi-page': 1000, // Approx. 1000 words for multi-page responses
  };

  const inputTokens = estimateTokensFromWords(inputWords);
  const outputWords = responseWordEstimates[responseSize];
  const outputTokens = estimateTokensFromWords(outputWords);
  const totalTokens = inputTokens + outputTokens;

  return { inputTokens, outputTokens, totalTokens };
}

/**
 * Estimate token usage from a prompt and expected response size.
 * @param prompt - The input text for the prompt.
 * @param responseSize - Expected response size ('sentence', 'paragraph', 'page', 'multi-page').
 * @returns Estimated input tokens, output tokens, and total tokens.
 */
export function estimateTokensFromPrompt(prompt: string, responseSize: 'sentence' | 'paragraph' | 'page' | 'multi-page'): { inputTokens: number; outputTokens: number; totalTokens: number } {
  const inputWords = prompt.trim() === '' ? 0 : prompt.split(/\s+/).length; // Handle empty prompt explicitly
  return estimateTokensForResponse(inputWords, responseSize);
}
