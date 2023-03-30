const parseError = (error) => {
  // Default error object
  const errorObject = {
    status: 400,
    message: 'An unexpected error occured',
    error
  }

  if (error.name === 'CastError') {
    errorObject.message = 'Invalid request ID.'
    errorObject.status = 400
  }

  return errorObject
}

module.exports = parseError
