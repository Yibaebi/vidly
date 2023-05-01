const request = require('supertest')
const server = require('../../../')
const { RESPONSE_CODES } = require('../../../constants')
const { Customer } = require('../../../models')

describe('Integration | middleware/authenticator', () => {
  afterEach(async () => {
    await Customer.deleteMany({})
    await server.close()
  })

  it('returns a 401 if token is empty', async () => {
    const response = await request(server)
      .get('/api/customers')
      .set('x-auth-token', '')

    expect(response.status).toBe(RESPONSE_CODES.UNAUTHORIZED)
  })

  it('returns a 401 if token is invalid', async () => {
    const response = await request(server)
      .get('/api/customers')
      .set('x-auth-token', '1')

    expect(response.status).toBe(RESPONSE_CODES.UNAUTHORIZED)
  })
})
