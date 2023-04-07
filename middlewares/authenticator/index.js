const jwt = require('jsonwebtoken')
const config = require('config')

const authenticator = (req, res, next) => {
  const token = req.headers['x-auth-token']

  if (!token) {
    return res.status(401).send({
      status: 401,
      message: 'Access Denied. No token provided.'
    })
  }

  try {
    const jwtPrivateKey = config.get('jwtPrivateKey')
    const userPayload = jwt.verify(token, jwtPrivateKey)

    req.user = userPayload

    next()
  } catch (error) {
    res.status(401).send({
      status: 401,
      message: 'Invalid auth token. Access Denied.'
    })
  }
}

module.exports = authenticator
