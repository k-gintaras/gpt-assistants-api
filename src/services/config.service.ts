import { Memory } from '../models/memory.model';

export const DEFAULT_MAX_ASSISTANT_MEMORIES = 5;
export const DEFAULT_MODEL = 'gpt-3.5-turbo-16k';
export const DEFAULT_INSTRUCTIONS = 'Please try your best to be concise.';
export const MEMORY_TYPES_PASSED_AS_MESSAGES: Memory['type'][] = ['knowledge', 'prompt', 'meta', 'session']; // we pass instructions to assistan itself
export const INSTRUCTION_SEPARATOR = '❤️'; // gpt likes ###, # or 🤍
