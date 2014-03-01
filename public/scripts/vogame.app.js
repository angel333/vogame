/*jslint browser: true*/
/*global jQuery*/


/**
 * # vogame
 */
(function($) {
	'use strict';


	/**
	 * HTML tag definitions
	 */
	var $sequence = $('#sequence');
	var $hint = $('#hint');


	/**
	 * <span> tag with current letter
	 */
	var $currentLetter;


	/**
	 * The stats array
	 *
	 * - properties are later defined via defineProperty()
	 */
	var stats = {};


	/**
	 * cards get ajax-loaded later on
	 */
	var cards;


	/**
	 * Key mappings
	 * 
	 * You're able to use qwerty keyboard and type in whatever characters you want.
	 */
	var keyboardLayouts = {
		querty: [
			'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']',
			'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'',
			'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', ' '
		],
		dvorak: [
			'\'', ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '=',
			'a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-',
			';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z', ' '
		],
		hebrew: [
			'/', '׳', 'ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ', ']', '[',
			'ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף', ',',
			'ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ', '.', ' '
		]
	};


	/**
	 * Key layout settings are hardcoded now...
	 */
	var sourceLayout = keyboardLayouts.querty;
	var targetLayout = keyboardLayouts.hebrew;


	/**
	 * Translates keys from one layout to another
	 *
	 * You can e.g. use qwerty layout to type in dvorak
	 * ... or use dvorak layout to type hebrew :) ...
	 *
	 * @param {Array} sourceLayout Source layout, just a one-dimensional array of characters
	 * @param {Array} targetLayout Target layout, just a one-dimensional array of characters
	 */
	function KeyTranslator(sourceLayout, targetLayout) {
		var charCache = {};

		sourceLayout.map(function(v, i) {
			charCache[v.charCodeAt()] = targetLayout[i];
		});

		return {
			translate: function(char) {
				return charCache[char.charCodeAt()];
			},
			translateCode: function(code) {
				return charCache[code];
			}
		};
	}


	/**
	 * KeyTranslator instance
	 */
	var translator = new KeyTranslator(sourceLayout, targetLayout);


	/**
	 * Picks a random card from the 'cards' array and returns it
	 *
	 * @return {Array} Card, e.g. `{ answer: 'foo', description: 'bar' }`
	 */
	function randomCard() {
		var index = Math.floor(Math.random() * cards.length);
		return cards[index];
	}


	/**
	 * Loads a new card specified via parameter
	 *
	 * @param {Array} card Card to load
	 */
	function loadCard(card) {
		var i;

		function _$createLetter(letter) {
			return $('<span>').text(letter);
		}

		$sequence.empty(); // clean

		// create all letters
		for (i = 0; i < card.answer.length; i++) {
			_$createLetter(card.answer[i]).appendTo($sequence);
		}

		// .. and fill the hint
		$hint.text(card.description);

		$currentLetter = $('span', $sequence).first();
		$currentLetter.addClass('current');
	}


	/**
	 * Moves to the next letter in sequence
	 */
	function shiftLetter() {
		if (0 === $currentLetter.next().length) {
			loadCard(randomCard());
			return;
		}

		$currentLetter = $currentLetter
			.removeClass('current')
			.addClass('done')
			.next()
				.addClass('current');
	}


	/**
	 * Refreshes Score
	 *
	 * Basically just speed of typing per minute
	 * with penalization for wrong hits
	 */
	function refreshScore () {
		stats.score = Math.floor((60 * (stats.right - stats.wrong))
			/ stats.time);
	}


	/**
	 * Creating convenient getters and setters for all stats
	 *
	 * - any change of right, wrong or time will trigger a change of score
	 */
	$.map([ 'right', 'wrong', 'time', 'score' ], function(id) {
		Object.defineProperty(stats, id, {
			set: function(v) {
				$('#statusbar>span.' + id).text(Number(v));
				if ('score' !== id) {
					refreshScore();
				}
			},
			get: function() {
				return Number($('#statusbar>span.' + id).text());
			}
		});
	});


	/**
	 * On page load...
	 */
	$(function() {

		$('#keyboard').keyboardVisualizer(targetLayout);

		// Loading the cards
		$.ajax({
			url: "/data/hebrew-days-of-week.json",
			dataType: "json",
		}).done(function(data) {
			cards = data;
			loadCard(randomCard());
		});

		// Timer
		setInterval(function() {
			stats.time++;
			//refreshScore();
		}, 1000);

		// Binding to key presses
		$('body').keypress(function(e) {
			e.preventDefault();
			if (translator.translateCode(e.which) === $currentLetter.text()) {
				stats.right++;
				shiftLetter();
			} else {
				stats.wrong++;
			}
		});

	});


}(jQuery));
