
/**
 * Module dependencies.
 */

var express = require('express');
// var user = require('./routes/user');
var http = require('http');
var path = require('path');
var hbs = require('hbs');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');  //Where templates are
app.set('view engine', 'hbs'); //Init Handlebars parsing of .html files

app.use(express.favicon(__dirname + '/public/img/favicon.ico')); 
app.use(express.logger('dev'));

// app.use(express.bodyParser()); -- Parse Requests
// app.use(express.methodOverride()); -- Use custom HTTP  methods
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//Read Partials
var fs = require('fs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname + '/views/partials/header');


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//Export express app for other modules to use
module.exports.app = app;
var routes = require('./routes.js');