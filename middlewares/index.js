const log = require('./logger')
const authenticate = require('./authenticator')
const admin = require('./admin')
const error = require('./error')

module.exports.logger = log
module.exports.authenticator = authenticate
module.exports.admin = admin
module.exports.error = error
