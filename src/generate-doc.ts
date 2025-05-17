/* eslint-disable @typescript-eslint/no-explicit-any */
import { Project, Node, SyntaxKind } from 'ts-morph';
import path from 'path';

// Function to extract API docs dynamically
export const generateApiDocs = (): any[] => {
  const project = new Project({
    tsConfigFilePath: path.join(__dirname, '../tsconfig.json'),
  });

  const routeFiles = project.getSourceFiles('src/routes/*.ts');
  const controllerFiles = project.getSourceFiles('src/controllers/*.ts');
  const apiDocs: any[] = [];

  console.log('Generating API docs...');
  console.log(
    'Route files:',
    routeFiles.map((file) => file.getBaseName())
  );

  // Helper to extract types from JSDoc comments
  const extractTypeFromComment = (method: any, tag: string): string | null => {
    const jsDoc = method.getJsDocs();
    for (const doc of jsDoc) {
      // console.log('JSDoc:', doc.getInnerText());
      for (const tagNode of doc.getTags()) {
        if (tagNode.getTagName() === tag) {
          // { id: string } The assistant's ID.
          const rawComment = tagNode.getComment()?.trim() || null;
          const fixedComment = rawComment.split('}')[0] + '}';
          return fixedComment;
        }
      }
    }
    return null;
  };

  // Helper to find a controller method by name
  const findControllerMethod = (controllerName: string, methodName: string) => {
    // console.log('Controller name:', controllerName);

    const controllerFile = controllerFiles.find((file) => file.getBaseNameWithoutExtension() === controllerName);
    // console.log('Controller file:', controllerFile);

    if (!controllerFile) return null;

    const classDeclaration = controllerFile.getClasses()[0];
    if (!classDeclaration) return null;

    const method = classDeclaration.getMethod(methodName);
    // console.log('Controller method:', method?.getName());
    // console.log('Controller class:', classDeclaration.getName());
    if (!method) return null;

    // console.log('Controller method found:', method.getName());
    // console.log('Controller file:', controllerFile.getBaseName());

    // Extract request params & body from JSDoc comments
    const inferredParams = extractTypeFromComment(method, 'requestParams');
    const inferredBody = extractTypeFromComment(method, 'requestBody');

    // Parse respond calls for response structure (status code, message, data)
    const respondDetails = method
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => call.getExpression().getText() === 'respond')
      .map((call) => {
        const args = call.getArguments();
        return {
          statusCode: args[1]?.getText(),
          message: args[2]?.getText(),
          data: args[3]?.getText(),
        };
      });

    return { inferredParams, inferredBody, respondDetails };
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

              // Store the extracted API documentation
              apiDocs.push({
                file: file.getBaseName(),
                httpMethod,
                path: '/' + file.getBaseName().replace('.routes.ts', '') + routePath,
                controller: controllerName,
                method: methodName,
                requestParams: controllerMethod?.inferredParams || null,
                requestBody: controllerMethod?.inferredBody || null,
                responses: controllerMethod?.respondDetails || [],
              });
            }
          }
        }
      }
    });
  });

  return apiDocs;
};

generateApiDocs();
