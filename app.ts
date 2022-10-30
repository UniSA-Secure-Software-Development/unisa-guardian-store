/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
require('./lib/startup/validateDependencies')().then(() => {
  const server = require('./server')
  server.start()
})
