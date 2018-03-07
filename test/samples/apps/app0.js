'use strict'

const http = require('http')

const server = http.createServer((req, res) => {
  res.end('hi! I am server')
})

server.listen(process.env.PORT)
