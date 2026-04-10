# Use Node.js
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Move into frontend and install dependencies
WORKDIR /app/frontend
RUN npm install

# Build frontend
RUN npm run build

# Expose React port
EXPOSE 3000

# Start frontend
CMD ["npm", "start"]
