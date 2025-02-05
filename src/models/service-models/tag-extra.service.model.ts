import { Tag } from '../../models/tag.model';

export interface TagExtraServiceModel {
  getTagsByEntity(entityId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<Tag[]>;
  addTagToEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean>;
  removeTagFromEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean>;
}
