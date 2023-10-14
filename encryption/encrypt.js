
// import Nodejs built in crypto module
const crypto = require('crypto')
const fs = require('fs')
// using AES encrpytion
const algorithm = 'aes-256-cbc'
// generates a random 256-bit key for encryption, required for AES encrpytion
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
  // encrpyted data is returned as a hex string
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
}

// decrypt function takes encrpyted text and returns the decrpyted plain text
function decrypt (text) {
  const iv = Buffer.from(text.iv, 'hex')
  const encryptedText = Buffer.from(text.encryptedData, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

// import file with sensitive data exposure
const file = '../data/static/users.yml'

// Read the YAML file
const yamlContent = fs.readFileSync(file, 'utf8')

// Encrypt the content
const encryptedContent = encrypt(yamlContent)

// Save the encrypted content to another file
fs.writeFileSync(file, JSON.stringify(encryptedContent))

console.log('File encrypted successfully!')

// If you want to test decryption, you can use the below code:
console.log('decrypted file: ' + decrypt(encryptedContent))
