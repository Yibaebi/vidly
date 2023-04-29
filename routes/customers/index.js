const express = require('express')

const { Customer, validateCustomer } = require('../../models')
const { authenticator, validateObjectId, admin } = require('../../middlewares')
const { ERROR_CODES } = require('../../constants')

// Setup Router
const router = express.Router()

// Get all customers
router.get('/', authenticator, async (req, res) => {
  const customers = await Customer.find().sort('name')
  res.send({ status: ERROR_CODES.OK, data: customers, count: customers.length })
})

// Get a customer
router.get('/:id', [validateObjectId, authenticator], async (req, res) => {
  const id = req.params.id

  const customer = await Customer.findOne({ _id: id })

  if (customer) {
    return res.send({
      status: ERROR_CODES.OK,
      data: customer,
      message: 'Customer found successfully.'
    })
  }

  res.status(ERROR_CODES.NOT_FOUND).send({
    status: ERROR_CODES.OK,
    message: `Customer with ID - ${id} not found.`
  })
})

// Create a customer
router.post('/', authenticator, async (req, res) => {
  const newCustomer = req.body

  const { error } = validateCustomer(newCustomer)

  if (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      error: error.message.replaceAll('"', ''),
      data: null
    })
  }

  const customer = new Customer(newCustomer)

  await customer.save()

  res.send({
    status: ERROR_CODES.OK,
    message: 'Customer created successfully',
    data: customer
  })
})

// Update a customer
router.put('/:id', authenticator, async (req, res) => {
  const customerId = req.params.id
  const customer = req.body

  const { error } = validateCustomer(customer, false)

  if (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      error: error.message.replaceAll('"', ''),
      data: null
    })
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(
    customerId,
    {
      $set: customer
    },
    { new: true }
  )

  if (updatedCustomer) {
    return res.send({
      status: ERROR_CODES.OK,
      message: `Customer with - ${customerId} has been updated successfully.`,
      data: updatedCustomer
    })
  }

  res.status(ERROR_CODES.NOT_FOUND).send({
    status: ERROR_CODES.NOT_FOUND,
    message: `Customer with ID - ${customerId} not found.`,
    data: updatedCustomer
  })
})

// Delete a customer
router.delete(
  '/:id',
  [validateObjectId, authenticator, admin],
  async (req, res) => {
    const customerId = req.params.id

    const deletedCustomer = await Customer.findByIdAndDelete(customerId)

    if (deletedCustomer) {
      return res.send({
        status: ERROR_CODES.OK,
        message: `Customer withd ID - ${customerId} has been deleted successfully.`,
        data: deletedCustomer
      })
    }

    res.status(ERROR_CODES.NOT_FOUND).send({
      status: ERROR_CODES.NOT_FOUND,
      message: `Customer withd ID - ${customerId} not found.`,
      data: deletedCustomer
    })
  }
)

module.exports = router
