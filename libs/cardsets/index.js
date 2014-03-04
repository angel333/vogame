var express = require('express');
var fs = require('fs');
var path = require('path');

var dataDir = path.join(__dirname, '../../data/');
var cardSets = [];

var app = express();
module.exports = exports = app;



/**
 *  >>> INIT >>>
 */

fs.readdir(dataDir, function(err, files) {
	if (err) {
		throw new Error("The data directory doesn't exist!");
	}
	files.map(loadCardSet);
});



/**
 *  >>> ROUTES >>>
 */

app.get('/', function(req, res) {
	var all = {};
	for (var i = 0; i < cardSets.length; i++) {
		all[cardSets[i].fileName] = cardSets[i].name;
	}
	res.send(all);
});

app.get('/:name', function(req, res) {
	var filePath = path.join(dataDir, path.basename(req.params.name));

	fs.readFile(filePath, function(err, content) {
		if (err) {
			res.send(404, { message: 'Card set not found!' });
		}
		res.send(content);
	});
});



/**
 *  >>> LOCAL FUNCTIONS >>>
 */

/**
 * Reads a card set from a file
 *
 * @param fileName {String} Path to the json file
 */
function loadCardSet(fileName) {
	var name;
	var cards = [];

	//console.log('Loading "%s"...', fileName);

	fs.readFile(dataDir + fileName, function(err, loaded) {
		if (err) {
			console.log('Couln\'t read %s!', fileName);
			return;
		}

		try {
			loaded = JSON.parse(loaded);
		} catch(err) {
			console.log('Can\'t parse %s, skipping!', fileName);
			return;
		}

		if (undefined === loaded.name) {
			console.log('No title found in %s, skipping!', fileName);
			return;
		}

		loaded.fileName = fileName;
		cardSets.push(loaded);
		console.log('%s loaded!', fileName);
	});
}
