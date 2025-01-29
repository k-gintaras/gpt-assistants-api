import { Feedback } from '../feedback.model';

export interface FeedbackServiceModel {
  getFeedbackById(id: string): Feedback | null;
  getFeedbackByTarget(targetId: string, targetType: 'assistant' | 'memory' | 'task'): Feedback[];
  addFeedback(feedback: Feedback): Promise<string>;
  updateFeedback(id: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean>;
  deleteFeedback(id: string): Promise<boolean>;
}
