# Stage 1: Build React app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy build from previous stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port (optional)
EXPOSE 80

# Start Nginx (already the default CMD)
