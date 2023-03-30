const express = require('express')
const Joi = require('joi')

const { CustomerModel } = require('../../models')
const { parseError } = require('../../utils')

// Setup Router
const router = express.Router()

// Get all customers
router.get('/', async (req, res) => {
  const customers = await CustomerModel.find().sort('name')
  res.send({ status: 200, data: customers, count: customers.length })
})

// Get a customer
router.get('/:id', async (req, res) => {
  const id = req.params.id

  try {
    const customer = await CustomerModel.findOne({ _id: id })

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

  let customer = new CustomerModel(newCustomer)
  customer = await customer.save()

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
    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
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
    const deletedCustomer = await CustomerModel.findByIdAndDelete(customerId)

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

// Validation fn for customer req object
function validateCustomer(customer, required = true) {
  const schema = {
    name: Joi.string().messages({
      'string.empty': 'Name is not allowed to be empty.',
      'string.required': 'Name is a required field.'
    }),
    isGold: Joi.boolean().optional(),
    phone: Joi.string()
      .pattern(
        /(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/
      )
      .messages({
        'string.pattern.base': 'Invalid phone number.'
      })
  }

  const customerSchemaOptional = Joi.object(schema)
  const customerSchema = required
    ? customerSchemaOptional.options({
        presence: 'required'
      })
    : customerSchemaOptional

  return customerSchema.validate(customer)
}

module.exports = router
