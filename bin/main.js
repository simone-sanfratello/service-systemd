#!/usr/bin/env node
'use strict'

const setup = require('../lib/setup')

// check user
if (!setup.checkUser(process.env.USER)) {
  setup.fail('Supercow powers needed... (run as root or sudo user)')
  process.exit(-1)
}

// get args
const _program = setup.args(process.argv)

if (_program.add && _program.remove) {
  _program.help()
  setup.fail('Argument conflict: both add and remove method invoked')
  process.exit(-1)
}

if (_program.add) {
  setup.add(setup.settings(_program))
    .then((message) => {
      setup.success(message)
      process.exit(1)
    })
    .catch((err) => {
      setup.fail(err.toString())
      process.exit(-1)
    })
} else if (_program.remove) {
  setup.remove(_program.service)
    .then((message) => {
      setup.success(message)
      process.exit(1)
    })
    .catch((err) => {
      setup.fail(err.toString())
      process.exit(-1)
    })
} else {
  _program.help()
  setup.fail('Missing action: add or remove')
  process.exit(-1)
}
