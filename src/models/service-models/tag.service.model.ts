import { Tag } from '../../models/tag.model';

export interface TagServiceModel {
  addTag(tag: Omit<Tag, 'id'>): Promise<string>;
  removeTag(tagId: string): Promise<boolean>;
  updateTag(id: string, updates: Partial<Omit<Tag, 'id'>>): Promise<boolean>;
  getTagById(tagId: string): Promise<Tag | null>;
  getAllTags(): Promise<Tag[]>;
}
