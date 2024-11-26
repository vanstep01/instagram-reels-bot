FROM node:16-alpine

WORKDIR /app

# Копирование файлов проекта
COPY package*.json ./
COPY index.js ./
COPY logger.js ./
COPY .env ./

# Установка зависимостей
RUN npm install --production

# Создание директории для логов
RUN mkdir -p logs

RUN npm start