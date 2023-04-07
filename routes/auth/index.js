const Joi = require('joi')
const express = require('express')
const bcrypt = require('bcrypt')

const { parseError } = require('../../utils')
const { User } = require('../../models')

// Setup router
const router = express.Router()

// Add a user
router.post('/', async (req, res) => {
  const { error } = validateUser(req.body)

  if (error) {
    return res.status(400).send({
      status: 400,
      message: error.details[0].message.replaceAll('"', ''),
      data: null
    })
  }

  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid email or password.',
        data: null
      })
    }

    //  Check if password is valid
    const passwordIsValid = await bcrypt.compare(
      req.body.password,
      user.password
    )

    if (!passwordIsValid) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid email or password.',
        data: null
      })
    }

    const token = user.generateAuthToken()

    return res.setHeader('x-auth-token', token).status(200).send({
      status: 200,
      message: 'Login successful.',
      data: null
    })
  } catch (error) {
    const { error: _, ...rest } = parseError(error)
    res.status(rest.status).send(rest)
  }
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
