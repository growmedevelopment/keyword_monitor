# Use official Node.js 23 Alpine image
FROM node:23-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY ../../frontend/package*.json ./
RUN npm install

# Copy source files
COPY ../../frontend ./

# Build the app
RUN npm run build

# Optional: use static server (for production)
# RUN npm install -g serve
# CMD ["serve", "-s", "dist"]

# For development: expose Vite dev server port
EXPOSE 5173
