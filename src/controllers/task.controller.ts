import { Route, Tags, Get, Post, Put, Delete, Path, Body, ValidateError, SuccessResponse } from 'tsoa';
import { TaskControllerService } from '../services/core-services/task.controller.service';
import { getDb } from '../database/database';
import { Task } from '../models/task.model';

@Route('task')
@Tags('Task')
export class TaskController {
  private readonly taskControllerService: TaskControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.taskControllerService = new TaskControllerService(pool);
  }

  @Get('/{taskId}')
  public async getTaskById(@Path() taskId: string): Promise<Task> {
    const task = await this.taskControllerService.getTaskById(taskId);
    if (!task) throw new ValidateError({}, `Task with ID ${taskId} not found.`);
    return task;
  }

  @Get('/')
  public async getAllTasks(): Promise<Task[]> {
    const tasks = await this.taskControllerService.getAllTasks();
    if (!tasks || tasks.length === 0) throw new ValidateError({}, 'Tasks not found.');
    return tasks;
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async addTask(@Body() task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const taskId = await this.taskControllerService.addTask(task);
    if (!taskId) throw new ValidateError({}, 'Task create failed.');
    return { id: taskId };
  }

  @Put('/{taskId}')
  public async updateTask(@Path() taskId: string, @Body() updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const isUpdated = await this.taskControllerService.updateTask(taskId, updates);
    if (!isUpdated) throw new ValidateError({}, `Task with ID ${taskId} not found or update failed.`);
  }

  @Delete('/{taskId}')
  public async deleteTask(@Path() taskId: string): Promise<void> {
    const isDeleted = await this.taskControllerService.deleteTask(taskId);
    if (!isDeleted) throw new ValidateError({}, `Task with ID ${taskId} not found or delete failed.`);
  }

  @Get('/status/{status}')
  public async getTasksByStatus(@Path() status: Task['status']): Promise<Task[]> {
    const tasks = await this.taskControllerService.getTasksByStatus(status);
    if (!tasks || tasks.length === 0) throw new ValidateError({}, `Tasks by status ${status} not found.`);
    return tasks;
  }

  @Get('/assistant/{assistantId}')
  public async getTasksByAssistant(@Path() assistantId: string): Promise<Task[]> {
    const tasks = await this.taskControllerService.getTasksByAssistant(assistantId);
    if (!tasks || tasks.length === 0) throw new ValidateError({}, `Tasks by assistant id ${assistantId} not found.`);
    return tasks;
  }
}
