const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize, splat } = format;

const userformat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
    format: combine(
        label({ label: '**user**' }),
        timestamp(),
        // colorize(),
        splat(),
        userformat
    ),
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.File({ filename: 'user.log' }));
}

module.exports = logger;
