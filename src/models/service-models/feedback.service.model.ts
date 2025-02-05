import { Feedback } from '../feedback.model';

export interface FeedbackServiceModel {
  getFeedbackById(id: string): Promise<Feedback | null>;
  getFeedbackByTarget(targetId: string, targetType: 'assistant' | 'memory' | 'task'): Promise<Feedback[]>;
  addFeedback(feedback: Feedback): Promise<string>;
  updateFeedback(id: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean>;
  deleteFeedback(id: string): Promise<boolean>;
}
