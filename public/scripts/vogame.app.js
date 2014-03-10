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
	var $sequenceFocus = $('#sequence-focus');
	var $selection = $('#selection');
	var $selectionLoading = $('div.loading', $selection);
	var $selectionList = $('ul', $selection);


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
		var $card;

		function _$createLetter(letter) {
			return $('<span>').text(letter);
		}

		// .prev -> .invisible -> cleanup after a while
		$('.prev', $sequenceFocus)
			.addClass('invisible')
			.delay(1000) // >= css transition delay
			.queue(function() {
				$(this).remove();
			});

		// .active -> .prev
		$('.active', $sequenceFocus)
			.removeClass('active')
			.addClass('prev');

		// new card is .next at first
		$card = $('<div class="card next"/>')
			.appendTo($sequenceFocus);

		// but quickly becomes .active
		window.setTimeout(function() {
			$card
				.removeClass('next')
				.addClass('active');
		}, 0);

		// letters
		var $front = $('<p class="front"/>').appendTo($card);
		for (var i = 0; i < card.answer.length; i++) {
			_$createLetter(card.answer[i]).appendTo($front);
		}
		$currentLetter = $('span', $front)
			.first()
			.addClass('current');

		// .. and fill the hint
		$('<p class="hint"/>')
			.text(card.description)
			.appendTo($card);
	}


	/**
	 * Moves to the next letter in sequence
	 */
	function shiftLetter() {
		$currentLetter
			.removeClass('current')
			.addClass('done');

		if (0 === $currentLetter.next().length) {
			loadCard(randomCard());
		} else {
			$currentLetter = $currentLetter.next()
				.addClass('current');
		}
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
	 * Load a card set from uri
	 */
	function loadCardSet(url) {
		$.ajax({
			url: url,
			dataType: 'json',
		}).done(function(data) {
			cards = data.cards;
			loadCard(randomCard());
		});
	}


	/**
	 * Shows a menu where card sets are selected
	 */
	function showSelectionMenu() {
		$selection.show();

		$selectionLoading.show();
		$selectionList.hide().empty();

		$.ajax({
			url: '/sets/',
			dataType: 'json',
		}).done(function(data) {
			for (var i in data) {
				$('<a/>')
					.text(data[i])
					.data('cardSetUrl', i)
					.appendTo($('<li/>').appendTo($selectionList))
					.attr('href', '#' + i);
			}
			$selectionLoading.hide();
			$selectionList.show();
		});
	}


	/**
	 * On page load...
	 */
	$(function() {

		//$('#keyboard').keyboardVisualizer(targetLayout);

		if (window.location.hash) {
			loadCardSet('/sets/' + window.location.hash.substr(1));
		} else {
			showSelectionMenu();
		}

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

		// Selection window
		$selection.on('click', 'a', function() {
			loadCardSet('/sets/' + $(this).data('cardSetUrl'));
			$selection.hide();
		});

	});


}(jQuery));
