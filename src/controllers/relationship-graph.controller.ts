import { Route, Tags, Get, Post, Put, Delete, Path, Body, ValidateError, SuccessResponse } from 'tsoa';
import { RelationshipGraphControllerService } from '../services/core-services/relationship-graph.controller.service';
import { getDb } from '../database/database';
import { RelationshipGraph } from '../models/relationship.model';

@Route('relationship-graph')
@Tags('RelationshipGraph')
export class RelationshipGraphController {
  private readonly relationshipGraphService: RelationshipGraphControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.relationshipGraphService = new RelationshipGraphControllerService(pool);
  }

  @Get('/')
  public async getAllRelationships(): Promise<RelationshipGraph[]> {
    const relationships = await this.relationshipGraphService.getAllRelationships();
    if (!relationships || relationships.length === 0) throw new ValidateError({}, 'No relationships found.');
    return relationships;
  }

  @Get('/source/{targetId}')
  public async getRelationshipsBySource(@Path() targetId: string): Promise<RelationshipGraph[]> {
    const relationships = await this.relationshipGraphService.getRelationshipsBySource(targetId);
    if (!relationships || relationships.length === 0) throw new ValidateError({}, `No relationships found for target ID ${targetId}.`);
    return relationships;
  }

  @Get('/source/{targetId}/type/{relationshipType}')
  public async getRelationshipsBySourceAndType(@Path() targetId: string, @Path() relationshipType: RelationshipGraph['type']): Promise<RelationshipGraph[]> {
    const relationships = await this.relationshipGraphService.getRelationshipsByTargetAndType(targetId, relationshipType);
    if (!relationships || relationships.length === 0) throw new ValidateError({}, `No relationships found for target ID ${targetId}.`);
    return relationships;
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async addRelationship(@Body() relationship: RelationshipGraph): Promise<void> {
    const added = await this.relationshipGraphService.addRelationship(relationship);
    if (!added) throw new ValidateError({}, 'Relationship was not created successfully.');
  }

  @Put('/{id}')
  public async updateRelationship(@Path() id: string, @Body() updates: RelationshipGraph): Promise<void> {
    const isUpdated = await this.relationshipGraphService.updateRelationship(id, updates);
    if (!isUpdated) throw new ValidateError({}, `Relationship with ID ${id} not found or update failed.`);
  }

  @Delete('/{id}')
  public async deleteRelationship(@Path() id: string): Promise<void> {
    const isDeleted = await this.relationshipGraphService.deleteRelationship(id);
    if (!isDeleted) throw new ValidateError({}, `Relationship with ID ${id} not found or delete failed.`);
  }
}
