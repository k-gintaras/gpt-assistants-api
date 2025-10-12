/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TaskController } from './controllers/task.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TagController } from './controllers/tag.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TagExtraController } from './controllers/tag-extra.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SimpleConversationController } from './controllers/simple-conversation.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SessionsController } from './controllers/sessions.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RelationshipGraphController } from './controllers/relationship-graph.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PromptController } from './controllers/prompt.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrchestratorController } from './controllers/orchestrator.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MemoryController } from './controllers/memory.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OwnedMemoryController } from './controllers/memory-owned.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FocusedMemoryController } from './controllers/memory-focused.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MemoryFocusRuleController } from './controllers/memory-focus-rule.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MemoryExtraController } from './controllers/memory-extra.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FeedbackController } from './controllers/feedback.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ConversationController } from './controllers/conversation.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ChatsController } from './controllers/chats.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ChatMessagesController } from './controllers/chat-messages.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AssistantController } from './controllers/assistant.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AssistantMemoryController } from './controllers/assistant-memory.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Task": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "assignedAssistant": {"dataType":"string","required":true},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pending"]},{"dataType":"enum","enums":["in_progress"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["failed"]}],"required":true},
            "inputData": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "outputData": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Task.Exclude_keyofTask.id-or-createdAt-or-updatedAt__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string","required":true},"assignedAssistant":{"dataType":"string","required":true},"status":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pending"]},{"dataType":"enum","enums":["in_progress"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["failed"]}],"required":true},"inputData":{"dataType":"string"},"outputData":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Omit_Task.id-or-createdAt-or-updatedAt_": {
        "dataType": "refAlias",
        "type": {"ref":"Pick_Task.Exclude_keyofTask.id-or-createdAt-or-updatedAt__","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Omit_Task.id-or-createdAt-or-updatedAt__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"},"assignedAssistant":{"dataType":"string"},"status":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pending"]},{"dataType":"enum","enums":["in_progress"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["failed"]}]},"inputData":{"dataType":"string"},"outputData":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Omit_Tag.id__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tag": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Session": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "assistant_id": {"dataType":"string","required":true},
            "user_id": {"dataType":"string"},
            "name": {"dataType":"string"},
            "started_at": {"dataType":"string","required":true},
            "ended_at": {"dataType":"string"},
            "created_at": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Session_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"string"},"assistant_id":{"dataType":"string"},"user_id":{"dataType":"string"},"name":{"dataType":"string"},"started_at":{"dataType":"string"},"ended_at":{"dataType":"string"},"created_at":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RelationshipGraph": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["task"]}],"required":true},
            "targetId": {"dataType":"string","required":true},
            "relationshipType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["related_to"]},{"dataType":"enum","enums":["part_of"]},{"dataType":"enum","enums":["example_of"]},{"dataType":"enum","enums":["derived_from"]},{"dataType":"enum","enums":["depends_on"]},{"dataType":"enum","enums":["blocks"]},{"dataType":"enum","enums":["subtask_of"]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MemoryRequest": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"text":{"dataType":"string","required":true},"type":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "output": {"dataType":"any"},
            "error": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskRequest": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RelationshipType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["related_to"]},{"dataType":"enum","enums":["part_of"]},{"dataType":"enum","enums":["example_of"]},{"dataType":"enum","enums":["derived_from"]},{"dataType":"enum","enums":["depends_on"]},{"dataType":"enum","enums":["blocks"]},{"dataType":"enum","enums":["subtask_of"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AssistantSuggestion": {
        "dataType": "refObject",
        "properties": {
            "assistantId": {"dataType":"string","required":true},
            "score": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AssistantEvaluation": {
        "dataType": "refObject",
        "properties": {
            "assistantId": {"dataType":"string","required":true},
            "successRate": {"dataType":"double","required":true},
            "feedbackAverage": {"dataType":"double","required":true},
            "tasksCompleted": {"dataType":"double","required":true},
            "tasksFailed": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Memory": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "summary": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"string","required":true},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "updatedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Memory.Exclude_keyofMemory.id-or-createdAt-or-updatedAt__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"summary":{"dataType":"string","required":true},"type":{"dataType":"string","required":true},"data":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Omit_Memory.id-or-createdAt-or-updatedAt_": {
        "dataType": "refAlias",
        "type": {"ref":"Pick_Memory.Exclude_keyofMemory.id-or-createdAt-or-updatedAt__","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MemoryWithTags": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "summary": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"string","required":true},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "updatedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "tags": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"Tag"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MemoryFocusRule": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "assistantId": {"dataType":"string","required":true},
            "maxResults": {"dataType":"double","required":true},
            "relationshipTypes": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "priorityTags": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizedMemoriesResponse": {
        "dataType": "refObject",
        "properties": {
            "looseMemories": {"dataType":"array","array":{"dataType":"refObject","ref":"Memory"},"required":true},
            "ownedMemories": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"memories":{"dataType":"array","array":{"dataType":"refObject","ref":"Memory"},"required":true},"assistantId":{"dataType":"string","required":true}}},"required":true},
            "focusedMemories": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"memories":{"dataType":"array","array":{"dataType":"refObject","ref":"Memory"},"required":true},"memoryFocusRuleId":{"dataType":"string","required":true}}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Feedback": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "targetId": {"dataType":"string","required":true},
            "targetType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["task"]}],"required":true},
            "rating": {"dataType":"double","required":true},
            "comments": {"dataType":"string"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Feedback.Exclude_keyofFeedback.id__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"createdAt":{"dataType":"datetime","required":true},"updatedAt":{"dataType":"datetime","required":true},"targetId":{"dataType":"string","required":true},"targetType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["task"]}],"required":true},"rating":{"dataType":"double","required":true},"comments":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Omit_Feedback.id_": {
        "dataType": "refAlias",
        "type": {"ref":"Pick_Feedback.Exclude_keyofFeedback.id__","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Omit_Feedback.id-or-createdAt-or-updatedAt__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"targetId":{"dataType":"string"},"targetType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["task"]}]},"rating":{"dataType":"double"},"comments":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConversationResponse": {
        "dataType": "refObject",
        "properties": {
            "assistantId": {"dataType":"string","required":true},
            "userId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "chatId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "sessionId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "responseType": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "answer": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConversationRequest": {
        "dataType": "refObject",
        "properties": {
            "assistantId": {"dataType":"string","required":true},
            "userId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "chatId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "sessionId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "prompt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Chat": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "session_id": {"dataType":"string","required":true},
            "created_at": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChatMessage": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "type": {"dataType":"string","required":true},
            "memory_id": {"dataType":"string","required":true},
            "created_at": {"dataType":"string","required":true},
            "chat_id": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Assistant": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "gptAssistantId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["chat"]},{"dataType":"enum","enums":["assistant"]}],"required":true},
            "model": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
            "updatedAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeedbackSummary": {
        "dataType": "refObject",
        "properties": {
            "avgRating": {"dataType":"double","required":true},
            "totalFeedback": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AssistantWithDetails": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "gptAssistantId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["chat"]},{"dataType":"enum","enums":["assistant"]}],"required":true},
            "model": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
            "updatedAt": {"dataType":"string","required":true},
            "focusedMemories": {"dataType":"array","array":{"dataType":"refObject","ref":"MemoryWithTags"},"required":true},
            "memoryFocusRule": {"ref":"MemoryFocusRule"},
            "assistantTags": {"dataType":"array","array":{"dataType":"refObject","ref":"Tag"}},
            "feedbackSummary": {"ref":"FeedbackSummary","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Assistant_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"string"},"gptAssistantId":{"dataType":"string"},"name":{"dataType":"string"},"description":{"dataType":"string"},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["chat"]}]},"model":{"dataType":"string"},"createdAt":{"dataType":"string"},"updatedAt":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AssistantMemoryData": {
        "dataType": "refObject",
        "properties": {
            "focused": {"dataType":"array","array":{"dataType":"refObject","ref":"Memory"},"required":true},
            "owned": {"dataType":"array","array":{"dataType":"refObject","ref":"Memory"},"required":true},
            "related": {"dataType":"array","array":{"dataType":"refObject","ref":"Memory"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsTaskController_getTaskById: Record<string, TsoaRoute.ParameterSchema> = {
                taskId: {"in":"path","name":"taskId","required":true,"dataType":"string"},
        };
        app.get('/task/:taskId',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.getTaskById)),

            async function TaskController_getTaskById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_getTaskById, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'getTaskById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_getAllTasks: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/task',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.getAllTasks)),

            async function TaskController_getAllTasks(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_getAllTasks, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'getAllTasks',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_addTask: Record<string, TsoaRoute.ParameterSchema> = {
                task: {"in":"body","name":"task","required":true,"ref":"Omit_Task.id-or-createdAt-or-updatedAt_"},
        };
        app.post('/task',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.addTask)),

            async function TaskController_addTask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_addTask, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'addTask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_updateTask: Record<string, TsoaRoute.ParameterSchema> = {
                taskId: {"in":"path","name":"taskId","required":true,"dataType":"string"},
                updates: {"in":"body","name":"updates","required":true,"ref":"Partial_Omit_Task.id-or-createdAt-or-updatedAt__"},
        };
        app.put('/task/:taskId',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.updateTask)),

            async function TaskController_updateTask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_updateTask, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'updateTask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_deleteTask: Record<string, TsoaRoute.ParameterSchema> = {
                taskId: {"in":"path","name":"taskId","required":true,"dataType":"string"},
        };
        app.delete('/task/:taskId',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.deleteTask)),

            async function TaskController_deleteTask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_deleteTask, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'deleteTask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_getTasksByStatus: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"path","name":"status","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pending"]},{"dataType":"enum","enums":["in_progress"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["failed"]}]},
        };
        app.get('/task/status/:status',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.getTasksByStatus)),

            async function TaskController_getTasksByStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_getTasksByStatus, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'getTasksByStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_getTasksByAssistant: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"path","name":"assistantId","required":true,"dataType":"string"},
        };
        app.get('/task/assistant/:assistantId',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.getTasksByAssistant)),

            async function TaskController_getTasksByAssistant(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_getTasksByAssistant, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'getTasksByAssistant',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_addTag: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true}}},
        };
        app.post('/tag',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.addTag)),

            async function TagController_addTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_addTag, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'addTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_removeTag: Record<string, TsoaRoute.ParameterSchema> = {
                tagId: {"in":"path","name":"tagId","required":true,"dataType":"string"},
        };
        app.delete('/tag/:tagId',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.removeTag)),

            async function TagController_removeTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_removeTag, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'removeTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_updateTag: Record<string, TsoaRoute.ParameterSchema> = {
                tagId: {"in":"path","name":"tagId","required":true,"dataType":"string"},
                updates: {"in":"body","name":"updates","required":true,"ref":"Partial_Omit_Tag.id__"},
        };
        app.put('/tag/:tagId',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.updateTag)),

            async function TagController_updateTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_updateTag, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'updateTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_getTagById: Record<string, TsoaRoute.ParameterSchema> = {
                tagId: {"in":"path","name":"tagId","required":true,"dataType":"string"},
        };
        app.get('/tag/:tagId',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.getTagById)),

            async function TagController_getTagById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_getTagById, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'getTagById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_getAllTags: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/tag',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.getAllTags)),

            async function TagController_getAllTags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_getAllTags, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'getAllTags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagExtraController_getTagsByEntity: Record<string, TsoaRoute.ParameterSchema> = {
                entityId: {"in":"path","name":"entityId","required":true,"dataType":"string"},
                entityType: {"in":"path","name":"entityType","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["task"]}]},
        };
        app.get('/tag-extra/entity/:entityId/:entityType',
            ...(fetchMiddlewares<RequestHandler>(TagExtraController)),
            ...(fetchMiddlewares<RequestHandler>(TagExtraController.prototype.getTagsByEntity)),

            async function TagExtraController_getTagsByEntity(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagExtraController_getTagsByEntity, request, response });

                const controller = new TagExtraController();

              await templateService.apiHandler({
                methodName: 'getTagsByEntity',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagExtraController_addTagToEntity: Record<string, TsoaRoute.ParameterSchema> = {
                entityId: {"in":"path","name":"entityId","required":true,"dataType":"string"},
                entityType: {"in":"path","name":"entityType","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["task"]}]},
                tagId: {"in":"path","name":"tagId","required":true,"dataType":"string"},
                isNames: {"in":"path","name":"isNames","required":true,"dataType":"boolean"},
        };
        app.post('/tag-extra/entity/:entityId/:entityType/:tagId/:isNames',
            ...(fetchMiddlewares<RequestHandler>(TagExtraController)),
            ...(fetchMiddlewares<RequestHandler>(TagExtraController.prototype.addTagToEntity)),

            async function TagExtraController_addTagToEntity(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagExtraController_addTagToEntity, request, response });

                const controller = new TagExtraController();

              await templateService.apiHandler({
                methodName: 'addTagToEntity',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagExtraController_removeTagFromEntity: Record<string, TsoaRoute.ParameterSchema> = {
                entityId: {"in":"path","name":"entityId","required":true,"dataType":"string"},
                entityType: {"in":"path","name":"entityType","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["task"]}]},
                tagId: {"in":"path","name":"tagId","required":true,"dataType":"string"},
        };
        app.delete('/tag-extra/entity/:entityId/:entityType/:tagId',
            ...(fetchMiddlewares<RequestHandler>(TagExtraController)),
            ...(fetchMiddlewares<RequestHandler>(TagExtraController.prototype.removeTagFromEntity)),

            async function TagExtraController_removeTagFromEntity(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagExtraController_removeTagFromEntity, request, response });

                const controller = new TagExtraController();

              await templateService.apiHandler({
                methodName: 'removeTagFromEntity',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSimpleConversationController_chat: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"query","name":"assistantId","required":true,"dataType":"string"},
                message: {"in":"query","name":"message","required":true,"dataType":"string"},
                chatId: {"in":"query","name":"chatId","dataType":"string"},
        };
        app.get('/simple-conversation',
            ...(fetchMiddlewares<RequestHandler>(SimpleConversationController)),
            ...(fetchMiddlewares<RequestHandler>(SimpleConversationController.prototype.chat)),

            async function SimpleConversationController_chat(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSimpleConversationController_chat, request, response });

                const controller = new SimpleConversationController();

              await templateService.apiHandler({
                methodName: 'chat',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionsController_createSession: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true},"userId":{"dataType":"string","required":true},"assistantId":{"dataType":"string","required":true}}},
        };
        app.post('/sessions',
            ...(fetchMiddlewares<RequestHandler>(SessionsController)),
            ...(fetchMiddlewares<RequestHandler>(SessionsController.prototype.createSession)),

            async function SessionsController_createSession(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionsController_createSession, request, response });

                const controller = new SessionsController();

              await templateService.apiHandler({
                methodName: 'createSession',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionsController_getAllSessions: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/sessions',
            ...(fetchMiddlewares<RequestHandler>(SessionsController)),
            ...(fetchMiddlewares<RequestHandler>(SessionsController.prototype.getAllSessions)),

            async function SessionsController_getAllSessions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionsController_getAllSessions, request, response });

                const controller = new SessionsController();

              await templateService.apiHandler({
                methodName: 'getAllSessions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionsController_getSessionById: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
        };
        app.get('/sessions/:sessionId',
            ...(fetchMiddlewares<RequestHandler>(SessionsController)),
            ...(fetchMiddlewares<RequestHandler>(SessionsController.prototype.getSessionById)),

            async function SessionsController_getSessionById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionsController_getSessionById, request, response });

                const controller = new SessionsController();

              await templateService.apiHandler({
                methodName: 'getSessionById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionsController_updateSession: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
                updates: {"in":"body","name":"updates","required":true,"ref":"Partial_Session_"},
        };
        app.put('/sessions/:sessionId',
            ...(fetchMiddlewares<RequestHandler>(SessionsController)),
            ...(fetchMiddlewares<RequestHandler>(SessionsController.prototype.updateSession)),

            async function SessionsController_updateSession(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionsController_updateSession, request, response });

                const controller = new SessionsController();

              await templateService.apiHandler({
                methodName: 'updateSession',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionsController_deleteSession: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
        };
        app.delete('/sessions/:sessionId',
            ...(fetchMiddlewares<RequestHandler>(SessionsController)),
            ...(fetchMiddlewares<RequestHandler>(SessionsController.prototype.deleteSession)),

            async function SessionsController_deleteSession(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionsController_deleteSession, request, response });

                const controller = new SessionsController();

              await templateService.apiHandler({
                methodName: 'deleteSession',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRelationshipGraphController_getAllRelationships: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/relationship-graph',
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController)),
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController.prototype.getAllRelationships)),

            async function RelationshipGraphController_getAllRelationships(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRelationshipGraphController_getAllRelationships, request, response });

                const controller = new RelationshipGraphController();

              await templateService.apiHandler({
                methodName: 'getAllRelationships',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRelationshipGraphController_getRelationshipsBySource: Record<string, TsoaRoute.ParameterSchema> = {
                targetId: {"in":"path","name":"targetId","required":true,"dataType":"string"},
        };
        app.get('/relationship-graph/source/:targetId',
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController)),
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController.prototype.getRelationshipsBySource)),

            async function RelationshipGraphController_getRelationshipsBySource(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRelationshipGraphController_getRelationshipsBySource, request, response });

                const controller = new RelationshipGraphController();

              await templateService.apiHandler({
                methodName: 'getRelationshipsBySource',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRelationshipGraphController_getRelationshipsBySourceAndType: Record<string, TsoaRoute.ParameterSchema> = {
                targetId: {"in":"path","name":"targetId","required":true,"dataType":"string"},
                relationshipType: {"in":"path","name":"relationshipType","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["task"]}]},
        };
        app.get('/relationship-graph/source/:targetId/type/:relationshipType',
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController)),
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController.prototype.getRelationshipsBySourceAndType)),

            async function RelationshipGraphController_getRelationshipsBySourceAndType(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRelationshipGraphController_getRelationshipsBySourceAndType, request, response });

                const controller = new RelationshipGraphController();

              await templateService.apiHandler({
                methodName: 'getRelationshipsBySourceAndType',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRelationshipGraphController_addRelationship: Record<string, TsoaRoute.ParameterSchema> = {
                relationship: {"in":"body","name":"relationship","required":true,"ref":"RelationshipGraph"},
        };
        app.post('/relationship-graph',
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController)),
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController.prototype.addRelationship)),

            async function RelationshipGraphController_addRelationship(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRelationshipGraphController_addRelationship, request, response });

                const controller = new RelationshipGraphController();

              await templateService.apiHandler({
                methodName: 'addRelationship',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRelationshipGraphController_updateRelationship: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                updates: {"in":"body","name":"updates","required":true,"ref":"RelationshipGraph"},
        };
        app.put('/relationship-graph/:id',
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController)),
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController.prototype.updateRelationship)),

            async function RelationshipGraphController_updateRelationship(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRelationshipGraphController_updateRelationship, request, response });

                const controller = new RelationshipGraphController();

              await templateService.apiHandler({
                methodName: 'updateRelationship',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRelationshipGraphController_deleteRelationship: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/relationship-graph/:id',
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController)),
            ...(fetchMiddlewares<RequestHandler>(RelationshipGraphController.prototype.deleteRelationship)),

            async function RelationshipGraphController_deleteRelationship(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRelationshipGraphController_deleteRelationship, request, response });

                const controller = new RelationshipGraphController();

              await templateService.apiHandler({
                methodName: 'deleteRelationship',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPromptController_prompt: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"extraInstruction":{"dataType":"string"},"prompt":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},
        };
        app.post('/prompt',
            ...(fetchMiddlewares<RequestHandler>(PromptController)),
            ...(fetchMiddlewares<RequestHandler>(PromptController.prototype.prompt)),

            async function PromptController_prompt(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPromptController_prompt, request, response });

                const controller = new PromptController();

              await templateService.apiHandler({
                methodName: 'prompt',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrchestratorController_remember: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"tags":{"dataType":"array","array":{"dataType":"string"}},"memory":{"ref":"MemoryRequest","required":true},"assistantId":{"dataType":"string","required":true}}},
        };
        app.post('/orchestrator/remember',
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController)),
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController.prototype.remember)),

            async function OrchestratorController_remember(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrchestratorController_remember, request, response });

                const controller = new OrchestratorController();

              await templateService.apiHandler({
                methodName: 'remember',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrchestratorController_forget: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"memoryId":{"dataType":"string","required":true},"assistantId":{"dataType":"string","required":true}}},
        };
        app.post('/orchestrator/forget',
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController)),
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController.prototype.forget)),

            async function OrchestratorController_forget(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrchestratorController_forget, request, response });

                const controller = new OrchestratorController();

              await templateService.apiHandler({
                methodName: 'forget',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrchestratorController_delegateTask: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"tags":{"dataType":"array","array":{"dataType":"string"}},"task":{"ref":"TaskRequest","required":true},"assistantId":{"dataType":"string","required":true}}},
        };
        app.post('/orchestrator/delegate-task',
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController)),
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController.prototype.delegateTask)),

            async function OrchestratorController_delegateTask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrchestratorController_delegateTask, request, response });

                const controller = new OrchestratorController();

              await templateService.apiHandler({
                methodName: 'delegateTask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrchestratorController_connectAssistants: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"relation":{"ref":"RelationshipType","required":true},"dependentId":{"dataType":"string","required":true},"primaryId":{"dataType":"string","required":true}}},
        };
        app.post('/orchestrator/connect-assistants',
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController)),
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController.prototype.connectAssistants)),

            async function OrchestratorController_connectAssistants(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrchestratorController_connectAssistants, request, response });

                const controller = new OrchestratorController();

              await templateService.apiHandler({
                methodName: 'connectAssistants',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrchestratorController_connectEntities: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"relation":{"ref":"RelationshipType","required":true},"targetId":{"dataType":"string","required":true},"targetType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["task"]}],"required":true},"sourceId":{"dataType":"string","required":true},"sourceType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["task"]}],"required":true}}},
        };
        app.post('/orchestrator/connect-entities',
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController)),
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController.prototype.connectEntities)),

            async function OrchestratorController_connectEntities(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrchestratorController_connectEntities, request, response });

                const controller = new OrchestratorController();

              await templateService.apiHandler({
                methodName: 'connectEntities',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrchestratorController_queryKnowledge: Record<string, TsoaRoute.ParameterSchema> = {
                query: {"in":"query","name":"query","required":true,"dataType":"string"},
                assistantId: {"in":"query","name":"assistantId","dataType":"string"},
                tags: {"in":"query","name":"tags","dataType":"string"},
        };
        app.get('/orchestrator/query-knowledge',
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController)),
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController.prototype.queryKnowledge)),

            async function OrchestratorController_queryKnowledge(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrchestratorController_queryKnowledge, request, response });

                const controller = new OrchestratorController();

              await templateService.apiHandler({
                methodName: 'queryKnowledge',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrchestratorController_suggestAssistants: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"tags":{"dataType":"array","array":{"dataType":"string"}},"task":{"ref":"TaskRequest","required":true}}},
        };
        app.post('/orchestrator/suggest-assistants',
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController)),
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController.prototype.suggestAssistants)),

            async function OrchestratorController_suggestAssistants(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrchestratorController_suggestAssistants, request, response });

                const controller = new OrchestratorController();

              await templateService.apiHandler({
                methodName: 'suggestAssistants',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrchestratorController_evaluatePerformance: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"path","name":"assistantId","required":true,"dataType":"string"},
        };
        app.get('/orchestrator/evaluate-performance/:assistantId',
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController)),
            ...(fetchMiddlewares<RequestHandler>(OrchestratorController.prototype.evaluatePerformance)),

            async function OrchestratorController_evaluatePerformance(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrchestratorController_evaluatePerformance, request, response });

                const controller = new OrchestratorController();

              await templateService.apiHandler({
                methodName: 'evaluatePerformance',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryController_getMemories: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/memory',
            ...(fetchMiddlewares<RequestHandler>(MemoryController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryController.prototype.getMemories)),

            async function MemoryController_getMemories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryController_getMemories, request, response });

                const controller = new MemoryController();

              await templateService.apiHandler({
                methodName: 'getMemories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryController_getMemory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/memory/:id',
            ...(fetchMiddlewares<RequestHandler>(MemoryController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryController.prototype.getMemory)),

            async function MemoryController_getMemory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryController_getMemory, request, response });

                const controller = new MemoryController();

              await templateService.apiHandler({
                methodName: 'getMemory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryController_createMemory: Record<string, TsoaRoute.ParameterSchema> = {
                memory: {"in":"body","name":"memory","required":true,"ref":"Omit_Memory.id-or-createdAt-or-updatedAt_"},
        };
        app.post('/memory',
            ...(fetchMiddlewares<RequestHandler>(MemoryController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryController.prototype.createMemory)),

            async function MemoryController_createMemory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryController_createMemory, request, response });

                const controller = new MemoryController();

              await templateService.apiHandler({
                methodName: 'createMemory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryController_updateMemory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                memory: {"in":"body","name":"memory","required":true,"ref":"Memory"},
        };
        app.put('/memory/:id',
            ...(fetchMiddlewares<RequestHandler>(MemoryController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryController.prototype.updateMemory)),

            async function MemoryController_updateMemory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryController_updateMemory, request, response });

                const controller = new MemoryController();

              await templateService.apiHandler({
                methodName: 'updateMemory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryController_deleteMemory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/memory/:id',
            ...(fetchMiddlewares<RequestHandler>(MemoryController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryController.prototype.deleteMemory)),

            async function MemoryController_deleteMemory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryController_deleteMemory, request, response });

                const controller = new MemoryController();

              await templateService.apiHandler({
                methodName: 'deleteMemory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOwnedMemoryController_getMemoriesByAssistantId: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"path","name":"assistantId","required":true,"dataType":"string"},
        };
        app.get('/memory-owned/assistant/:assistantId',
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController.prototype.getMemoriesByAssistantId)),

            async function OwnedMemoryController_getMemoriesByAssistantId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOwnedMemoryController_getMemoriesByAssistantId, request, response });

                const controller = new OwnedMemoryController();

              await templateService.apiHandler({
                methodName: 'getMemoriesByAssistantId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOwnedMemoryController_getOwnedMemories: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"path","name":"assistantId","required":true,"dataType":"string"},
        };
        app.get('/memory-owned/owned/:assistantId',
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController.prototype.getOwnedMemories)),

            async function OwnedMemoryController_getOwnedMemories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOwnedMemoryController_getOwnedMemories, request, response });

                const controller = new OwnedMemoryController();

              await templateService.apiHandler({
                methodName: 'getOwnedMemories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOwnedMemoryController_addOwnedMemory: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"path","name":"assistantId","required":true,"dataType":"string"},
                memoryId: {"in":"path","name":"memoryId","required":true,"dataType":"string"},
        };
        app.post('/memory-owned/assistant/:assistantId/memory/:memoryId',
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController.prototype.addOwnedMemory)),

            async function OwnedMemoryController_addOwnedMemory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOwnedMemoryController_addOwnedMemory, request, response });

                const controller = new OwnedMemoryController();

              await templateService.apiHandler({
                methodName: 'addOwnedMemory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOwnedMemoryController_removeOwnedMemory: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"path","name":"assistantId","required":true,"dataType":"string"},
                memoryId: {"in":"path","name":"memoryId","required":true,"dataType":"string"},
        };
        app.delete('/memory-owned/assistant/:assistantId/memory/:memoryId',
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController.prototype.removeOwnedMemory)),

            async function OwnedMemoryController_removeOwnedMemory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOwnedMemoryController_removeOwnedMemory, request, response });

                const controller = new OwnedMemoryController();

              await templateService.apiHandler({
                methodName: 'removeOwnedMemory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOwnedMemoryController_updateOwnedMemories: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"path","name":"assistantId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"memoryIds":{"dataType":"array","array":{"dataType":"string"},"required":true}}},
        };
        app.put('/memory-owned/assistant/:assistantId',
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(OwnedMemoryController.prototype.updateOwnedMemories)),

            async function OwnedMemoryController_updateOwnedMemories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOwnedMemoryController_updateOwnedMemories, request, response });

                const controller = new OwnedMemoryController();

              await templateService.apiHandler({
                methodName: 'updateOwnedMemories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFocusedMemoryController_getFocusedMemoriesByAssistantId: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"path","name":"assistantId","required":true,"dataType":"string"},
        };
        app.get('/memory-focused/assistant/:assistantId',
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController.prototype.getFocusedMemoriesByAssistantId)),

            async function FocusedMemoryController_getFocusedMemoriesByAssistantId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFocusedMemoryController_getFocusedMemoriesByAssistantId, request, response });

                const controller = new FocusedMemoryController();

              await templateService.apiHandler({
                methodName: 'getFocusedMemoriesByAssistantId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFocusedMemoryController_getFocusedMemories: Record<string, TsoaRoute.ParameterSchema> = {
                memoryFocusId: {"in":"path","name":"memoryFocusId","required":true,"dataType":"string"},
        };
        app.get('/memory-focused/focus/:memoryFocusId',
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController.prototype.getFocusedMemories)),

            async function FocusedMemoryController_getFocusedMemories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFocusedMemoryController_getFocusedMemories, request, response });

                const controller = new FocusedMemoryController();

              await templateService.apiHandler({
                methodName: 'getFocusedMemories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFocusedMemoryController_addFocusedMemory: Record<string, TsoaRoute.ParameterSchema> = {
                memoryFocusId: {"in":"path","name":"memoryFocusId","required":true,"dataType":"string"},
                memoryId: {"in":"path","name":"memoryId","required":true,"dataType":"string"},
        };
        app.post('/memory-focused/focus/:memoryFocusId/memory/:memoryId',
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController.prototype.addFocusedMemory)),

            async function FocusedMemoryController_addFocusedMemory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFocusedMemoryController_addFocusedMemory, request, response });

                const controller = new FocusedMemoryController();

              await templateService.apiHandler({
                methodName: 'addFocusedMemory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFocusedMemoryController_removeFocusedMemory: Record<string, TsoaRoute.ParameterSchema> = {
                memoryFocusId: {"in":"path","name":"memoryFocusId","required":true,"dataType":"string"},
                memoryId: {"in":"path","name":"memoryId","required":true,"dataType":"string"},
        };
        app.delete('/memory-focused/focus/:memoryFocusId/memory/:memoryId',
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController.prototype.removeFocusedMemory)),

            async function FocusedMemoryController_removeFocusedMemory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFocusedMemoryController_removeFocusedMemory, request, response });

                const controller = new FocusedMemoryController();

              await templateService.apiHandler({
                methodName: 'removeFocusedMemory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFocusedMemoryController_updateFocusedMemories: Record<string, TsoaRoute.ParameterSchema> = {
                memoryFocusId: {"in":"path","name":"memoryFocusId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"memoryIds":{"dataType":"array","array":{"dataType":"string"},"required":true}}},
        };
        app.put('/memory-focused/focus/:memoryFocusId',
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(FocusedMemoryController.prototype.updateFocusedMemories)),

            async function FocusedMemoryController_updateFocusedMemories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFocusedMemoryController_updateFocusedMemories, request, response });

                const controller = new FocusedMemoryController();

              await templateService.apiHandler({
                methodName: 'updateFocusedMemories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryFocusRuleController_createMemoryFocusRule: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"priorityTags":{"dataType":"array","array":{"dataType":"string"},"required":true},"relationshipTypes":{"dataType":"array","array":{"dataType":"string"},"required":true},"maxResults":{"dataType":"double","required":true},"assistantId":{"dataType":"string","required":true}}},
        };
        app.post('/memory-focus-rule',
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController.prototype.createMemoryFocusRule)),

            async function MemoryFocusRuleController_createMemoryFocusRule(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryFocusRuleController_createMemoryFocusRule, request, response });

                const controller = new MemoryFocusRuleController();

              await templateService.apiHandler({
                methodName: 'createMemoryFocusRule',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryFocusRuleController_getMemoryFocusRules: Record<string, TsoaRoute.ParameterSchema> = {
                assistantId: {"in":"path","name":"assistantId","required":true,"dataType":"string"},
        };
        app.get('/memory-focus-rule/assistant/:assistantId',
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController.prototype.getMemoryFocusRules)),

            async function MemoryFocusRuleController_getMemoryFocusRules(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryFocusRuleController_getMemoryFocusRules, request, response });

                const controller = new MemoryFocusRuleController();

              await templateService.apiHandler({
                methodName: 'getMemoryFocusRules',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryFocusRuleController_getMemoryFocusRuleById: Record<string, TsoaRoute.ParameterSchema> = {
                ruleId: {"in":"path","name":"ruleId","required":true,"dataType":"string"},
        };
        app.get('/memory-focus-rule/:ruleId',
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController.prototype.getMemoryFocusRuleById)),

            async function MemoryFocusRuleController_getMemoryFocusRuleById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryFocusRuleController_getMemoryFocusRuleById, request, response });

                const controller = new MemoryFocusRuleController();

              await templateService.apiHandler({
                methodName: 'getMemoryFocusRuleById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryFocusRuleController_updateMemoryFocusRule: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                updates: {"in":"body","name":"updates","required":true,"ref":"MemoryFocusRule"},
        };
        app.put('/memory-focus-rule/:id',
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController.prototype.updateMemoryFocusRule)),

            async function MemoryFocusRuleController_updateMemoryFocusRule(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryFocusRuleController_updateMemoryFocusRule, request, response });

                const controller = new MemoryFocusRuleController();

              await templateService.apiHandler({
                methodName: 'updateMemoryFocusRule',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryFocusRuleController_removeMemoryFocusRule: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/memory-focus-rule/:id',
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryFocusRuleController.prototype.removeMemoryFocusRule)),

            async function MemoryFocusRuleController_removeMemoryFocusRule(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryFocusRuleController_removeMemoryFocusRule, request, response });

                const controller = new MemoryFocusRuleController();

              await templateService.apiHandler({
                methodName: 'removeMemoryFocusRule',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryExtraController_getMemoriesWithTags: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/memory-extra/with-tags',
            ...(fetchMiddlewares<RequestHandler>(MemoryExtraController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryExtraController.prototype.getMemoriesWithTags)),

            async function MemoryExtraController_getMemoriesWithTags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryExtraController_getMemoriesWithTags, request, response });

                const controller = new MemoryExtraController();

              await templateService.apiHandler({
                methodName: 'getMemoriesWithTags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryExtraController_getMemoriesByTags: Record<string, TsoaRoute.ParameterSchema> = {
                tags: {"in":"query","name":"tags","required":true,"dataType":"string"},
        };
        app.get('/memory-extra/by-tags',
            ...(fetchMiddlewares<RequestHandler>(MemoryExtraController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryExtraController.prototype.getMemoriesByTags)),

            async function MemoryExtraController_getMemoriesByTags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryExtraController_getMemoriesByTags, request, response });

                const controller = new MemoryExtraController();

              await templateService.apiHandler({
                methodName: 'getMemoriesByTags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryExtraController_getOrganizedMemories: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/memory-extra/organized',
            ...(fetchMiddlewares<RequestHandler>(MemoryExtraController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryExtraController.prototype.getOrganizedMemories)),

            async function MemoryExtraController_getOrganizedMemories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryExtraController_getOrganizedMemories, request, response });

                const controller = new MemoryExtraController();

              await templateService.apiHandler({
                methodName: 'getOrganizedMemories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMemoryExtraController_updateMemoryTags: Record<string, TsoaRoute.ParameterSchema> = {
                memoryId: {"in":"path","name":"memoryId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"newTags":{"dataType":"array","array":{"dataType":"string"},"required":true}}},
        };
        app.put('/memory-extra/:memoryId/tags',
            ...(fetchMiddlewares<RequestHandler>(MemoryExtraController)),
            ...(fetchMiddlewares<RequestHandler>(MemoryExtraController.prototype.updateMemoryTags)),

            async function MemoryExtraController_updateMemoryTags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMemoryExtraController_updateMemoryTags, request, response });

                const controller = new MemoryExtraController();

              await templateService.apiHandler({
                methodName: 'updateMemoryTags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_getFeedbackById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/feedback/:id',
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.getFeedbackById)),

            async function FeedbackController_getFeedbackById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_getFeedbackById, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'getFeedbackById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_getFeedbackByTarget: Record<string, TsoaRoute.ParameterSchema> = {
                targetType: {"in":"path","name":"targetType","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["assistant"]},{"dataType":"enum","enums":["memory"]},{"dataType":"enum","enums":["task"]}]},
                targetId: {"in":"path","name":"targetId","required":true,"dataType":"string"},
        };
        app.get('/feedback/target/:targetType/:targetId',
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.getFeedbackByTarget)),

            async function FeedbackController_getFeedbackByTarget(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_getFeedbackByTarget, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'getFeedbackByTarget',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_addFeedback: Record<string, TsoaRoute.ParameterSchema> = {
                feedback: {"in":"body","name":"feedback","required":true,"ref":"Omit_Feedback.id_"},
        };
        app.post('/feedback',
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.addFeedback)),

            async function FeedbackController_addFeedback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_addFeedback, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'addFeedback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_updateFeedback: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                updates: {"in":"body","name":"updates","required":true,"ref":"Partial_Omit_Feedback.id-or-createdAt-or-updatedAt__"},
        };
        app.put('/feedback/:id',
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.updateFeedback)),

            async function FeedbackController_updateFeedback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_updateFeedback, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'updateFeedback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_deleteFeedback: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/feedback/:id',
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.deleteFeedback)),

            async function FeedbackController_deleteFeedback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_deleteFeedback, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'deleteFeedback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationController_ask: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"ConversationRequest"},
        };
        app.post('/conversation',
            ...(fetchMiddlewares<RequestHandler>(ConversationController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationController.prototype.ask)),

            async function ConversationController_ask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationController_ask, request, response });

                const controller = new ConversationController();

              await templateService.apiHandler({
                methodName: 'ask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatsController_createChat: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"sessionId":{"dataType":"string","required":true}}},
        };
        app.post('/chats',
            ...(fetchMiddlewares<RequestHandler>(ChatsController)),
            ...(fetchMiddlewares<RequestHandler>(ChatsController.prototype.createChat)),

            async function ChatsController_createChat(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatsController_createChat, request, response });

                const controller = new ChatsController();

              await templateService.apiHandler({
                methodName: 'createChat',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatsController_getChatsBySessionId: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
        };
        app.get('/chats/session/:sessionId',
            ...(fetchMiddlewares<RequestHandler>(ChatsController)),
            ...(fetchMiddlewares<RequestHandler>(ChatsController.prototype.getChatsBySessionId)),

            async function ChatsController_getChatsBySessionId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatsController_getChatsBySessionId, request, response });

                const controller = new ChatsController();

              await templateService.apiHandler({
                methodName: 'getChatsBySessionId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatMessagesController_addMessage: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"type":{"dataType":"string","required":true},"memoryId":{"dataType":"string"},"chatId":{"dataType":"string","required":true}}},
        };
        app.post('/chat-messages',
            ...(fetchMiddlewares<RequestHandler>(ChatMessagesController)),
            ...(fetchMiddlewares<RequestHandler>(ChatMessagesController.prototype.addMessage)),

            async function ChatMessagesController_addMessage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatMessagesController_addMessage, request, response });

                const controller = new ChatMessagesController();

              await templateService.apiHandler({
                methodName: 'addMessage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatMessagesController_getMessagesByChatId: Record<string, TsoaRoute.ParameterSchema> = {
                chatId: {"in":"path","name":"chatId","required":true,"dataType":"string"},
        };
        app.get('/chat-messages/chat/:chatId',
            ...(fetchMiddlewares<RequestHandler>(ChatMessagesController)),
            ...(fetchMiddlewares<RequestHandler>(ChatMessagesController.prototype.getMessagesByChatId)),

            async function ChatMessagesController_getMessagesByChatId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatMessagesController_getMessagesByChatId, request, response });

                const controller = new ChatMessagesController();

              await templateService.apiHandler({
                methodName: 'getMessagesByChatId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAssistantController_getAllAssistants: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/assistant',
            ...(fetchMiddlewares<RequestHandler>(AssistantController)),
            ...(fetchMiddlewares<RequestHandler>(AssistantController.prototype.getAllAssistants)),

            async function AssistantController_getAllAssistants(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAssistantController_getAllAssistants, request, response });

                const controller = new AssistantController();

              await templateService.apiHandler({
                methodName: 'getAllAssistants',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAssistantController_getAssistantById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/assistant/:id',
            ...(fetchMiddlewares<RequestHandler>(AssistantController)),
            ...(fetchMiddlewares<RequestHandler>(AssistantController.prototype.getAssistantById)),

            async function AssistantController_getAssistantById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAssistantController_getAssistantById, request, response });

                const controller = new AssistantController();

              await templateService.apiHandler({
                methodName: 'getAssistantById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAssistantController_getAssistantWithDetailsById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/assistant/:id/details',
            ...(fetchMiddlewares<RequestHandler>(AssistantController)),
            ...(fetchMiddlewares<RequestHandler>(AssistantController.prototype.getAssistantWithDetailsById)),

            async function AssistantController_getAssistantWithDetailsById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAssistantController_getAssistantWithDetailsById, request, response });

                const controller = new AssistantController();

              await templateService.apiHandler({
                methodName: 'getAssistantWithDetailsById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAssistantController_createAssistantSimple: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"instructions":{"dataType":"string","required":true},"name":{"dataType":"string","required":true}}},
        };
        app.post('/assistant/simple',
            ...(fetchMiddlewares<RequestHandler>(AssistantController)),
            ...(fetchMiddlewares<RequestHandler>(AssistantController.prototype.createAssistantSimple)),

            async function AssistantController_createAssistantSimple(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAssistantController_createAssistantSimple, request, response });

                const controller = new AssistantController();

              await templateService.apiHandler({
                methodName: 'createAssistantSimple',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAssistantController_createAssistant: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"instructions":{"dataType":"string","required":true},"model":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["chat"]},{"dataType":"enum","enums":["assistant"]}],"required":true},"description":{"dataType":"string","required":true},"name":{"dataType":"string","required":true}}},
        };
        app.post('/assistant',
            ...(fetchMiddlewares<RequestHandler>(AssistantController)),
            ...(fetchMiddlewares<RequestHandler>(AssistantController.prototype.createAssistant)),

            async function AssistantController_createAssistant(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAssistantController_createAssistant, request, response });

                const controller = new AssistantController();

              await templateService.apiHandler({
                methodName: 'createAssistant',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAssistantController_updateAssistant: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                assistant: {"in":"body","name":"assistant","required":true,"ref":"Partial_Assistant_"},
        };
        app.put('/assistant/:id',
            ...(fetchMiddlewares<RequestHandler>(AssistantController)),
            ...(fetchMiddlewares<RequestHandler>(AssistantController.prototype.updateAssistant)),

            async function AssistantController_updateAssistant(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAssistantController_updateAssistant, request, response });

                const controller = new AssistantController();

              await templateService.apiHandler({
                methodName: 'updateAssistant',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAssistantController_deleteAssistant: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/assistant/:id',
            ...(fetchMiddlewares<RequestHandler>(AssistantController)),
            ...(fetchMiddlewares<RequestHandler>(AssistantController.prototype.deleteAssistant)),

            async function AssistantController_deleteAssistant(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAssistantController_deleteAssistant, request, response });

                const controller = new AssistantController();

              await templateService.apiHandler({
                methodName: 'deleteAssistant',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAssistantMemoryController_getAssistantMemories: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/assistant-memory/:id',
            ...(fetchMiddlewares<RequestHandler>(AssistantMemoryController)),
            ...(fetchMiddlewares<RequestHandler>(AssistantMemoryController.prototype.getAssistantMemories)),

            async function AssistantMemoryController_getAssistantMemories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAssistantMemoryController_getAssistantMemories, request, response });

                const controller = new AssistantMemoryController();

              await templateService.apiHandler({
                methodName: 'getAssistantMemories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
