#!/usr/bin/env node
'use strict'

const tools = require('a-toolbox')
const log = require('log-segment')

log.set({format: '{marker} [{timestamp}] {message}'})

const setup = require('../lib/setup')

function assureRoot() {
  if (!tools.sys.isRoot()) {
    setup.fail('Supercow powers needed... (run as root or sudo user)')
    process.exit(-1)
  }
}

// get args
const _program = setup.args(process.argv)

if (_program.add && _program.remove) {
  _program.help()
  setup.fail('Argument conflict: both add and remove method invoked')
  process.exit(-1)
}

Promise.resolve().then(() => {
  if(_program.add) {
    const settings = setup.settings(_program)
    return setup.add(settings);
  } else if(_program.remove) {
    return setup.remove(_program.service)
  } else if(_program.print) {
    const settings = setup.settings(_program);
    return setup.makeServiceFile(settings).then(data => console.log(data.service)).then(() => process.exit(0))
  } else {
    _program.help()
  }
}).then((message) => {
  setup.success(message)
}).catch((err) => {
  setup.fail(err.toString())
  process.exit(-1)
})
