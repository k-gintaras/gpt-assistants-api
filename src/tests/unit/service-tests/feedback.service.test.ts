import { Pool } from 'pg';
import { Feedback } from '../../../models/feedback.model';
import { FeedbackService } from '../../../services/sqlite-services/feedback.service';
import { getDb } from '../test-db.helper';

let feedbackService: FeedbackService;
let db: Pool;

describe('Feedback Service', () => {
  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    feedbackService = new FeedbackService(db);
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    await db.query('BEGIN'); // Start transaction for each test
  });

  afterEach(async () => {
    await db.query('ROLLBACK'); // Rollback changes after each test
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

    const feedback = await feedbackService.getFeedbackById(feedbackId);
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

    const updatedFeedback = await feedbackService.getFeedbackById(feedbackId);
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

    const deletedFeedback = await feedbackService.getFeedbackById(feedbackId);
    expect(deletedFeedback).toBeNull();
  });

  it('should fetch feedback for a specific target', async () => {
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

    const feedbackList = await feedbackService.getFeedbackByTarget('memory1', 'memory');
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
