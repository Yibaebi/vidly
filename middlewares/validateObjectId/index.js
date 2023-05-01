const mongoose = require('mongoose')
const { RESPONSE_CODES } = require('../../constants')

module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(RESPONSE_CODES.NOT_FOUND)
      .send({ data: null, message: 'Invalid request ID' })
  }

  next()
}
