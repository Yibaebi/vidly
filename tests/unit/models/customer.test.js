const { Customer } = require('../../../models')

describe('model:customer', () => {
  it('creates a customer ', () => {
    const payload = {
      name: 'test_customer',
      phone: '98360286372',
      isGold: true
    }
    const customer = new Customer(payload)

    expect(customer).toMatchObject(payload)
  })
})
