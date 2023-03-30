const genre = require('./genre')
const customer = require('./customer')

module.exports = {
  ...genre,
  ...customer
}
