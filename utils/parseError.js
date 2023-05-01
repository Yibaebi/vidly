const { RESPONSE_CODES } = require('../constants')

const parseError = (error) => {
  // Default error object
  const errorObject = {
    status: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
    message: 'Internal server error.',
    data: null
  }

  if (error.name === 'ValidationError') {
    errorObject.message = `${error._message}. Check the provided request body.`
  }

  return errorObject
}

module.exports = parseError
