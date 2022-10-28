/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs')
import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../models/user'

const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const logger = require('../lib/logger')
const fileType = require('file-type')
const mimeType = require('mime-types')

module.exports = function fileUpload () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file
    const buffer = file?.buffer
    const uploadedFileType = await fileType.fromBuffer(buffer)
    const allowedFileTypes = ['jpeg', 'jpg', 'png']
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
    const uploadedMime = mimeType.lookup(file)

    if (loggedInUser) {
      if (uploadedFileType === undefined) {
        res.status(500)
        next(new Error('Illegal file type'))
      } else if (!allowedMimeTypes.includes(uploadedMime)) {
        res.status(500)
        next(new Error('Illegal mime type - must be jpeg, jpg, or png'))
      } else if (!allowedFileTypes.includes(uploadedFileType.ext)) {
        res.status(500)
        next(new Error('Illegal file type - must be jpeg, jpg, or png'))
      } else {
        if (uploadedFileType !== null && utils.startsWith(uploadedFileType.mime, 'image')) {
          fs.open(`frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}`, 'w', function (err, fd) {
            if (err != null) logger.warn('Error opening file: ' + err.message)
            if (buffer) {
              fs.write(fd, buffer, 0, buffer.length, null, function (err) {
                if (err != null) logger.warn('Error writing file: ' + err.message)
                fs.close(fd, function () { })
              })
            }
          })
          UserModel.findByPk(loggedInUser.data.id).then(async (user: UserModel | null) => {
            if (user) {
              return await user.update({ profileImage: `assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}` })
            }
          }).catch((error: Error) => {
            next(error)
          })
          res.location(process.env.BASE_PATH + '/profile')
          res.redirect(process.env.BASE_PATH + '/profile')
        }
      }
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}
