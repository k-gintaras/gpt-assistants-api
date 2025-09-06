import { Route, Tags, Get, Post, Put, Delete, Path, Body, ValidateError, SuccessResponse } from 'tsoa';
import { FeedbackControllerService } from '../services/core-services/feedback.controller.service';
import { getDb } from '../database/database';
import { Feedback } from '../models/feedback.model';

@Route('feedback')
@Tags('Feedback')
export class FeedbackController {
  private readonly feedbackService: FeedbackControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.feedbackService = new FeedbackControllerService(pool);
  }

  @Get('/{id}')
  public async getFeedbackById(@Path() id: string): Promise<Feedback> {
    const feedback = await this.feedbackService.getFeedbackById(id);
    if (!feedback) throw new ValidateError({}, `Feedback with ID ${id} not found.`);
    return feedback;
  }

  @Get('/target/{targetType}/{targetId}')
  public async getFeedbackByTarget(@Path() targetType: 'assistant' | 'memory' | 'task', @Path() targetId: string): Promise<Feedback[]> {
    const feedback = await this.feedbackService.getFeedbackByTarget(targetId, targetType);
    if (!feedback || feedback.length === 0) throw new ValidateError({}, `No feedback found for ${targetType} with ID ${targetId}.`);
    return feedback;
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async addFeedback(@Body() feedback: Omit<Feedback, 'id'>): Promise<{ id: string }> {
    const feedbackId = await this.feedbackService.addFeedback(feedback);
    if (!feedbackId) throw new ValidateError({}, 'Failed to add feedback.');
    return { id: feedbackId };
  }

  @Put('/{id}')
  public async updateFeedback(@Path() id: string, @Body() updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const isUpdated = await this.feedbackService.updateFeedback(id, updates);
    if (!isUpdated) throw new ValidateError({}, `Feedback with ID ${id} not found or update failed.`);
  }

  @Delete('/{id}')
  public async deleteFeedback(@Path() id: string): Promise<void> {
    const isDeleted = await this.feedbackService.deleteFeedback(id);
    if (!isDeleted) throw new ValidateError({}, `Feedback with ID ${id} not found or delete failed.`);
  }
}
