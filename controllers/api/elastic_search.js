var dbName = 'grade_data_api';
var year = '2012';
var semester = 'fall';
var api = require('../../api/elasticSearch_api').init();


exports.refresh = function(req, res) {
    api.refreshES(req.params.year, req.params.semester);
    res.send("Refeshing ElasticSearch, for year: " + req.params.year + ", semester: " + req.params.semester);
}

exports.search = function(req, res) {   
    api.getResults(req, function(data) {
        res.jsonp(data);
    });
}