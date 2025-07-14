# Stage 1: Build the React app
# Fix casing warning: 'AS' in uppercase
FROM node:20-alpine AS builder  

WORKDIR /app

# Copy dependency files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies)
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Set environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN pnpm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
