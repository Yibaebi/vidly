const parseError = (error) => {
  const errorObject = {}

  if (error.name === 'CastError') {
    errorObject.message = 'Invalid request ID'
    errorObject.status = 400
  }

  return errorObject
}

module.exports = parseError
