import Database from 'better-sqlite3';
import { Feedback } from '../../../models/feedback.model';
import { FeedbackService } from '../../../services/sqlite-services/feedback.service';

let feedbackService: FeedbackService;
describe('Feedback Service', () => {
  beforeAll(() => {
    const db = new Database(':memory:');
    feedbackService = new FeedbackService(db);
    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        target_id TEXT NOT NULL,
        target_type TEXT CHECK(target_type IN ('assistant', 'memory', 'task')) NOT NULL,
        rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
        comments TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  });

  afterAll(() => {
    feedbackService.db.close();
  });

  it('should add feedback for a target', async () => {
    const feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'> = {
      targetId: 'task1',
      targetType: 'task',
      rating: 4,
      comments: 'Great performance!',
    };

    const feedbackId = await feedbackService.addFeedback(feedbackData);
    expect(feedbackId).toBeDefined();

    const feedback = feedbackService.getFeedbackById(feedbackId);
    expect(feedback).not.toBeNull();
    expect(feedback?.targetId).toBe('task1');
    expect(feedback?.targetType).toBe('task');
    expect(feedback?.rating).toBe(4);
    expect(feedback?.comments).toBe('Great performance!');
  });

  it('should update feedback', async () => {
    const feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'> = {
      targetId: 'task2',
      targetType: 'task',
      rating: 3,
      comments: 'Good, but room for improvement.',
    };

    const feedbackId = await feedbackService.addFeedback(feedbackData);

    const updates = {
      rating: 5,
      comments: 'Outstanding work!',
    };

    const updated = await feedbackService.updateFeedback(feedbackId, updates);
    expect(updated).toBe(true);

    const updatedFeedback = feedbackService.getFeedbackById(feedbackId);
    expect(updatedFeedback?.rating).toBe(5);
    expect(updatedFeedback?.comments).toBe('Outstanding work!');
  });

  it('should delete feedback', async () => {
    const feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'> = {
      targetId: 'task3',
      targetType: 'task',
      rating: 2,
      comments: 'Needs improvement.',
    };

    const feedbackId = await feedbackService.addFeedback(feedbackData);

    const deleted = await feedbackService.deleteFeedback(feedbackId);
    expect(deleted).toBe(true);

    const deletedFeedback = feedbackService.getFeedbackById(feedbackId);
    expect(deletedFeedback).toBeNull();
  });

  it('should fetch feedback for a specific target', async () => {
    // Add multiple feedback entries for the same target
    await feedbackService.addFeedback({
      targetId: 'memory1',
      targetType: 'memory',
      rating: 4,
      comments: 'Helpful memory!',
    });

    await feedbackService.addFeedback({
      targetId: 'memory1',
      targetType: 'memory',
      rating: 5,
      comments: 'Very insightful!',
    });

    const feedbackList = feedbackService.getFeedbackByTarget('memory1', 'memory');
    expect(feedbackList.length).toBeGreaterThanOrEqual(2);
    expect(feedbackList.every((feedback) => feedback.targetId === 'memory1')).toBe(true);
  });

  it('should throw an error when updating non-existent feedback', async () => {
    const updates = { rating: 3, comments: 'Test update' };

    await expect(feedbackService.updateFeedback('nonexistent-feedback', updates)).rejects.toThrow('Feedback with ID nonexistent-feedback not found.');
  });

  it('should return false when deleting non-existent feedback', async () => {
    const deleted = await feedbackService.deleteFeedback('nonexistent-feedback');
    expect(deleted).toBe(false);
  });
});
