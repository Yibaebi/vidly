const Joi = require('joi')
const { Schema, model } = require('mongoose')

const genreValidationSchema = Joi.object().keys({
  title: Joi.string().min(3).max(50).required()
})
// Genre Schema
const genreSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  }
})

// Genre Model
const Genre = model('Genre', genreSchema)

// Validation fn for a genre
function validateGenre(genre) {
  return genreValidationSchema.validate(genre)
}

module.exports = { Genre, genreValidationSchema, genreSchema, validateGenre }
