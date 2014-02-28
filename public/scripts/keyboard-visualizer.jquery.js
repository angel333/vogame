/*jslint browser: true*/
/*global jQuery*/


/**
 * KEYBOARD VISUALIZER
 *
 * Creates a keyboard out of a <div> element
 */
(function($) {
	'use strict';


	/**
	 * A default layout in case no layout is passed
	 */
	var defaultLayout = [
		'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']',
		'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'',
		'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'
	];


	/**
	 * Creates a <div> element with everything needed for a key
	 *
	 * @param {String} label Label printed on the key
	 * @return {jQuery} a div element with the key
	 */
	function _$createKey(label) {
		return $('<div class="key"/>')
			.text(label);
	}


	/**
	 * Just a fancy keyboard with adjustable layout
	 *
	 * @param {Array} layout An optional array with keyboard layout
	 */
	$.fn.keyboardVisualizer = function(layout) {
		var $keyboard = $(this);

		layout = undefined !== layout ? layout : defaultLayout;

		// split the layout
		var rows = [];
		rows.push(layout.slice(0, 12));
		rows.push(layout.slice(12, 23));
		rows.push(layout.slice(23, 33));

		rows.map(function(row) {
			var $row = $('<div class="row"/>')
				.appendTo($keyboard);

			row.map(function(key) {
				$row.append(_$createKey(key));
			});

		});

		return $(this);
	};

}(jQuery));
