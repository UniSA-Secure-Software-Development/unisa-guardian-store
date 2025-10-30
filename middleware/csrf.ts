import { NextFunction, Request, Response } from 'express'
import crypto from 'crypto'
import config = require('config')

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function generateToken (bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

export function csrfProtection () {
  return (req: Request, res: Response, next: NextFunction) => {
    const domain = (() => {
      try {
        return config.get<string>('application.domain')
      } catch {
        return undefined
      }
    })()

    // Ensure CSRF token cookie exists
    let cookieToken = req.cookies?.csrfToken as string | undefined
    if (!cookieToken) {
      cookieToken = generateToken()
      const isSecure = (req.secure === true) || (req.headers['x-forwarded-proto'] === 'https')
      res.cookie('csrfToken', cookieToken, {
        sameSite: 'lax',
        secure: isSecure,
        httpOnly: false, // must be readable by frontend to set header
        ...(domain ? { domain } : {}),
        path: '/'
      })
    }

    // Allow read-only methods without CSRF verification
    if (!UNSAFE_METHODS.has(req.method.toUpperCase())) {
      return next()
    }

    // Verify Origin/Referer if present
    const origin = req.headers.origin as string | undefined
    const referer = req.headers.referer as string | undefined
    const host = req.headers.host

    const sameSiteOk = (() => {
      try {
        if (origin) {
          return origin.includes(host ?? '') || (domain ? origin.includes(domain) : false)
        }
        if (referer) {
          return referer.includes(host ?? '') || (domain ? referer.includes(domain) : false)
        }
      } catch {}
      // If neither provided, fall back to token check only
      return true
    })()

    // Double submit cookie check
    const headerToken = (req.headers['x-csrf-token'] as string | undefined) ?? (req.body?.csrfToken as string | undefined)

    if (!sameSiteOk || !cookieToken || !headerToken || headerToken !== cookieToken) {
      return res.status(403).json({ error: 'CSRF validation failed' })
    }

    next()
  }
}

export function issueCsrfToken () {
  return (req: Request, res: Response) => {
    let cookieToken = req.cookies?.csrfToken as string | undefined
    if (!cookieToken) {
      cookieToken = generateToken()
      const isSecure = (req.secure === true) || (req.headers['x-forwarded-proto'] === 'https')
      const domain = (() => {
        try { return config.get<string>('application.domain') } catch { return undefined }
      })()
      res.cookie('csrfToken', cookieToken, {
        sameSite: 'lax',
        secure: isSecure,
        httpOnly: false,
        ...(domain ? { domain } : {}),
        path: '/'
      })
    }
    res.json({ csrfToken: cookieToken })
  }
}


