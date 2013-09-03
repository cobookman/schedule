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
        res.jsonp([]);   
    }
}

exports.prof = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var cacheID = api.genCacheID(req.params.department, req.params.course);
    
    api.getCache(dbName, cacheID, cacheHit, cacheMiss); 
    
    function cacheHit(cache) {
        if(cache.hasOwnProperty('data') && cache.data.profs.hasOwnProperty(profID)) {
            res.jsonp(cache.data.profs[profID]);
        } else { 
            cacheMiss();
        }
    }

    function cacheMiss() {
        res.jsonp([]);
    }
}

exports.year = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var year = req.params.year;
    var cacheID = api.genCacheID(req.params.department, req.params.course);

    api.getCache(dbName, cacheID, cacheHit, cacheMiss); 

    function cacheHit(cache) {
        if(cache.hasOwnProperty('data') && cache.data.profs.hasOwnProperty(profID) && cache.data.profs[profID].years.hasOwnProperty(year)) {
            res.jsonp(cache.data.porofs[profID].years[year]);
        } else { 
            cacheMiss();
        }
    }

    function cacheMiss() {
        res.jsonp([]);
    }
}

exports.semester = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var year = req.params.year;
    var semester = req.params.semester.toLowerCase();
    var cacheID = this.genCacheID(req.params.department, req.params.course);

    api.getCache(dbName, cacheID, cacheHit, cacheMiss); 

    function cacheHit(cache) {
        if(cache.hasOwnProperty('data') && cache.data.profs.hasOwnProperty(profID) 
            && cache.data.profs[profID].years.hasOwnProperty(year) 
            && cache.data.profs[profID].years[year].semesters.hasOwnProperty(semester)) {

            res.jsonp(cache.data.profs[profID].years[year].semesters[semester]);
        } else { 
            cacheMiss();
        }
    }

    function cacheMiss() {
        res.jsonp([]);
    }
}

exports.refreshStatistics = function(req, res) {
    this.updateStatistics(dbName, function() { res.jsonp(["Refreshed"]); });
}

exports.importJSON = function(req, res) {
    var filepath = '/Users/colin/srv/schedule/api/Data.json';
    this.push2Cache(dbName, filepath);
}
