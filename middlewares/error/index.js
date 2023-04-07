const { parseError } = require('../../utils')

module.exports = function (err, req, res, next) {
  const errorObj = parseError(err)
  res.status(errorObj.status).send(errorObj)
}
