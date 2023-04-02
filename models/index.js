const genre = require('./genre')
const customer = require('./customer')
const movie = require('./movie')

module.exports = {
  ...genre,
  ...customer,
  ...movie
}
