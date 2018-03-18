/**
 * LIFX Javascript SDK v0.0.1
 * Copyright (c) 2018 Levi Cole
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */

module.exports = function Lifx(authorisation_token) {
	const $		= window.$ || window.jQuery || false;
	const self	= this;

	self.base_url	= 'https://api.lifx.com/v1/';
	self.token		= authorisation_token;

	/**
	 * Check for dependencies
	 */
	if (!$) { throw 'jQuery is required for Lifx()'; }
	if (!self.token) { throw 'An API Authorization token is required. See: https://api.developer.lifx.com/docs/authentication'; }


	/* API helpers
	-------------------------------------------------------- */

	/**
	 * Store all API helper functions
	 * @type {Object}
	 */
	self.api = {};

	/**
	 * Base API call function, handles request
	 * @param	{string}	method		Accepts; POST, GET, PUT, DELETE
	 * @param	{string}	endpoint	E.g. '/id:XXXXXXX/state'
	 * @param	{mixed}		params		Can be object or string
	 * @param	{string}	prefix		If the request endpoint should be prefixed
	 * @return	{Promise}
	 */
	self.api.call = function(method, endpoint, params, prefix) {

		// Defaults
		endpoint	= endpoint.replace(/^(\/)/, '');
		params		= params ? params : {};
		prefix		= typeof prefix === 'string' ? prefix : 'lights/'

		// Remove blank parameters
		if (typeof params === 'object') {
			for (var key in params) {
				if (!params[key]) {
					delete params[key];
				}
			}
		}


		// Return promise
		return new Promise((resolve, reject) => {
			$.ajax({
				url: self.base_url+($.trim(prefix) ? prefix : '/')+endpoint,
				type: method,
				data: params,
				headers: {
					Authorization: 'Bearer '+self.token
				}
			}).then(function(response) {
				resolve(response);
			}, function(errors) {
				reject(errors);
			});
		});
	};

	/**
	 * POST alias of self.api.call()
	 * @param	{string}	endpoint
	 * @param	{mixed}		data
	 * @param	{string}	prefix
	 * @return	{Promise}
	 */
	self.api.post = function(endpoint, data, prefix) {
		return self.api.call('post', endpoint, data);
	};

	/**
	 * GET alias of self.api.call()
	 * @param	{string}	endpoint
	 * @param	{mixed}		data
	 * @param	{string}	prefix
	 * @return	{Promise}
	 */
	self.api.get = function(endpoint, data, prefix) {
		return self.api.call('get', endpoint, data);
	};

	/**
	 * PUT alias of self.api.call()
	 * @param	{string}	endpoint
	 * @param	{mixed}		data
	 * @param	{string}	prefix
	 * @return	{Promise}
	 */
	self.api.put = function(endpoint, data, prefix) {
		return self.api.call('put', endpoint, data);
	};

	/* Ad-hoc helpers
	-------------------------------------------------------- */
	const validate_selector = (selector) => {
		selector = typeof selector === 'string' ? selector : 'all';
		selector.replace(/^(\/)/, '').replace(/$(\/)/, '');

		return selector;
	};

	/* Endpoint helpers
	-------------------------------------------------------- */

	/**
	 * Get a list of lights determined by the selector
	 * @param	{string}	selector	The selector to limit which light information is returned. Default 'all'
	 * @return	{Promise}
	 * @see		https://api.developer.lifx.com/docs/list-lights
	 */
	self.list_lights = (selector) => {
		selector = validate_selector(selector);

		return self.api.get(selector);
	};

	/**
	 * Set the state of a lights determined by the selector
	 * @param	{string}	selector	The selector to limit which light information is returned. Default 'all'
	 * @param	{object}	params
	 * @return	{Promise}
	 * @see		https://api.developer.lifx.com/docs/set-state
	 */
	self.set_state = (selector, params) => {
		selector = validate_selector(selector);

		let data = $.extend({
			power:		'on',	// string	The power state you want to set on the selector. on or off
			color:		'',		// string	The color to set the light to. @see https://api.developer.lifx.com/v1/docs/colors
			brightness:	null,	// double	The brightness level from 0.0 to 1.0. Overrides any brightness set in color (if any).
			duration:	null,	// double	How long in seconds you want the power action to take. Range: 0.0 – 3155760000.0 (100 years)
			infrared:	null	// double	The maximum brightness of the infrared channel.
		}, params || {});

		return self.api.put(selector+'/state', data);
	};

	/**
	 * Bulk set states
	 * @param	{array}		states		Array of state hashes as per Set State. No more than 50 entries.
	 * @param	{object}	defaults	Default values to use when not specified in each states[] object.
	 * @return	{Promise}
	 * @see		https://api.developer.lifx.com/docs/set-states
	 */
	self.set_states = (states, defaults) => {
		return self.api.put('states', {
			states:		states || [],
			defaults:	defaults || {}
		});
	};

	/**
	 * TODO: This function is pending
	 * @param	{string}	selector	The selector to limit which light information is returned. Default 'all'
	 * @return	{throw}
	 * @see		https://api.developer.lifx.com/docs/state-delta
	 */
	self.state_delta = (selector) => {
		selector = validate_selector(selector);

		throw 'This function is currently not available.';
	};

	/**
	 * Toggle power to lights defined by selector
	 * @param	{string}	selector	The selector to limit which light information is returned. Default 'all'
	 * @param	{object}	params
	 * @return	{Promise}
	 */
	self.toggle_power = (selector, params) => {
		selector = validate_selector(selector);

		let data = $.extend({
			duration: null	// double	The time is seconds to spend performing the power toggle.
		}, params || {});

		return self.api.post(selector+'/toggle', data);
	};

	/**
	 * Performs a breathe effect by slowly fading between the given colors. Use the parameters to tweak the effect.
	 * @param	{string}	selector	The selector to limit which light information is returned. Default 'all'
	 * @param	{object}	params
	 * @return	{Promise}
	 * @see		https://api.developer.lifx.com/docs/breathe-effect
	 */
	self.breath_effect = (selector, params) => {
		selector = validate_selector(selector);

		let data = $.extend({
			color:		'',		// string	The color to use for the breathe effect. @see https://api.developer.lifx.com/v1/docs/colors
			from_color:	'',		// string	The color to start the effect from. If this parameter is omitted then the color the bulb is currently set to is used instead.
			period:		null,	// double	The time in seconds for one cyles of the effect.
			cycles:		null,	// double	The number of times to repeat the effect.
			persist:	false,	// boolean	If false set the light back to its previous value when effect ends, if true leave the last effect color.
			power_on:	true,	// boolean	If true, turn the bulb on if it is not already on.
			peak:		null	// double	Defines where in a period the target color is at its maximum. Minimum 0.0, maximum 1.0.
		}, params || {});

		return self.api.post(selector+'/effects/breathe', data);
	};

	/**
	 * Performs a pulse effect by quickly flashing between the given colors. Use the parameters to tweak the effect.
	 * @param	{string}	selector	The selector to limit which light information is returned. Default 'all'
	 * @param	{object}	params
	 * @return	{Promise}
	 * @see		https://api.developer.lifx.com/docs/pulse-effect
	 */
	self.pulse_effect = (selector, params) => {
		selector = validate_selector(selector);

		let data = $.extend({
			color:		'',		// string	The color to use for the pulse effect. @see https://api.developer.lifx.com/v1/docs/colors
			from_color:	'',		// string	The color to start the effect from. If this parameter is omitted then the color the bulb is currently set to is used instead.
			period:		null,	// double	The time in seconds for one cyles of the effect.
			cycles:		null,	// double	The number of times to repeat the effect.
			persist:	false,	// boolean	If false set the light back to its previous value when effect ends, if true leave the last effect color.
			power_on:	true	// boolean	If true, turn the bulb on if it is not already on.
		}, params || {});

		return self.api.post(selector+'/effects/pulse', data);
	};

	/**
	 * Make the light(s) cycle to the next or previous state in a list of states.
	 * @param	{string}	selector	The selector to limit which light information is returned. Default 'all'
	 * @param	{object}	params
	 * @return	{Promise}
	 * @see		https://api.developer.lifx.com/docs/cycle
	 */
	self.cycle = (selector, params) => {
		selector = validate_selector(selector);

		let data = $.extend({
			states:		[],			// array	Array of state hashes as per Set State. Must have 2 to 5 entries.
			defaults:	{},			// object	Default values to use when not specified in each states[] object.
			direction:	'forward'	// string	Direction in which to cycle through the list. Can be forward or backward
		}, params || {});

		return self.api.post(selector+'/cycle', data);
	};

	/**
	 * Lists all the scenes available in the users account
	 * @return	{Promise}
	 * @see		https://api.developer.lifx.com/docs/list-scenes
	 */
	self.list_scenes = () => {
		return self.api.get('scenes', false, '');
	};

	/**
	 * Activates a scene from the users account
	 * @param	{string}	scene_uuid	The UUID for the scene you wish to activate
	 * @param	{object}	params
	 * @return	{Promise}
	 * @see		https://api.developer.lifx.com/docs/activate-scene
	 */
	self.activate_scene = (scene_uuid, params) => {

		let data = $.extend({
			duration:	null,	// double	The time in seconds to spend performing the scene transition.
			ignore:		[],		// array	Any of "power", "infrared", "duration", "intensity", "hue", "saturation", "brightness" or "kelvin", specifying that these properties should not be changed on devices when applying the scene.
			overrides:	{}		// object	 state object as per Set State specifying properties to apply to all devices in the scene, overriding those configured in the scene.
		}, params || {});

		return self.api.put('scenes/'+scene_uuid+'/activate', data, '');
	};

	/**
	 * Validate a color string
	 * @param	{string}	color	Color string you'd like to validate
	 * @return	{Promise}
	 * @see		https://api.developer.lifx.com/docs/validate-color
	 */
	self.validate_color = (color) => {
		return self.api.get('color', {
			string: color
		}, '');
	};

}