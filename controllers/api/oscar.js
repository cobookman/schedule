var api = require('../../api/oscar_api').init();
var dbName = 'oscar_api';
////////////////////////
/// Helper Functions ///
////////////////////////
/* 
    DRY implementation of a cache check, 
    it routes to cacheMiss() on a cacheMiss
                                                                    */
function sendData(req, res, cacheID, cacheMiss) {
    if(!api.cacheRequest(req)) {
        cacheMiss();
    } else {
        api.checkCache(dbName, cacheID, cacheHit, cacheMiss);
    }

    function cacheHit(cache) {
        if(cache.hasOwnProperty('data')) {
            res.jsonp(cache.data);
        } else { //Doesn't have the necessary propety we need
            cacheMiss();
        }
    }
}

/////////////////////
/// ROUTE ACTIONS ///
/////////////////////
/* Export list of courses the requested department offers E.G: ECE */
exports.department = function(req, res) {
    var cacheID = api.genCacheID(req);
    sendData(req, res, cacheID, cacheMiss);
    
    function cacheMiss() {
        api.getDepartment(req.params.department, function(data) {
            api.resetCache(dbName, cacheID, data)            
            res.jsonp(data);
        });
    }
}

/* Particular Course information - E.g: ECE 2035 */
exports.course = function(req, res){
    var cacheID = api.genCacheID(req);
    sendData(req, res, cacheID, cacheMiss);
    
    function cacheMiss() {
        api.getCourse(req.params.department, req.params.course, function(data) {
            api.resetCache(dbName, cacheID, data);
            res.jsonp(data);
        });
    }
}

/* List of sections in the current year/semester for requested course */
exports.semester = function(req, res){
    var cacheID = api.genCacheID(req);
    sendData(req, res, cacheID, cacheMiss);

    function cacheMiss() {
        api.getSemester(req.params.department, req.params.course, req.params.year, req.params.semester, function(data) {
            api.resetCache(dbName, cacheID, data);
            res.jsonp(data);
        });
    }
}

/* 
    Information on the requested section 
    -Differs from above functions in that cache is only held for < 5mins
                                                                                */
exports.section = function(req, res) {
    var cacheID = api.genCacheID(req);

    if(!api.cacheRequest(req)) { //Did they ask for cache hit?
        cacheMiss();
    } else {
        api.getCache(dbName, cacheID, cacheHit, cacheMiss);
    }

    function cacheHit(cache) {
        if(cache.hasOwnProperty('data') && cache.hasOwnProperty('last_modified')) {
            var timeHeld = (new Date()) - (new Date(cache.last_modified)); 
            if( timeHeld < api.config.sectionCacheHoldTime) {
                res.jsonp(cache.data);
            } else {
                cacheMiss();
            }
        } else { //Cache Was not formatted correctly
            cacheMiss();
        }
    }

    function cacheMiss() {
        api.getSection(req.params.department, req.params.course, req.params.year, 
                         req.params.semester, req.params.section, function(data) {
            api.resetCache(dbName, cacheID, data);
            res.jsonp(data);
        });
    }
}
