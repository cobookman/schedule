/*
	Core API functionality, this class is inherited by all other apis
		exporting of module @ bottom of file
																		*/


//Constructor
var core_api = function() {
	this.request = require('request');
    this.cheerio = require('cheerio');
    this.config = require('../config.js');
}

/* 
    Checks cache for resource 
        - found returns resource, 
        - not found returns false 
        Cache Format: $(DEPARTMENT)$(COURSENUM)_$(YEAR)$(SEMESTER)
                                    */
core_api.prototype.checkCache = function(cachePath, callback) {
    //Check cache ID
    if(!cacheID) { return false; }

    //Check if cache hit
    request.get(this.config.dbHost  + cachePath, process);
    function process(data) {
        var cache = JSON.parse(data);
        var output;
        //Cache hit
        if(!cache.hasOwnProperty('error')) {
            output = cache.data;
        //Cache Miss
        } else {
            output = false;
        }

        if(typeof(callback) === 'function') {
            callback(output);
        } else {
            return output;
        }
    }

}

/*
    Sets cache
        -if sets cache returns couchdb msg
        -if can't set cache returns false
*/
core_api.prototype.setCache = function(cachePath, data, callback) {
    //Can't set cache w/o valid data and cacheID
    if(!cachePath || typeof data === 'undefined') { 
        return false; 
    } 
    //Check if cacheID exists
    this.checkCache(cacheID, function(cache) {
        if(cache.hasOwnProperty('_rev')) {
            //Update document
            request({
                method : 'PUT',
                uri : this.config.dbHost + cachePath,
                multipart : [{
                    'content-type' : 'application/json',
                    '_rev' : cache.rev,
                    'data' : data
                }]
            }, process);
        } else {
            //create document
            request({
                method : 'PUT',
                uri : this.config.dbHost + "/oscar_api/" + cacheID,
                multipart : [{

                }]
            })

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