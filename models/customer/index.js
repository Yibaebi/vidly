const Joi = require('joi')
const { Schema, model } = require('mongoose')

// Customer Schema
const customerSchema = new Schema({
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

// Genre Model
const Customer = model('Customer', customerSchema)

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

module.exports = {
  Customer,
  customerSchema,
  validateCustomer
}
