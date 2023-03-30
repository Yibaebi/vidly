const Joi = require('joi')
const mongoose = require('mongoose')

// Genre Model
const Genre = mongoose.model(
  'Genre',
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      minlength: 3
    }
  })
)

// Validation fn for a genre
function validateGenre(genre) {
  const schema = Joi.object({
    title: Joi.string().min(3).required()
  })

  return schema.validate(genre)
}

module.exports = { Genre, validateGenre }
