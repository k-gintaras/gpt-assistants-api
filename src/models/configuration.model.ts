export interface Configuration {
  id: string; // Configuration ID
  scope: 'global' | 'assistant'; // Scope of the configuration
  targetId?: string; // Target assistant ID (if scope is "assistant")
  settings: Record<string, unknown>; // Configuration key-value pairs
  createdAt: Date; // Configuration creation timestamp
  updatedAt: Date; // Last update timestamp
}
