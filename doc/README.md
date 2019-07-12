# service-systemd

- [Installing](#installing)
- [Getting Started](#getting-started)
- [Methods](#methods)
- [Bin](#bin)
- [Module](#module)
- [Settings](#settings)
- [OS](#os)

---

# Installing

````bash
$ npm i -g service-systemd
````

# Getting Started

- Install service

  + pass settings in command line
  ````bash
  $ sudo service-systemd -a -n my-service -c /path/to/service -A app.js
  ````

  + pass all settings in JSON file
  ````bash
  $ sudo service-systemd -a -s service.json
  ````

- Uninstall service

````bash
$ sudo service-systemd -r -n myservice
````

# Methods

````bash
$ sudo service-systemd [method] [settings]
````

``service-systemd`` has 2 method: ``add`` and ``remove``.

- **add**  
  add the service, provide settings

- **remove**  
  remove the service, provide service name

  ````bash
  $ sudo service-systemd -r -n myservice
  $ sudo service-systemd --remove --service myservice
  ````

# Bin

````bash
$ sudo service-systemd --help

-h, --help                             output usage information
-V, --version                          output the version number

-a, --add                              Add the service
-r, --remove                           Remove the service
-s, --settings [file]                  Service settings file
-n, --service [name]                   Service name
-d, --description [description]        Service description, default {name} service
-k, --author [author]                  Service author
-u, --user [user]                      User to run service as
-g, --group [group]                    Group to run service as
-A, --app [app]                        Application main file, default main.js
-c, --cwd [path]                       Application cwd
-p, --app.args [args]                  Application arguments
-e, --env [NAME=VALUE]                 Environment variables to set in systemd job
-P, --pid [file]                       Service pid file, default /var/run/{name}.pid
-L, --log [file]                       Service log file, default /var/log/{name}/log
-E, --error [file]                     Service error file, default /var/log/{name}/error
-X, --engine [node|forever|pm2]        Service engine (node|forever|pm2), default node
-b, --engine.bin [bin]                 Service engine bin, default /usr/bin/{engine}
-t, --engine.args [eargs]              Service engine args
-L, --logrotate                        Add logrotate config
-R, --logrotate.rotate [rotate]        Logrotate rotations, default 10
-F, --logrotate.frequency [frequency]  Logrotate frequency, default daily
````

# Module

Use ``service-systemd`` into a node.js application as module

````js
const service = require('service-systemd')
````

### API

#### add

````js
.add(settings)
````

settings is the same as the JSON file

Example  
````js
try {
  await service.add({
    name: 'my-node-service',
    cwd: '/path/to/app',
    app: 'main.js',
    env: {
      PORT: 3002,
    }
  })
  console.log('my-node-service installed')
} catch (error) {
  console.error('something wrong', error.toString())
}
````

#### remove

````js
.remove(name)
````

Example  
````js
try {
  await service.remove('my-node-service')
  console.log('my-node-service removed')
} catch (error) {
  console.error('something wrong', error.toString())
}

````

# Settings

Settings can be passed by command-line or into JSON file.  
Each param can be in both inputs; if so, the one in command-line override the respective from the JSON file.

- **File**  
Service settings file  
command-line ``-s, --settings [file]``

- **Name**
Service name  
command-line ``-n, --service [name]``  
json ``"name": "name"``

- **Description**  
Service description  
default "{name} service"  
command-line ``-d, --description [description]``  
json ``"description": "{name} service"``

- **Author**  
Service author  
command-line ``-k, --author [author]``  
json ``"author": "author"``

- **User**  
User to run service as  
command-line ``-u, --user [user]``  
json ``"user": "user"``

- **Group**  
Group to run service as  
command-line ``-g, --group [group]``  
json ``"group": "group"``

- **Application**  
Application main file  
default "main.js"  
command-line ``-A, --app [app]``  
json ``"app": "main.js"``

- **Application working directory (cwd)**  
Application working directory  
command-line ``-c, --cwd [path]``  
json ``"cwd": "/path/to"``

- **Application arguments**  
Arguments to pass to application file  
command-line ``-p, --app.args [args]``  
json ``"app.args": "arg1 arg2 arg3"``

- **Environment variables**  
Environment variables to set in systemd job  
command-line ``-e, --env [NAME=VALUE]``   
json ``"env": {"VAR1": 1, "VAR2": "value2"}``

- **PID**  
Service pid file  
default "/var/run/{name}.pid"  
command-line ``-P, --pid [file]``  
json ``"pid": "/path/to/pid"``

- **Log file**  
Service log file  
default "/var/log/{name}/log"  
command-line ``-L, --log [file]``  
json ``"log": "/path/to/log"``

- **Error file**  
Service error file  
default "/var/log/{name}/error"  
command-line ``-E, --error [file]``  
json ``"error": "/path/to/error"``

- **Engine**  
Service engine (node|forever|pm2)  
default "node"  
command-line ``-X, --engine [node|forever|pm2]``  
json ``"engine": "node|forever|pm2"``  

  - **"engine": "node"**  
  Use node to run your application.  
  *Remember to manage logs inside your application*.  

  - **"engine": "forever"**  
  Using [forever](http://github.com/foreverjs/forever) allow to use its own tools, like monitoring or redirect stdout and stderr into log files.  
  Obviously, you need ``forever`` globally installed.  
  You may also have to specify bin path in ``engine.bin`` (see below) options as  ``/usr/local/bin/forever``.

  - **"engine": "pm2"**  
  With [pm2](http://pm2.keymetrics.io/) you can use its tools like monitoring, log file or clustering.  
  Obviously, you need ``pm2`` globally installed.  
  You may also have to specify bin path in ``engine.bin`` (see below) options as  ``/usr/local/bin/pm2``.

- **Engine bin**  
Service engine binary  
Declare if different from tipical ``/usr/bin/{engine}`` - may be ``/usr/local/bin/{engine}``  
default "/usr/bin/{engine}"  
command-line ``-b, --engine.bin [bin]``  
json ``"engine.bin": "/path/to/bin"``

- **Engine args**  
Service engine args  
Supply additional arguments to engine (``forever`` or ``node`` or ``pm2``).
On command line, should be something like (note spaces) ``-t " --arg1 v1 -arg2"``  
command-line ``-t, --engine.args [eargs]``  
json ``"engine.args": "--arg1 v1 -arg2"``

- **Logrotate**  
Add logrotate config  
Will be written a logrotate file as {name}.conf in logrotate config dir ``/etc/logrotate.d``.  
default "false"  
command-line ``-l, --logrotate``  
json ``"logrotate": true|false``

- **Logrotate rotate**  
Logrotate rotations  
See logrotate documentation for further details.  
default 10  
command-line ``-R, --logrotate.rotate [rotate]``  
json ``"logrotate.rotate": 1``

- **Logrotate frequency**  
Logrotate frequency  
See logrotate documentation for further details.  
default "daily"  
command-line ``-F, --logrotate.frequency [frequency]``  
json ``"logrotate.frequency": "daily"``

# Examples

## Using JSON file settings

See the template files in [test/samples/settings](./test/samples/settings)  
Collect all settings in a JSON file and pass via command-line.

````bash
$ sudo service-systemd -a -s file.json
````

### JSON file settings examples

- minimal

````json
{
  "name": "my-node-service",
  "description": "an amazing service",
  "cwd": "/node/my-node-service/",
  "user": "www-data",
  "group": "www-data",
  "app": "main.js",
  "logrotate": true
}
````

- full featured

````json
{
  "name": "my-node-service",
  "description": "an amazing service",
  "author": "John Smith",
  "cwd": "/node/my-node-service/",
  "user": "www-data",
  "group": "www-data",
  "env": {
    "PORT": "3001",
    "ENV": "alpha"
  },
  "app": "main.js",
  "app.args": "-debug",
  "pid": "/var/run/my-node-service.pid",
  "log": "/var/log/my-node-service/log",
  "error": "/var/log/my-node-service/error",
  "engine": "node",
  "engine.args": "--harmony",
  "logrotate": true,
  "logrotate.rotate": "1",
  "logrotate.frequency": "weekly"
}
````

- with forever engine

````json
{
  "name": "my-node-service",
  "description": "an amazing service",
  "author": "John Smith",
  "cwd": "/node/my-node-service/",
  "user": "www-data",
  "group": "www-data",
  "app": "main.js",
  "pid": "/var/run/my-node-service.pid",
  "log": "/var/log/my-node-service/log",
  "error": "/var/log/my-node-service/error",
  "engine": "forever",
  "logrotate": true,
}
````

### Using settings in command-line

- minimal

````bash
$ sudo service-systemd -a -n my-service -c /path/to/service
````

- basic

````bash
$ sudo service-systemd -a -n my-service -c /path/to/service \
  -L false -k "John Doe" -e PORT=5543 -X forever
````

- long name arguments

````bash
$ sudo service-systemd --add --service my-service \
  --cwd /path/to/service --logrotate false \
  --author "John Doe" --env PORT=5543 --engine forever
````

### Using settings in command-line and JSON

Use a settings JSON and override some params

````bash
$ sudo service-systemd -a -s file.json -e PORT=23456 -p debug
````


# OS

The package is tested on @todo
- Debian 8.x
- Ubuntu 16.x

Should also work in every linux distribution that support ``systemd`` and ``nodejs``.
