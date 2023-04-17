const config = require('config')

module.exports = function name() {
  if (!config.get('jwtPrivateKey')) {
    throw new Error('FATAL ERROR! "jwtPrivateKey" not found.')
  }
}
