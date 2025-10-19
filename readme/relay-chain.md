# Relay Chain Service

The Relay Chain Service provides functionality for sequential task execution where each step depends on the output of the previous step. This is useful for multi-stage workflows where data needs to flow from one assistant to the next.

## Overview

A relay chain executes tasks in strict sequential order:
1. Each step is assigned to a specific assistant
2. Each step waits for the previous step to complete
3. The output from the previous step is injected into the current step's message template
4. If any step fails, the entire chain fails

## Use Cases

- **Multi-stage content creation**: Design → HTML → CSS → Review
- **Data transformation pipelines**: Extract → Transform → Load → Validate
- **Iterative refinement**: Draft → Review → Revise → Finalize
- **Sequential analysis**: Collect data → Analyze → Summarize → Recommend

## API Endpoints

### 1. Plan a Relay Chain
**POST** `/conversation/chain/relay`

Creates a parent task and ordered step tasks with dependencies.

**Request Body:**
```json
{
  "steps": [
    {
      "assistantId": "assistant-1",
      "messageTemplate": "Design a user interface for {{topic}}"
    },
    {
      "assistantId": "assistant-2",
      "messageTemplate": "Given this design:\n{{prev_reply}}\nCreate semantic HTML"
    },
    {
      "assistantId": "assistant-3",
      "messageTemplate": "Given this HTML:\n{{prev_reply}}\nAdd CSS styling"
    }
  ],
  "description": "Design to Implementation Pipeline",
  "options": {
    "baseDelayMs": 250,
    "delayFactor": 2,
    "maxDelayMs": 2000
  }
}
```

**Response:**
```json
{
  "parentId": "task-parent-uuid",
  "stepIds": ["step-1-uuid", "step-2-uuid", "step-3-uuid"]
}
```

### 2. Run a Relay Chain
**POST** `/conversation/chain/relay/run/{parentId}`

Executes the relay chain in the background. Steps execute sequentially based on their dependencies.

**Response:**
```json
{
  "message": "Relay chain execution started"
}
```

### 3. Get Relay Chain Progress
**GET** `/conversation/chain/relay/progress/{parentId}`

Returns detailed progress including step tracking.

**Response:**
```json
{
  "done": 2,
  "total": 3,
  "pct": 66,
  "stepTrack": "step-1:completed -> step-2:completed -> step-3:in_progress"
}
```

## Message Templates

Templates use `{{variable}}` syntax to inject values:

- `{{prev_reply}}` - The reply/output from the previous step
- Any custom variables can be added in future enhancements

**Example:**
```
Template: "Given the interface design:\n{{prev_reply}}\n\nCreate HTML code."

If prev_reply = "A login form with username and password"

Result: "Given the interface design:
A login form with username and password

Create HTML code."
```

## Chain Options

```typescript
{
  baseDelayMs?: number;    // Initial delay between operations (default: 250ms)
  delayFactor?: number;    // Backoff multiplier (default: 2)
  maxDelayMs?: number;     // Maximum delay cap (default: 2000ms)
  user?: string;           // OpenAI user field
}
```

## Relationships and Dependencies

The service creates these relationships in the `relationship_graph` table:

1. **subtask_of**: Links each step to the parent task
2. **depends_on**: Links each step to the previous step (current depends on previous)
3. **blocks**: Links previous step to current step (previous blocks current)

This ensures:
- Steps execute in order
- A step can't start until its dependencies are completed
- Progress can be tracked through the relationship graph

## Failure Handling

When a step fails:
1. The failed step's status is set to `'failed'`
2. The error is stored in `output_data.error`
3. The parent task is marked as `'failed'`
4. Subsequent steps remain in `'pending'` state (never execute)

## Implementation Details

### Task Creation
```typescript
// Parent task
{
  description: "Relay Chain",
  assignedAssistant: null,
  status: "in_progress",
  inputData: { mode: "relay", steps: [...] }
}

// Step task
{
  description: "Relay step 0 → assistant assistant-1",
  assignedAssistant: "assistant-1",
  status: "pending",
  inputData: { stepIndex: 0, messageTemplate: "..." }
}
```

### Execution Flow
1. Runner polls for pending steps belonging to the parent
2. Finds first executable step (all dependencies completed)
3. Retrieves previous step's output
4. Applies template with `prev_reply`
5. Sends request to AI API
6. Stores output including:
   - `reply`: The AI's response
   - `responseType`: Type of response
   - `injectedFrom`: ID of previous step
   - `promptEcho`: The actual prompt sent (for debugging)
7. Updates task status to `'completed'`
8. Repeats until all steps complete or one fails

### Progress Tracking
Uses SQL to:
- Count completed vs total steps
- Calculate percentage
- Build step tracking string showing order and status

## Comparison with Broadcast Chain

| Feature | Broadcast Chain | Relay Chain |
|---------|----------------|-------------|
| Execution | Parallel batches | Sequential |
| Dependencies | None | Each step depends on previous |
| Input | Same messages to all | Template with previous output |
| Use Case | Same task, multiple assistants | Multi-stage pipeline |
| Failure | Continues with other tasks | Stops entire chain |

## Testing

See `src/tests/unit/feature-tests/chain-tests/relay-chain.service.test.ts` for comprehensive tests including:
- Planning relay chains
- Sequential execution
- Template application
- Dependency management
- Failure scenarios
- Progress tracking

## Example Usage

```typescript
// 1. Plan the chain
const { parentId, stepIds } = await relayChainService.planRelayChain({
  steps: [
    {
      assistantId: 'designer-assistant',
      messageTemplate: 'Design a landing page for a SaaS product'
    },
    {
      assistantId: 'html-assistant',
      messageTemplate: 'Given this design:\n{{prev_reply}}\n\nCreate semantic HTML5 code'
    },
    {
      assistantId: 'css-assistant',
      messageTemplate: 'Given this HTML:\n{{prev_reply}}\n\nCreate modern CSS with flexbox'
    }
  ],
  description: 'Landing Page Creation Pipeline'
});

// 2. Run it (in background)
await relayChainService.runRelayChain(parentId);

// 3. Check progress
const progress = await relayChainService.getRelayChainProgress(parentId);
console.log(`${progress.done}/${progress.total} steps completed`);
console.log(`Track: ${progress.stepTrack}`);

// 4. Get final output
const lastStepId = stepIds[stepIds.length - 1];
const lastStep = await taskService.getTaskById(lastStepId);
const output = JSON.parse(lastStep.outputData);
console.log('Final CSS:', output.reply);
```

## Future Enhancements

Potential improvements:
- Conditional branching (if/else steps)
- Parallel step groups within relay
- Retry logic per step
- Custom template variables
- Step-level validation
- Streaming progress updates
- Cancellation support
- Step timeouts
