const express = require('express')
const bcrypt = require('bcrypt')
const _ = require('lodash')

const { validateUser, User } = require('../../models')
const { parseError } = require('../../utils')

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
    const userWithSameEmail = await User.findOne({ email: req.body.email })

    if (userWithSameEmail) {
      return res.status(400).send({
        status: 400,
        message: 'User already registered.',
        data: null
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(req.body.password, salt)

    let newUser = new User({ ...req.body, password: hashedPass })

    await newUser.save()

    newUser = _.pick(newUser, ['name', 'email', '_id', 'createdAt'])

    res.status(200).send({
      status: 200,
      message: 'User created successfully.',
      data: newUser
    })
  } catch (error) {
    const { error: _, ...rest } = parseError(error)
    res.status(rest.status).send(rest)
  }
})

module.exports = router
