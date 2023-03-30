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

module.exports = Genre
