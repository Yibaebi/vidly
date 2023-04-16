const { parseError } = require('../../utils')
const logger = require('../logger')

module.exports = function (err, req, res, next) {
  logger.error(err)

  const errorObj = parseError(err)
  res.status(errorObj.status).send(errorObj)
}
