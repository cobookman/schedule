var dbName = 'grade_data_api';
var year = '2012';
var semester = 'fall';
var api = require('../../api/elasticSearch_api').init();


exports.refresh = function(req, res) {
	api.refreshES(req.params.year, req.params.semester);
	res.send("Refeshing ElasticSearch, for year: " + req.params.year + ", semester: " + req.params.semester);
}

exports.scrollID = function(req, res) {
	if(req.params.scrollID) {
		api.scrollID(req.params.scrollID, function(data) {
			res.jsonp(data);
		});
	} else {
		res.jsonp([]);
	}
}
exports.search = function(req, res) {
	console.log(req.query);
	if(req.query.hasOwnProperty('query')) {
		api.query(req.query.query, req.params.year, req.params.semester, function(data) { 
			res.jsonp(data);
		});
	} else {
		res.jsonp([]);
	}
}