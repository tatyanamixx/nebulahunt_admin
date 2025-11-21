# Multi-stage build для админки
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package файлы
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Production stage - nginx для статики
FROM nginx:alpine

# Копируем собранные файлы из builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфиг nginx для SPA routing
RUN echo 'server { \
    listen 3001; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Увеличиваем лимит размера тела запроса для загрузки файлов (фото для уведомлений) \
    client_max_body_size 20M; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://127.0.0.1:3002; \
        proxy_http_version 1.1; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        \
        # Увеличиваем лимит для проксируемых запросов \
        client_max_body_size 20M; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]