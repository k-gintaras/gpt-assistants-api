import { Tag } from '../../models/tag.model';
import { TagServiceModel } from '../../models/service-models/tag.service.model';
import { TagService } from '../sqlite-services/tag.service';
import Database from 'better-sqlite3';

export class TagControllerService implements TagServiceModel {
  tagService: TagService;

  constructor(db: Database.Database) {
    this.tagService = new TagService(db);
  }

  addTag(tag: Omit<Tag, 'id'>): Promise<string> {
    return this.tagService.addTag(tag);
  }

  removeTag(tagId: string): Promise<boolean> {
    return this.tagService.removeTag(tagId);
  }

  updateTag(id: string, updates: Partial<Omit<Tag, 'id'>>): Promise<boolean> {
    return this.tagService.updateTag(id, updates);
  }

  getTagById(tagId: string): Promise<Tag | null> {
    return this.tagService.getTagById(tagId);
  }

  getAllTags(): Promise<Tag[]> {
    return this.tagService.getAllTags();
  }
}
