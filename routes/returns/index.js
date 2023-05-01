const express = require('express')

const { RESPONSE_CODES } = require('../../constants')
const { Rental, validateRental } = require('../../models')
const { authenticator, validateReq } = require('../../middlewares')

// Setup router
const router = express.Router()

// POST a movie return
router.post(
  '/',
  [authenticator, validateReq(validateRental)],
  async (req, res) => {
    const { customerId, movieId } = req.body

    const rental = await Rental.lookup(movieId, customerId)

    if (!rental) {
      return res.status(RESPONSE_CODES.NOT_FOUND).send({
        message: 'No rental found!',
        data: null,
        status: RESPONSE_CODES.NOT_FOUND
      })
    }

    if (rental.dateReturned) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).send({
        message: 'Rental already processed',
        data: null,
        status: RESPONSE_CODES.BAD_REQUEST
      })
    }

    rental.return()
    await rental.save()

    return res.send({
      message: 'Rental processed successfully',
      data: rental,
      status: RESPONSE_CODES.OK
    })
  }
)

module.exports = router
