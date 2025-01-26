import {
  estimateTokens,
  PromptEvaluation,
  evaluatePrompt,
  getSuitableModels,
  models,
  estimateTokensForResponse,
  estimateTokensFromWords,
  estimateTokensFromPrompt,
} from '../../../services/gpt-api/gpt-api-model-helper';

describe('Token Utility Functions', () => {
  it('should correctly estimate tokens from text', () => {
    const text = 'This is a test input string.';
    const expectedTokens = Math.ceil(text.length / 4); // Approx. 4 chars per token
    expect(estimateTokens(text)).toBe(expectedTokens);
  });

  it('should evaluate a feasible prompt correctly', () => {
    const inputTokens = 1000;
    const outputTokens = 2000;
    const intelligence = 'advanced';
    const evaluation: PromptEvaluation = evaluatePrompt(inputTokens, outputTokens, intelligence);

    expect(evaluation).toEqual(
      expect.objectContaining({
        estimatedInputTokens: inputTokens,
        requiredOutputTokens: outputTokens,
        intelligenceLevel: intelligence,
        suggestedModel: 'gpt-4o',
        availableResponseTokens: expect.any(Number),
        isFeasible: true,
        recommendations: [],
      })
    );
  });

  it('should evaluate a non-feasible prompt correctly', () => {
    const inputTokens = 130000;
    const outputTokens = 10000;
    const intelligence = 'advanced';
    const evaluation: PromptEvaluation = evaluatePrompt(inputTokens, outputTokens, intelligence);

    expect(evaluation).toEqual(
      expect.objectContaining({
        estimatedInputTokens: inputTokens,
        requiredOutputTokens: outputTokens,
        intelligenceLevel: intelligence,
        suggestedModel: 'gpt-4o',
        isFeasible: false,
        recommendations: expect.arrayContaining([expect.stringContaining('exceed the context window')]),
      })
    );
  });

  it('should return suitable models for a given input-output requirement', () => {
    const inputTokens = 10000;
    const outputTokens = 5000;
    const suitableModels = getSuitableModels(inputTokens, outputTokens);

    expect(suitableModels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alias: 'gpt-4o',
        }),
        expect.objectContaining({
          alias: 'o1',
        }),
      ])
    );
    expect(suitableModels).not.toContainEqual(
      expect.objectContaining({
        alias: 'gpt-4-turbo',
      })
    );
  });

  it('should handle edge cases for token estimation', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('A')).toBe(1);
    expect(estimateTokens('This text is 20 characters long.')).toBe(Math.ceil(32 / 4)); // 32 chars
  });
});

describe('Model Definitions', () => {
  it('should include all defined models', () => {
    const expectedModels = ['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini', 'gpt-4-turbo', 'gpt-3.5-turbo-16k'];
    const actualModels = Object.keys(models);
    expect(actualModels).toEqual(expect.arrayContaining(expectedModels));
  });

  it('should validate model properties', () => {
    Object.values(models).forEach((model) => {
      expect(model).toEqual(
        expect.objectContaining({
          alias: expect.any(String),
          contextWindow: expect.any(Number),
          maxOutputTokens: expect.any(Number),
          description: expect.any(String),
          useCase: expect.any(String),
        })
      );
    });
  });
});

describe('Word and Token Estimation', () => {
  it('should estimate tokens from word count accurately', () => {
    const words = 200;
    const expectedTokens = Math.ceil(words / 0.75); // ¾ word per token
    expect(estimateTokensFromWords(words)).toBe(expectedTokens);
  });

  it('should estimate token usage for response sizes', () => {
    const inputWords = 200;
    const responseSize = 'paragraph'; // Approx. 150 words
    const { inputTokens, outputTokens, totalTokens } = estimateTokensForResponse(inputWords, responseSize);

    const expectedInputTokens = estimateTokensFromWords(inputWords);
    const expectedOutputTokens = estimateTokensFromWords(150); // Paragraph size
    const expectedTotalTokens = expectedInputTokens + expectedOutputTokens;

    expect(inputTokens).toBe(expectedInputTokens);
    expect(outputTokens).toBe(expectedOutputTokens);
    expect(totalTokens).toBe(expectedTotalTokens);
  });

  it('should integrate with evaluatePrompt for larger scenarios', () => {
    const inputWords = 200;
    const responseSize = 'multi-page'; // Approx. 1000 words
    const { inputTokens, outputTokens } = estimateTokensForResponse(inputWords, responseSize);

    const evaluation: PromptEvaluation = evaluatePrompt(inputTokens, outputTokens, 'advanced');

    expect(evaluation).toEqual(
      expect.objectContaining({
        estimatedInputTokens: inputTokens,
        requiredOutputTokens: outputTokens,
        isFeasible: expect.any(Boolean),
        recommendations: expect.any(Array),
      })
    );
  });

  it('should handle edge cases for minimal input and response sizes', () => {
    const inputWords = 1;
    const responseSize = 'sentence'; // Approx. 20 words
    const { inputTokens, outputTokens, totalTokens } = estimateTokensForResponse(inputWords, responseSize);

    expect(inputTokens).toBe(estimateTokensFromWords(inputWords));
    expect(outputTokens).toBe(estimateTokensFromWords(20));
    expect(totalTokens).toBe(inputTokens + outputTokens);
  });
});
describe('Estimate Tokens from Prompt', () => {
  it('should estimate tokens for a short sentence prompt with a sentence response', () => {
    const prompt = 'This is a short sentence.';
    const responseSize = 'sentence';

    const { inputTokens, outputTokens, totalTokens } = estimateTokensFromPrompt(prompt, responseSize);

    const inputWords = prompt.split(/\s+/).length;
    const expectedInputTokens = Math.ceil(inputWords / 0.75);
    const expectedOutputTokens = Math.ceil(20 / 0.75); // Sentence response size
    const expectedTotalTokens = expectedInputTokens + expectedOutputTokens;

    expect(inputTokens).toBe(expectedInputTokens);
    expect(outputTokens).toBe(expectedOutputTokens);
    expect(totalTokens).toBe(expectedTotalTokens);
  });

  it('should estimate tokens for a paragraph prompt with a multi-page response', () => {
    const prompt = 'This is a longer prompt that contains multiple sentences. It represents a full paragraph. Imagine it is a detailed explanation or input provided to the model.';
    const responseSize = 'multi-page';

    const { inputTokens, outputTokens, totalTokens } = estimateTokensFromPrompt(prompt, responseSize);

    const inputWords = prompt.split(/\s+/).length;
    const expectedInputTokens = Math.ceil(inputWords / 0.75);
    const expectedOutputTokens = Math.ceil(1000 / 0.75); // Multi-page response size
    const expectedTotalTokens = expectedInputTokens + expectedOutputTokens;

    expect(inputTokens).toBe(expectedInputTokens);
    expect(outputTokens).toBe(expectedOutputTokens);
    expect(totalTokens).toBe(expectedTotalTokens);
  });

  it('should handle edge cases for empty prompt', () => {
    const prompt = '';
    const responseSize = 'sentence';

    const { inputTokens, outputTokens, totalTokens } = estimateTokensFromPrompt(prompt, responseSize);

    const expectedInputTokens = 0; // No input words
    const expectedOutputTokens = Math.ceil(20 / 0.75); // Sentence response size
    const expectedTotalTokens = expectedInputTokens + expectedOutputTokens;

    expect(inputTokens).toBe(expectedInputTokens);
    expect(outputTokens).toBe(expectedOutputTokens);
    expect(totalTokens).toBe(expectedTotalTokens);
  });

  it('should handle edge cases for single-word prompt', () => {
    const prompt = 'Word';
    const responseSize = 'sentence';

    const { inputTokens, outputTokens, totalTokens } = estimateTokensFromPrompt(prompt, responseSize);

    const inputWords = prompt.split(/\s+/).length;
    const expectedInputTokens = Math.ceil(inputWords / 0.75);
    const expectedOutputTokens = Math.ceil(20 / 0.75); // Sentence response size
    const expectedTotalTokens = expectedInputTokens + expectedOutputTokens;

    expect(inputTokens).toBe(expectedInputTokens);
    expect(outputTokens).toBe(expectedOutputTokens);
    expect(totalTokens).toBe(expectedTotalTokens);
  });
});
