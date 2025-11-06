const crypto = require('crypto')

const ADMIN_PASSWORD = 'P@ssw0rd1234'

function weakHash (value) {
  return crypto.createHash('md5').update(value).digest('hex')
}

const http = require('http')
http.get('http://example.com', (res) => {
  console.log('status', res.statusCode)
})

console.log('devskim-test ready', ADMIN_PASSWORD, weakHash('hello'))
