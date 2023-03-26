const express = require('express')
const Joi = require('joi')
const { faker } = require('@faker-js/faker')

// Setup router
const router = express.Router()

// Genre Content-Type
const CONTENT_TYPE = 'application/json'

// Genre Services
const genresList = Array.from({ length: 10 }, () => faker.music.genre())
const uniqueGenres = new Set(genresList)
let genres = Array.from(uniqueGenres, (genre, idx) => ({
  id: faker.database.mongodbObjectId(),
  title: genre
}))

// Get a movie Genre
router.get('/', (req, res) => {
  res
    .status(200)
    .contentType('application/json')
    .send({ status: 200, data: genres, count: genres.length })
})

// Get a movie Genre
router.get('/:id', (req, res) => {
  const genreId = req.params.id
  const genre = getAGenre(genreId)

  if (!genre) {
    return res
      .status(404)
      .contentType(CONTENT_TYPE)
      .send({
        status: 404,
        message: `Genre with id ${genreId} does not exist.`,
        data: null
      })
  }

  res
    .status(200)
    .contentType('application/json')
    .send({ status: 200, data: genre })
})

// Add a movie genre
router.post('/', (req, res) => {
  const { error } = validateGenre(req.body)

  if (error) {
    return res
      .status(400)
      .contentType(CONTENT_TYPE)
      .send({
        status: 400,
        message: error.details[0].message.replaceAll('"', ''),
        data: null
      })
  }

  const newGenreTitle = req.body.title
  const genre = genres.find(
    (gen) => gen.title.toLowerCase() === newGenreTitle.toLowerCase()
  )

  if (genre) {
    return res
      .status(409)
      .contentType(CONTENT_TYPE)
      .send({
        status: 409,
        message: `Genre with title ${genre.title} already exists.`,
        data: null
      })
  }

  const newGenre = {
    id: faker.database.mongodbObjectId(),
    title: newGenreTitle
  }

  genres.push(newGenre)

  res.status(200).contentType(CONTENT_TYPE).send({
    status: 200,
    message: 'Genre added successfully.',
    data: newGenre
  })
})

// Update a movie genre
router.put('/:id', (req, res) => {
  const genreId = req.params.id
  const genreToEdit = getAGenre(genreId)

  if (!genreToEdit) {
    return res
      .status(404)
      .contentType(CONTENT_TYPE)
      .send({
        status: 404,
        message: `Genre with id ${genreId} does not exist.`,
        data: null
      })
  }

  const { error } = validateGenre(req.body)

  if (error) {
    return res
      .status(400)
      .contentType(CONTENT_TYPE)
      .send({
        status: 400,
        message: error.details[0].message.replaceAll('"', ''),
        data: null
      })
  }

  const newGenreTitle = req.body.title

  const genre = genres.find(
    (gen) => gen.title.toLowerCase() === newGenreTitle.toLowerCase()
  )

  if (genre) {
    return res
      .status(409)
      .contentType(CONTENT_TYPE)
      .send({
        status: 409,
        message: `Genre with title ${genre.title} already exists.`,
        data: null
      })
  }

  genreToEdit.title = newGenreTitle

  res.status(200).contentType(CONTENT_TYPE).send({
    status: 200,
    message: 'Genre updated successfully!',
    data: genreToEdit
  })
})

// Delete a genre
router.delete('/:id', (req, res) => {
  const genreId = req.params.id
  const genreToDelete = getAGenre(genreId)

  if (!genreToDelete) {
    return res
      .status(404)
      .contentType(CONTENT_TYPE)
      .send({
        status: 404,
        message: `Genre with id ${genreId} does not exist.`,
        data: null
      })
  }

  genres = genres.filter((genre) => genre.id !== genreToDelete.id)

  res.status(200).contentType(CONTENT_TYPE).send({
    status: 200,
    message: 'Genre deleted successfully',
    data: genreToDelete
  })
})

// Validation fn for a genre
function validateGenre(genre) {
  const schema = {
    title: Joi.string().min(3).required()
  }

  return Joi.validate(genre, schema)
}

// Check if a genre already exists
function getAGenre(genreId) {
  return genres.find((gen) => gen.id === genreId)
}

module.exports = router
