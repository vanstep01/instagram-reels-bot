require('dotenv').config();
const { Telegraf } = require('telegraf');
const instagramGetUrl = require("instagram-url-direct");
const axios = require('axios');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Функция для очистки временных файлов
const cleanupTempFiles = async (tempFilePath) => {
    try {
        if (fs.existsSync(tempFilePath)) {
            await fs.promises.unlink(tempFilePath);
            logger.info(`Временный файл удален: ${tempFilePath}`);
        }
    } catch (error) {
        logger.error('Ошибка при удалении временного файла', { error: error.message });
    }
};

// Функция для периодической очистки старых логов
const cleanupOldLogs = async () => {
    const logsDir = path.join(__dirname, 'logs');
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней

    try {
        const files = await fs.promises.readdir(logsDir);
        for (const file of files) {
            const filePath = path.join(logsDir, file);
            const stats = await fs.promises.stat(filePath);
            if (Date.now() - stats.mtime.getTime() > maxAge) {
                await fs.promises.unlink(filePath);
                logger.info(`Удален старый лог файл: ${file}`);
            }
        }
    } catch (error) {
        logger.error('Ошибка при очистке старых логов', { error: error.message });
    }
};

// Запускаем очистку логов раз в день
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

if (!process.env.BOT_TOKEN) {
    logger.error('BOT_TOKEN не указан в .env файле');
    throw new Error('BOT_TOKEN не указан в .env файле');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    logger.info('Новый пользователь начал использовать бота', {
        userId: ctx.from.id,
        username: ctx.from.username
    });
    ctx.reply('Привет! Отправь мне ссылку на Instagram Reels, и я скачаю его для тебя.');
});

bot.on('text', async (ctx) => {
    const message = ctx.message.text;
    const userId = ctx.from.id;
    const username = ctx.from.username;
    
    logger.info('Получено сообщение', {
        userId,
        username,
        message
    });
    
    if (message.includes('instagram.com/reel') || message.includes('instagram.com/p/')) {
        const tempFilePath = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);
        try {
            logger.info('Начало загрузки видео', { url: message });
            const processingMsg = await ctx.reply('Загружаю видео, пожалуйста подождите...');
            
            const igResult = await instagramGetUrl(message);
            
            if (igResult.url_list.length > 0) {
                const videoUrl = igResult.url_list[0];
                logger.info('Получена прямая ссылка на видео', { videoUrl });
                
                const response = await axios({
                    method: 'GET',
                    url: videoUrl,
                    responseType: 'stream'
                });
                
                // Сохраняем во временный файл
                const writer = fs.createWriteStream(tempFilePath);
                response.data.pipe(writer);
                
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                
                await ctx.replyWithVideo({ source: tempFilePath });
                logger.info('Видео успешно отправлено пользователю', { userId });
                
                await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
            } else {
                throw new Error('Не удалось получить ссылку на видео');
            }
        } catch (error) {
            logger.error('Ошибка при обработке видео', {
                error: error.message,
                userId,
                url: message
            });
            ctx.reply('Произошла ошибка при загрузке видео. Убедитесь, что ссылка правильная и видео доступно.');
        } finally {
            // Очищаем временный файл
            await cleanupTempFiles(tempFilePath);
        }
    } else {
        logger.warn('Получена некорректная ссылка', {
            userId,
            message
        });
        ctx.reply('Пожалуйста, отправьте корректную ссылку на Instagram Reels.');
    }
});

bot.launch();
logger.info('Бот запущен');

// Включаем graceful shutdown
process.once('SIGINT', () => {
    logger.info('Получен сигнал SIGINT, завершение работы');
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    logger.info('Получен сигнал SIGTERM, завершение работы');
    bot.stop('SIGTERM');
}); 