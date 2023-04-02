const parseError = (error) => {
  // Default error object
  const errorObject = {
    status: 400,
    message: 'An unexpected error occured',
    data: null,
    error
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
