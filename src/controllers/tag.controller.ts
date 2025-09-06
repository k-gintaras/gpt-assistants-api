import { Route, Tags, Get, Post, Put, Delete, Path, Body, ValidateError, SuccessResponse } from 'tsoa';
import { TagControllerService } from '../services/core-services/tag.controller.service';
import { getDb } from '../database/database';
import { Tag } from '../models/tag.model';

@Route('tag')
@Tags('Tag')
export class TagController {
  private readonly tagControllerService: TagControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.tagControllerService = new TagControllerService(pool);
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async addTag(@Body() body: { name: string }): Promise<{ tagId: string }> {
    const tagId = await this.tagControllerService.addTag({ name: body.name });
    if (!tagId) throw new ValidateError({}, `Tag ${body.name} not created.`);
    return { tagId };
  }

  @Delete('/{tagId}')
  public async removeTag(@Path() tagId: string): Promise<void> {
    const removed = await this.tagControllerService.removeTag(tagId);
    if (!removed) throw new ValidateError({}, 'Tag to delete not found.');
  }

  @Put('/{tagId}')
  public async updateTag(@Path() tagId: string, @Body() updates: Partial<Omit<Tag, 'id'>>): Promise<void> {
    const updated = await this.tagControllerService.updateTag(tagId, updates);
    if (!updated) throw new ValidateError({}, 'Tag to update not found.');
  }

  @Get('/{tagId}')
  public async getTagById(@Path() tagId: string): Promise<Tag> {
    const tag = await this.tagControllerService.getTagById(tagId);
    if (!tag) throw new ValidateError({}, `Tag with ID ${tagId} not found.`);
    return tag;
  }

  @Get('/')
  public async getAllTags(): Promise<Tag[]> {
    const tags = await this.tagControllerService.getAllTags();
    return tags;
  }
}
