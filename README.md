# service-systemd

[![NPM Version](http://img.shields.io/npm/v/service-systemd.svg?style=flat)](https://www.npmjs.org/package/service-systemd)
[![NPM Downloads](https://img.shields.io/npm/dm/service-systemd.svg?style=flat)](https://www.npmjs.org/package/service-systemd)

[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Purpose

Setup a node.js app as `systemd` service. 

Sometimes you just want an "old style" daemon for tiny services or small devices like a RaspberryPi

## Installing

````bash
npm i -g service-systemd
````

### Quick start

- Install service

  + pass settings in command line (see full [documentation](./doc/README.md) for all options)
  ````bash
  sudo service-systemd -a -n my-service -c /path/to/service -A main.js
  ````

  + pass all settings in JSON file
  ````bash
  sudo service-systemd -a -s service.json
  ````

- Run the service

````bash
sudo service my-service start
sudo service my-service stop
sudo service my-service restart
````

- Uninstall service

````bash
sudo service-systemd -r -n my-service
````

## Programmatic usage

````js
const service = require('service-systemd')

// add service

try {
  await service.add({
    name: 'my-service',
    cwd: '/path/to/app',
    app: 'main.js',
    env: {
      PORT: 3002,
    }
  })
  console.log('my-service installed')
} catch (error) {
  console.error('something wrong', error)
}

// remove service

try {
  await service.remove('my-service')
  console.log('my-service removed')
} catch (error) {
  console.error('something wrong', error)
}

````

## Engines

App can run using engines: ``node`` (default), [forever](https://github.com/foreverjs/forever), [pm2](http://pm2.keymetrics.io). With ``forever`` and ``pm2`` you can use their options and tools.

## Documentation

See [documentation](./doc/README.md) for further informations.

## Changelog

See [changelog](./CHANGELOG.md).

## TODO

- [ ] test suite
- [ ] show examples in `--help`
- [ ] replace `commander` with `yargs` and rename args
- [ ] add `EnvironmentFile`
- [ ] get `bin/node` location by `which node`
- [ ] run multiple instances
- [ ] rollback on error
- [ ] check if `systemd` is on board
- [ ] ? drop `fs-extra` and use `fs.promises`

---

### Thanks to

[Chris Lea](https://github.com/chrislea) for these articles
- https://nodesource.com/blog/running-your-node-js-app-with-systemd-part-1
- https://nodesource.com/blog/running-your-node-js-app-with-systemd-part-2

Similar package  
- [strong-service-systemd](https://github.com/strongloop/strong-service-systemd)

## License

The MIT License (MIT)

Copyright (c) 2017-2019, [braces lab](https://braceslab.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
