const config = require('config')
const mongoose = require('mongoose')
const { logger } = require('../../middlewares')

module.exports = function () {
  // Setup mongodb
  const MONGODB_URL = config.get('mongodbURL')

  mongoose
    .connect(MONGODB_URL)
    .then(() => logger.info(`Connected to ${MONGODB_URL}...`))
}
