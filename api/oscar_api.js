var htmlparser = require('htmlparser2');
var request = require('request');
exports.init = function() {
	return new oscar_api();
}
function oscar_api() {
}

oscar_api.prototype.getDepartment = function(department_name, callback) {
	request('http://example.com', function(error, response, body) {
		if(!error && response.statusCode == 200) {
			
			
			typeof callback === 'function' && callback(body);
		}
	});
}

oscar_api.prototype.getCourse = function(department_name, course) {
	return 'hola';
}

oscar_api.prototype.getYear = function(department_name, course, year) {
	return 'Params: ' + department_name;
}

oscar_api.prototype.getSemester = function(department_name, course, year, semester) {
	return 'Params: ' + department_name;
}

oscar_api.prototype.getSection = function(department_name, course, year, semester, section) {
	return 'Params: ' + department_name;
}