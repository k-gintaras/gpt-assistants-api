import { Assistant } from '../assistant.model';
import { Feedback } from '../feedback.model';
import { OwnedMemory } from '../focused-memory.model';
import { Task } from '../task.model';

export interface ConnectorService {
  executeTask(task: Task): Promise<Task>; // Orchestrates a task by selecting the appropriate assistant and memories
  retrieveRelevantMemories(taskTags: string[], assistant: Assistant): Promise<OwnedMemory[]>; // Fetches relevant memories for a task
  logFeedback(feedback: Feedback): Promise<void>; // Logs feedback for assistants or tasks
  analyzePerformance(assistantId: string): Promise<void>; // Analyzes and adjusts assistant based on performance
}
