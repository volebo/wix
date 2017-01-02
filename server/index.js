/*

Wix Integration service for volebo.net

Copyright (C) 2016-2017 Volebo <dev@volebo.net>
Copyright (C) 2016-2017 Koryukov Maksim <maxkoryukov@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

'use strict'

require('dotenv').config({silent: true})

const path            = require('path')
const debug           = require('debug')('volebo:www-wix:server')
const vbexpress       = require('@volebo/volebo-express')

const Wix0Router      = require('./routes/wix0')

debug('initializing')

const options = vbexpress.Config.readYaml(path.join(__dirname, 'www-wix.config.yml'))

const app = vbexpress(options)

// TODO : move to options and use `path`. Do not use `server`
// because we will build the app, and move it to DIST
app.hbs.layoutsDir = path.join(__dirname, 'views', 'layouts')
app.hbs.partialsDir = path.join(__dirname, 'views', 'partials')
app.set('views', path.join(__dirname, 'views'))

app.lang.use('/wix/v0', new Wix0Router(app))

exports = module.exports = app
