# Instagram Reels Downloader Bot

Telegram бот для скачивания видео из Instagram Reels. Бот автоматически обрабатывает ссылки на Reels и отправляет видео пользователю.

> 🤖 Этот проект полностью разработан с помощью нейросети Claude 3.5 Sonnet

## 🚀 Возможности

- Скачивание видео из Instagram Reels
- Автоматическая очистка временных файлов
- Подробное логирование всех действий
- Автоматический перезапуск при сбоях
- Docker контейнеризация
- Ротация логов
- Graceful shutdown

## 📋 Требования

- Docker и Docker Compose
- Telegram Bot Token (получить у [@BotFather](https://t.me/BotFather))
- Минимум 1GB RAM
- 100MB свободного места на диске

## 🛠 Установка и запуск

1. Скопируйте `.env.example` в `.env` и добавьте токен вашего бота:
```bash
cp .env.example .env
```

2. Соберите и запустите контейнер:
```bash
docker-compose build && docker-compose up -d
```

3. Просмотр логов:
```bash
docker-compose logs -f
```

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).