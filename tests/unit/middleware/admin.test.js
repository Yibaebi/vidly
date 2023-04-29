const { admin } = require('../../../middlewares')
const { User } = require('../../../models')

describe('Unit | middleware/admin', () => {
  it('authorizes user if user is admin', async () => {
    const user = new User({ isAdmin: true })

    const req = { user }
    const res = {}
    const next = jest.fn()

    admin(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
