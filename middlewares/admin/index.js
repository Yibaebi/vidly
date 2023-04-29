const { ERROR_CODES } = require('../../constants')

const admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(ERROR_CODES.FORBIDDEN).send({
      status: ERROR_CODES.FORBIDDEN,
      message: 'Access Denied.'
    })
  }

  next()
}

module.exports = admin
