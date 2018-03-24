// Dependencies

window.$	= window.jQuery = require('jquery');
window.Vue	= require('vue/dist/vue.min.js');
const shell	= require('electron').shell;

(function($) {
	'use strict';

	$(document).on('click', 'a[href^="http"]', function(event) {
		event.preventDefault();
		shell.openExternal(this.href);
	});

})(jQuery);