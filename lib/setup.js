'use strict'

const path = require('path')
const log = require('log-segment')
const commander = require('commander')
// const Promise = require('bluebird')
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
  log.success('service-systemd', message)
}

/**
 * print error message
 * @method setup.fail
 * @param {string} message
 */
setup.fail = function (message) {
  log.error('service-systemd', message)
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
 * @return {string}
 */
setup.add = async function (settings) {
  setup.checkSettings(settings)
  const _contents = setup.parse(settings)
  await setup.checkPaths(settings)
  await setup.addLog(settings, _contents)
  await setup.addScripts(settings, _contents)
  await setup.addLogrotate(settings, _contents)
  return `service ${settings.name} installed`
}

/**
 * remove the service
 * @method setup.remove
 * @param {string} service service name
 * @return {string}
 */
setup.remove = async function (service) {
  if (!service) {
    throw new Error('Missing argument: service name')
  }

  const _cmd = `systemctl disable ${service}.service`
  log.info('service-systemd', '>', _cmd)
  await exec(_cmd)

  let _file = path.join('/etc/systemd/system', `${service}.service`)
  log.info('service-systemd', `remove ${_file}`)
  await tools.fs.unlink(_file, true)

  _file = path.join('/usr/local/bin', `systemd-${service}-start`)
  log.info('service-systemd', `remove ${_file}`)
  await tools.fs.unlink(_file, true)

  _file = path.join('/etc/logrotate.d', service)
  log.info('service-systemd', `remove ${_file}`)
  await tools.fs.unlink(_file, true)
  return `service ${service} uninstalled`
}

/**
 * load settings merged with cli arguments
 * @method setup.settings
 * @param {Commander} commander instance
 * @return {object} settings
 */
setup.settings = function (commander) {
  const _settings = {}

  let _file = {}
  if (commander.settings) {
    try {
      _file = require(path.resolve(commander.settings))
    } catch (e) {
      log.warning('service-systemd', `can't load settings file ${commander.settings}`)
    }
  }

  for (const option in SETTINGS) {
    if (commander[option] && typeof commander[option] !== 'function' && commander[option].length > 0) {
      _settings[option] = commander[option]
    } else if (_file[option]) {
      _settings[option] = _file[option]
    } else {
      _settings[option] = SETTINGS[option].default
    }
  }
  _settings.service = commander.service

  // log.verbose(_settings)
  return _settings
}

/**
 * check mandatories params and paths
 * @method setup.checkSettings
 * @param {object} settings
 */
setup.checkSettings = function (settings) {
  if (!settings.name) {
    settings.name = settings.service
  }

  delete settings.service

  const _paths = []
  for (const option in SETTINGS) {
    const _option = SETTINGS[option]
    if (_option.mandatory && !settings[option]) {
      throw new Error(`Missing ${option} in settings file or arguments`)
    }
    if (_option.fs) {
      settings[option] = path.resolve(settings[option])
    }
  }
}

/**
 * check mandatories params and paths
 * @method setup.checkPaths
 * @param {object} settings
 */
setup.checkPaths = async function (settings) {
  const _exists = []
  for (const option in SETTINGS) {
    const _option = SETTINGS[option]
    if (_option.fs) {
      _exists.push((async () => {
        const exists = await tools.fs.exists(settings[option])
        if (!exists) {
          throw Error(`path ${settings[option]} (${option}) does not exists`)
        }
      })())
    }
  }

  await Promise.all(_exists)
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
    settings.envs = ''
    for (const key in settings.env) {
      settings.envs += 'Environment=' + key + '=' + settings.env[key] + '\n'
    }
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

  const _service = tools.string.template(_templates.engines[settings.engine].service, settings, true)
  const _start = tools.string.template(_templates.engines[settings.engine].start, settings, true)
  const _stop = tools.string.template(_templates.engines[settings.engine].stop, settings, true)
  const _logrotate = settings.logrotate ? tools.string.template(_templates.logrotate, settings, true) : ''

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
 */
setup.addScripts = async function (settings, contents) {
  const _service = path.join('/etc/systemd/system', `${settings.name}.service`)
  const _tasks = []

  if (contents.start) {
    _tasks.push(() => {
      const _start = path.join('/usr/local/bin', `systemd-${settings.name}-start`)
      log.info('service-systemd', `write file ${_start}`)
      return fs.writeFile(_start, contents.start, 'utf8')
    })
  }

  if (contents.stop) {
    _tasks.push(() => {
      const _stop = path.join('/usr/local/bin', `systemd-${settings.name}-stop`)
      log.info('service-systemd', `write file ${_stop}`)
      return fs.writeFile(_stop, contents.stop, 'utf8')
    })
  }

  if (contents.start || contents.stop) {
    _tasks.push(() => {
      const _cmd = `chmod a+x /usr/local/bin/systemd-${settings.name}*`
      log.info('service-systemd', '>', _cmd)
      return exec(_cmd)
    })
  }

  _tasks.push(() => {
    log.info('service-systemd', `write file ${_service}`)
    return fs.writeFile(_service, contents.service, 'utf8')
  })

  _tasks.push(() => {
    const _cmd = `systemctl enable ${_service};systemctl daemon-reload`
    log.info('service-systemd', '>', _cmd)
    return exec(_cmd)
  })

  for (const _task of _tasks) {
    await _task()
  }
}

/**
 * ensure dirs for log files
 * @method setup.addLog
 * @param {object} settings
 */
setup.addLog = async function (settings) {
  const _tasks = []
  let _dirLog, _dirError
  if (settings.log) {
    _dirLog = path.dirname(settings.log)
    log.info('service-systemd', `ensure dir ${_dirLog}`)
    _tasks.push(fs.ensureDir(_dirLog))
  }
  if (settings.error) {
    _dirError = path.dirname(settings.error)
    if (_dirError !== _dirLog) {
      log.info('service-systemd', `ensure dir ${_dirError}`)
      _tasks.push(fs.ensureDir(_dirError))
    }
  }
  await Promise.all(_tasks)
}

/**
 * write logrotate conf script
 * @method setup.addLogrotate
 * @param {object} settings
 * @param {object} contents scripts contents
 * @param {string} contents.start
 * @param {string} contents.stop
 * @param {string} contents.service
 */
setup.addLogrotate = async function (settings, contents) {
  if (!settings.logrotate) {
    return
  }
  const _file = path.join('/etc/logrotate.d/', settings.name)
  log.info('service-systemd', `write logrotate file ${_file}`)
  await fs.writeFile(_file, contents.logrotate, 'utf8')
}

module.exports = setup
