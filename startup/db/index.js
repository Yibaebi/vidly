const config = require('config')
const { logger } = require('../../middlewares')
const mongoose = require('mongoose')

module.exports = function () {
  // Setup mongodb
  const MONGODB_URL = config.get('mongodbURL')

  mongoose
    .connect(MONGODB_URL)
    .then(() => logger.info('Connected to MongoDB...'))
}
