const parseError = (error) => {
  // Default error object
  const errorObject = {
    status: 500,
    message: 'Internal server error.',
    data: null
  }

  if (error.name === 'CastError') {
    errorObject.message = 'Invalid request ID.'
    errorObject.status = 400
  }

  if (error.name === 'ValidationError') {
    errorObject.message = `${error._message}. Check the provided request body.`
  }

  return errorObject
}

module.exports = parseError
