# Build stage
FROM node:20-alpine AS builder
<<<<<<< HEAD
WORKDIR /app
# Copy package files
COPY package*.json ./
=======

WORKDIR /app

# Copy package files
COPY package*.json ./

>>>>>>> 10d02261375d219e08536f62462b5b07b03f9316
# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:20-alpine
<<<<<<< HEAD
=======

>>>>>>> 10d02261375d219e08536f62462b5b07b03f9316
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

<<<<<<< HEAD
# Create logs directory BEFORE copying files
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
=======
# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
>>>>>>> 10d02261375d219e08536f62462b5b07b03f9316

# Copy application code
COPY --chown=nodejs:nodejs . .

<<<<<<< HEAD
# Ensure logs directory has correct ownership after copy
RUN chown -R nodejs:nodejs /app/logs

=======
>>>>>>> 10d02261375d219e08536f62462b5b07b03f9316
# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
