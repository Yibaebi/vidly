const express = require('express')

const { Movie, validateMovie, Genre } = require('../../models')
const { authenticator } = require('../../middlewares')
const { RESPONSE_CODES } = require('../../constants')

// Setup router
const router = express.Router()

// Get all movies
router.get('/', async (req, res) => {
  const movies = await Movie.find()
  res
    .status(RESPONSE_CODES.OK)
    .send({ status: RESPONSE_CODES.OK, data: movies, count: movies.length })
})

// Get a movie
router.get('/:id', async (req, res) => {
  const id = req.params.id

  const genre = await Movie.findById(id)

  if (!genre) {
    return res.status(RESPONSE_CODES.NOT_FOUND).send({
      status: RESPONSE_CODES.NOT_FOUND,
      data: null,
      message: `Movie with ID - ${id} not found.`
    })
  }

  res.send({ status: RESPONSE_CODES.OK, data: genre })
})

// Add a movie
router.post('/', authenticator, async (req, res) => {
  const { error } = validateMovie(req.body)

  if (error) {
    return res.status(RESPONSE_CODES.BAD_REQUEST).send({
      status: RESPONSE_CODES.BAD_REQUEST,
      message: error.details[0].message.replaceAll('"', ''),
      data: null
    })
  }

  const newMovieTitle = req.body.title
  const genreId = req.body.genreId

  const movieWithSameTitleAndGenre = await Movie.findOne({
    title: newMovieTitle,
    'genre._id': genreId
  })

  if (movieWithSameTitleAndGenre) {
    return res.status(RESPONSE_CODES.CONFLICT).send({
      status: RESPONSE_CODES.CONFLICT,
      message: `Movie with title "${movieWithSameTitleAndGenre.title}" and genre with ID - "${movieWithSameTitleAndGenre.genre.id}" already exists.`,
      data: null
    })
  }

  const genre = await fetchMovieGenre(genreId)

  if (genreId && !genre) {
    return res.status(RESPONSE_CODES.NOT_FOUND).send({
      status: RESPONSE_CODES.NOT_FOUND,
      message: `Genre with ID - ${genreId} not found.`
    })
  }

  const newMovie = new Movie({ ...req.body, genre })

  await newMovie.save()

  res.send({
    status: RESPONSE_CODES.OK,
    message: 'Movie created successfully.',
    data: newMovie
  })
})

// Update a movie
router.put('/:id', authenticator, async (req, res) => {
  const { error } = validateMovie(req.body, false)

  if (error) {
    return res.status(RESPONSE_CODES.BAD_REQUEST).send({
      status: RESPONSE_CODES.BAD_REQUEST,
      message: error.details[0].message.replaceAll('"', ''),
      data: null
    })
  }

  const genreId = req.body.genreId
  const genre = await fetchMovieGenre(genreId)

  if (genreId && !genre) {
    return res.status(RESPONSE_CODES.NOT_FOUND).send({
      status: RESPONSE_CODES.NOT_FOUND,
      message: `Genre with ID - ${genreId} not found.`
    })
  }

  const movieId = req.params.id
  const movieUpdates = genre ? { ...req.body, genre } : req.body

  const movie = await Movie.findByIdAndUpdate(
    movieId,
    { $set: movieUpdates },
    { new: true }
  )

  if (!movie) {
    return res.status(RESPONSE_CODES.NOT_FOUND).send({
      status: RESPONSE_CODES.NOT_FOUND,
      message: `Movie with ID - ${movieId} does not exists.`,
      data: null
    })
  }

  res.send({
    status: RESPONSE_CODES.OK,
    message: 'Movie updated successfully!',
    data: movie
  })
})

// Delete a movie
router.delete('/:id', authenticator, async (req, res) => {
  const movieId = req.params.id

  const deletedMovie = await Movie.findByIdAndDelete(movieId)

  if (deletedMovie) {
    res.send({
      status: RESPONSE_CODES.OK,
      message: 'Movie deleted successfully',
      data: deletedMovie
    })
  } else {
    res.status(RESPONSE_CODES.NOT_FOUND).send({
      status: RESPONSE_CODES.NOT_FOUND,
      message: `Movie with id ${movieId} does not exist.`,
      data: null
    })
  }
})

async function fetchMovieGenre(genreId) {
  return genreId ? await Genre.findOne({ _id: genreId }).select('-__v') : null
}

module.exports = router
