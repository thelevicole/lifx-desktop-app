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
			groups: [],
			controlling: false
		},
		mounted: function() {
			this.authenticate();
		},
		computed: {
			ordered_lights: function () {
				return _.orderBy(this.lights || [], 'label');
			},
			ordered_groups: function () {
				return _.orderBy(this.groups || [], 'name');
			}
		},
		methods: {
			//
			// User AUTH functions
			//
			authenticate: function() {

				if (this.access_token) {
					localStorage.setItem('lifx_access_token', this.access_token);
					connection = new Lifx( this.access_token );

					$(this.$el).addClass('loading');

					connection.list_lights().then((response) => {
						$(this.$el).removeClass('loading');
						this.lights = response;
						this.group_builder();
					}, (errors) => {
						$(this.$el).removeClass('loading');
						if (errors.error) {
							alert(errors.error);
						}
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
			group_builder: function() {
				let builder = [];

				if (this.lights) {
					for (var i = 0; i < this.lights.length; i++) {
						const light = this.lights[i];
						if (light.group) {
							var group		= _.findIndex(builder, {id: light.group.id});
							var new_group	= {
								id: light.group.id,
								name: light.group.name,
								power: light.power,
								lights: _.values( _.filter(this.lights, (object) => {
									return object.group.id === light.group.id;
								}) )
							};

							if (group !== -1) {
								if (light.power === 'on') {
									builder[group].power = 'on';
								}
							} else {
								builder.push( new_group );
							}
						}
					}
				}

				this.groups = builder;
			},

			//
			// Single LIGHT function
			//
			update_light: function(id, data) {
				if (id === 'all') {
					for (var i = 0; i < this.lights.length; i++) {
						this.lights[i] = this.update_light(this.lights[i].id, data);
					}
				} else {
					const light = this.get_light(id);

					if (light) {
						this.lights[light.index] = _.extend(true, light.data, (data || {}));
					}
				}

				// Rebuild group
				this.group_builder();
			},
			get_light: function(id, attr) {
				const index = _.findIndex(this.lights, {id: id});

				if (index >= 0) {
					const object = {
						index: index,
						data: this.lights[index]
					};

					if (attr) {
						return object[ attr ];
					}

					return object;
				}

				return attr ? null : false;
			},

			//
			// Single GROUP function
			//
			update_group_lights: function(group_id, light_data) {
				let group = this.get_group( group_id );

				if (group && group.lights) {
					for (var i = 0; i < group.lights.length; i++) {
						this.update_light(group.lights[i].id, light_data);
					}
				}
			},
			get_group: function(id) {
				return _.find(this.groups, {id: id}, false);
			},

			//
			// Dirty device guessing updater
			//
			update_view_data: function(id, data) {
				if (id === 'all' || this.get_light(id)) {
					this.update_light(id, data);
				} else if (this.get_group(id)) {
					this.update_group_lights(id, data);
				}
			}
		}
	});

	/**
	 * Add [ALL] `switch` component to app
	 */
	Vue.component('group-switch', {
		props: [ 'group' ],
		template: '#group-switch-template',
		computed: {
			selector: function() {
				return this.group.id !== 'all' ? 'group_id:'+this.group.id : 'all';
			},
			hex_color: function() {
				return this.group.power === 'on' ? '#00A6FF' : '#3B434B';
			}
		},
		methods: {
			toggle: function() {
				this.group.power = this.group.power === 'on' ? 'off' : 'on';

				connection.set_state(this.selector , {
					power: this.group.power
				});

				app.update_view_data(this.group.id, {
					power: this.group.power
				});

				return false;
			},
			set: function() {
				app.controlling = {
					selector: 'group_id',
					id: this.group.id,
					data: this.group.lights
				};

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

				app.update_view_data(this.data.id, {
					power: this.data.power
				});

				return false;
			},
			set: function() {
				app.controlling = {
					selector: 'id',
					id: this.data.id,
					data: this.data
				};

				return false;
			}
		}
	});

	/**
	 * Add `color-picker` component to app
	 */
	Vue.component('color-picker', {
		template: '#color-picker-template',
		methods: {
			close: function() {
				app.controlling = false;
				return false;
			}
		},
		computed: {
			selector: () => {
				return app.controlling.selector+':'+app.controlling.id;
			},
			single: () => {
				if (!app.controlling.data.brightness) {
					return app.controlling.data[0];
				}

				return app.controlling.data;
			}
		},
		mounted: function() {
			const single	= this.single;
			var sending		= false;

			const selector	= this.selector;
			const update_id	= app.controlling.id;

			$(this.$el).LifxColorPicker({
				brightness: single.brightness,
				hue: single.color.hue,
				saturation: single.color.saturation,
				changed: function(color) {
					// color.hex
					// color.hue
					// color.saturation
					// color.brightness

					// Send data
					if (sending) {
						clearTimeout(sending);
					}

					sending = setTimeout(function() {

						// Send updates to Lifx
						connection.set_color(selector, color.hue, color.saturation, color.brightness);

						// Update UI
						app.update_view_data(update_id, {
							color: {
								hue: color.hue,
								saturation: color.saturation
							},
							brightness: color.brightness,
							power: single.power
						});

					}, 500);
				}
			});
		}
	});

})(jQuery);