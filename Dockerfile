# ===================================
# Stage 1: Build Stage
# ===================================
FROM node:18-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source files
COPY . .

# Copy Firebase service account file
COPY ai-api-5c92d-firebase-adminsdk-fbsvc-2df8c90eaf.json /app/firebase-key.json

# Build TypeScript and generate tsoa routes
RUN npm run build

# ===================================
# Stage 2: Production Stage
# ===================================
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-key.json ./firebase-key.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsoa.json ./tsoa.json

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose the app's port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the compiled app
CMD ["node", "dist/app.js"]
