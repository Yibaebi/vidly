const express = require('express')
const bcrypt = require('bcrypt')
const _ = require('lodash')

const { validateUser, User } = require('../../models')
const { authenticator } = require('../../middlewares')
const { ERROR_CODES } = require('../../constants')

// Setup router
const router = express.Router()

// Get a user
router.get('/me', authenticator, async (req, res, next) => {
  const id = req.user._id

  const user = await User.findById(id)

  if (user) {
    return res.send({
      status: ERROR_CODES.OK,
      data: _.pick(user, ['name', 'email', 'createdAt', '_id']),
      message: 'User found successfully.'
    })
  }

  res.status(ERROR_CODES.NOT_FOUND).send({
    status: ERROR_CODES.OK,
    message: `User with ID - ${id} not found.`
  })
})

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

  const userWithSameEmail = await User.findOne({ email: req.body.email })

  if (userWithSameEmail) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      message: 'User already registered.',
      data: null
    })
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPass = await bcrypt.hash(req.body.password, salt)

  let newUser = new User({ ...req.body, password: hashedPass })
  const token = newUser.generateAuthToken()

  await newUser.save()

  newUser = _.pick(newUser, ['name', 'email', '_id', 'createdAt'])

  res.setHeader('x-auth-token', token).status(ERROR_CODES.OK).send({
    status: ERROR_CODES.OK,
    message: 'User created successfully.',
    data: newUser
  })
})

module.exports = router
