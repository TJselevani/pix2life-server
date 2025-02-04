const { createLogger, format, transports } = require('winston');
const ConsoleLoggerTransport = require('../lib/winston-console-transport');

const customFormat = format((info) => {
  if (info.error) {
    info.error = {
      message: info.error.message,
      stack: info.error.stack
    };
  }
  return info;
})();

const logTransports = [
  new transports.File({
    level: 'error',
    filename: './logs/error.log',
    format: format.combine(customFormat, format.json())
  }),
  new ConsoleLoggerTransport()
];

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: logTransports,
  defaultMeta: { service: 'api' },
  // eslint-disable-next-line no-undef
  level: process.env.NODE_ENV === 'development' ? 'silly' : 'info'
});

module.exports = logger;
