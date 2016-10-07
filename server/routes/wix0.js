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
const wix             = require('wix');

function wix0 (expressApp) {

	let router = new vbexpress.Router();

	// TODO: use ENV
	wix.secret(expressApp.config.wix.secret);

	// GET /games-list?
	//	cacheKiller=1475708149032&
	//	compId=comp-itxihrc1&
	//	deviceType=desktop&
	//	instance=Q5zpKbzozdmm6MBoCmaBL3l5zi6EM5JlDOcmB8R4mwU.eyJpbnN0YW5jZUlkIjoiM2ZjYjdhYjMtZWI4MC00ODZkLWIzNmMtNDgwMzRlYzU3ODRmIiwic2lnbkRhdGUiOiIyMDE2LTEwLTA1VDIyOjU1OjQxLjY5OFoiLCJ1aWQiOm51bGwsImlwQW5kUG9ydCI6IjUuMTg5Ljg1LjE4Mi81NDQwNCIsInZlbmRvclByb2R1Y3RJZCI6bnVsbCwiZGVtb01vZGUiOmZhbHNlLCJhaWQiOiJmZGE1ZWI1My1hOGU0LTRjYWUtYWY3Mi1jMTA3M2EwMjg2MTYiLCJzaXRlT3duZXJJZCI6IjE1MDM5Yzc1LWJkNTItNGQ5ZC04OTZiLTU4YWNlN2Q4Yzg5MCJ9&
	//	locale=ru&
	//	viewMode=site&
	//	width=1172
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

		// 1 extract query params
		let instance = req.query.instance;
		let width = Number(req.query.width || 0);
		let locale = req.query.locale;

		// parse encoded data
		// http://dev.wix.com/docs/infrastructure/app-instance/#instance-properties
		debug(wix.secret());
		let instanceData = wix.parse(instance);

		if (! (instanceData && instanceData.instanceId)) {
			// not a WIX request!

			// TODO : #1 generate correct errors
			let err = new Error('Not a WIX request!');
			err.status = 400;
			return next(err);
		}

		res.locals.locale = locale;
		res.locals.data = instanceData;

		req.lang.setLocale(locale);

		res.locals.width = width;
		res.locals.games = [{
			dateFrom: new Date(2016, 1, 18, 22, 13),
			homeTeam: {
				name: 'A'
			},
			awayTeam: {
				name: 'B'
			},

			gym: {
				name: 'gym'
			}
		}, {
			dateFrom: new Date(2016, 1, 14, 22, 13),
			homeTeam: {
				name: 'ОКБ АВТОМАТИКА'
			},
			awayTeam: {
				name: 'АЙТИЭМ ХОЛДИНГ - УрИ ГПС МЧС [F]'
			},

			gym: {
				name: 'AVS-ОТЕЛЬ'
			},

			referee: {
				nameShort: 'Карташев И. В.',
				nameFull: 'Карташев Игорь Витальевич'
			}
		}];

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
