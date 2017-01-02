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

const debug           = require('debug')('volebo:www-wix:routes:wix0')
const _               = require('lodash')
const vbexpress       = require('@volebo/volebo-express')
const WixAppStrategy  = require('passport-wix-app').Strategy

function wixWidgetMw(req, res, next) {

	req.wix = {
//		instance     : req.query.instance,                // The signed app instance
		width        : Number(req.query.width || 0),      // The width of the iframe in pixels
		locale       : req.query.locale,                  // Current locale value
		cacheKiller  : Number(req.query.cacheKiller),
		deviceType   : req.query.deviceType,              // "desktop" or "mobile"
		viewMode     : req.query.viewMode,                // "editor" or "site"

		compId       : req.query.compId,                  // The compId value for the app settings is always tpaSettings
		originCompId : req.query.originCompId || null,    // "editor" or "site"
	}

	debug(req.wix)

	return next()
}

/**
 * Create chain of middlewares for Wix v0, which will handle all wix requests
 *
 * @param  {Volebo.Express}   app  Volebo-express main application
 * @return {Array.<MW>}            Middleware/array of middlewares to handle WIX requests
 */
function wix0 (app) {

	app.passport.use('wix0', new WixAppStrategy({
		secret: app.config.wix.v0.secret
	}, function verifyCallback(instance, done) {
		const user = instance.instanceId

debug('verify callback', instance)

		return done(null, user)
	}))

	const authMw = app.passport.authenticate('wix0', { session: false })
	const router = new vbexpress.Router();

	const commonRenderOptions = {
		layout: 'api-v0'
	};

	router.get('/games-list', (req, res, next) => {
		// extract query params

console.log('cccccccccccccccccccccccccc', req.user)

		req.lang.setLocale(req.wix.locale);
		res.locals.width = req.wix.width;

		app.model.Game.collection()
			.query('where', {tour: 97})
			.query('where', {game_state: 2})
			//.query('limit', 2)
			.fetch({
				withRelated: [
					'homeTeam', 'awayTeam', 'gym'
				]
			})
			.then(games => games.toJSON())
			.then(games => {
				res.locals.games = games
				return res.render('wix0/games-list', commonRenderOptions)
			})
			.catch(e => {
				return next(e)
			})
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

		res.render('wix0/settings', commonRenderOptions);
	});

	return [authMw, wixWidgetMw, router]
}

exports = module.exports = wix0;
