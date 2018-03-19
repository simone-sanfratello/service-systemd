'use strict'

const path = require('path')
const Promise = require('bluebird')
const tap = require('tap')
const log = require('log-segment')

const setup = require('../../lib/setup')

/**
 * @todo check wrote script (content) and systemdctl to pass
 * @todo install service using only settings in cli
 * @todo install service using settings either in file and cli
 */

log.add({
  segments: { 'test': { color: 'blue' } }
})

log.set({
  enabled: {
    segments: '*',
    levels: '*'
  }
})

const samples = {
  bin: '../..bin/main.js',
  engines: {
    node: {
      settings: [
        path.join(__dirname, '../samples/settings', 'node-full.json'),
        path.join(__dirname, '../samples/settings', 'node-minimal.json')
      ]
      // @todo cli
    },
    forever: {
      settings: [
        path.join(__dirname, '../samples/settings', 'forever-full.json'),
        path.join(__dirname, '../samples/settings', 'forever-minimal.json')
      ]
    }
  }
}

const _batch = []

for (const engine in samples.engines) {
  const _engine = samples.engines[engine]

  // install service using only settings in file
  _engine.settings.forEach((file) => {
    let _service = require(file).name
    _batch.push(() => {
      return tap.test(`add service ${_service}`, (test) => {
        test.plan(1)
        const _args = ['node', 'service-systemd', '-a', '-s', file]
        const _program = setup.args(_args)
        log.info('test', _args.join(' '))
        setup.add(_program)
          .then(() => {
            test.pass(`add service ${_service} success`)
          })
          .catch((err) => {
            test.fail(`add service ${_service} fail`, err)
          })
      })
    })

    // remove services
    _batch.push(() => {
      return tap.test(`remove service ${_service}`, (test) => {
        test.plan(1)

        setup.remove(_service)
          .then(() => {
            test.pass(`remove service ${_service} success`)
          })
          .catch((err) => {
            test.fail(`remove service ${_service} fail`, err)
          })
      })
    })
  })
}

Promise.each(_batch, (f) => {
  return f()
})
  .then((tap) => {
    // well done
    process.exit(0)
  })
  .catch(tap.threw)
