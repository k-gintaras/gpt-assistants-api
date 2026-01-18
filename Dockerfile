# Use Node.js LTS as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files into the container
COPY . .

# Copy Firebase service account file
COPY ai-api-5c92d-firebase-adminsdk-fbsvc-2df8c90eaf.json /app/firebase-key.json

# Build TypeScript
RUN npm run build

# Expose the app's port
EXPOSE 3001

# Start the compiled app
CMD ["node", "dist/app.js"]
