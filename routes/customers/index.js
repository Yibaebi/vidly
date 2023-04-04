const express = require('express')

const { Customer, validateCustomer } = require('../../models')
const { parseError } = require('../../utils')

// Setup Router
const router = express.Router()

// Get all customers
router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name')
  res.send({ status: 200, data: customers, count: customers.length })
})

// Get a customer
router.get('/:id', async (req, res) => {
  const id = req.params.id

  try {
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
  } catch (error) {
    const { message, status } = parseError(error)

    res.status(status).send({
      status,
      message,
      data: null
    })
  }
})

// Create a customer
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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

  try {
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
  } catch (error) {
    const { message, status } = parseError(error)

    res.status(status).send({
      status,
      message,
      data: null
    })
  }
})

// Delete a customer
router.delete('/:id', async (req, res) => {
  const customerId = req.params.id

  try {
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
  } catch (error) {
    const { message, status } = parseError(error)

    res.status(status).send({
      status,
      message,
      data: null
    })
  }
})

module.exports = router
