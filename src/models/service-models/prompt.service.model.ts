export interface PromptServiceModel {
  prompt(id: string, prompt: string, extraInstruction?: string): Promise<string | null>;
}
