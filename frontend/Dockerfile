# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency files first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Build arguments (set at build time)
ARG REACT_APP_API_BASE
ARG REACT_APP_COGNITO_REGION=eu-central-1
ARG REACT_APP_COGNITO_USER_POOL_ID=eu-central-1_9GKrnPnwt
ARG REACT_APP_COGNITO_APP_CLIENT_ID=nbi6of817it1n1s6g2tfadlc6

# Set environment variables from build args
ENV REACT_APP_API_BASE=${REACT_APP_API_BASE}
ENV REACT_APP_COGNITO_REGION=${REACT_APP_COGNITO_REGION}
ENV REACT_APP_COGNITO_USER_POOL_ID=${REACT_APP_COGNITO_USER_POOL_ID}
ENV REACT_APP_COGNITO_APP_CLIENT_ID=${REACT_APP_COGNITO_APP_CLIENT_ID}

# Build the app
RUN npm run build

# Production stage with Nginx
FROM nginx:1.27-alpine

# Copy custom nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 nginx-user && adduser -D -u 1001 -G nginx-user nginx-user

# Update nginx to run as non-root
RUN chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

USER nginx-user

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]