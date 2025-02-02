import { OpenAPIV3 } from 'openapi-types';

export const openApiSchemas: OpenAPIV3.ComponentsObject = {
  schemas: {
    MemoryRequest: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['instruction', 'session', 'prompt', 'knowledge', 'meta'],
        },
        data: { type: 'string' },
      },
    },
    TaskRequest: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        description: { type: 'string' },
      },
    },
  },
};
