# Use a minimal Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy rest of the app
COPY . .

# Expose API port
EXPOSE 3000

# Start the server
CMD ["node", "dist/server.js"]
