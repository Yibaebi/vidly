const genre = require('./genre')
const customer = require('./customer')
const movie = require('./movie')
const rental = require('./rental')
const user = require('./user')

module.exports = {
  ...genre,
  ...customer,
  ...movie,
  ...rental,
  ...user
}
