# Relay Chain Implementation Summary

## Overview
Successfully implemented a **Relay Chain Service** that enables sequential task execution where each step depends on the output of the previous step. This complements the existing Broadcast Chain functionality.

## Files Created/Modified

### New Files

1. **`src/services/orchestrator-services/chain/relay-chain.service.ts`**
   - Core relay chain service implementation
   - Handles planning, execution, and progress tracking
   - Template application for message injection
   - Dependency management and execution ordering

2. **`src/tests/unit/feature-tests/chain-tests/relay-chain.service.test.ts`**
   - Comprehensive test suite with 8 test cases
   - Tests planning, execution, templating, failures, and progress
   - Mock AI API for isolated testing

3. **`readme/relay-chain.md`**
   - Complete documentation with API reference
   - Use cases, examples, and implementation details
   - Comparison with broadcast chain

4. **`examples/relay-chain.ts`**
   - Three practical examples:
     - Blog post creation pipeline
     - Design-to-code workflow
     - Data processing pipeline

### Modified Files

1. **`src/models/chain.model.ts`**
   - Added `RelayStep` interface
   - Added `RelayChainInput` interface
   - Added `RelayChainProgress` interface (extends ChainProgress with stepTrack)
   - Updated `ChainMode` type to include 'relay'

2. **`src/services/core-services/conversation.controller.service.ts`**
   - Added `RelayChainService` instance
   - Added `planRelayChain()` method
   - Added `runRelayChain()` method (runs in background)
   - Added `getRelayChainProgress()` method

3. **`src/controllers/conversation.controller.ts`**
   - Added three new endpoints:
     - `POST /conversation/chain/relay` - Plan relay chain
     - `POST /conversation/chain/relay/run/{parentId}` - Run relay chain
     - `GET /conversation/chain/relay/progress/{parentId}` - Get progress

## Key Features

### 1. Sequential Execution
- Each step waits for previous step to complete
- Dependencies enforced via `relationship_graph` table
- Strict ordering maintained through dependency checking

### 2. Message Templating
- Simple `{{variable}}` syntax
- Primary variable: `{{prev_reply}}` - injects previous step's output
- Applied before sending to AI API

### 3. Relationship Management
Three relationship types created:
- `subtask_of`: Links steps to parent task
- `depends_on`: Current step depends on previous
- `blocks`: Previous step blocks current step

### 4. Progress Tracking
Enhanced progress includes:
- Count of completed vs total steps
- Percentage completion
- **Step tracking string**: Visual representation of execution flow
  - Example: `"step1:completed -> step2:in_progress -> step3:pending"`

### 5. Failure Handling
- Fail-fast approach: first failure stops the chain
- Parent task marked as `'failed'`
- Error details stored in step's `output_data`
- Subsequent steps remain `'pending'` (never execute)

### 6. Resilience Features
- Exponential backoff when waiting for dependencies
- No executable step → increase delay
- Configurable delays (base, factor, max)
- Per-step output includes `promptEcho` for debugging

## API Endpoints

### Plan Relay Chain
```
POST /conversation/chain/relay
```
**Request:**
```json
{
  "steps": [
    {
      "assistantId": "assistant-1",
      "messageTemplate": "Design interface"
    },
    {
      "assistantId": "assistant-2",
      "messageTemplate": "Given design:\n{{prev_reply}}\nCreate HTML"
    }
  ],
  "description": "Design to Code Pipeline",
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
  "parentId": "uuid",
  "stepIds": ["uuid1", "uuid2"]
}
```

### Run Relay Chain
```
POST /conversation/chain/relay/run/{parentId}
```
Starts background execution, returns immediately.

### Get Progress
```
GET /conversation/chain/relay/progress/{parentId}
```
**Response:**
```json
{
  "done": 2,
  "total": 3,
  "pct": 66,
  "stepTrack": "step1:completed -> step2:completed -> step3:in_progress"
}
```

## Database Schema Usage

### Tasks Table
```sql
-- Parent task
id: uuid
description: "Relay Chain"
assigned_assistant: NULL
status: 'in_progress' | 'completed' | 'failed'
input_data: { mode: 'relay', steps: [...] }

-- Step task
id: uuid
description: "Relay step 0 → assistant xyz"
assigned_assistant: assistant_id
status: 'pending' | 'in_progress' | 'completed' | 'failed'
input_data: { stepIndex: 0, messageTemplate: "..." }
output_data: { reply, responseType, injectedFrom, promptEcho }
```

### Relationship Graph
```sql
-- Example for 3-step chain
-- Step 1
(parent, subtask_of, step1)

-- Step 2
(parent, subtask_of, step2)
(step2, depends_on, step1)
(step1, blocks, step2)

-- Step 3
(parent, subtask_of, step3)
(step3, depends_on, step2)
(step2, blocks, step3)
```

## Test Coverage

8 comprehensive tests covering:
1. ✅ Plan relay chain correctly
2. ✅ Run relay chain in correct order
3. ✅ Fail relay chain when step fails
4. ✅ Get relay chain progress with step tracking
5. ✅ Handle empty steps list
6. ✅ Correctly apply template with previous output
7. ✅ Handle relay chain with single step
8. ✅ Sequential execution with proper data flow

## Usage Examples

### Basic Usage
```typescript
const relayChainService = new RelayChainService(pool);

// 1. Plan
const { parentId, stepIds } = await relayChainService.planRelayChain({
  steps: [
    { assistantId: 'a1', messageTemplate: 'Step 1' },
    { assistantId: 'a2', messageTemplate: 'Step 2: {{prev_reply}}' }
  ]
});

// 2. Execute
await relayChainService.runRelayChain(parentId);

// 3. Check progress
const progress = await relayChainService.getRelayChainProgress(parentId);
```

### Via HTTP API
```bash
# Plan
curl -X POST http://localhost:3000/conversation/chain/relay \
  -H "Content-Type: application/json" \
  -d '{"steps": [...]}'

# Run
curl -X POST http://localhost:3000/conversation/chain/relay/run/{parentId}

# Progress
curl http://localhost:3000/conversation/chain/relay/progress/{parentId}
```

## Comparison: Broadcast vs Relay

| Aspect | Broadcast Chain | Relay Chain |
|--------|----------------|-------------|
| **Execution** | Parallel batches | Sequential |
| **Dependencies** | None | Each depends on previous |
| **Input** | Same messages to all | Template with prev output |
| **Data Flow** | Independent | Cascading |
| **Failure Mode** | Continue others | Stop entire chain |
| **Use Case** | Same task, many assistants | Multi-stage pipeline |
| **Speed** | Faster (parallel) | Slower (sequential) |
| **Relationships** | `subtask_of` only | `subtask_of`, `depends_on`, `blocks` |

## Architecture Decisions

### 1. Template Simplicity
- Chose simple `{{key}}` replacement over complex templating
- Easy to understand and debug
- Can be enhanced later without breaking changes

### 2. Fail-Fast Approach
- First failure stops the chain
- Prevents wasted API calls
- Clear error propagation
- Can be made optional in future

### 3. Dependency-Based Execution
- Used existing `relationship_graph` table
- No new database schema needed
- Leverages proven relationship types
- Queryable for analytics

### 4. Background Execution
- Controller returns immediately
- Long-running chains don't block HTTP
- Progress polling via GET endpoint
- Can add webhooks/SSE later

### 5. Output Preservation
- Each step stores complete output
- Includes `promptEcho` for reproducibility
- Includes `injectedFrom` for tracing
- Audit trail for debugging

## Integration Points

### Works With
- ✅ Existing task service
- ✅ Existing relationship graph service
- ✅ Existing assistant service
- ✅ AI API service (all types)
- ✅ TSOA routing
- ✅ PostgreSQL and pg-mem

### Compatible With
- Tags (can tag relay chains)
- Feedback (can rate steps)
- Memories (can inject into steps)
- Sessions (can track in sessions)

## Future Enhancements

Potential additions:
1. **Conditional branching**: If/else steps based on output
2. **Parallel groups**: Some steps in parallel within relay
3. **Retry logic**: Per-step retry with exponential backoff
4. **Custom variables**: Beyond `{{prev_reply}}`
5. **Validation**: Schema validation per step
6. **Streaming**: Real-time progress via WebSocket
7. **Cancellation**: Ability to cancel running chains
8. **Timeouts**: Per-step timeout limits
9. **Rollback**: Undo previous steps on failure
10. **Branching**: Multiple possible next steps

## Performance Considerations

### Throttling
- Uses exponential backoff
- Prevents API rate limiting
- Configurable delays per chain

### Scalability
- One runner per parent task
- Can run multiple chains simultaneously
- Database queries optimized with indexes
- Progress queries are lightweight

### Resource Usage
- Background execution doesn't block
- Each step releases resources after completion
- No memory leaks (stateless service)

## Next Steps

To use relay chains:

1. **Create assistants** for each step
2. **Define templates** with clear instructions
3. **Plan the chain** via API or service
4. **Execute** and monitor progress
5. **Retrieve results** from final step

## Testing the Implementation

```bash
# Run relay chain tests
npm test -- relay-chain.service.test

# Run all chain tests
npm test -- chain-tests/

# Run specific test
npm test -- -t "should run relay chain in correct order"
```

## Documentation References

- Full API docs: `readme/relay-chain.md`
- Examples: `examples/relay-chain.ts`
- Tests: `src/tests/unit/feature-tests/chain-tests/relay-chain.service.test.ts`
- Service: `src/services/orchestrator-services/chain/relay-chain.service.ts`
- Models: `src/models/chain.model.ts`
- Controller: `src/controllers/conversation.controller.ts`

---

**Implementation completed successfully!** ✅

All files created, tests passing, lint-clean, and fully documented.
