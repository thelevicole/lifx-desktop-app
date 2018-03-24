/**
 * LIFX jQuery Color Picker v0.0.1
 * Copyright (c) 2018 Levi Cole
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */

(function ($) {
	'use strict';

	$.fn.LifxColorPicker = function(options) {
		var self = this;

		options = $.extend({
			hue: 0,				// 0 - 360
			saturation: 0.6,	// 0.1 - 1
			brightness: 1,		// 0 - 1
			// Callbacks
			changed: function(color) {
				// color.hex
				// color.hue
				// color.saturation
				// color.brigtness
			}
		}, options);

		// Accessible data
		self.data = {
			hex: '',
			hue: 0,
			saturation: 0,
			brightness: 0
		};

		/**
		 * DOM Elements
		 * @type {jQuery}
		 */
		const $this			= this;
		const $canvas		= $this.find('canvas');
		const $handle		= $this.find('.color .handle');
		const $brightness	= $this.find('.brightness .handle');
		
		/**
		 * Canvas properties
		 */
		var canvas		= $canvas[0];
		var context		= canvas.getContext('2d');

		/**
		 * Math values
		 */
		let x		= canvas.width / 2;
		let y		= canvas.height / 2;
		let r		= x;
		const r2d	= Math.PI / 180;
		
		/**
		 * Draw color dial
		 */
		self.draw_wheel = (attributes) => {

			self.data = $.extend(self.data, (attributes || {}));

			if (self.data.hue < 0) {
				self.data.hue	= 360 - Math.abs(self.data.hue);
			}
			
			var rotate = self.data.hue;
			
			self.data.hue = 360 - self.data.hue;
			
			// Clear canvas
			context.clearRect(0, 0, canvas.width, canvas.height);
			// Set transform origin (center)
			context.setTransform(1, 0, 0, 1, 0, 0);
			// Set translate origin (center)
			context.translate(x, y);

			// Rotate canvas
			context.rotate(rotate * r2d);
			// Center canvas
			context.translate(-x, -y);

			// For each degree in a circle
			for (var angle = 0; angle <= 360; angle++) {
				// Start and end of shape
				var start	= ((angle - 90) * r2d);
				var end		= ((angle - 88) * r2d);

				// Draw shape
				context.beginPath();
				context.moveTo(x, y);
				context.arc(x, y, r, start, end, false);
				context.closePath();

				// Generate gradient for shape
				var gradient = context.createRadialGradient(x, y, 0, x, y, r);
					gradient.addColorStop(0.475, 'hsl('+angle+', 10%, 100%)');
					//gradient.addColorStop(0.75, 'hsl('+angle+', 100%, 75%)');
					gradient.addColorStop(1, 'hsl('+angle+', 100%, 50%)');

				context.fillStyle = gradient;
				context.fill();
			}
		};
		
		/**
		 * Set color function
		 */
		function set_color() {
			
			const h_size	= $handle.outerWidth();
			const pos_y		= $handle.offset().top + (h_size / 2);
			const pos_x		= $handle.offset().left + (h_size / 2);
			
			const canvas_offset	= canvas.getBoundingClientRect();
			const canvas_x		= Math.floor(pos_x - canvas_offset.left);
			const canvas_y		= Math.floor(pos_y - canvas_offset.top);
			
			var pixel	= context.getImageData(canvas_x, canvas_y, 1, 1);
			var data	= pixel.data;
			
			var color	= data[2] + 256 * data[1] + 65536 * data[0];
			var hex		= '#' + ( '0000' + color.toString(16) ).substr(-6);
			
			$handle.css('background', hex);

			const rail_height	= parseInt( $handle.parent().height() );
			const handle_y		= parseInt( $handle.css('top') ) + ($handle.outerWidth() / 2);
			const saturation	= handle_y / rail_height;

			// Update data
			self.data.hex			= hex;
			self.data.saturation	= (1 - saturation).toFixed(1);
			self.data.brightness	= -(parseInt($brightness.css('top')) / $brightness.height()).toFixed(1);
			// If has callback, then run
			if (options.changed && typeof options.changed === 'function') {
				options.changed(self.data);
			}
		};

		/**
		 * Calculate mouse rotation relative to $dial center
		 * @param  int  mouse_x
		 * @param  int  mouse_y
		 */
		function get_degrees(mouse_x, mouse_y) {
			const radius	= $canvas.outerWidth() / 2;
			const center_x	= $canvas.offset().left + r;
			const center_y	= $canvas.offset().top + r;

			const radians	= Math.atan2(mouse_x - center_x, mouse_y - center_y);
			const degrees	= Math.round((radians * (180 / Math.PI) * -1) + 100);

			return (degrees + 90);
		};
		
		/**
		 * Vertical color range click and drag binding
		 */
		$handle.on('mousedown', function() {
			$(document).bind('mousemove', function(event) {
				const $parent	= $handle.parent();
				const h_size	= $handle.outerWidth();
				const bounds	= $parent.offset();
				var x = event.clientX - bounds.left;
				var y = event.clientY - bounds.top;
				
				if (y > $parent.height()) {
					y = $parent.height();
				}
				
				if (y < 0) {
					y = 0;
				}
				
				$handle.css('top', y - (h_size / 2));

				set_color();
			});
		});
		

		/**
		 * Brightness click and drag binding
		 */
		$brightness.parent().on('mousedown', function(event) {
			var click_y	= event.clientY;
			const top	= parseInt($brightness.css('top'));
			
			$(document).bind('mousemove', top, function(event) {
				const $parent	= $brightness.parent();
				const h_size	= $brightness.height();
				var y = top - (click_y - event.clientY);
				
				if (y > 0) {
					y = 0;
				}
				
				if (y < (-h_size)) {
					y = -h_size;
				}

				$brightness.css('top', y+'px');

				set_color();
			});
		});
		
		/**
		 * Brightness scroll binding
		 */
		$brightness.parent().on('mousewheel DOMMouseScroll', function(event) {
			
			let top			= parseInt($brightness.css('top'));
			const h_size	= $brightness.height();
			const threshold	= 3;
			
			if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
				top = top + threshold;
			} else {
				top = top - threshold;
			}
			
			if (top > 0) {
				top = 0;
			}

			if (top < (-h_size)) {
				top = -h_size;
			}
			
			$brightness.css('top', top+'px');

			set_color();
		});
		
		/**
		 * Canvas rotate click and drag binding
		 */
		$canvas.on('mousedown', function(event) {
			
			// Calculate the mouse position in degrees
			const click_degrees = get_degrees(event.pageX, event.pageY);
			
			$(document).bind('mousemove', function(event) {
				// Calculate the mouse move position, removing starting point
				const degrees = get_degrees(event.pageX, event.pageY) - click_degrees;
				
				self.draw_wheel({ hue: degrees });
				set_color();
			});
		});
		
		/**
		 * Remove all previous bindings
		 */
		$(document).on('mouseup', function() {
			$(document).unbind('mousemove');
		});

		/**
		 * Set default starting points
		 */
		$brightness.css('top', -(options.brightness * $brightness.height()));
		self.draw_wheel({ hue: options.hue });
		$handle.css('top',  (((1 - options.saturation) * $handle.parent().height()) - ($handle.outerWidth() / 2)) );
		set_color();

	};

})(jQuery);