# --- Stage 1: Build TypeScript sources ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript into dist/
RUN npm run build


# --- Stage 2: Production runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Default environment variables (override in docker-compose or runtime)
ENV PORT=3000 \
    MONGODB_URI=mongodb://mongo:27017/szteunipress

# Start the server
CMD ["node", "dist/server.js"]

