const Joi = require('joi')
const { model, Schema } = require('mongoose')

const { customerSchema } = require('../customer')

// Rental Schema
const rentalSchema = new Schema({
  customer: { type: customerSchema, required: true },
  movie: {
    type: new Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 255
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
      }
    }),
    required: true
  },
  dateOut: { type: Date, default: Date.now, required: true },
  dateReturned: { type: Date },
  rentalFee: { type: Number, min: 0 }
})

// Rental Model
const Rental = model('Rental', rentalSchema)

// Validation fn for rental req object
function validateRental(movie, required = true) {
  const schema = Joi.object({
    customerId: Joi.objectId(),
    movieId: Joi.objectId()
  })

  const rentalSchema = required
    ? schema.options({ presence: 'required' })
    : schema

  return rentalSchema.validate(movie)
}

module.exports = {
  Rental,
  validateRental
}
