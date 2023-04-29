const express = require('express')
const mongoose = require('mongoose')

const { Rental, validateRental, Customer, Movie } = require('../../models')
const { ERROR_CODES } = require('../../constants')

// Setup router
const router = express.Router()

// Get all rentals
router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut')
  res
    .status(ERROR_CODES.OK)
    .send({ status: ERROR_CODES.OK, data: rentals, count: rentals.length })
})

// Get a rental
router.get('/:id', async (req, res) => {
  const id = req.params.id

  const rental = await Rental.findById(id)

  if (!rental) {
    return res.status(ERROR_CODES.NOT_FOUND).send({
      status: ERROR_CODES.NOT_FOUND,
      data: null,
      message: `Rental with ID - ${id} not found.`
    })
  }

  res.status(ERROR_CODES.OK).send({ status: ERROR_CODES.OK, data: rental })
})

// Add a rental
router.post('/', async (req, res) => {
  const { error } = validateRental(req.body)

  if (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      message: error.details[0].message.replaceAll('"', ''),
      data: null
    })
  }

  const session = await mongoose.startSession()

  const customerId = req.body.customerId
  const movieId = req.body.movieId

  const customer = await Customer.findById(customerId).select('name phone _id')

  if (!customer) {
    return res.status(ERROR_CODES.NOT_FOUND).send({
      status: ERROR_CODES.NOT_FOUND,
      message: `Customer with ID - ${customerId} not found.`
    })
  }

  const movie = await Movie.findById(movieId)

  if (!movie) {
    return res.status(ERROR_CODES.NOT_FOUND).send({
      status: ERROR_CODES.NOT_FOUND,
      message: `Movie with ID - ${movieId} not found.`,
      data: null
    })
  }

  if (movie.numberInStock === 0) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      message: 'This movie is out of stock.',
      data: null
    })
  }

  const existingRental = await Rental.findOne({
    'movie._id': movieId,
    'customer._id': customerId,
    data: null
  })

  if (existingRental) {
    return res.status(ERROR_CODES.CONFLICT).send({
      status: ERROR_CODES.CONFLICT,
      message: 'This customer has already rented this movie.',
      data: null
    })
  }

  session.startTransaction()

  const rental = new Rental({
    customer,
    movie
  })

  await rental.save({ session })

  movie.numberInStock--
  await movie.save({ session })

  await session.commitTransaction()

  res.status(ERROR_CODES.OK).send({
    status: ERROR_CODES.OK,
    message: 'Rental created successfully.',
    data: rental
  })

  session.endSession()
})

module.exports = router
