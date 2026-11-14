const Joi = require('joi')
const jwt = require('jsonwebtoken')
const validate = require('../src/middleware/validate')
const { signAccessToken, verifyAccessToken, issueRefreshToken, consumeRefreshToken } = require('../src/utils/jwt')

describe('utils/jwt', () => {
  const user = { id: 5, role: 'ADMIN' }

  it('access token содержит id и роль', () => {
    expect(verifyAccessToken(signAccessToken(user))).toMatchObject({ sub: 5, role: 'ADMIN' })
  })

  it('испорченный токен не проходит проверку', () => {
    const token = signAccessToken(user)
    expect(() => verifyAccessToken(token.slice(0, -2) + 'xx')).toThrow(jwt.JsonWebTokenError)
  })

  it('refresh token одноразовый', async () => {
    const token = await issueRefreshToken(user)

    await expect(consumeRefreshToken(token)).resolves.toMatchObject({ sub: 5 })
    await expect(consumeRefreshToken(token)).rejects.toThrow()
  })
})

describe('middleware/validate', () => {
  const schema = Joi.object({ page: Joi.number().integer().min(1).default(1) })

  function run(query) {
    const req = { query }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()
    validate(schema, 'query')(req, res, next)
    return { req, res, next }
  }

  it('подставляет значения по умолчанию и приводит типы', () => {
    const { req, next } = run({ page: '3', junk: 'x' })
    expect(next).toHaveBeenCalled()
    expect(req.query).toEqual({ page: 3 })
  })

  it('отдаёт 400 с details', () => {
    const { res, next } = run({ page: '0' })
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json.mock.calls[0][0].error.details).toEqual([
      { field: 'page', message: 'page должно быть не меньше 1' },
    ])
  })
})
