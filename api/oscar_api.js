exports.init = function() {
	return new oscar_api();
}

function oscar_api() {
}

oscar_api.prototype.getDepartment = function(department_name) {
	return 'Params: ' + department_name;
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