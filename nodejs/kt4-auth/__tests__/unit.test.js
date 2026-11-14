const Joi = require('joi')
const jwt = require('jsonwebtoken')
const { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } = require('../src/utils/jwt')
const validate = require('../src/middleware/validate')

describe('utils/jwt', () => {
  const user = { id: 7, role: 'MODERATOR', tokenVersion: 2 }

  it('access token содержит id и роль', () => {
    const payload = verifyAccessToken(signAccessToken(user))
    expect(payload).toMatchObject({ sub: 7, role: 'MODERATOR' })
  })

  it('refresh token нельзя проверить как access token', () => {
    const refresh = signRefreshToken(user)

    expect(verifyRefreshToken(refresh)).toMatchObject({ sub: 7, ver: 2 })
    expect(() => verifyAccessToken(refresh)).toThrow(jwt.JsonWebTokenError)
  })
})

describe('middleware/validate', () => {
  const schema = Joi.object({ title: Joi.string().required() })

  function run(body) {
    const req = { body }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    const next = jest.fn()
    validate(schema)(req, res, next)
    return { req, res, next }
  }

  it('пропускает валидные данные дальше', () => {
    const { next, res } = run({ title: 'ok' })
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('возвращает 400 с details', () => {
    const { next, res } = run({})
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json.mock.calls[0][0].details[0]).toEqual({ field: 'title', message: 'title обязательно' })
  })
})
