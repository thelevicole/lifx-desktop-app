(function($) {
	'use strict';

	/**
	 * Create Lifx API instance
	 * @type {Lifx}
	 */
	var connection = false;

	/**
	 * Initiate application
	 * @type {Vue}
	 */
	var app = new Vue({
		el: '[vue-app]',
		data: {
			access_token: localStorage.getItem('lifx_access_token'),
			lights: [],
			light: null
		},
		mounted: function() {
			this.authenticate();
		},
		methods: {
			authenticate: function() {

				if (this.access_token) {
					localStorage.setItem('lifx_access_token', this.access_token);
					connection = new Lifx( this.access_token );

					connection.list_lights().then((response) => {
						this.lights = response;
					});

				} else {
					localStorage.removeItem('lifx_access_token');
					connection = false;
				}
			},
			logout: function() {
				localStorage.removeItem('lifx_access_token');
				connection = false;
				location.reload();
			},
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
				hue: light.color.hue,
				saturation: light.color.saturation,
				changed: function(color) {
					// color.hex
					// color.hue
					// color.saturation
					// color.brigtness

					// Send data
					if (timing) {
						clearTimeout(timing);
					}

					timing = setTimeout(function() {

						// Send updates to Lifx
						connection.set_color('id:'+app.light, color.hue, color.saturation);

						// Update UI
						app.update_light(app.light, {
							color: color.hex,
							brightness: color.brigtness,
							power: light.power
						});

					}, 500);
				}
			});
		}
	});

})(jQuery);