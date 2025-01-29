/* eslint-disable @typescript-eslint/no-explicit-any */
import { Project, Node, SyntaxKind } from 'ts-morph';
import path from 'path';

const project = new Project({
  tsConfigFilePath: path.join(__dirname, '../tsconfig.json'),
});

const routeFiles = project.getSourceFiles('src/routes/*.ts');
const controllerFiles = project.getSourceFiles('src/controllers/*.ts');
const apiDocs: any[] = [];

// Helper to simplify type names
const simplifyTypeName = (type: string): string => {
  const match = type.match(/import\(.+?\)\.([A-Za-z0-9]+)/);
  return match ? match[1] : type;
};

// Helper to parse `respond` calls and extract response details
const parseRespondCalls = (method: any) => {
  const respondCalls = method
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((call: { getExpression: () => { (): any; new (): any; getText: { (): string; new (): any } } }) => call.getExpression().getText() === 'respond');

  return respondCalls.map((call: { getArguments: () => any }) => {
    const args = call.getArguments();
    const statusCode = args[1]?.getText();
    const message = args[2]?.getText();
    const data = args[3]?.getText();
    return { statusCode, message, data };
  });
};

// Helper to infer parameter types from `req.params`
const inferParamsType = (method: any) => {
  const params: Record<string, string> = {};
  const body = method.getBody();
  if (!body) return null;

  // Find destructuring or direct access of `req.params`
  body.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((decl: { getInitializer: () => any }) => {
    const initializer = decl.getInitializer();
    if (initializer?.getText().includes('req.params')) {
      const destructuredProps = initializer
        .getText()
        .match(/\{(.*?)\}/)?.[1]
        ?.split(',');
      if (destructuredProps) {
        destructuredProps.forEach((prop: string) => {
          const key = prop.trim();
          params[key] = 'string'; // Assuming `string` as the default type for path params
        });
      }
    }
  });

  body.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression).forEach((access: { getText: () => any }) => {
    const text = access.getText();
    if (text.startsWith('req.params.')) {
      const paramName = text.split('.')[2];
      if (paramName) {
        params[paramName] = 'string'; // Default to `string`
      }
    }
  });

  return Object.keys(params).length > 0 ? params : null;
};

// Helper to infer `req.body` type
const inferBodyType = (method: any) => {
  const body = method.getBody();
  if (!body) return null;

  const bodyAssignment = body.getDescendantsOfKind(SyntaxKind.VariableDeclaration).find((decl: { getInitializer: () => any }) => {
    const initializer = decl.getInitializer();
    return initializer?.getText().includes('req.body');
  });

  if (bodyAssignment) {
    const bodyType = bodyAssignment.getType().getText();
    return simplifyTypeName(bodyType);
  }

  return null;
};

// Helper to find a controller method by name
const findControllerMethod = (controllerName: string, methodName: string) => {
  const controllerFile = controllerFiles.find((file) => file.getBaseNameWithoutExtension() === controllerName);
  if (!controllerFile) return null;

  const classDeclaration = controllerFile.getClasses()[0];
  if (!classDeclaration) return null;

  const method = classDeclaration.getMethod(methodName);
  if (!method) return null;

  // Infer parameter details
  const parameters = method.getParameters().map((param) => ({
    name: param.getName(),
    type: simplifyTypeName(param.getType().getText()),
  }));

  // Infer additional details from method body
  const inferredParams = inferParamsType(method);
  const inferredBody = inferBodyType(method);

  // Parse respond calls
  const respondDetails = parseRespondCalls(method);

  return { parameters, inferredParams, inferredBody, respondDetails };
};

routeFiles.forEach((file) => {
  file.forEachDescendant((node) => {
    if (Node.isCallExpression(node)) {
      const expression = node.getExpression();
      if (Node.isPropertyAccessExpression(expression)) {
        const httpMethod = expression.getName();
        if (['get', 'post', 'put', 'delete'].includes(httpMethod)) {
          const args = node.getArguments();
          const routePath = args[0]?.getText()?.replace(/['"`]/g, '');
          const controllerCall = args[1]?.getText(); // Get the controller method call

          // Extract controller and method names
          const match = controllerCall?.match(/controller\.(\w+)/);
          if (match) {
            const [, methodName] = match;
            const controllerName = file.getBaseNameWithoutExtension().replace('.routes', '.controller');

            // Find controller method details
            const controllerMethod = findControllerMethod(controllerName, methodName);

            apiDocs.push({
              file: file.getBaseName(),
              httpMethod,
              path: routePath,
              controller: controllerName,
              method: methodName,
              details: controllerMethod || 'Controller method not found',
            });
          }
        }
      }
    }
  });
});

// Output the API documentation
console.log('Extracted API Docs:', JSON.stringify(apiDocs, null, 2));
