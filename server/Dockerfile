# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies (only copy package files first for caching)
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Environment variables
ENV PORT=4000
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "src/server.js"]
