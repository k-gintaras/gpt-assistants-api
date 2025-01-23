export interface User {
  id: string; // Unique identifier for the user
  name: string; // User's name
  preferences: {
    defaultAssistantType: 'completion' | 'chat' | 'assistant'; // Preferred assistant type
    feedbackFrequency: 'always' | 'sometimes' | 'never'; // Frequency of feedback requests
  };
  createdAt: Date; // User account creation timestamp
  updatedAt: Date; // Last update timestamp
}
