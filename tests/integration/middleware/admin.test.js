const request = require('supertest')
const server = require('../../../')
const { RESPONSE_CODES } = require('../../../constants')
const { User, Customer } = require('../../../models')

describe('Integration | middleware/admin', () => {
  afterEach(async () => {
    await Customer.deleteMany({})
    await server.close()
  })

  it('throws an 403 if user is not an admin', async () => {
    const customer = new Customer({ phone: '98107825637', name: 'test_name' })
    await customer.save()

    const user = new User({ isAdmin: false })
    const token = user.generateAuthToken()

    const response = await request(server)
      .delete(`/api/customers/${customer.id}`)
      .set('x-auth-token', token)

    expect(response.status).toBe(RESPONSE_CODES.FORBIDDEN)
  })
})
