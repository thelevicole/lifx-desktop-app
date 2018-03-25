/**
 * LIFX jQuery Color Picker v0.0.1
 * Copyright (c) 2018 Levi Cole
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */

(function ($) {
	'use strict';

	$.fn.LifxColorPicker = function(options) {
		const self = this;
		options = $.extend(true, {
			hue: 0,
			saturation: 0.5,
			brightness: 1,
			size: 320,
			// Callback
			changed: function(color) {
				// color.hex
				// color.hue
				// color.saturation
				// color.brigtness
			}
		}, options);
		
		/**
		 * Public
		 * Color data
		 */
		self.data = {
			hue: 0,
			saturation: 0,
			brightness: 0
		};
		
		/**
		 * Private
		 * DOM data
		 */
		const dom = {
			rotation: 0,
			brightness: 0
		};
		 
		
		/**
		 * Global DOM Elements
		 * @type {jQuery}
		 */
		const $this	= this;
		const $dial = $this.find('.dial');
		const $saturation_handle = $this.find('.color .handle');
		const $brightness_handle = $this.find('.brightness .handle');
		
		/*
		 * Canvas properties
		 */
		const canvas		= document.createElement('canvas');
		const context		= canvas.getContext('2d');
		
		canvas.width	= options.size;
		canvas.height	= options.size;
		context.scale(2, 2);
		
		/**
		 * Math variables
		 */
		const x		= options.size / 4;		// Canvas center X (divided by 4 because of retina)
		const y		= options.size / 4;		// Canvas center Y (divided by 4 because of retina)
		const r		= x;					// Canvas radius
		const d2r	= Math.PI / 180;		// Degrees to radians
		const r2d	= 180 / Math.PI;		// Radians to degrees
		const abs_x	= $dial.offset().left + (r * 2);
		const abs_y	= $dial.offset().top + (r * 2);
		
		/**
		 * Public
		 * Simple function to retrieve the current [H]ue [S]aturation [L]ightness
		 */
		self.hsl = () => {
			
			let h = self.data.hue;
			let s = Math.round(self.data.saturation * 100);
			let l = Math.round(s < 50 ? 100 - s : 50);
			
			return 'hsl('+h+', '+s+'%, '+l+'%)';
		};
		
		/**
		 * Private
		 * Generate radial gradient image
		 */
		const generate_gradient = () => {
			
			for (let angle = 0; angle <= 360; angle++) {
				const arc_start	= (angle - 90) * d2r;
				const arc_end	= (angle - 88) * d2r;
				
				// Draw shape
				context.beginPath();
				context.moveTo(x, y);
				context.arc(x, y, r, arc_start, arc_end, false);
				context.closePath();

				// Generate gradient for shape
				let gradient = context.createRadialGradient(x, y, 0, x, y, r);
					gradient.addColorStop(0.475, 'hsl('+angle+', 10%, 100%)');
					gradient.addColorStop(1, 'hsl('+angle+', 100%, 50%)');

				context.fillStyle = gradient;
				context.fill();
			}
			
			$dial.css('background-image', 'url('+canvas.toDataURL('image/png', 1)+')');
		};
		
		/**
		 * Calculate mouse rotation relative to $dial center
		 * @param  int  mouse_x
		 * @param  int  mouse_y
		 */
		const get_degrees = (mouse_x, mouse_y) => {
			const radians	= Math.atan2(mouse_x - abs_x, mouse_y - abs_y);
			const degrees	= Math.round((radians * r2d * -1) + 100);
			return degrees;
		};
		
		/**
		 * Private
		 * Run when any values are changed
		 */
		const trigger_change = () => {
			
			let c_color	= self.hsl();
			let c_top	= ((1 - self.data.saturation) * ($saturation_handle.parent().outerHeight() - $saturation_handle.outerHeight()) );
		
			
			// Update dial rotation
			$dial.css('transform', 'rotate('+dom.rotation+'deg)');
			
			// Update saturation handle
			$saturation_handle.css('background', c_color);
			$saturation_handle.css('top', c_top+'px');
			
			// Update brightness handle
			$brightness_handle.css('top', -(dom.brightness * $brightness_handle.height())+'px')
			
			// Send data to callback
			if (typeof options.changed === 'function') {
				let send_data = self.data;

				send_data.hsl			= self.hsl();
				send_data.brightness	= parseFloat(send_data.brightness);
				send_data.saturation	= parseFloat(send_data.saturation);
				
				options.changed(send_data);
			}
		};

		/**
		 * Public
		 * Set Hue
		 * @param	{integer}	hue			// 0 - 360
		 */
		self.set_hue = (rotation) => {
			let hue = typeof rotation !== 'undefined' ? rotation : self.data.hue;
			if (hue > 360) {
				hue = hue - 360;
			}
			if (hue < 0) {
				hue	= 360 - Math.abs(hue);
			}
			// Set data values
			self.data.hue	= Math.round(360 - hue);
			dom.rotation	= rotation;
			trigger_change();
		};
		
		/**
		 * Public
		 * Set saturation
		 * @param	{integer}	saturation	// 0.0 - 1.0
		 */
		self.set_saturation = (saturation) => {
			saturation = typeof saturation !== 'undefined' ? saturation : self.data.saturation;
			if (saturation > 1) { saturation = 1; }
			if (saturation < 0) { saturation = 0; }
			self.data.saturation = saturation.toFixed(2);
			trigger_change();
		};
		
		/**
		 * Public
		 * Set brightness
		 * @param	{integer}	brightness	// 0.0 - 1.0
		 */
		self.set_brightness = (brightness) => {
			brightness = typeof brightness !== 'undefined' ? brightness : self.data.brightness;
			if (brightness > 1) { brightness = 1; }
			if (brightness < 0) { brightness = 0; }
			self.data.brightness	= brightness.toFixed(2);
			dom.brightness			= brightness;
			trigger_change();
		};
		
		/**
		 * Public
		 * Set color from Hue and Saturation
		 * @param	{integer}	hue			// 0 - 360
		 * @param	{integer}	saturation	// 0.0 - 1.0
		 * @param	{integer}	brightness	// 0.0 - 1.0
		 */
		self.set_color = (hue, saturation, brightness) => {
			self.set_hue(hue);
			self.set_saturation(saturation);
			self.set_brightness(brightness);
		};
		
		/**
		 * Dial rotate click and drag binding
		 */
		$dial.on('mousedown', function(event) {
			
			// Calculate the mouse position in degrees
			const click_degrees = get_degrees(event.pageX, event.pageY);
			
			$(document).bind('mousemove', function(event) {
				// Calculate the mouse move position, removing starting point
				const degrees = get_degrees(event.pageX, event.pageY) - click_degrees;
				
				self.set_hue( degrees );
			});
		});
		
		/**
		 * Vertical color range click and drag binding
		 */
		$saturation_handle.on('mousedown', function() {
			$(document).bind('mousemove', function(event) {
				const $parent	= $saturation_handle.parent();
				const h_size	= $saturation_handle.outerWidth();
				const h_half	= h_size / 2;
				const p_size	= $parent.outerHeight() - h_size;
				const bounds	= $parent.offset();

				var y = event.clientY - (bounds.top + h_half);
				
				if (y > p_size) {
					y = p_size;
				}
				
				if (y < 0) {
					y = 0;
				}

				self.set_saturation( 1 - (y / p_size) );
			});
		});
		
		/**
		 * Brightness click and drag binding
		 */
		$brightness_handle.parent().on('mousedown', function(event) {
			var click_y	= event.clientY;
			const top	= parseInt($brightness_handle.css('top'));
			
			$(document).bind('mousemove', top, function(event) {
				const h_size = $brightness_handle.height();
				var y = top - (click_y - event.clientY);
				
				if (y > 0) {
					y = 0;
				}
				
				if (y < (-h_size)) {
					y = -h_size;
				}

				self.set_brightness( Math.abs(y) / h_size );
			});
		});
		
		/**
		 * Remove all click and drag bindings
		 */
		$(document).on('mouseup', function() {
			$(document).unbind('mousemove');
		});
		
		/**
		 * Initiate
		 */
		generate_gradient();
		self.set_color(Math.round(360 - options.hue), parseFloat(options.saturation), parseFloat(options.brightness));
		
	};

})(jQuery);