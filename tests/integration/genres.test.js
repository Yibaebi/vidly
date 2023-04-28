const request = require('supertest')
const { Genre } = require('../../models')
const mongoose = require('mongoose')

describe('/api/genres', () => {
  let server

  beforeEach(() => {
    server = require('../..')
  })

  afterEach(async () => {
    server.close()
    await Genre.deleteMany({})
  })

  describe('GET /', () => {
    it('returns all genres', async () => {
      await Genre.collection.insertMany([
        { title: 'genre1' },
        { title: 'genre2' }
      ])

      const response = await request(server).get('/api/genres')

      expect(response.status).toBe(200)
      expect(response.body.count).toBe(2)
    })
  })

  describe('GET /:id', () => {
    it('it returns a genre with a valid ID in db', async () => {
      const genre = new Genre({ title: 'genre_test' })
      await genre.save()

      const response = await request(server).get(`/api/genres/${genre._id}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('_id', genre.id)
      expect(response.body.data).toHaveProperty('title', genre.title)
    })

    it('it should return 404 if genre does not exist in db', async () => {
      const nonExistentID = new mongoose.Types.ObjectId().toHexString()

      const response = await request(server).get(`/api/genres/${nonExistentID}`)

      expect(response.status).toBe(404)
    })
  })
})
