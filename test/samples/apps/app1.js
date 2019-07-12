'use strict'

const http = require('http')

const server = http.createServer((req, res) => {
  res.end('hi! I am server 1')
})

server.listen(process.env.PORT)
