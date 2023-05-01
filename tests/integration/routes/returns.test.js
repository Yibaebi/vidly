const request = require('supertest')
const mongoose = require('mongoose')
const dayjs = require('dayjs')

const server = require('../../..')
const { Rental, User } = require('../../../models')
const { RESPONSE_CODES } = require('../../../constants')

describe('Integration | routes/returns', () => {
  const BASE_URL = '/api/returns'
  const REQ_AGENT = request(server)
  const token = new User().generateAuthToken()

  let rental
  const customerId = new mongoose.Types.ObjectId().toHexString()
  const movieId = new mongoose.Types.ObjectId().toHexString()

  beforeEach(async () => {
    rental = new Rental({
      customer: {
        _id: customerId,
        name: 'customer_name',
        isGold: true,
        phone: '09876543210'
      },
      movie: {
        _id: movieId,
        title: 'movie_title',
        dailyRentalRate: 10
      }
    })

    await rental.save()
  })

  afterEach(async () => {
    await Rental.deleteMany({})
    await server.close()
  })

  const postReturn = (payload, addAuth = true) => {
    return REQ_AGENT.post(BASE_URL)
      .set('x-auth-token', addAuth ? token : '')
      .send(payload)
  }

  describe('POST /', () => {
    it('should return 401 if client is not logged in', async () => {
      const response = await postReturn({}, false)

      expect(response.status).toBe(RESPONSE_CODES.UNAUTHORIZED)
    })

    it('should return 400 if customer ID is not provided', async () => {
      const response = await postReturn({ movieId })

      expect(response.status).toBe(RESPONSE_CODES.BAD_REQUEST)
    })

    it('should return 400 if movie ID is not provided', async () => {
      const response = await postReturn({ customerId })

      expect(response.status).toBe(RESPONSE_CODES.BAD_REQUEST)
    })

    it('should return 404 if no rental is found for movieID and customer ID', async () => {
      await Rental.deleteMany({})

      const response = await postReturn({ customerId, movieId })

      expect(response.status).toBe(RESPONSE_CODES.NOT_FOUND)
    })

    it('should return 400 if rental is already processed', async () => {
      rental.set('dateReturned', Date.now())
      await rental.save()

      const response = await postReturn({ customerId, movieId })

      expect(response.status).toBe(RESPONSE_CODES.BAD_REQUEST)
    })

    it('should return 200 if valid request', async () => {
      const response = await postReturn({ customerId, movieId })

      expect(response.status).toBe(RESPONSE_CODES.OK)
    })

    it('should set the return date', async () => {
      const response = await postReturn({ customerId, movieId })

      expect(response.status).toBe(RESPONSE_CODES.OK)

      const rentalInDB = await Rental.findById(rental._id)

      expect(rentalInDB.dateReturned).toBeDefined()

      const dateDiff = new Date() - rentalInDB.dateReturned

      expect(dateDiff).toBeLessThan(10 * 1000)
    })

    it('calculate and set rental fee', async () => {
      rental.dateOut = dayjs().subtract(7, 'days')
      await rental.save()

      const response = await postReturn({ customerId, movieId })

      expect(response.status).toBe(RESPONSE_CODES.OK)

      const rentalInDB = await Rental.findById(rental._id)

      const dateDiff = dayjs(rentalInDB.dateReturned).diff(
        rentalInDB.dateOut,
        'days'
      )
      const rentalFee = dateDiff * rentalInDB.movie.dailyRentalRate

      expect(rentalInDB.rentalFee).toBeDefined()
      expect(rentalInDB.rentalFee).toBe(rentalFee)
    })

    it('should return rental', async () => {
      const response = await postReturn({ customerId, movieId })

      expect(response.status).toBe(RESPONSE_CODES.OK)
      expect(Object.keys(response.body.data)).toEqual(
        expect.arrayContaining([
          '_id',
          'customer',
          'movie',
          'dateOut',
          '__v',
          'dateReturned',
          'rentalFee'
        ])
      )
    })
  })
})
