const { RESPONSE_CODES } = require('../../constants')

module.exports = function (validatorFn) {
  return (req, res, next) => {
    const { error } = validatorFn(req.body)

    if (error) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).send({
        status: RESPONSE_CODES.BAD_REQUEST,
        message: error.details[0].message.replaceAll('"', ''),
        data: null
      })
    }

    next()
  }
}
