var express = require('express');
var app = express();
var httpServer = app.listen(process.env.PORT || 8080);

app.use(express.static(__dirname + '/public'));
