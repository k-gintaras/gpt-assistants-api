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

# Compile TypeScript to generate the dist/ folder
RUN npm run tsoa:gen && npm run build

COPY src/database/*.sql /app/dist/database/


# Expose the app's port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
