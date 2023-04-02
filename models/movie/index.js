const Joi = require('joi')
const { model, Schema } = require('mongoose')

const { genreSchema } = require('../genre')

// Movie Model
const Movie = model(
  'Movie',
  new Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255
    },
    genre: { type: genreSchema, required: true },
    numberInStock: {
      type: Number,
      default: 0,
      required: true
    },
    dailyRentalRate: {
      type: Number,
      default: 0,
      required: true
    }
  })
)

// Validation fn for movie req object
function validateMovie(movie, required = true) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).messages({
      'string.empty': 'Title is not allowed to be empty.',
      'string.required': 'Title is a required field.'
    }),
    genreId: Joi.string().required(),
    numberInStock: Joi.number().min(0).max(255),
    dailyRentalRate: Joi.number().min(0).max(255)
  })

  const movieSchema = required
    ? schema.options({ presence: 'required' })
    : schema

  return movieSchema.validate(movie)
}

module.exports = {
  Movie,
  validateMovie
}
