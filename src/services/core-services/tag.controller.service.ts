import { Tag } from '../../models/tag.model';
import { TagServiceModel } from '../../models/service-models/tag.service.model';
import { Pool } from 'pg';
import { TagService } from '../sqlite-services/tag.service';

export class TagControllerService implements TagServiceModel {
  tagService: TagService;

  constructor(pool: Pool) {
    this.tagService = new TagService(pool);
  }

  async addTag(tag: Omit<Tag, 'id'>): Promise<string> {
    return await this.tagService.addTag(tag);
  }

  async removeTag(tagId: string): Promise<boolean> {
    return await this.tagService.removeTag(tagId);
  }

  async updateTag(id: string, updates: Partial<Omit<Tag, 'id'>>): Promise<boolean> {
    return await this.tagService.updateTag(id, updates);
  }

  async getTagById(tagId: string): Promise<Tag | null> {
    return await this.tagService.getTagById(tagId);
  }

  async getAllTags(): Promise<Tag[]> {
    return await this.tagService.getAllTags();
  }
}
