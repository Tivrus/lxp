const HttpError = require('../utils/httpError')

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, 'Недостаточно прав')
    }
    next()
  }
}

function canModify(user, ownerId) {
  return user.id === ownerId || user.role === 'MODERATOR' || user.role === 'ADMIN'
}

module.exports = { authorize, canModify }
