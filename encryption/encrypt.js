// import Nodejs built in crypto module
const crypto = require('crypto')
const fs = require('fs')
// using AES encryption
const algorithm = 'aes-256-cbc'
// generates a random 256-bit key for encryption, required for AES encryption
const key = crypto.randomBytes(32)
// generates a random 128-bit initalisation vector
const iv = crypto.randomBytes(16)

// encrypt function
function encrypt (text) {
  // initalise a cipher using the specified algorithm, key and iv
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
  // text is encrpyted using the cipher
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  // encrypted data is returned as a hex string
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
}
// Store key after encryption
fs.writeFileSync('key.txt', key)

// import file with sensitive data exposure
const file = '../data/static/users.yml'

// Read the YAML file
const yamlContent = fs.readFileSync(file, 'utf8')

// Encrypt the content
const encryptedContent = encrypt(yamlContent)

// overwrite the file
fs.writeFileSync(file, JSON.stringify(encryptedContent))

console.log('File encrypted successfully!')
