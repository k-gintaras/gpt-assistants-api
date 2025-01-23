export interface PromotionCriteria {
  assistantId: string; // ID of the assistant
  criteria: {
    positiveFeedbackThreshold: number; // Minimum positive feedback count
    tasksCompletedThreshold: number; // Minimum tasks completed
    memoryExpansion: boolean; // Whether to add more memories upon promotion
  };
  nextLevel: 'chat' | 'assistant'; // Target level after promotion
}
