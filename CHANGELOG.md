# CHANGELOG

v. 3.5.0

- upgrade to node v.10
- update dependencies
- update documentation, drop jsdoc

v. 3.4.0

- --help work without sudo [#5](https://github.com/braceslab/service-systemd/issues/5)

v. 3.3.0

- Add ``pm2`` as engine option

v. 3.2.0

- jsdoc documentation

v. 3.1.3

- Fix logrotate settings

v. 3.1.0

- Add support for module use

v. 3.0.0

- All settings can be passed by command line
- Settings can have pseudo-template string like {service} or {engine} es. engine.bin
- Renamed binary to ``service-systemd``
- Renamed settings from ``wrap`` to ``engine``
- Renamed settings from ``path`` to ``cwd``
- Renamed settings from ``script`` to ``app``
- Added settings: ``author`` and ``engine.args``
- Use ``logrotate`` settings on ``node`` and ``forever`` engines