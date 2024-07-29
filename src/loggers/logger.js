const { createLogger, format, transports } = require('winston');
const ConsoleLoggerTransport = require('../lib/winston-console-transport');

const logTransports = [
  new transports.File({
    level: 'error',
    filename: './logs/error.log',
    format: format.json({
      replacer: (key, value) => {
        if (key === 'error') {
          return {
            message: value.message,
            stack: value.stack
          };
        }
        return value;
      }
    })
  }),
  new ConsoleLoggerTransport()
];

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: logTransports,
  defaultMeta: { service: 'api' },
  level: process.env.NODE_ENV === 'development' ? 'silly' : 'info'
});

module.exports = logger;
