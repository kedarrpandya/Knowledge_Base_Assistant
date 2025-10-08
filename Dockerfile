# Dockerfile for Knowledge Assistant Backend

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY local/backend ./local/backend/

# Install dependencies
RUN cd backend && npm install
RUN npm install --prefix local/backend express helmet cors compression morgan dotenv multer groq-sdk ollama @qdrant/js-client-rest
RUN npm install --prefix local/backend --save-dev @types/express @types/cors @types/compression @types/morgan @types/multer @types/node typescript

# Copy source code
COPY backend ./backend
COPY local ./local

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV API_PORT=3000

# Start the application
WORKDIR /app/backend
CMD ["npx", "ts-node", "../local/backend/index-local.ts"]

