const shell	= require('electron').shell;

(function($) {
	'use strict';

	$(document).on('click', 'a[href^="http"]', function(event) {
		event.preventDefault();
		shell.openExternal(this.href);
	});

})(jQuery);