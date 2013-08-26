var api = require('../../api/oscar_api').init();
var cache_miss_error = false;

/* Export list of courses the requested department offers E.G: ECE */
exports.department = function(req, res) {
    var cacheID = api.genCacheID(req);
    if(!cacheRequest(req)) {
        cacheMiss();
    } else {
        checkCache(res, cacheID, cacheMiss);
    }

    //Cache Miss action
    function cacheMiss() {
        api.getDepartment(req.params.department, function(data) {
            resetCache(cacheID, data)            
            res.jsonp(data);
        });
    }

}

/* Particular Course information - E.g: ECE 2035 */
exports.course = function(req, res){
    var cacheID = api.genCacheID(req);
    if(!cacheRequest(req)) {
        cacheMiss();
    } else { 
        checkCache(res, cacheID, cacheMiss);
    }
    
    //Cache Miss Action
    function cacheMiss() {
        api.getCourse(req.params.department, req.params.course, function(data) {
            resetCache(cacheID, data);
            res.jsonp(data);
        });
    }
}

/* every section in the current year for requested course */
exports.year = function(req, res){
    var cacheID = api.genCacheID(req);
    if(!cacheRequest(req)) {
        cacheMiss();
    } else {
        checkCache(res, cacheID, cacheMiss);
    }
    function cacheMiss() {
        api.getYear(req.params.department, req.params.course, req.params.year, function(data) {
            resetCache(cacheID, data);
            res.jsonp(data);
        });
    }
    
}

/* List of sections in the current year/semester for requested course */
exports.semester = function(req, res){
    var cacheID = api.genCacheID(req);
    if(!cacheRequest(req)) {
        cacheMiss();
    } else {
        checkCache(res, cacheID, cacheMiss);
    }
    function cacheMiss() {
        api.getSemester(req.params.department, req.params.course, req.params.year, req.params.semester, function(data) {
            resetCache(cacheID, data);
            res.jsonp(data);
        });
    }
}

/* Information on the requested section */
exports.section = function(req, res) {
    var cacheID = api.genCacheID(req);
    if(!cacheRequest(req)) {
        cacheMiss();
    /* 
        We want more up to date information for this section,
        hence we check the last_modified param, if > 'x' time refresh 
    */
    } else {
        api.getCache(api.config.cache_database['oscar_api'], cacheID, function(cache) {
            if(cache.hasOwnProperty('data') && cache.hasOwnProperty('last_modified')) { //Cache Hit
                var last_modified = new Date(cache.last_modified);
                var current = new Date();
                if((current - last_modified) < api.config.sectionCacheHoldTime) { //No refresh needed
                    res.jsonp(cache.data);
                } else {
                    cacheMiss();
                }
            } else {
                cacheMiss();
            }
        });

    }

    function cacheMiss() {
        api.getSection(req.params.department, req.params.course, req.params.year, 
                         req.params.semester, req.params.section, function(data) {
            resetCache(cacheID, data);
            res.jsonp(data);
        });
    }
}


function resetCache(cacheID, data) {
    if(!(Array.isArray(data) && data.length == 0)) { //don't cache empty arrays
        api.setCache(api.config.cache_database['oscar_api'], cacheID, {'data' : data, 'last_modified' : new Date() } );         
    }
}

/*
    Checks cache for content, if found sends the cache to user, 
        else hits the cache miss action
                                                    */
function checkCache(res, cacheID, cacheMiss) {
    api.getCache(api.config.cache_database['oscar_api'], cacheID, function(cache) {
        if(cache.hasOwnProperty('data')) {
            res.jsonp(cache.data);
        } else {
            cacheMiss();
        }
    });
}
//Handle cacheHit/Miss actions
function cacheRequest(req) {
    if(req.query.hasOwnProperty('cache') && req.query.cache === 'false') {
        return false;
    } else {
        return true;
    }
}