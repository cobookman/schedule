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
    this.cradleConnection = new(cradle.Connection)(this.config.dbHost, this.config.dbPort, { cache: true, raw: false });
    this.db = {}; //Init our db connections
}


core_api.prototype.resetCache = function(dbName, cacheID, data) {
    if(!(Array.isArray(data) && data.length == 0)) { //don't cache empty arrays
        this.setCache(this.config.cache_database[dbName], cacheID, {'data' : data, 'last_modified' : new Date() } );         
    }
}
/*
    Checks cache for content, if found sends the cache to user, 
        else hits the cache miss action
                                                    */
core_api.prototype.checkCache = function(res, dbName, cacheID, cacheMiss) {
    this.getCache(dbName, cacheID, function(cache) {
        if(cache.hasOwnProperty('data')) {
            res.jsonp(cache.data);
        } else {
            cacheMiss();
        }
    });
}

//find if cache not requested 
core_api.prototype.cacheRequest = function(req) {
    if(req.query.hasOwnProperty('cache') && req.query.cache === 'false') {
        return false;
    } else {
        return true;
    }
}

/* 
    Checks cache for resource 
        - found returns resource w/callback, 
        - not found returns false 
        -Internal only
                                    */
core_api.prototype.dbConnection = function(database) {
    if(!this.db.hasOwnProperty(database)) {
        this.db[database] = this.cradleConnection.database(database);
    }
}

core_api.prototype.getCache = function(dbName, items, callback) {
    //Async operation, needs a callback
    if(typeof callback !== 'function') { return false; }
    var dbName = this.config.cache_database[dbName];
    //check if dabase has been connected to already (cache purposes)
    this.dbConnection(dbName);

    //Get items
    this.db[dbName].get(items, function(error, doc) {
        if(!error) {
            callback(doc);
        } else {
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

    var dbName = this.config.cache_database[dbName];
    //Check if database has a connection already
    this.dbConnection(dbName);

    //Initiate the save
    this.db[dbName].save(item, data, function(error, res) {
        if(!error && typeof callback === 'function') {
            callback(res);
        } else if(error && typeof callback === 'function') {
            console.log('ERROR setting cache ('+dbName+', '+JSON.stringify(item)+'): ' + JSON.stringify(error));
            callback(false);
        } else if(error) {
            console.log('ERROR setting cache ('+dbName+', '+JSON.stringify(item)+'): ' + JSON.stringify(error));
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