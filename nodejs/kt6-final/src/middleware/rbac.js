const { HttpError } = require('../utils/http')

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) throw new HttpError(403, 'Недостаточно прав')
    next()
  }
}

function isAdmin(user) {
  return user.role === 'ADMIN'
}

function assertOwner(user, ...ownerIds) {
  if (!isAdmin(user) && !ownerIds.includes(user.id)) {
    throw new HttpError(403, 'Действие доступно только владельцу или администратору')
  }
}

module.exports = { authorize, isAdmin, assertOwner }
