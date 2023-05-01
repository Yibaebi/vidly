const { RESPONSE_CODES } = require('../../constants')

const admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(RESPONSE_CODES.FORBIDDEN).send({
      status: RESPONSE_CODES.FORBIDDEN,
      message: 'Access Denied.'
    })
  }

  next()
}

module.exports = admin
