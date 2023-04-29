const jwt = require('jsonwebtoken')
const config = require('config')

const { ERROR_CODES } = require('../../constants')

const authenticator = (req, res, next) => {
  const token = req.headers['x-auth-token']

  if (!token) {
    return res.status(ERROR_CODES.UNAUTHORIZED).send({
      status: ERROR_CODES.UNAUTHORIZED,
      message: 'Access Denied. No token provided.'
    })
  }

  try {
    const jwtPrivateKey = config.get('jwtPrivateKey')
    const userPayload = jwt.verify(token, jwtPrivateKey)

    req.user = userPayload

    next()
  } catch (error) {
    res.status(ERROR_CODES.UNAUTHORIZED).send({
      status: ERROR_CODES.UNAUTHORIZED,
      message: 'Invalid auth token. Access Denied.'
    })
  }
}

module.exports = authenticator
