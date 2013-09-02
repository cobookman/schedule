var api = require('../../api/grade_api').init();
var dbName = 'grade_data_api';

exports.course = function(req, res) {
    var cacheID = api.genCacheID(req.params.department, req.params.course);
    api.getCache(dbName, cacheID, cacheHit, cacheMiss); 

    function cacheHit(cache) {
        if(cache.hasOwnProperty('data')) {
            res.jsonp(cache.data);
        } else {
            cacheMiss();
        }
    }

    function cacheMiss() {
        res.jsonp(false);   
    }
}

exports.prof = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var cacheID = api.genCacheID(req.params.department, req.params.course);
    
    api.getCache(dbName, cacheID, cacheHit, cacheMiss); 
    
    function cacheHit(cache) {
        if(cache.hasOwnProperty('data') && cache.data.hasOwnProperty(profID)) {
            res.jsonp(cache.data[profID]);
        } else { 
            cacheMiss();
        }
    }

    function cacheMiss() {
        res.jsonp(false);
    }
}

exports.year = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var year = req.params.year;
    var cacheID = api.genCacheID(req.params.department, req.params.course);

    api.getCache(dbName, cacheID, cacheHit, cacheMiss); 

    function cacheHit(cache) {
        if(cache.hasOwnProperty('data') && cache.data.hasOwnProperty(profID) && cache.data[profID].hasOwnProperty(year)) {
            res.jsonp(cache.data[profID][year]);
        } else { 
            cacheMiss();
        }
    }

    function cacheMiss() {
        res.jsonp(false);
    }
}

exports.semester = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var year = req.params.year;
    var semester = req.params.semester.toLowerCase();
    var cacheID = this.genCacheID(req.params.department, req.params.course);

    api.getCache(dbName, cacheID, cacheHit, cacheMiss); 

    function cacheHit(cache) {
        if(cache.hasOwnProperty('data') && cache.data.hasOwnProperty(profID) 
            && cache.data[profID].hasOwnProperty(year) 
            && cache.data[profID][year].hasOwnProperty(semester)) {

            res.jsonp(cache.data[profID][year][semester]);
        } else { 
            cacheMiss();
        }
    }

    function cacheMiss() {
        res.jsonp(false);
    }
}
