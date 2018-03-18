/**
 * LIFX jQuery Color Picker v0.0.1
 * Copyright (c) 2018 Levi Cole
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */

(function ($) {
	'use strict';

	$.fn.LifxColorPicker = function(options) {

		options = $.extend({
			color: 0,
			brightness: 1,
			// Callbacks
			changed: function(hex, brightness) {}
		}, options);

		const $this			= this;

		const $canvas		= $this.find('canvas');
		const $handle		= $this.find('.color .handle');
		const $brightness	= $this.find('.brightness .handle');
		
		// HTML5 canvas properties
		var canvas		= $canvas[0];
		var context		= canvas.getContext('2d');

		// Canvas points
		let x = canvas.width / 2;
		let y = canvas.height / 2;
		let r = x; // Radius
		const r2d = Math.PI / 180;
		
		/**
		 * Draw color dial
		 */
		function draw() {

			for (var angle = 0; angle <= 360; angle++) {
				var start	= -((angle + 2) * r2d);
				var end		= -(angle * r2d);

				context.beginPath();
				context.moveTo(x + 10, y + 10);
				context.arc(x, y, r, start, end, false);
				context.closePath();

				var gradient = context.createRadialGradient(x, y, 0, x, y, r);
					gradient.addColorStop(0.475, 'hsl('+angle+', 10%, 100%)');
					gradient.addColorStop(0.75, 'hsl('+angle+', 100%, 50%)');
					gradient.addColorStop(1, 'hsl('+angle+', 100%, 30%)');

				context.fillStyle = gradient;
				context.fill();
			}
		};
		
		/**
		 * Rotate canvas
		 * @param	{integer}	angle
		 */
		function rotate(angle) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.translate(x, y);
			context.rotate(angle * r2d);
			context.translate(-x, -y);
			draw();
		};
		
		/**
		 * Set color function
		 */
		function set_color() {
			
			const h_size = $handle.outerWidth();
			const pos_y = $handle.offset().top + (h_size / 2);
			const pos_x = $handle.offset().left + (h_size / 2);
			
			const canvas_offset = canvas.getBoundingClientRect();
			const canvas_x = Math.floor(pos_x - canvas_offset.left);
			const canvas_y = Math.floor(pos_y - canvas_offset.top);
			
			var image_data = context.getImageData(canvas_x, canvas_y, 1, 1);
			var pixel = image_data.data;
			
			var color = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
			var hex = '#' + ( '0000' + color.toString(16) ).substr(-6);

			// 0.0 -> 1.0
			var brightness = -(parseInt($brightness.css('top')) / $brightness.height()).toFixed(1);
			
			$handle.css('background', hex);

			// If success callback, then run
			if (options.changed && typeof options.changed === 'function') {
				options.changed(hex, brightness);
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

			return degrees;
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
			
			$(document).bind('mousemove', click_degrees, function(event) {
				// Calculate the mouse move position, removing starting point
				const degrees = get_degrees(event.pageX, event.pageY) - click_degrees;
				
				rotate( degrees );
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
		rotate(options.color);
		set_color();

	};

})(jQuery);