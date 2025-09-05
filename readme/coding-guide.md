# Coding Guide

This guide helps developers add features and maintain the codebase.

## Adding New Functionality

### Automated Way
Run `npm run add` to scaffold a new feature:
- Prompts for feature name and description
- Creates service, controller service, controller, route
- Updates `app.ts`

### Manual Steps
1. **Create Service** (`src/services/sqlite-services/feature.service.ts`):
   - Handle DB queries
   - Example: `getAllFeatures()`, `createFeature()`

2. **Create Controller Service** (`src/services/core-services/feature.controller.service.ts`):
   - Bridge between DB service and controller
   - Add business logic

3. **Create Controller** (`src/controllers/feature.controller.ts`):
   - Handle HTTP requests
   - Validate input, call service, respond
   - Use `respond()` helper

4. **Create Route** (`src/routes/feature.routes.ts`):
   - Map URLs to controller methods
   - Example: `router.get('/', controller.getFeatures)`

5. **Register Route** in `src/app.ts`:
   - Import and `app.use('/feature', featureRoutes)`

### Example Code Snippets
See `tools/add-functionality.ts` for boilerplate.

## Best Practices
- **TypeScript**: Use interfaces for models
- **Error Handling**: Use try-catch, respond with proper codes
- **Validation**: Validate inputs in controllers
- **Testing**: Write unit tests in `tests/`
- **Linting**: Run `npm run lint` before commit
- **Commits**: Descriptive messages

## Development Workflow
1. Branch from `main`
2. Implement feature
3. Test locally
4. Run `npm test`
5. Lint: `npm run lint`
6. Commit and push
7. Create PR

## Tools
- **Build**: `npm run build`
- **Dev Server**: `npm run dev`
- **DB Shell**: `npm run db`
- **Update DB**: `npm run update-database`

## Common Patterns
- Services return data, controllers handle responses
- Use async/await for DB calls
- JSDoc for Swagger docs
