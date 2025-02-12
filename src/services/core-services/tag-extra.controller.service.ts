import { Tag } from '../../models/tag.model';
import { TagExtraServiceModel } from '../../models/service-models/tag-extra.service.model';
import { Pool } from 'pg';
import { TagExtraService } from '../sqlite-services/tag-extra.service';

export class TagExtraControllerService implements TagExtraServiceModel {
  tagExtraService: TagExtraService;

  constructor(pool: Pool) {
    this.tagExtraService = new TagExtraService(pool);
  }

  async getTagsByEntity(entityId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<Tag[]> {
    return await this.tagExtraService.getTagsByEntity(entityId, entityType);
  }

  async addTagToEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    return await this.tagExtraService.addTagToEntity(entityId, tagId, entityType);
  }

  async addTagNamesToEntity(entityId: string, tagNames: string[], entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    return await this.tagExtraService.addTagNamesToEntity(entityId, tagNames, entityType);
  }

  async removeTagFromEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    return await this.tagExtraService.removeTagFromEntity(entityId, tagId, entityType);
  }
}
