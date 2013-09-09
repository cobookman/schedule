var dbName = 'grade_data_api';
var year = '2012';
var semester = 'fall';
var api = require('../../api/elasticSearch_api').init();


exports.refresh = function(req, res) {
	api.refreshES(req.params.year, req.params.semester);
	res.send("Refeshing ElasticSearch, for year: " + req.params.year + ", semester: " + req.params.semester);
}

exports.search = function(req, res) {
	console.log(req.query);
	
	var from = 0; //optional param
	if(req.query.hasOwnProperty('from')) {
		from = req.query.from;
	}

	if(req.query.hasOwnProperty('query')) {
		var params = {
			"query" : req.query.query,
			"from" : from,
			"year" : req.params.year,
			"semester" : req.params.semester
		};
		api.query(params, function(data) { 
			res.jsonp(data);
		});
	} else {
		res.jsonp([]);
	}
}