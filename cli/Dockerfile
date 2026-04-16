FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Link the package locally so the 'envsync' command is available
RUN npm link

# Default command is to show help
CMD ["envsync", "--help"]
