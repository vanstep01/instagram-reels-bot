const winston = require('winston');
const path = require('path');

// Создаем форматтер для логов
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
    }
    return msg;
});

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
        logFormat
    ),
    transports: [
        // Логирование в файл errors.log только ошибок
        new winston.transports.File({
            filename: path.join('logs', 'errors.log'),
            level: 'error'
        }),
        // Логирование всех уровней в файл combined.log
        new winston.transports.File({
            filename: path.join('logs', 'combined.log')
        }),
        // Вывод в консоль
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        })
    ]
});

module.exports = logger; 