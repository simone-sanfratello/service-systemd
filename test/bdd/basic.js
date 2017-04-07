'use strict'

const path = require('path')
// const Promise = require('bluebird')
// const tap = require('tap')
const log = require('log-segment')

const setup = require('../../lib/setup')

log.set({
  enabled: {
    segments: '*',
    levels: '*'
  }
})

const samples = {
  bin: '../..bin/main.js',
  apps: [
    path.join(__dirname, '../samples/apps', 'app0.js'),
    path.join(__dirname, '../samples/apps', 'app1.js')
  ],
  engines: {
    node: {
      settings: [
        path.join(__dirname, '../samples/settings', 'full-node.js'),
        path.join(__dirname, '../samples/settings', 'minimal-node.js')
      ],
      cli: {
        minimal: [],
        full: [],
        something: []
      }
    },
    forever: {
      settings: [
        path.join(__dirname, '../samples/settings', 'full-forever.js'),
        path.join(__dirname, '../samples/settings', 'minimal-forever.js')
      ],
      cli: {
        minimal: [],
        full: [],
        something: []
      }
    }
  }
}

const vows = require('vows')
const assert = require('assert')

// @todo error cases

const _batch = []
samples.engines.forEach((engine) => {
  samples.apps.forEach((app) => {
    // install service using only settings in file
    _batch.push('...')

    // install service using only settings in cli

    // install service using settings either in file and cli

    // remove services

  })
})



// install samples apps using node engine and samples settings
// bin/main.js -a -n app0-node -A app0.js -c test/samples/apps/app0.js

// install samples apps using forever engine and samples settings

// install samples apps using node engine and cli settings
// install samples apps using forever engine and cli settings

// sudo service-systemd -a -n 'my-service' -c /path/to/service -A main.js
// sudo service-systemd -a -s service.json
// sudo service-systemd -r -n 'my-service'

// install samples apps using forever engine
// remove services

// missing arguments in cli
// missing arguments in json
