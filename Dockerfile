# Use a Debian-based Node.js image (Debian supports glibc, needed for better-sqlite3)
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Install required dependencies for better-sqlite3 compilation
RUN apt-get update && apt-get install -y python3 make g++ sqlite3 && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first to cache dependencies
COPY package.json package-lock.json ./

# Install dependencies (forcing better-sqlite3 to compile inside Docker)
RUN npm install --build-from-source=better-sqlite3

# Copy application files
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the server port
EXPOSE 3000

# Start the server
CMD ["node", "/app/dist/app.js"]
