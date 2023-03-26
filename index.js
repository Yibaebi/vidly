const express = require('express')

const { logger, authenticator } = require('./middlewares')
const { genres } = require('./routes')

// Set up server
const app = express()
app.use(express.json())
app.use(logger)
app.use(authenticator)

// Routes
app.use('/api/genres', genres)

// Setup port
const PORT = process.env.PORT || '3000'
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
