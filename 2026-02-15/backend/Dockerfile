FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install as specified)
RUN npm install

# Copy application files
COPY . .

# Expose port (will be overridden by environment variable)
EXPOSE 3109

# Start the application
CMD ["node", "server.js"]
