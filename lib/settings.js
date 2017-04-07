'use strict'

/*
    .option('-n, --service [name]', 'Service name')
    .option('-d, --description [description]', `Service description, default ${defaultSettings.description}`, defaultSettings.description)
    .option('-k, --author [author]', 'Service author')
    .option('-u, --user [user]', 'User to run service as')
    .option('-g, --group [group]', 'Group to run service as')
    .option('-A, --app [app]', `Application main file, default ${defaultSettings.app}`, defaultSettings.app)
    .option('-c, --cwd [path]', 'Application cwd')
    .option('-p, --app.args [args]', 'Application arguments')
    .option('-e, --env [NAME=VALUE]', 'Environment variables to set in systemd job',
      (v, vars) => {
        const _v = v.split('=')
        vars[_v[0]] = _v[1]; return vars
      }, [])
    .option('-P, --pid [file]', `Service pid file, default ${defaultSettings.pid}`, defaultSettings.pid)
    .option('-L, --log [file]', `Service log file, default ${defaultSettings.log}`, defaultSettings.log)
    .option('-E, --error [file]', `Service error file, default ${defaultSettings.error}`, defaultSettings.error)
    .option('-X, --engine [node|forever]', `Service engine (node|forever), default ${defaultSettings.engine}`, defaultSettings.engine)
    .option('-b, --engine.bin [bin]', `Service engine bin, default ${defaultSettings['engine.bin']}`, defaultSettings['engine.bin'])
    .option('-t, --engine.args [args]', 'Service engine args')
    .option('-L, --logrotate', 'Add logrotate config')
    .option('-R, --logrotate.rotate [rotate]', `Logrotate rotations, default ${defaultSettings['logrotate.rotate']}`, defaultSettings['logrotate.rotate'])
    .option('-F, --logrotate.frequency [frequency]', `Logrotate frequency, default ${defaultSettings['logrotate.frequency']}`, defaultSettings['logrotate.frequency'])
*/

const settings = {
  name: {
    cli: {
      short: 'n',
      long: 'service',
      value: '[name]',
      description: 'Service name'
    },
    mandatory: true
  },
  description: {
    cli: {
      short: 'd',
      long: 'description',
      value: '[description]',
      description: 'Service description'
    },
    default: '{name} service'
  },
  author: {
    cli: {
      short: 'k',
      long: 'author',
      value: '[author]',
      description: 'Service author'
    }
  },
  user: {
    cli: {
      short: 'u',
      long: 'user',
      value: '[user]',
      description: 'User to run service as'
    }
  },
  group: {
    cli: {
      short: 'g',
      long: 'group',
      value: '[group]',
      description: 'Group to run service as'
    }
  },
  app: {
    cli: {
      short: 'A',
      long: 'app',
      value: '[app]',
      description: 'Application main file'
    },
    default: 'main.js'

  },
  cwd: {
    cli: {
      short: 'c',
      long: 'cwd',
      value: '[path]',
      description: 'Application cwd'
    },
    mandatory: true,
    fs: true
  },
  'app.args': {
    cli: {
      short: 'p',
      long: 'app.args',
      value: '[args]',
      description: 'Application arguments'
    }
  },
  env: {
    cli: {
      short: 'e',
      long: 'env',
      value: '[NAME=VALUE]',
      description: 'Environment variables to set in systemd job',
      function: (v, vars) => {
        const _v = v.split('=')
        vars[_v[0]] = _v[1]; return vars
      },
      store: []
    }
  },
  pid: {
    cli: {
      short: 'P',
      long: 'pid',
      value: '[file]',
      description: 'Service pid file'
    },
    default: '/var/run/{name}.pid'
  },
  log: {
    cli: {
      short: 'L',
      long: 'log',
      value: '[file]',
      description: 'Service log file'
    },
    default: '/var/log/{name}/log'
  },
  error: {
    cli: {
      short: 'E',
      long: 'error',
      value: '[file]',
      description: 'Service error file'
    },
    default: '/var/log/{name}/error'
  },
  engine: {
    cli: {
      short: 'X',
      long: 'engine',
      value: '[node|forever]',
      description: 'Service engine (node|forever)'
    },
    default: 'node',
    mandatory: true
  },
  'engine.bin': {
    cli: {
      short: 'b',
      long: 'engine.bin',
      value: '[bin]',
      description: 'Service engine bin'
    },
    default: '/usr/bin/{engine}',
    fs: true
  },
  'engine.args': {
    cli: {
      short: 't',
      long: 'engine.args',
      value: '[args]',
      description: 'Service engine args'
    }
  },
  logrotate: {
    cli: {
      short: 'L',
      long: 'logrotate',
      description: 'Add logrotate config'
    },
    default: true
  },
  'logrotate.rotate': {
    cli: {
      short: 'R',
      long: 'logrotate.rotate',
      value: '[rotate]',
      description: 'Logrotate rotations'
    },
    default: 10

  },
  'logrotate.frequency': {
    cli: {
      short: 'F',
      long: 'logrotate.frequency',
      value: '[frequency]',
      description: 'Logrotate frequency'
    },
    default: 'daily'
  }
}

module.exports = settings
