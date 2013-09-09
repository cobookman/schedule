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
    this.departments = require('../department_list.js');
    this.cradleConnection = new(cradle.Connection)(this.config.dbHost, this.config.dbPort, { cache: true, raw: false });
    this.db = {}; //Init our db connections
    this.jStat = require('jStat').jStat;
}
//Removes everything which isnt a space, 0-9, a-z, A-Z, >, <, =, /, ., \, _, -, &, %, ?
core_api.prototype.safeString = function(str) {
    if(typeof str === 'string') {
        return str.replace(/([^\w\s><=:\/\\\.\-_&%\?])/g, '');
    } else if(typeof str ==='number') {
        return "" + str;
    } else {
        return "";
    }
}
core_api.prototype.toFloat = function(dataset) {
    for(var i = 0; i < dataset.length; i++) {
        dataset[i] = parseFloat(dataset[i], 10);
    }
    return dataset;
}
/* 
    Input array of #s, outputs object with statistics
                                                        */
core_api.prototype.genBoxplotStats = function(dataset) {
    var quartiles = [0, 0, 0],
        stdev = 0,
        IQR = 0,
        outliers = [];
    if(dataset.length > 1) {
        quartiles = this.jStat.quartiles(dataset);
        stdev = this.jStat.stdev(dataset);   
        IQR = quartiles[2] - quartiles[0];

        var lowBound = quartiles[0] - 1.5*IQR,
            highBound = quartiles[2] + 1.5*IQR;

        for(var i = 0; i<dataset.length; i++) {
            if(dataset[i] > highBound || dataset[i] < lowBound) {
                outliers.push(dataset[i]);
            }
        }
    }
    var mean = this.jStat.mean(dataset)

    return ({
        "mean" : mean.toFixed(2),
        "stddev" : stdev.toFixed(2),
        "q1" : quartiles[0].toFixed(2),
        "q2" : quartiles[1].toFixed(2),
        "q3" : quartiles[2].toFixed(2),
        "outliers" : outliers
    });
}

core_api.prototype.resetCache = function(dbName, cacheID, data) {
    if(!(Array.isArray(data) && data.length == 0)) { //don't cache empty arrays
        this.setCache(dbName, cacheID, {'data' : data, 'last_modified' : new Date() } );         
    }
}
/*
    Checks cache for data, then routes accordingly
                                                    */
core_api.prototype.checkCache = function(dbName, cacheID, cacheHit, cacheMiss) {
    this.getCache(dbName, cacheID, function(cache) {
        if(typeof cache !== 'undefined' && cache !== false) {
            cacheHit(cache);
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
        -database is the full database
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
    item = this.safeString(item);
    var dbName = this.safeString(this.config.cache_database[dbName]);
    //Check if database has a connection already
    this.dbConnection(dbName);

    //Initiate the save
    this.db[dbName].save(item, data, function(error, res) {
        if(!error && typeof callback === 'function') {
            callback(res);
        } else if(error) {
            throw new Error('ERROR setting cache ('+dbName+', '+JSON.stringify(item)+'): ' + JSON.stringify(error));
        }
    });
}
core_api.prototype.getURL = function(url, callback) {
    //Make sure URL is 'safe'
    url = this.safeString(url);
    this.request.get(url, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            typeof callback === 'function' && callback(body);
        } else {
            throw new Error("Couldn't fetch URL: " + url + "Response code: " + response.statusCode);
        }
    });
}

//EXPORT core_api
module.exports = core_api;