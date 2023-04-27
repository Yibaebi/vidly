const config = require('config')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const { User, validateUser } = require('../../../models')

describe('model:user', () => {
  it('creates a user ', () => {
    const payload = {
      name: 'test_name',
      password: '1234',
      email: 'test@mail.com',
      isAdmin: false
    }
    const user = new User(payload)

    expect(user).toHaveProperty('_id')
    expect(user).toHaveProperty('createdAt')
    expect(user).toMatchObject(payload)
  })
})

describe('model:validateUser', () => {
  it('returns payload if valid', () => {
    const payload = {
      name: 'test_name',
      password: '12345',
      email: 'test@mail.com'
    }
    const result = validateUser(payload)

    expect(result.value).toEqual(payload)
    expect(result.error).toBeUndefined()
  })

  it('returns an error if password is less than 5 characters', () => {
    const payload = {
      name: 'test_name',
      password: '1235',
      email: 'test@mail.com'
    }
    const result = validateUser(payload)

    expect(result.error).toBeDefined()
    expect(result.error.details[0].message).toMatch(/password/)
    expect(result.value).toEqual(payload)
  })

  it('returns an error if name is empty or not supplied in payload', () => {
    const emptyErrorMsg = 'name is not allowed to be empty.'

    const payload = {
      name: '',
      password: '12356',
      email: 'test@mail.com'
    }
    let result = validateUser(payload)

    expect(result.error).toBeDefined()
    expect(result.error.details[0].message).toMatch(new RegExp(emptyErrorMsg))
    expect(result.value).toEqual(payload)

    // Required check
    const requiredErrMsg = 'name is a required field.'

    const requiredPayload = {
      password: '12356',
      email: 'test@mail.com'
    }
    result = validateUser(requiredPayload)

    expect(result.error).toBeDefined()
    expect(result.error.details[0].message).toMatch(new RegExp(requiredErrMsg))
    expect(result.value).toEqual(requiredPayload)
  })

  it('returns an error if email is empty or invalid', () => {
    const payload = {
      name: 'test_name',
      password: '12356',
      email: ''
    }
    let result = validateUser(payload)

    expect(result.error).toBeDefined()

    let errMsg = result.error.details[0].message
    expect(errMsg).toContain('email')

    expect(result.value).toEqual(payload)

    // Required check
    const requiredPayload = {
      name: 'test_name',
      password: '12356',
      email: 'test@'
    }
    result = validateUser(requiredPayload)

    expect(result.error).toBeDefined()

    errMsg = result.error.details[0].message
    expect(errMsg).toContain('email')

    expect(result.value).toEqual(requiredPayload)
  })
})

describe('model:user.generateAuthToken', () => {
  it('generates a valid user token', () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: false
    }
    const user = new User(payload)

    const token = user.generateAuthToken()
    const secret = config.get('jwtPrivateKey')
    const decoded = jwt.verify(token, secret)

    expect(decoded).toMatchObject(payload)
  })
})
