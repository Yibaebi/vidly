const mongoose = require('mongoose')

// Genre Model
const Customer = mongoose.model(
  'Customer',
  new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    isGold: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      required: true
    }
  })
)

module.exports = Customer
