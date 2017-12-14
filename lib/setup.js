'use strict'

const path = require('path')
const log = require('log-segment')
const commander = require('commander')
const Promise = require('bluebird')
const fs = require('fs-extra')
const tools = require('a-toolbox')
const exec = require('child-process-promise').exec

const app = require('../package.json')

const SETTINGS = require('./settings')

const setup = {}

/**
 * @namespace setup
 */

/**
 * print success message
 * @method setup.success
 * @param {string} message
 */
setup.success = function (message) {
  log.success('', message)
}

/**
 * print error message
 * @method setup.fail
 * @param {string} message
 */
setup.fail = function (message) {
  log.error('', message)
}

/**
 * get argument from command line
 * @method setup.args
 * @param {string[]} argv should be process.argv
 * @return {Commander} commander instance
 */
setup.args = function (argv) {
  commander
    .version(app.version)
    .option('-a, --add', 'Add the service')
    .option('-r, --remove', 'Remove the service')

    .option('-s, --settings [file]', 'Service settings file')

  for (const option in SETTINGS) {
    const _option = SETTINGS[option]
    let _description = _option.cli.description
    if (_option.default) {
      _description += `, default ${_option.default}`
    }
    if (!_option.cli.value) {
      _option.cli.value = ''
    }
    if (!_option.cli.function) {
      commander.option(`-${_option.cli.short}, --${_option.cli.long} ${_option.cli.value}`, _description)
    } else {
      commander.option(`-${_option.cli.short}, --${_option.cli.long} ${_option.cli.value}`, _description, _option.cli.function, _option.cli.store)
    }
  }

  commander.parse(argv)

  return commander
}

/**
 * install the service
 * can also be used to update the service
 * @method setup.add
 * @param {object} settings
 * @return {Promise<string>}
 */
setup.add = function (settings) {
  return new Promise((resolve, reject) => {
    let _contents

    // check settings data
    setup.checkSettings(settings)
      .then(() => {
        _contents = setup.parse(settings)
        return setup.addLog(settings, _contents)
      })
      .then(() => {
        return setup.addScripts(settings, _contents)
      })
      .then(() => {
        return setup.addLogrotate(settings, _contents)
      })
      .then(() => {
        resolve(`service ${settings.name} installed`)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

/**
 * remove the service
 * @method setup.remove
 * @param {string} service service name
 * @return {Promise<string>}
 */
setup.remove = function (service) {
  return new Promise((resolve, reject) => {
    // check arguments
    if (!service) {
      reject(new Error('Missing argument: service name'))
      return
    }

    const _cmd = `systemctl disable ${service}.service`
    log.info('', '>', _cmd)
    exec(_cmd)
      .then(() => {
        let _file = path.join('/etc/systemd/system', `${service}.service`)
        log.info('', `remove ${_file}`)
        return tools.fs.unlink(_file, true)
      })
      .then(() => {
        let _file = path.join('/usr/local/bin', `systemd-${service}-start`)
        log.info('', `remove ${_file}`)
        return tools.fs.unlink(_file, true)
      })
      .then(() => {
        let _file = path.join('/etc/logrotate.d', service)
        log.info('', `remove ${_file}`)
        return tools.fs.unlink(_file, true)
      })
      .then(() => {
        resolve(`service ${service} uninstalled`)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

/**
 * load settings merged with cli arguments
 * @method setup.settings
 * @param {Commander} commander instance
 * @return {object} settings
 */
setup.settings = function (commander) {
  let _settings = {}

  // load json file
  let _file = {}
  if (commander.settings) {
    try {
      _file = require(path.resolve(commander.settings))
    } catch (e) {
      log.warning('', `can't load settings file ${commander.settings}`)
    }
  }

  for (const option in SETTINGS) {
    if (commander[option] && typeof commander[option] !== 'function') {
      _settings[option] = commander[option]
    } else if (_file[option]) {
      _settings[option] = _file[option]
    } else {
      _settings[option] = SETTINGS[option].default
    }
  }
  _settings.service = commander.service

  return _settings
}

/**
 * check mandatories params and paths
 * @method setup.checkSettings
 * @param {object} settings
 * @return {Promise<void>}
 */
setup.checkSettings = function (settings) {
  return new Promise((resolve, reject) => {
    if (!settings.name) {
      settings.name = settings.service
    }

    delete settings.service

    const _paths = []
    for (const option in SETTINGS) {
      const _option = SETTINGS[option]
      if (_option.mandatory && !settings[option]) {
        reject(new Error(`Missing ${option} in settings file or arguments`))
        return
      }
      if (_option.fs) {
        _paths.push(option)
      }
    }

    const _exists = _paths.map((fs) => {
      settings[fs] = path.resolve(settings[fs])
      return () => {
        tools.fs.exists(settings[fs])
          .then((exists) => {
            if (!exists) {
              log.warn('', `path ${settings[fs]} (${fs}) does not exists`)
            }
          })
      }
    })

    Promise.all(_exists)
      .then(resolve)
      .catch(reject)
  })
}

/**
 * merge settings with templates
 * create scripts contents
 * @method setup.parse
 * @param {object} settings
 */
setup.parse = function (settings) {
  const _templates = require('./templates.js')

  if (settings.env) {
    settings.envs = Object.keys(settings.env).map(function (key) {
      return 'Environment=' + key + '=' + settings.env[key] + '\n'
    }).join('')
  }
  settings.user = settings.user
    ? `User=${settings.user}`
    : ''
  settings.group = settings.group
    ? `Group=${settings.group}`
    : ''

  settings.date = (new Date()).toString()

  for (const _key in settings) {
    if (typeof settings[_key] === 'string') {
      settings[_key] = tools.string.template(settings[_key], settings, true)
    }
  }

  let _service = tools.string.template(_templates.engines[settings.engine].service, settings, true)
  let _start = tools.string.template(_templates.engines[settings.engine].start, settings)
  let _stop = tools.string.template(_templates.engines[settings.engine].stop, settings)
  let _logrotate = settings.logrotate ? tools.string.template(_templates.logrotate, settings) : ''

  return {
    service: _service,
    start: _start,
    stop: _stop,
    logrotate: _logrotate
  }
}

/**
 * write scripts and run commands to install the service
 * @method setup.addScripts
 * @param {object} settings
 * @param {object} contents scripts contents
 * @param {string} contents.start
 * @param {string} contents.stop
 * @param {string} contents.service
 * @return {Promise<void>}
 */
setup.addScripts = function (settings, contents) {
  let _service = path.join('/etc/systemd/system', `${settings.name}.service`)
  const _tasks = []

  if (contents.start) {
    _tasks.push(() => {
      let _start = path.join('/usr/local/bin', `systemd-${settings.name}-start`)
      log.info('', `write file ${_start}`)
      return fs.writeFile(_start, contents.start, 'utf8')
    })
  }

  if (contents.stop) {
    _tasks.push(() => {
      let _stop = path.join('/usr/local/bin', `systemd-${settings.name}-stop`)
      log.info('', `write file ${_stop}`)
      return fs.writeFile(_stop, contents.stop, 'utf8')
    })
  }

  if (contents.start || contents.stop) {
    _tasks.push(() => {
      let _cmd = `chmod a+x /usr/local/bin/systemd-${settings.name}*`
      log.info('', '>', _cmd)
      return exec(_cmd)
    })
  }

  _tasks.push(() => {
    log.info('', `write file ${_service}`)
    return fs.writeFile(_service, contents.service, 'utf8')
  })

  _tasks.push(() => {
    let _cmd = `systemctl enable ${_service};systemctl daemon-reload`
    log.info('', '>', _cmd)
    return exec(_cmd)
  })

  return Promise.each(_tasks, (task) => {
    return task()
  })
}

/**
 * ensure dirs for log files
 * @method setup.addLog
 * @param {object} settings
 * @return {Promise<void>}
 */
setup.addLog = function (settings) {
  const _tasks = []
  let _dirLog, _dirError
  if (settings.log) {
    _dirLog = path.dirname(settings.log)
    log.info('', `ensure dir ${_dirLog}`)
    _tasks.push(fs.ensureDir(_dirLog))
  }
  if (settings.error) {
    _dirError = path.dirname(settings.error)
    if (_dirError !== _dirLog) {
      log.info('', `ensure dir ${_dirError}`)
      _tasks.push(fs.ensureDir(_dirError))
    }
  }
  return Promise.all(_tasks)
}

/**
 * write logrotate conf script
 * @method setup.addLogrotate
 * @param {object} settings
 * @param {object} contents scripts contents
 * @param {string} contents.start
 * @param {string} contents.stop
 * @param {string} contents.service
 * @return {Promise<void>}
 */
setup.addLogrotate = function (settings, contents) {
  return new Promise((resolve, reject) => {
    if (!settings.logrotate) {
      resolve()
      return
    }
    const _file = path.join('/etc/logrotate.d/', settings.name)
    log.info('', `write logrotate file ${_file}`)
    fs.writeFile(_file, contents.logrotate, 'utf8')
      .then(resolve)
      .catch(reject)
  })
}

module.exports = setup
