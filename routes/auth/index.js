const Joi = require('joi')
const express = require('express')
const bcrypt = require('bcrypt')

const { User } = require('../../models')
const { ERROR_CODES } = require('../../constants')

// Setup router
const router = express.Router()

// Add a user
router.post('/', async (req, res) => {
  const { error } = validateUser(req.body)

  if (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      message: error.details[0].message.replaceAll('"', ''),
      data: null
    })
  }

  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      message: 'Invalid email or password.',
      data: null
    })
  }

  //  Check if password is valid
  const passwordIsValid = await bcrypt.compare(req.body.password, user.password)

  if (!passwordIsValid) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      message: 'Invalid email or password.',
      data: null
    })
  }

  const token = user.generateAuthToken()

  return res.setHeader('x-auth-token', token).status(ERROR_CODES.OK).send({
    status: ERROR_CODES.OK,
    message: 'Login successful.',
    data: null
  })
})

// Validation fn for user req object
function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(255).required()
  })

  return schema.validate(user)
}

module.exports = router
