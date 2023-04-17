const express = require('express')
const { routes, db, config, validation } = require('./startup')
const { logger } = require('./middlewares')

// Setup server
const app = express()

// Setup app validation
validation()

// Setup app config
config()

// Setup app routes
routes(app)

// DB setup
db()

// Setup port
const PORT = process.env.PORT || '3000'
app.listen(PORT, () => logger.info(`Listening on port ${PORT}...`))
