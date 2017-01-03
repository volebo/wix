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
		cacheKiller  : Number(req.query.cacheKiller),     // The cacheKiller is there to ensure no caching of the iframe content by the host browser
		deviceType   : req.query.deviceType,              // "desktop" or "mobile"
		viewMode     : req.query.viewMode,                // "editor" or "site"

		compId       : req.query.compId,                  // Unique ID for the widget. The compId value for the app settings is always tpaSettings
		originCompId : req.query.originCompId || null,    // "editor" or "site"
	}

	debug('wix query-params', req.wix)

	return next()
}

/**
 * Create chain of middlewares for Wix v0, which will handle all wix requests
 *
 * @param  {Volebo.Express}   app  Volebo-express main application
 * @return {Array.<MW>}            Middleware/array of middlewares to handle WIX requests
 */
function wix0 (app) {

	const wixSecret = app.config.wix.v0.secret

	app.passport.use('wix0-authorize', new WixAppStrategy({
		secret: wixSecret,
		// TODO: check threshold!!!
		signDateThreshold: false
	}, function verifyCallback(req, instance, done) {

		const wixAppChallenge = {
			instanceId : instance.instanceId,
			componentId: req.wix.compId,
		}

		debug('verify callback called')
		debug('search for a wix-app:', wixAppChallenge)

		return app.model.Wix.Registered.find(wixAppChallenge)
			.then(wixAppData => {

				if (!wixAppData) {
					// not a registered application
					debug('not a known or registered WIX-application')
					return done(null, false)
				}

				wixAppData = wixAppData.toJSON()
				debug('wix registered app:', wixAppData)

				const account = {
					tour: wixAppData.tour || null
				}

				done(null, account)
				return
			})
			.catch(err => {
				done(err)
				return
			})
		;
	}))

	const authMw = app.passport.authorize('wix0-authorize', { session: false })
	const router = new vbexpress.Router()

	const commonRenderOptions = {
		layout: 'api-v0'
	};

	router.get('/game-previews/list', (req, res, next) => {

		req.lang.setLocale(req.wix.locale);
		res.locals.width = req.wix.width;

		app.model.Game.collection()
			.query('where', {tour: req.account.tour})
			.query('where', {game_state: 2})
			.fetch({
				withRelated: [
					'homeTeam', 'awayTeam', 'gym'
				]
			})
			.then(games => games.toJSON())
			.then(games => {
				res.locals.games = games
				return res.render('wix0/game-previews/list', commonRenderOptions)
			})
			.catch(e => {
				return next(e)
			})
	});

	router.get('/game-result/list', (req, res, next) => {

		req.lang.setLocale(req.wix.locale);
		res.locals.width = req.wix.width;

		app.model.Game.collection()
			.query('where', {tour: req.account.tour})
			.query('where', {game_state: 3})
			.fetch({
				withRelated: [
					'homeTeam', 'awayTeam', 'gym'
				]
			})
			.then(games => games.toJSON())
			.then(games => {
				res.locals.games = games
				return res.render('wix0/game-result/list', commonRenderOptions)
			})
			.catch(e => {
				return next(e)
			})
	});

	// App Settings request URL template
	router.get('/game-previews/settings', (req, res, next) => {
		// instance=[signed-instance]    The signed app instance
		// &width=[width]                The width of the iframe in pixels
		// &compId=tpaSettings
		// &origCompId=[origCompId]      The ID of the Widget component which associated with the App Settings
		// &locale=[locale]

		// res.locals.instance = req.;
		res.locals.width = req.wix.width;
		res.locals.compId = req.wix.compId;
		// res.locals.origCompId = req.wix.origCompId;
		res.locals.locale = req.wix.locale;

		res.render('wix0/game-previews/settings', commonRenderOptions);
	});

	const setHeaders = function setHeaders(req, res, next) {

		// TODO: security here:
		debug('set X-Frame-Options')
		res.set('X-Frame-Options', 'ALLOW-FROM http://maxkoryukov.wixsite.com/test')

		return next()
	}

	return [wixWidgetMw, authMw, setHeaders, router]
}

exports = module.exports = wix0;
