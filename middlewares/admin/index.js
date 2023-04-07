const admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).send({
      status: 403,
      message: 'Access Denied.'
    })
  }

  next()
}

module.exports = admin
