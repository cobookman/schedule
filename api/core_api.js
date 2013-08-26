/*
	Core API functionality, this class is inherited by all other apis
		exporting of module @ bottom of file
																		*/
//Core_API specific
var cradle = require('cradle');

//Constructor
var core_api = function() {
	this.request = require('request');
    this.cheerio = require('cheerio');
    this.config = require('../config.js');
    this.connection = new(cradle.Connection)(this.config.dbHost, this.config.dbPort, { cache: true, raw: false });
    this.db = {}; //Init our db connections
}

/* 
    Checks cache for resource 
        - found returns resource w/callback, 
        - not found returns false 
                                    */
core_api.prototype.dbConnection = function(dbName) {
    if(!this.db.hasOwnProperty(dbName)) {
        this.db[dbName] = this.connection.database(dbName);
    }
}

core_api.prototype.getCache = function(dbName, items, callback) {
    //Async operation, needs a callback
    if(typeof callback !== 'function') { return false; }

    //check if dabase has been connected to already (cache purposes)
    this.dbConnection(dbName);

    //Get items
    this.db[dbName].get(items, function(error, doc) {
        if(!error) {
            callback(doc);
        } else {
            console.log('ERROR Fetching cache ('+dbName+', '+JSON.stringify(items)+'): ' + JSON.stringify(error));
            callback(false);
        }
    });
}

/*
    Sets cache
        -if sets cache returns couchdb msg
        -if can't set cache returns false through callback
*/
core_api.prototype.setCache = function(dbName, item, data, callback) {
    //Check if database has a connection already
    this.dbConnection(dbName);

    //Initiate the save
    this.db[dbName].save(item, data, function(error, res) {
        if(!error && typeof callback === 'function') {
            callback(res);
        } else if(error && typeof callback === 'function') {
            console.log('ERROR setting cache ('+dbName+', '+JSON.stringify(item)+'): ' + JSON.stringify(error));
            callback(false);
        }
    });
}
core_api.prototype.getURL = function(url, callback) {
    this.request.get(url, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            typeof callback === 'function' && callback(body);
        } else {
            console.log("ERROR couldn't fetch URL " + url); 
            callback(false); 
        }
    });
}

//EXPORT core_api
module.exports = core_api;