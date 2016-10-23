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

const Wix0            = require('./routes/wix0');

debug('initializing');

let options = vbexpress.Config.readJson(path.join(__dirname, 'config', 'config.json'));

let app = vbexpress(options);

// TODO : move to options and use `path`. Do not use `server`
// because we will build the app, and move it to DIST
app.hbs.layoutsDir = 'server/views/layouts/';
app.hbs.partialsDir = 'server/views/partials/';
app.set('views', 'server/views/');

var wix0 = Wix0(app);
app.lang.use('/api/v0', wix0);

exports = module.exports = app;
