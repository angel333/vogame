var express = require('express');
var cardsets = require('./libs/cardsets');
var path = require('path');

var app = express();
var httpServer = app.listen(process.env.PORT || 8080);


app.use('/sets', cardsets);
app.use(express.static(__dirname + '/public'));
