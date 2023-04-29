const request = require('supertest')
const server = require('../../../')
const { ERROR_CODES } = require('../../../constants')
const { Customer } = require('../../../models')

describe('Integration | middleware/authenticator', () => {
  afterEach(async () => {
    server.close()
    await Customer.deleteMany({})
  })

  it('returns a 401 if token is empty', async () => {
    const response = await request(server)
      .get('/api/customers')
      .set('x-auth-token', '')

    expect(response.status).toBe(ERROR_CODES.UNAUTHORIZED)
  })

  it('returns a 401 if token is invalid', async () => {
    const response = await request(server)
      .get('/api/customers')
      .set('x-auth-token', '1')

    expect(response.status).toBe(ERROR_CODES.UNAUTHORIZED)
  })
})
