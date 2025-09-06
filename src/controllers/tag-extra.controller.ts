import { Route, Tags, Get, Post, Delete, Path, ValidateError, SuccessResponse } from 'tsoa';
import { TagExtraControllerService } from '../services/core-services/tag-extra.controller.service';
import { getDb } from '../database/database';
import { Tag } from '../models/tag.model';

@Route('tag-extra')
@Tags('TagExtra')
export class TagExtraController {
  private readonly tagExtraService: TagExtraControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.tagExtraService = new TagExtraControllerService(pool);
  }

  @Get('/entity/{entityId}/{entityType}')
  public async getTagsByEntity(@Path() entityId: string, @Path() entityType: 'memory' | 'assistant' | 'task'): Promise<Tag[]> {
    const tags = await this.tagExtraService.getTagsByEntity(entityId, entityType);
    if (!tags || tags.length === 0) throw new ValidateError({}, `No tags found for entity type ${entityType} and ID ${entityId}.`);
    return tags;
  }

  @Post('/entity/{entityId}/{entityType}/{tagId}/{isNames}')
  @SuccessResponse('201', 'Created')
  public async addTagToEntity(@Path() entityId: string, @Path() entityType: 'memory' | 'assistant' | 'task', @Path() tagId: string, @Path() isNames: boolean): Promise<void> {
    let isAdded = false;
    if (isNames) {
      const tags = tagId.split(',');
      if (!tags) throw new ValidateError({}, 'Failed to add tag to entity.');
      isAdded = await this.tagExtraService.addTagNamesToEntity(entityId, tags, entityType);
    } else {
      isAdded = await this.tagExtraService.addTagToEntity(entityId, tagId, entityType);
    }
    if (!isAdded) throw new ValidateError({}, 'Failed to add tag to entity.');
  }

  @Delete('/entity/{entityId}/{entityType}/{tagId}')
  public async removeTagFromEntity(@Path() entityId: string, @Path() entityType: 'memory' | 'assistant' | 'task', @Path() tagId: string): Promise<void> {
    const isRemoved = await this.tagExtraService.removeTagFromEntity(entityId, tagId, entityType);
    if (!isRemoved) throw new ValidateError({}, 'Failed to remove tag from entity.');
  }
}
