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

"use strict";

//const debug           = require('debug')('volebo:routes:wix0');
const wix             = require('wix');
const _               = require('lodash');

const vbexpress       = require('@volebo/volebo-express');

const __ = function(x) { return x; };


function wix0 (app) {

	let router = new vbexpress.Router();

	const commonRenderOptions = {
		layout: 'api-v0'
	};

	// TODO: use ENV
	wix.secret(app.config.wix.v0.secret);

	router.get('/games-list', (req, res, next) => {

		// extract query params
		let instance = req.query.instance;
		let width = Number(req.query.width || 0);
		let locale = req.query.locale;

		// parse encoded data
		// http://dev.wix.com/docs/infrastructure/app-instance/#instance-properties
		let instanceData = wix.parse(instance);

		if (! (instanceData && instanceData.instanceId)) {
			// not a WIX request!

			// TODO : #1 generate correct errors
			let err = new Error('Not a WIX request!');
			err.status = 400;
			return next(err);
		}

		res.helpers = {
			__ : __
		};

		res.lang.setLocale(locale);
		res.locals.width = width;

		app.model.Game.collection()
			.query('where', {tour: 97})
			.query('where', {game_state: 2})
			//.query('limit', 2)
			.fetch({
				withRelated: [
					'homeCrew', 'awayCrew', 'gym'
				]
			})
			.then( games => {

				games = _
					.chain(games.toJSON())
					.each( x=> {
						x.dateFrom = x.from_date;
						x.homeTeam = x.homeCrew;
						x.homeTeam.shortName = x.homeTeam.short_name || x.homeTeam.name;
						if (x.homeTeam.short_name) {
							x.homeTeam.fullName = x.homeTeam.name;
						}

						x.awayTeam = x.awayCrew;
						x.awayTeam.shortName = x.awayTeam.short_name || x.awayTeam.name;
						if (x.awayTeam.short_name) {
							x.awayTeam.fullName = x.awayTeam.name;
						}
					})
					.value();

				res.locals.games = games;

				// debug
				res.locals.locale = locale;
				res.locals.data = instanceData;

				res.render('wix/games-list', commonRenderOptions);
			})
			.catch(e => next(e));
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

		res.render('wix/settings', commonRenderOptions);
	});

	return router;
}

exports = module.exports = wix0;
