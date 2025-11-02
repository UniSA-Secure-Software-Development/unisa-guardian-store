/*
 * Insecure file upload vulnerability test script
 * 
 * Author: Aaron Bednikof
 * ID: 110233224
 * Email_ID: beday003
 * 
 * Description: script that tests for file upload vulnerability fixed.
 * the tests serve to validate that the fix implementations work as intended via
 * testing if proper restrictions are in place for both unexpected file types,
 * and files that exceed the maximum 100kb limit (100,000 bytes)
 */

import frisby = require('frisby')
const fs = require('fs')
const path = require('path')

const URL = 'http://localhost:3000'

describe('/file-upload - Security Fix Validation', () => {

  // test 1: reject files that are too large (over 100KB)
  it('Should reject large files', () => {

    //find the test file provided
    const file = path.resolve(__dirname, '../files/invalidSizeForClient.pdf')
    
    //create a form to upload the file
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))
    
    //send the file to the server api
    // @ts-expect-error
    return frisby.post(URL + '/file-upload', { 
      headers: { 'Content-Type': form.getHeaders()['content-type'] }, 
      body: form
    })
    //check the response (should be 400 reject)
      .expect('status', 400)
      .expect('json', 'error', /File exceeds size limit/)})

  // test 2: reject files with wrong file types
  it('Should reject wrong file types', () => {

    //find the test file (this one is not allowed)
    const file = path.resolve(__dirname, '../files/invalidTypeForClient.exe')
    
    //create a form to upload the file
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))
    
    //send the file to the server api
    // @ts-expect-error
    return frisby.post(URL + '/file-upload', { 
      headers: { 'Content-Type': form.getHeaders()['content-type'] }, 
      body: form 
    })
    //check the response (should be 400 reject)
      .expect('status', 400)  // 400 = Bad Request (rejected)
      .expect('json', 'error', /Invalid file type/)
  })

  // test 3: accept valid pdf files (smaller correct type)
  it('Should accept valid PDF files', () => {

    //find the test file
    const file = path.resolve(__dirname, '../files/validSizeAndTypeForClient.pdf')
    
    //create a form to upload the file
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))
    
    //send the file to the server api
    // @ts-expect-error
    return frisby.post(URL + '/file-upload', { 
      headers: { 'Content-Type': form.getHeaders()['content-type'] }, 
      body: form 
    })
    //check the response (should be 204 accept)
      .expect('status', 204)
  })

  // test 4: accept valid zip files
  it('Should accept valid ZIP files', () => {
    //find the test file (zip files are allowed)
    const file = path.resolve(__dirname, '../files/arbitraryFileWrite.zip')
    
    //create a form to upload the file
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))
    
    //send the file to the server api
    // @ts-expect-error
    return frisby.post(URL + '/file-upload', { 
      headers: { 'Content-Type': form.getHeaders()['content-type'] }, 
      body: form 
    })
    //check the response (should be 204 accepted)
      .expect('status', 204)
  })
})