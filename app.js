
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
// var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');  //Where templates are
app.set('view engine', 'html'); //Init Handlebars parsing of .html files
app.engine('html', require('hbs').__express); //Handlebars as default engine
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

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
