var api = require('../../api/grade_api').init();
var dbName = 'grade_data_api';

function getCourseData(req, callback) {
    var cacheID = api.genCacheID(req.params.department, req.params.course);
 
    api.getCache(dbName, cacheID, function(cache) {
        if(cache.hasOwnProperty('data')) {
            callback(cache.data);
        } else {
            cacheMiss();
        }
    });

    function cacheMiss() {
        console.log("ERROR getting course data: getCourseData - "+req.params.department+", " + req.params.course + " - cacheID: " + cacheID);
        res.jsonp('false');
    }
}

//Get grade data for particular course
exports.course = function(req, res) {
    getCourseData(req, function(data) {
        res.jsonp(data);
    });
}
exports.prof = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    getCourseData(req, function(data) {
        if(data.hasOwnProperty(profID)) {
            res.jsonp(data[profID]);
        } else { 
            res.jsonp(false);
        }
    });
}
//given course-profID-semester-year
exports.year = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var year = req.params.year;

    getCourseData(req, function(data) {
        if(data.hasOwnProperty(profID) && data[profID].hasOwnProperty(year)) {
            res.jsonp(data[profID][year]);
        } else { 
            res.jsonp(false);
        }
    });
}

//given course-profID-year-semester
exports.semester = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var year = req.params.year;
    var semester = req.params.semester.toLowerCase();

    getCourseData(req, function(data) {
        if(data.hasOwnProperty(profID) && data[profID].hasOwnProperty(year) && data[profID][year].hasOwnProperty(semester)) {
            res.jsonp(data[profID][year][semester]);
        } else { 
            res.jsonp(false);
        }
    });
}

