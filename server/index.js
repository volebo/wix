/*
Wix Integration service for volebo.net

Copyright (C) 2016  Volebo <volebo.net@gmail.com>
Copyright (C) 2016  Koryukov Maksim <maxkoryukov@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the MIT License, attached to this software package.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

You should have received a copy of the MIT License along with this
program. If not, see <https://opensource.org/licenses/MIT>.

http://spdx.org/licenses/MIT
*/

"use strict";

require('dotenv').config({silent: true});

const path            = require('path');
const url             = require('url');
const debug           = require('debug')('volebo:wix:index');
const vbexpress       = require('@volebo/volebo-express');

debug('initializing');

let options = require(path.join('..', 'etc', 'config.json'));

let app = vbexpress(options);

// TODO : move to options and use `path`. Do not use `server`
// because we will build the app, and move it to DIST
app.hbs.layoutsDir = 'server/views/layouts/';
app.hbs.partialsDir = 'server/views/partials/';
app.set('views', 'server/views/');

// Required for generating callback url for 3d side services
// ADVICE 1 : http://stackoverflow.com/a/10185427/1115187
// ADVICE 2 : http://stackoverflow.com/a/15922426/1115187
// TODO : need to refactor, it is not a clean solution:
app.getRootUrl = function() {

	return url.format({
		protocol: 'http',
		hostname: '127.0.0.1',
		port: app.config.server.port,
		pathname: '/'
	})

/*
	return url.format({
		protocol: req.protocol,
		host: req.get('host'),
		pathname: req.originalUrl
	})
*/
}

var wix0 = require('./routes/wix0')(app);
app.lang.use(wix0);

exports = module.exports = app;
