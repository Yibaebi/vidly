const express = require('express')
require('express-async-errors')

const { error } = require('../../middlewares')
const {
  genres,
  customers,
  movies,
  rentals,
  users,
  auth
} = require('../../routes')

module.exports = function (app) {
  app.use(express.json())

  // Routes
  app.use('/api/genres', genres)
  app.use('/api/customers', customers)
  app.use('/api/movies', movies)
  app.use('/api/rentals', rentals)
  app.use('/api/users', users)
  app.use('/api/auth', auth)

  // Error handler
  app.use(error)
}
