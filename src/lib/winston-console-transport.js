const Transport = require('winston-transport');

/**
 * Log level escape codes
 */
const levelStyleMap = {
  error: '\x1b[41m%s\x1b[0m',
  warn: '\x1b[33m%s\x1b[0m',
  info: '\x1b[94m%s\x1b[0m',
  verbose: '\x1b[35m%s\x1b[0m',
  debug: '\x1b[32m%s\x1b[0m',
  silly: '\x1b[36m%s\x1b[0m'
};

class ConsoleLogTransport extends Transport {
  log(info, callback) {
    const label = info.consoleLoggerOptions?.label || info.level.toUpperCase();
    const finalMessage = `[${new Date().toISOString()}] [${label}] ${info.message}`;
    console.log(levelStyleMap[info.level], finalMessage);
    if (info.stack) { console.log('\t', info.stack);}
    callback();
  }
}

module.exports = ConsoleLogTransport;
