var api = require('../../api/grade_api').init();
var dbName = 'grade_data_api';

exports.course = function(req, res) {
    api.getCourseData(req, dbName, function(data) {
        res.jsonp(data);
    });
}

exports.prof = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    
    api.getCourseData(req, dbName, function(data) {
        if(data.hasOwnProperty(profID)) {
            res.jsonp(data[profID]);
        } else { 
            res.jsonp(false);
        }
    });
}

exports.year = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var year = req.params.year;

    api.getCourseData(req, dbName, function(data) {
        if(data.hasOwnProperty(profID) && data[profID].hasOwnProperty(year)) {
            res.jsonp(data[profID][year]);
        } else { 
            res.jsonp(false);
        }
    });
}

exports.semester = function(req, res) {
    var profID = req.params.profID.toUpperCase();
    var year = req.params.year;
    var semester = req.params.semester.toLowerCase();

    api.getCourseData(req, dbName, function(data) {
        if(data.hasOwnProperty(profID) && data[profID].hasOwnProperty(year) && data[profID][year].hasOwnProperty(semester)) {
            res.jsonp(data[profID][year][semester]);
        } else { 
            res.jsonp(false);
        }
    });
}

