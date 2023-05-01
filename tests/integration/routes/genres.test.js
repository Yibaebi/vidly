const request = require('supertest')
const server = require('../../..')
const { Genre, User } = require('../../../models')
const { RESPONSE_CODES } = require('../../../constants')

describe('Integration | routes/genres', () => {
  const BASE_URL = '/api/genres'
  const AGENT = request(server)

  afterEach(async () => {
    await Genre.deleteMany({})
    await server.close()
  })

  describe('GET /', () => {
    it('returns all genres', async () => {
      await Genre.collection.insertMany([
        { title: 'genre1' },
        { title: 'genre2' }
      ])

      const response = await AGENT.get(BASE_URL)

      expect(response.status).toBe(RESPONSE_CODES.OK)
      expect(response.body.count).toBe(2)
      expect(response.body.data.some((g) => g.title === 'genre1')).toBeTruthy()
      expect(response.body.data.some((g) => g.title === 'genre2')).toBeTruthy()
    })
  })

  describe('GET /:id', () => {
    it('returns a genre with a valid ID in db', async () => {
      const genre = new Genre({ title: 'genre_test' })
      await genre.save()

      const response = await AGENT.get(`${BASE_URL}/${genre._id}`)

      expect(response.status).toBe(RESPONSE_CODES.OK)
      expect(response.body.data).toHaveProperty('_id', genre.id)
      expect(response.body.data).toHaveProperty('title', genre.title)
    })

    it('should return 404 if genre is invalid', async () => {
      const response = await AGENT.get(`${BASE_URL}/1`)
      expect(response.status).toBe(RESPONSE_CODES.NOT_FOUND)
    })

    it('should return 404 if genre is not found', async () => {
      const genre = new Genre({ title: 'genre_test' })
      const response = await AGENT.get(`${BASE_URL}/${genre._id}`)

      expect(response.status).toBe(RESPONSE_CODES.NOT_FOUND)
    })
  })

  describe('POST /', () => {
    // Happy Path
    const mockToken = new User().generateAuthToken()
    const mockGenre = { title: 'genre' }

    // Mock POST req function
    const exec = async (params) => {
      const { token = mockToken, genre = mockGenre } = params || {}

      return await AGENT.post(BASE_URL).set('x-auth-token', token).send(genre)
    }

    it('returns a 401 status if user is unauthorized', async () => {
      const response = await exec({ token: '' })

      expect(response.status).toBe(RESPONSE_CODES.UNAUTHORIZED)
    })

    it('returns a 400 if genre is less than 3 characters ', async () => {
      const response = await exec({ genre: { title: 'ge' } })

      expect(response.status).toBe(RESPONSE_CODES.BAD_REQUEST)
    })

    it('returns a 400 if genre is greater than 50 characters ', async () => {
      const title = new Array(52).join('a')
      const genre = { title }

      const response = await exec({ genre })

      expect(response.status).toBe(RESPONSE_CODES.BAD_REQUEST)
    })

    it('returns a 409 if genre already exists ', async () => {
      const title = 'title_test'

      // Add a genre with the same name to db
      await Genre.collection.insertOne({ title })

      const response = await exec({ genre: { title } })

      expect(response.status).toBe(RESPONSE_CODES.CONFLICT)
    })

    it('creates a genre successfully if request body is valid', async () => {
      const response = await exec()

      expect(response.body.status).toBe(RESPONSE_CODES.OK)
      expect(response.body.data).toMatchObject(mockGenre)
    })
  })

  describe('PUT /:id', () => {
    // Mock PUT req function
    const updateGenreExec = async (genre, updateTitle = 'updated_title') => {
      const token = new User().generateAuthToken()

      return AGENT.put(`${BASE_URL}/${genre.id}`)
        .set('x-auth-token', token)
        .send({ title: updateTitle })
    }

    // Create Genre fn
    const createGenre = async (title = 'genre_test') => {
      const genre = new Genre({ title })
      await genre.save()

      return await genre
    }

    it('updates a genre successfully if request body is valid', async () => {
      const genre = await createGenre()
      const response = await updateGenreExec(genre)

      expect(response.body.status).toBe(RESPONSE_CODES.OK)
      expect(response.body.data).toHaveProperty('title', 'updated_title')
    })

    it('returns 409 if update title is less than 3 characters', async () => {
      const genre = await createGenre()
      const response = await updateGenreExec(genre, 'up')

      expect(response.body.status).toBe(RESPONSE_CODES.BAD_REQUEST)
    })

    it('returns 409 if update title is greater than 50 characters', async () => {
      const genre = await createGenre()
      const response = await updateGenreExec(genre, new Array(52).join('a'))

      expect(response.body.status).toBe(RESPONSE_CODES.BAD_REQUEST)
    })

    it('returns 409 if update title is the same', async () => {
      const genre = await createGenre()
      const response = await updateGenreExec(genre, genre.title)

      expect(response.body.status).toBe(RESPONSE_CODES.CONFLICT)
    })

    it('returns 409 if update title if a genre with same title already exists in DB', async () => {
      await Genre.collection.insertMany([{ title: 'genre_test_1' }])

      const genre = await createGenre('genre_test_2')
      const response = await updateGenreExec(genre, 'genre_test_1')

      expect(response.body.status).toBe(RESPONSE_CODES.CONFLICT)
    })

    it('returns 404 if genre does not exist', async () => {
      const genre = new Genre({ title: 'genre_test' })
      const response = await updateGenreExec(genre)

      expect(response.body.status).toBe(RESPONSE_CODES.NOT_FOUND)
    })
  })

  describe('DELETE /:id', () => {
    // Mock DELETE req function
    const deleteGenreExec = async (genre) => {
      const token = new User().generateAuthToken()

      return AGENT.delete(`${BASE_URL}/${genre.id}`)
        .set('x-auth-token', token)
        .send()
    }

    // Create Genre fn
    const createGenre = async (title = 'genre_test') => {
      const genre = new Genre({ title })
      await genre.save()

      return await genre
    }

    it('deletes a genre successfully if genre exists', async () => {
      const genre = await createGenre()
      const response = await deleteGenreExec(genre)

      expect(response.body.status).toBe(RESPONSE_CODES.OK)

      const deletedGenre = await Genre.findById(genre.id)
      expect(deletedGenre).toBeNull()
    })

    it('returns 404 if genre does not exist', async () => {
      const genre = new Genre({ title: 'genre_test' })
      const response = await deleteGenreExec(genre)

      expect(response.body.status).toBe(RESPONSE_CODES.NOT_FOUND)
    })
  })
})
