var dbName = 'grade_data_api';
var year = '2013';
var semester = 'fall';
var api = require('../../api/elasticSearch_api').init();


exports.refresh = function(req, res) {
	api.refreshES(year, semester);
}