# Use Node 18 slim Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy all source files
COPY . .

# Expose backend port
EXPOSE 3000

# Start the backend
CMD ["node", "index.js"]
