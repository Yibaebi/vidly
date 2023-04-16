const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const dbDebugger = require('debug')('app:db')
require('express-async-errors')

const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const { error } = require('./middlewares')
const { genres, customers, movies, rentals, users, auth } = require('./routes')

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR! "jwtPrivateKey" not found.')
  process.exit(1)
}

// Set up server
const app = express()
app.use(express.json())

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
app.use('/api/users', users)
app.use('/api/auth', auth)

// Error handler
app.use(error)

// Setup port
const PORT = process.env.PORT || '3000'
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
