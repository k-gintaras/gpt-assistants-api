import Database from 'better-sqlite3';
import { Feedback } from '../../models/feedback.model';
import { FeedbackServiceModel } from '../../models/service-models/feedback.service.model';
import { FeedbackService } from '../sqlite-services/feedback.service';

export class FeedbackControllerService implements FeedbackServiceModel {
  feedbackService: FeedbackService;

  constructor(db: Database.Database) {
    this.feedbackService = new FeedbackService(db);
  }

  getFeedbackById(id: string): Feedback | null {
    return this.feedbackService.getFeedbackById(id);
  }

  getFeedbackByTarget(targetId: string, targetType: 'assistant' | 'memory' | 'task'): Feedback[] {
    return this.feedbackService.getFeedbackByTarget(targetId, targetType);
  }

  addFeedback(feedback: Feedback): Promise<string> {
    return this.feedbackService.addFeedback(feedback);
  }

  updateFeedback(id: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    return this.feedbackService.updateFeedback(id, updates);
  }

  deleteFeedback(id: string): Promise<boolean> {
    return this.feedbackService.deleteFeedback(id);
  }
}
