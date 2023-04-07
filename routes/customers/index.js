const express = require('express')

const { Customer, validateCustomer } = require('../../models')
const { authenticator } = require('../../middlewares')

// Setup Router
const router = express.Router()

// Get all customers
router.get('/', authenticator, async (req, res) => {
  const customers = await Customer.find().sort('name')
  res.send({ status: 200, data: customers, count: customers.length })
})

// Get a customer
router.get('/:id', authenticator, async (req, res) => {
  const id = req.params.id

  const customer = await Customer.findOne({ _id: id })

  if (customer) {
    return res.send({
      status: 200,
      data: customer,
      message: 'Customer found successfully.'
    })
  }

  res
    .status(404)
    .send({ status: 200, message: `Customer with ID - ${id} not found.` })
})

// Create a customer
router.post('/', authenticator, async (req, res) => {
  const newCustomer = req.body

  const { error } = validateCustomer(newCustomer)

  if (error) {
    return res.status(400).send({
      status: 400,
      error: error.message.replaceAll('"', ''),
      data: null
    })
  }

  const customer = new Customer(newCustomer)

  await customer.save()

  res.send({
    status: 200,
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
    return res.status(400).send({
      status: 400,
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
      status: 200,
      message: `Customer with - ${customerId} has been updated successfully.`,
      data: updatedCustomer
    })
  }

  res.status(404).send({
    status: 404,
    message: `Customer with ID - ${customerId} not found.`,
    data: updatedCustomer
  })
})

// Delete a customer
router.delete('/:id', authenticator, async (req, res) => {
  const customerId = req.params.id

  const deletedCustomer = await Customer.findByIdAndDelete(customerId)

  if (deletedCustomer) {
    return res.send({
      status: 200,
      message: `Customer withd ID - ${customerId} has been deleted successfully.`,
      data: deletedCustomer
    })
  }

  res.status(404).send({
    status: 404,
    message: `Customer withd ID - ${customerId} not found.`,
    data: deletedCustomer
  })
})

module.exports = router
