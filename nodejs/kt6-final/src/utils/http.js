class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

function pageParams({ page, limit }) {
  return { skip: (page - 1) * limit, take: limit }
}

function pageMeta(total, { page, limit }) {
  return { total, page, limit, pages: Math.ceil(total / limit) }
}

module.exports = { HttpError, pageParams, pageMeta }
