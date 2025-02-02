// gptApiConnector.ts - A module to initialize and manage OpenAI API connection

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Singleton instance to ensure a single OpenAI client
let openaiInstance: OpenAI | null = null;

/**
 * Initialize the OpenAI client with organization and project details.
 * @param apiKey - Your OpenAI API Key.
 * @param project - Your OpenAI project ID.
 */
export function initOpenAI(apiKey: string, project: string): void {
  if (!apiKey || !project) {
    throw new Error('API Key and Project Key are required to initialize OpenAI.');
  }
  openaiInstance = new OpenAI({
    apiKey,
    project,
  });
  // console.log('OpenAI client initialized with project:', project);
}

/**
 * Get the initialized OpenAI client.
 * @returns The OpenAI client instance.
 */
export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    const projectKey = process.env.OPENAI_PROJECT_ID;

    if (!apiKey || !projectKey) {
      throw new Error('Environment variables OPENAI_API_KEY and OPENAI_PROJECT_KEY are required.');
    }

    initOpenAI(apiKey, projectKey);
  }
  if (!openaiInstance) {
    throw new Error('GPT API Initialization failed.');
  }
  return openaiInstance;
}
