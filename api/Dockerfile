FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .sequelizerc ./

# Install dependencies (including dev dependencies for sequelize-cli)
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Default command (will be overridden in compose.yml)
CMD ["node", "src/server.js"]
