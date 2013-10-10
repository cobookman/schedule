var front_end_api = require('../../api/front_end.js').init();

exports.get = function(req, res) {
	front_end_api.schedules_get({"username" : req.params.username}, function(user_schedules) {
		res.jsonp(user_schedules);
	});
}
exports.put = function(req, res) {

}
exports.delete = function(req, res) {

}