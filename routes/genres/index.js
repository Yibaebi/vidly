const express = require('express')

const { Genre, validateGenre } = require('../../models')
const { authenticator, validateObjectId } = require('../../middlewares')
const { ERROR_CODES } = require('../../constants')

// Setup router
const router = express.Router()

// Get all movie genres
router.get('/', async (req, res) => {
  const genres = await Genre.find()
  res
    .status(ERROR_CODES.OK)
    .send({ status: ERROR_CODES.OK, data: genres, count: genres.length })
})

// Get a movie genre
router.get('/:id', validateObjectId, async (req, res) => {
  const id = req.params.id

  const genre = await Genre.findById(id).select('-__v')

  if (!genre) {
    return res.status(ERROR_CODES.NOT_FOUND).send({
      status: ERROR_CODES.NOT_FOUND,
      data: null,
      message: `Genre with ID - ${id} not found.`
    })
  }

  res.status(ERROR_CODES.OK).send({ status: ERROR_CODES.OK, data: genre })
})

// Add a movie genre
router.post('/', authenticator, async (req, res) => {
  const { error } = validateGenre(req.body)

  if (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      message: error.details[0].message.replaceAll('"', ''),
      data: null
    })
  }

  const newGenreTitle = req.body.title
  const titlePattern = new RegExp('^' + newGenreTitle.trim() + '$', 'i')

  const genre = await Genre.findOne({
    title: titlePattern
  })

  if (genre) {
    return res.status(ERROR_CODES.CONFLICT).send({
      status: ERROR_CODES.CONFLICT,
      message: `Genre with title ${genre.title} already exists.`,
      data: null
    })
  }

  const newGenre = new Genre({
    title: newGenreTitle
  })

  await newGenre.save()

  res.status(ERROR_CODES.OK).send({
    status: ERROR_CODES.OK,
    message: 'Genre added successfully.',
    data: newGenre
  })
})

// Update a movie genre
router.put('/:id', authenticator, async (req, res) => {
  const genreId = req.params.id

  const { error } = validateGenre(req.body)

  if (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).send({
      status: ERROR_CODES.BAD_REQUEST,
      message: error.details[0].message.replaceAll('"', ''),
      data: null
    })
  }

  const newGenreTitle = req.body.title
  const genre = await Genre.findById(genreId)

  if (genre) {
    // New genre title Regex pattern
    const titlePattern = new RegExp(newGenreTitle.trim(), 'i')

    if (genre.title.match(titlePattern)) {
      return res.status(ERROR_CODES.CONFLICT).send({
        status: ERROR_CODES.CONFLICT,
        message: 'Cannot update genre with the same title.'
      })
    }

    // Check if Genre title already exists in DB
    const genreWithTitle = await Genre.findOne({
      _id: { $ne: genreId },
      title: titlePattern
    })

    if (genreWithTitle) {
      return res.status(ERROR_CODES.CONFLICT).send({
        status: ERROR_CODES.CONFLICT,
        message: `A genre with title ${genreWithTitle.title} already exists. Cannot perform update.`,
        data: null
      })
    } else {
      genre.title = newGenreTitle
      const updatedGenre = await genre.save()

      res.status(ERROR_CODES.OK).send({
        status: ERROR_CODES.OK,
        message: 'Genre updated successfully!',
        data: updatedGenre
      })
    }
  } else {
    res.status(ERROR_CODES.NOT_FOUND).send({
      status: ERROR_CODES.NOT_FOUND,
      message: `Genre with ID - ${genreId} does not exists.`,
      data: null
    })
  }
})

// Delete a genre
router.delete('/:id', authenticator, async (req, res) => {
  const genreId = req.params.id

  const deletedGenre = await Genre.findByIdAndDelete(genreId)

  if (deletedGenre) {
    res.status(ERROR_CODES.OK).send({
      status: ERROR_CODES.OK,
      message: 'Genre deleted successfully',
      data: deletedGenre
    })
  } else {
    res.status(ERROR_CODES.NOT_FOUND).send({
      status: ERROR_CODES.NOT_FOUND,
      message: `Genre with id ${genreId} does not exist.`,
      data: null
    })
  }
})

module.exports = router
