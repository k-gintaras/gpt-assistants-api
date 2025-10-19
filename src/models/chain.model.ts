export type ChainMode = 'broadcast';

export type ChainOptions = {
  batchSize?: number;       // e.g. 5
  baseDelayMs?: number;     // e.g. 250
  delayFactor?: number;     // e.g. 2
  maxDelayMs?: number;      // e.g. 2000
  user?: string;            // openai user field
};

export interface BroadcastChainInput {
  assistantIds: string[];
  messages: { role: 'user'|'developer'|'assistant'; content: string; }[];
  description?: string;     // parent task description
  options?: ChainOptions;
}

export interface ChainProgress {
  done: number;
  total: number;
  pct: number;
}