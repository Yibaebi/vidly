const { authenticator } = require('../../../middlewares')
const { User } = require('../../../models')

describe('Unit | middleware/authenticator', () => {
  it('authorizes user if token is valid', async () => {
    const token = new User({ isAdmin: true }).generateAuthToken()

    const req = {
      headers: {
        'x-auth-token': token
      }
    }
    const res = {}
    const next = jest.fn()

    authenticator(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
