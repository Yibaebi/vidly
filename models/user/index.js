const Joi = require('joi')
const jwt = require('jsonwebtoken')
const config = require('config')
const { Schema, model } = require('mongoose')

// User Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 255
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

userSchema.methods.generateAuthToken = function () {
  const jwtPrivateKey = config.get('jwtPrivateKey')
  const token = jwt.sign({ _id: this._id }, jwtPrivateKey)

  return token
}

// Genre Model
const User = model('User', userSchema)

// Validation fn for user req object
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'name is not allowed to be empty.',
      'string.required': 'name is a required field.'
    }),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(255).required()
  })

  return schema.validate(user)
}

module.exports = {
  User,
  userSchema,
  validateUser
}
