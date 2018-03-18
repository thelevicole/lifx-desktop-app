const Lifx = require('./Lifx.js');

(function($) {
	'use strict';

	/**
	 * Create Lifx API instance
	 * @type {Lifx}
	 */
    const connection = new Lifx('xxx');

	/**
	 * Initiate application
	 * @type {Vue}
	 */
	var app = new Vue({
		el: '[vue-app]',
		data: {
			lights: [],
			light: null
		},
		methods: {
			update_light: function(id, data) {
				for (var i = 0; i < this.lights.length; i++) {
					if (this.lights[i].id === id) {
						this.lights[i] = $.extend(this.lights[i], data);
						
						return this.lights[i];
					}
				}

				return false;
			},
			get_light: function(id) {
				for (var i = 0; i < this.lights.length; i++) {
					if (this.lights[i].id === id) {
						return this.lights[i];
					}
				}

				return false;
			}
		}
	});

	/**
	 * Add `switch` component to app
	 */
	Vue.component('light-switch', {
		props: [ 'data' ],
		template: '#light-switch-template',
		computed: {
			percentage: function() {
				return this.data.power === 'on' ? (this.data.brightness * 100)+', 100' : '0, 100';
			},
			linecap: function() {
				return this.data.power === 'on' ? 'round' : 'butt';	
			},
			hex_color: function() {

				if (typeof this.data.color === 'string') {
					return this.data.color;
				}

				var h = this.data.color.hue;
				var s = this.data.color.saturation;
				var v = 1;//this.data.brightness;

				var rgb, i, data = [];

				if (s === 0) {
					rgb = [v, v, v];
				} else {
					h = h / 60;
					i = Math.floor(h);
					data = [ v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i))) ];

					switch(i) {
						case 0:
							rgb = [v, data[2], data[0]];
							break;
						case 1:
							rgb = [data[1], v, data[0]];
							break;
						case 2:
							rgb = [data[0], v, data[2]];
							break;
						case 3:
							rgb = [data[0], data[1], v];
							break;
						case 4:
							rgb = [data[2], data[0], v];
							break;
						default:
							rgb = [v, data[0], data[1]];
							break;
					}
				}

				return '#'+rgb.map(function(x){ 
					return ( '0'+Math.round(x * 255).toString(16) ).slice(-2);
				}).join('');
			}
		},
		methods: {
			toggle: function() {
				this.data.power = this.data.power === 'on' ? 'off' : 'on';

				connection.set_state('id:'+this.data.id, {
					power: this.data.power
				});

				return false;
			},
			set: function() {
				app.light = this.data.id;

				return false;
			}
		}
	});

	/**
	 * Add `color-picker` component to app
	 */
	Vue.component('color-picker', {
		template: '#color-picker-template',
		computed: {
			light: function() {
				return app.get_light( app.light );
			}
		},
		methods: {
			close: function() {
				app.light = null;
				return false;
			}
		},
		mounted: function() {
			const light = this.light;

			var timing = false;

			$(this.$el).LifxColorPicker({
				brightness: light.brightness,
				changed: function(hex, brightness) {
					// Send data
					if (timing) {
						clearTimeout(timing);
					}

					timing = setTimeout(function() {

						// Send updates to Lifx
						connection.set_state('id:'+app.light, {
							color: hex,
							brightness: brightness,
							power: light.power
						});

						// Update UI
						app.update_light(app.light, {
							color: hex,
							brightness: brightness,
							power: light.power
						});

					}, 500);
				}
			});
		}
	})

	/**
	 * Load lights
	 */
	connection.list_lights().then(function(response) {
		app.lights = response;
	});




})(jQuery);