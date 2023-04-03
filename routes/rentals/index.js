const express = require('express')

const { parseError } = require('../../utils')
const { Rental, validateRental, Customer, Movie } = require('../../models')

// Setup router
const router = express.Router()

// Get all rentals
router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut')
  res.status(200).send({ status: 200, data: rentals, count: rentals.length })
})

// Get a rental
router.get('/:id', async (req, res) => {
  const id = req.params.id

  try {
    const rental = await Rental.findById(id)

    if (!rental) {
      return res.status(404).send({
        status: 404,
        data: null,
        message: `Rental with ID - ${id} not found.`
      })
    }

    res.status(200).send({ status: 200, data: rental })
  } catch (error) {
    const { error: _, ...rest } = parseError(error)
    res.status(rest.status).send(rest)
  }
})

// Add a rental
router.post('/', async (req, res) => {
  const { error } = validateRental(req.body)

  if (error) {
    return res.status(400).send({
      status: 400,
      message: error.details[0].message.replaceAll('"', ''),
      data: null
    })
  }

  try {
    const customerId = req.body.customerId
    const movieId = req.body.movieId

    const customer = await Customer.findById(customerId).select(
      'name phone _id'
    )

    if (!customer) {
      return res.status(404).send({
        status: 404,
        message: `Customer with ID - ${customerId} not found.`
      })
    }

    const movie = await Movie.findById(movieId).select(
      'title dailyRentalRate numberInStock'
    )

    if (!movie) {
      return res.status(404).send({
        status: 404,
        message: `Movie with ID - ${movieId} not found.`,
        data: null
      })
    }

    if (movie.numberInStock === 0) {
      return res.status(400).send({
        status: 400,
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
      return res.status(409).send({
        status: 409,
        message: 'This customer has already rented this movie.',
        data: null
      })
    }

    let rental = new Rental({
      customer,
      movie
    })

    rental = await rental.save()

    movie.numberInStock--
    await movie.save()

    res.status(200).send({
      status: 200,
      message: 'Rental created successfully.',
      data: rental
    })
  } catch (error) {
    const errorObj = parseError(error)
    res.status(errorObj.status).send(errorObj)
  }
})

module.exports = router
