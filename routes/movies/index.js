const express = require('express')

const { Movie, validateMovie, Genre } = require('../../models')
const { authenticator } = require('../../middlewares')

// Setup router
const router = express.Router()

// Get all movies
router.get('/', async (req, res) => {
  const movies = await Movie.find()
  res.status(200).send({ status: 200, data: movies, count: movies.length })
})

// Get a movie
router.get('/:id', async (req, res) => {
  const id = req.params.id

  const genre = await Movie.findById(id)

  if (!genre) {
    return res.status(404).send({
      status: 404,
      data: null,
      message: `Movie with ID - ${id} not found.`
    })
  }

  res.status(200).send({ status: 200, data: genre })
})

// Add a movie
router.post('/', authenticator, async (req, res) => {
  const { error } = validateMovie(req.body)

  if (error) {
    return res.status(400).send({
      status: 400,
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
    return res.status(409).send({
      status: 409,
      message: `Movie with title "${movieWithSameTitleAndGenre.title}" and genre with ID - "${movieWithSameTitleAndGenre.genre.id}" already exists.`,
      data: null
    })
  }

  const genre = await fetchMovieGenre(genreId)

  if (genreId && !genre) {
    return res.status(404).send({
      status: 404,
      message: `Genre with ID - ${genreId} not found.`
    })
  }

  const newMovie = new Movie({ ...req.body, genre })

  await newMovie.save()

  res.status(200).send({
    status: 200,
    message: 'Movie created successfully.',
    data: newMovie
  })
})

// Update a movie
router.put('/:id', authenticator, async (req, res) => {
  const { error } = validateMovie(req.body, false)

  if (error) {
    return res.status(400).send({
      status: 400,
      message: error.details[0].message.replaceAll('"', ''),
      data: null
    })
  }

  const genreId = req.body.genreId
  const genre = await fetchMovieGenre(genreId)

  if (genreId && !genre) {
    return res.status(404).send({
      status: 404,
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
    return res.status(404).send({
      status: 404,
      message: `Movie with ID - ${movieId} does not exists.`,
      data: null
    })
  }

  res.status(200).send({
    status: 200,
    message: 'Movie updated successfully!',
    data: movie
  })
})

// Delete a movie
router.delete('/:id', authenticator, async (req, res) => {
  const movieId = req.params.id

  const deletedMovie = await Movie.findByIdAndDelete(movieId)

  if (deletedMovie) {
    res.status(200).send({
      status: 200,
      message: 'Movie deleted successfully',
      data: deletedMovie
    })
  } else {
    res.status(404).send({
      status: 404,
      message: `Movie with id ${movieId} does not exist.`,
      data: null
    })
  }
})

async function fetchMovieGenre(genreId) {
  return genreId ? await Genre.findOne({ _id: genreId }).select('-__v') : null
}

module.exports = router
