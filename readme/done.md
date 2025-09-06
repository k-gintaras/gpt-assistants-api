TSOA migration TODO

Goal: Incrementally convert   - [x] Convert `memory-extra.controller.ts` [x] Convert `memory-owned.controller.ts`ontrollers to TSOA-decorated classes so routes and OpenAPI docs are auto-generated.

How we'll work:
- Convert one controller at a time.
- Mark items Done/Blocked/ToDo so the assistant can pick the next small task without large context switches.

Example: import { Get, Route, Tags, Path } from "tsoa";
import { AssistantMemoryControllerService } from "../services/core-services/assistant-memory.controller.service";
import { getDb } from "../database/database";
import { AssistantMemoryData } from "../services/sqlite-services/assistant-memory.service";
import { ValidateError } from "tsoa";

@Route("assistant-memory")
@Tags("AssistantMemory")
export class AssistantMemoryController {
  private svc: AssistantMemoryControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.svc = new AssistantMemoryControllerService(pool);
  }

  @Get("/{id}")
  public async getAssistantMemories(@Path() id: string): Promise<AssistantMemoryData> {
    const memories = await this.svc.getAssistantMemories(id);

    if (!memories || (
      memories.focused.length === 0 &&
      memories.owned.length === 0 &&
      memories.related.length === 0
    )) {
      // tsoa will convert thrown errors into proper HTTP responses
      throw new ValidateError({}, `No memories found for assistant ${id}`);
    }

    return memories;
  }
}


Checklist
- [x] Convert `assistant-memory.controller.ts` to TSOA style (feature/pgmem-quickstart)
- [x] Convert `assistant.controller.ts`
- [x] Convert `chats.controller.ts`
- [x] Convert `chat-messages.controller.ts`
- [x] Convert `conversation.controller.ts`
 - [x] Convert `feedback.controller.ts`
 - [x] Convert `memory.controller.ts`
 - [x] Convert `memory-focused.controller.ts`
- [x] Convert `memory-owned.controller.ts`
- [x] Convert `memory-extra.controller.ts`
- [x] Convert `memory-focus-rule.controller.ts`
- [x] Convert `orchestrator.controller.ts`
- [x] Convert `prompt.controller.ts`
- [x] Convert `relationship-graph.controller.ts`
- [x] Convert `sessions.controller.ts`
- [x] Convert `tag.controller.ts`
- [x] Convert `tag-extra.controller.ts`
- [x] Convert `task.controller.ts`

Notes
- Use `getDb().getInstance()` in controller constructors to access PG pool.
- Prefer importing concrete data interfaces from service modules when available.
- Keep legacy routes until TSOA routes are fully generated and tested.
- After converting a controller, run `npm run tsoa:gen` to regenerate routes + spec and run the app.

Next steps for me
1. Fix type errors in `assistant-memory.controller.ts` (use proper types or small helper types).
2. Convert next controller in checklist when you mark it as next.
