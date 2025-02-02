import { OpenAPIV3 } from 'openapi-types';

/**
 * Type for the documentation object extracted from routes.
 */
interface ApiDoc {
  httpMethod: 'get' | 'post' | 'put' | 'delete';
  path: string;
  controller: string;
  method: string;
  requestParams: string | null;
  requestBody: string | null;
  responses: { statusCode: string; message: string; data: string | null }[];
}

/**
 * Helper function to handle dynamic route parameters (e.g., /:id -> /{id}).
 * @param path - The route path
 * @returns The path with parameters formatted for Swagger
 */
const formatPath = (path: string): string => {
  return path.replace(/\/:(\w+)/g, '/{$1}');
};

/**
 * Generates Swagger Paths from API documentation.
 * @param apiDocs - Array of API documentation objects
 * @returns The Swagger PathsObject
 */
export const generateSwaggerPaths = (apiDocs: ApiDoc[]): OpenAPIV3.PathsObject => {
  const paths: OpenAPIV3.PathsObject = {};

  apiDocs.forEach((doc) => {
    const { httpMethod, path, requestParams, requestBody, responses } = doc;

    // Format path to handle dynamic parameters
    const formattedPath = formatPath(path);

    // Initialize the path object if not already
    if (!paths[formattedPath]) {
      paths[formattedPath] = {};
    }

    // Define the operation
    paths[formattedPath][httpMethod] = {
      tags: [doc.controller],
      summary: `${doc.controller} - ${doc.method}`,
      description: `This endpoint corresponds to the ${doc.method} method in the ${doc.controller}`,
      parameters: requestParams ? parseParams(requestParams) : [],
      requestBody: requestBody
        ? {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: getContent(requestBody),
                },
              },
            },
          }
        : undefined,
      responses: responses.reduce((acc, { statusCode, message, data }) => {
        acc[statusCode] = {
          description: message,
          content: data
            ? {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { [data]: { type: 'string' } },
                  },
                },
              }
            : undefined,
        };
        return acc;
      }, {} as Record<string, OpenAPIV3.ResponseObject>),
    };
  });

  return paths;
};

/**
 * Parses the request parameters from a string into Swagger-compatible objects.
 * @param requestParams - The request parameters as a string (e.g., "id:string")
 * @returns Array of Swagger ParameterObject
 */
function parseParams(requestParams: string): OpenAPIV3.ParameterObject[] {
  return requestParams.split(',').map((param) => {
    // Trim and clean each parameter
    const [paramName, paramType] = param
      .replace(/[{}]/g, '') // Remove any unwanted `{` or `}`
      .trim()
      .split(':')
      .map((part) => part.trim());

    return {
      name: paramName, // Cleaned parameter name
      in: 'path',
      required: true,
      description: `The ${paramName}`, // Provide a clear description
      schema: { type: paramType || 'string' }, // Default to "string" if no type is specified
    } as OpenAPIV3.ParameterObject;
  });
}

/**
 * Parses the request body into Swagger-compatible properties.
 * Supports references, arrays, and primitive types.
 * @param requestBody - The request body as a string
 * @returns An object containing Swagger schema properties
 */
function getContent(requestBody: string): Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> {
  const properties: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {};
  const regex = /(\w+)\??:\s*([\w[\]{}]+)/g;
  let match;

  while ((match = regex.exec(requestBody)) !== null) {
    const [paramName, paramType] = [match[1], match[2]];

    // Map basic types
    const typeMapping: Record<string, OpenAPIV3.NonArraySchemaObjectType> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      object: 'object',
    };

    if (paramType.endsWith('[]')) {
      // Detect arrays (e.g., string[], number[])
      const arrayType = paramType.replace('[]', '').trim(); // Extract base type (e.g., string)
      properties[paramName] = {
        type: 'array',
        items: { type: typeMapping[arrayType] || 'string' }, // Default to string if not mapped
      };
    } else if (typeMapping[paramType]) {
      // Primitive types
      properties[paramName] = { type: typeMapping[paramType] };
    } else {
      // Assume a reference (e.g., MemoryRequest)
      properties[paramName] = { $ref: `#/components/schemas/${paramType}` };
    }
  }

  return properties;
}
