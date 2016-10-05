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

const debug           = require('debug')('volebo:routes:wix0');
const vbexpress       = require('@volebo/volebo-express');

function wix0 (/*expressApp*/) {

	let router = new vbexpress.Router();

	// games-list widget URL template
	router.get('/games-list', (req, res, next) => {
		// instance=[signed-instance]    The signed app instance
		// &width=[width]                The width of the iframe in pixels
		// &cacheKiller=[cacheKiller]
		// &compId=[compId]              The compId value for the app settings is always tpaSettings
		// &viewMode=[viewMode]
		// &locale=[locale]
		// &originCompId[originCompId]
		// &deviceType=[device]

		res.locals.instance = req.query.instance;
		res.locals.width = req.query.width;

		res.locals.locale = req.query.locale;

		res.render('wix/games-list');
	});

	// App Settings request URL template
	router.get('/settings', (req, res, next) => {
		// instance=[signed-instance]    The signed app instance
		// &width=[width]                The width of the iframe in pixels
		// &compId=tpaSettings
		// &origCompId=[origCompId]      The ID of the Widget component which associated with the App Settings
		// &locale=[locale]

		res.locals.instance = req.query.instance;
		res.locals.width = req.query.width;
		res.locals.compId = req.query.compId;
		res.locals.origCompId = req.query.origCompId;
		res.locals.locale = req.query.locale;

		res.render('wix/settings');
	});

	return router;
}

exports = module.exports = wix0;
