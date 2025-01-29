import { Tag } from '../../models/tag.model';
import { TagExtraServiceModel } from '../../models/service-models/tag-extra.service.model';
import { TagExtraService } from '../sqlite-services/tag-extra.service';
import Database from 'better-sqlite3';

export class TagExtraControllerService implements TagExtraServiceModel {
  tagExtraService: TagExtraService;

  constructor(db: Database.Database) {
    this.tagExtraService = new TagExtraService(db);
  }

  getTagsByEntity(entityId: string, entityType: 'memory' | 'assistant' | 'task'): Tag[] {
    return this.tagExtraService.getTagsByEntity(entityId, entityType);
  }

  addTagToEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    return this.tagExtraService.addTagToEntity(entityId, tagId, entityType);
  }

  removeTagFromEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    return this.tagExtraService.removeTagFromEntity(entityId, tagId, entityType);
  }
}
