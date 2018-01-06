'use strict'

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
      value: '[log]',
      description: 'Service log file'
    },
    default: '/var/log/{name}/log'
  },
  error: {
    cli: {
      short: 'E',
      long: 'error',
      value: '[error]',
      description: 'Service error file'
    },
    default: '/var/log/{name}/error'
  },
  engine: {
    cli: {
      short: 'X',
      long: 'engine',
      value: '[node|forever|pm2]',
      description: 'Service engine (node|forever|pm2)'
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
      value: '[eargs]',
      description: 'Service engine args'
    }
  },
  logrotate: {
    cli: {
      short: 'l',
      long: 'logrotate',
      description: 'Add logrotate config'
    }
    // default false
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
