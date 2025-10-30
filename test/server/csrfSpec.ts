/*
 * Copyright (c) 2025
 * CSRF middleware tests
 */

import sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('csrf middleware', () => {
  const { csrfProtection } = require('../../middleware/csrf')

  const build = (method: string, headers: any = {}, body: any = {}, cookies: any = {}) => {
    const req: any = { method, headers, body, cookies, secure: false }
    const res: any = { status: sinon.stub().returnsThis(), json: sinon.spy(), cookie: sinon.spy() }
    const next = sinon.spy()
    return { req, res, next }
  }

  it('should set csrfToken cookie if missing (GET)', () => {
    const { req, res, next } = build('GET')
    csrfProtection()(req, res, next)
    expect(res.cookie).to.have.been.calledWithMatch('csrfToken', sinon.match.string)
    expect(next).to.have.been.called
  })

  it('should reject unsafe method without matching token', () => {
    const { req, res, next } = build('POST', { host: 'localhost:3000' }, {}, { csrfToken: 'cookie-token' })
    csrfProtection()(req, res, next)
    expect(res.status).to.have.been.calledWith(403)
    expect(res.json).to.have.been.calledWithMatch({ error: sinon.match.string })
    expect(next).to.not.have.been.called
  })

  it('should allow unsafe method with matching header token', () => {
    const token = 'abc123'
    const { req, res, next } = build('POST', { host: 'localhost:3000', origin: 'http://localhost:3000' }, {}, { csrfToken: token })
    req.headers['x-csrf-token'] = token
    csrfProtection()(req, res, next)
    expect(next).to.have.been.called
  })
})


