const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const dbDebugger = require('debug')('app:db')

const { logger, authenticator } = require('./middlewares')
const { genres, customers, movies, rentals } = require('./routes')

// Set up server
const app = express()
app.use(express.json())
app.use(logger)
app.use(authenticator)

// Setup mongodb
const MONGODB_URL = config.get('mongodbURL')

mongoose
  .connect(MONGODB_URL)
  .then(() => dbDebugger('Connected to MongoDB...'))
  .catch((err) => console.error(err))

// Routes
app.use('/api/genres', genres)
app.use('/api/customers', customers)
app.use('/api/movies', movies)
app.use('/api/rentals', rentals)

// Setup port
const PORT = process.env.PORT || '3000'
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
