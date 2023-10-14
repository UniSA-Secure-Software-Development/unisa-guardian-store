// import Nodejs built in crypto module
const crypto = require('crypto')
const fs = require('fs')
// using AES encrpytion
const algorithm = 'aes-256-cbc'

// Retrieving key and iv before decryption
const key = fs.readFileSync('key.txt')

// decrypt function takes encrpyted text and returns the decrpyted plain text
function decrypt (text) {
  const iv = Buffer.from(text.iv, 'hex')
  const encryptedText = Buffer.from(text.encryptedData, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
// decryption test
const file = '../data/static/users.yml'
const ToBeDecryptedContent = fs.readFileSync(file, 'utf8')
const data = JSON.parse(ToBeDecryptedContent)
const decryptedContent = decrypt(data)
fs.writeFileSync(file, decryptedContent)
console.log('File decrypted successfully!')
