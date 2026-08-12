# Stage 1: Build the React / Vite application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy project source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the static build using lightweight Nginx web server
FROM nginx:alpine

# Copy custom Nginx configuration for SPA routing
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static files from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
