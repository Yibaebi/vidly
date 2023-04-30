const { authenticator } = require('../../../middlewares')
const { User } = require('../../../models')

describe('Unit | middleware/authenticator', () => {
  it('authorizes user and populates req.user with JWT payload', async () => {
    const user = new User({ isAdmin: true })
    const token = user.generateAuthToken()

    const req = {
      headers: {
        'x-auth-token': token
      }
    }
    const res = {}
    const next = jest.fn()

    authenticator(req, res, next)

    expect(req.user).toBeDefined()
    expect(req.user).toHaveProperty('isAdmin', user.isAdmin)
    expect(next).toHaveBeenCalled()
  })
})
