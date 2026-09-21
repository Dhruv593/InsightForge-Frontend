FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Vite embeds these public values when building. Never pass secrets here.
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ARG VITE_SITE_URL=http://localhost:8080
ARG VITE_GOOGLE_SIGN_IN_ENABLED=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_GOOGLE_SIGN_IN_ENABLED=$VITE_GOOGLE_SIGN_IN_ENABLED
RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
ENTRYPOINT ["nginx", "-g", "daemon off;"]
