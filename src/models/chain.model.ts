export type ChainMode = 'broadcast' | 'relay';

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

export interface RelayStep {
  assistantId: string;
  messageTemplate: string; // e.g. "Given INTERFACE:\n{{prev_reply}}\nCreate semantic HTML."
}

export interface RelayChainInput {
  steps: RelayStep[];      // ordered
  description?: string;
  options?: ChainOptions;
}

export interface ChainProgress {
  done: number;
  total: number;
  pct: number;
}

export interface RelayChainProgress extends ChainProgress {
  stepTrack: string; // e.g. "step1:completed -> step2:in_progress -> step3:pending"
}