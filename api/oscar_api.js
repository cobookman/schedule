var htmlparser = require('htmlparser2');
var request = require('request');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; 
exports.init = function() {
	return new oscar_api();
}
function oscar_api() {
}

oscar_api.prototype.getDepartment = function(department_name, callback) {
	var r = request.get('https://oscar.gatech.edu/pls/bprod/bwckctlg.p_display_courses?sel_attr=dummy&sel_attr=%25&sel_coll=dummy&sel_coll=%25&sel_crse_end=9999&sel_crse_strt=0&sel_dept=dummy&sel_dept=%25&sel_divs=dummy&sel_divs=%25&sel_from_cred=&sel_levl=dummy&sel_levl=%25&sel_schd=dummy&sel_schd=%25&sel_subj=dummy&sel_subj=ECE&sel_title=&sel_to_cred=&term_in=201308', function(error, response, body) {
		if(!error && response.statusCode == 200) {
			console.log(body);
			typeof callback === 'function' && callback(body);
		} else { console.log(response.statusCode + ""); callback(response.statusCode + ""); }
	});
}

oscar_api.prototype.getCourse = function(department_name, course, callback) {
	return 'hola';
}

oscar_api.prototype.getYear = function(department_name, course, year, callback) {
	return 'Params: ' + department_name;
}

oscar_api.prototype.getSemester = function(department_name, course, year, semester, callback) {
	return 'Params: ' + department_name;
}

oscar_api.prototype.getSection = function(department_name, course, year, semester, section, callback) {
	return 'Params: ' + department_name;
}