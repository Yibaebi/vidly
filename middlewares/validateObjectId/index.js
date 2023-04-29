const mongoose = require('mongoose')
const { ERROR_CODES } = require('../../constants')

module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(ERROR_CODES.NOT_FOUND)
      .send({ data: null, message: 'Invalid request ID' })
  }

  next()
}
