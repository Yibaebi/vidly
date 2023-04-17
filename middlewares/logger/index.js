const { format, createLogger, transports } = require('winston')
const { combine, errors, timestamp, colorize } = format

// Default log config
const DIRNAME = './logs'

const readableLogFormat = format.printf(
  ({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level.toUpperCase()} ${stack || message}\n`
  }
)

const DEFAULT_LOG_FORMAT = combine(
  errors({ stack: false }),
  timestamp(),
  combine(colorize({ level: true })),
  readableLogFormat
)

const GEN_CONFIG = {
  dirname: DIRNAME,
  extension: '.log',
  zippedArchive: true
}

const logger = createLogger({
  format: DEFAULT_LOG_FORMAT,
  transports: [
    new transports.Console({ level: 'info' }),
    new transports.File({ filename: 'error', level: 'error', ...GEN_CONFIG })
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({
      filename: 'exceptions',
      handleRejections: true,
      ...GEN_CONFIG
    })
  ]
})

module.exports = logger
