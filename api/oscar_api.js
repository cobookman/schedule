var request = require('request');
var cheerio = require('cheerio');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; //OSCAR's cert has some issues hence disabling of certs

exports.init = function() {
	return new oscar_api();
}

function oscar_api() {
}

oscar_api.prototype.getURL = function(url, callback) {
	request.get(url, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			typeof callback === 'function' && callback(body);
		} else {
			console.log(response.statusCode + " - ERROR couldn't fetch URL"); 
			callback("ERROR: " + response.statusCode); 
		}
	});
}


oscar_api.prototype.getDepartment = function(department_name, callback) {
	department_name = department_name.toUpperCase();
	this.getURL('https://oscar.gatech.edu/pls/bprod/bwckctlg.p_display_courses?sel_attr=dummy&sel_attr=%25&sel_coll=dummy&sel_coll=%25&sel_crse_end=9999&sel_crse_strt=0&sel_dept=dummy&sel_dept=%25&sel_divs=dummy&sel_divs=%25&sel_from_cred=&sel_levl=dummy&sel_levl=%25&sel_schd=dummy&sel_schd=%25&sel_subj=dummy&sel_subj='+department_name+'&sel_title=&sel_to_cred=&term_in=201308', process);
	function process(data) {
		$ = cheerio.load(data);
		//a .nttitle has a corr .ntdefault as of Aug 16, 2013
		var courseTitles = $(".nttitle");
		var courseInfos = $(".ntdefault");
		var output = {};

		//BUILD JSON for each course
		for(var i = 0; i < courseTitles.length; i++) {
			var courseSplit = $(courseTitles[i]).text().split(' ');
			var course_fullName = (function() {
					var fullName = "";
					for(var i = 3; i < courseSplit.length; i++ ) {
						fullName += courseSplit[i] + " ";
					}
					return fullName.slice(0,-1);
			})();

			var course_num = courseSplit[1],
				infoSplit = $(courseInfos[i]).html().split('<br>');
			
			//Always present
			var	course_description = infoSplit[0].trim('\n'),
				credit_hours = infoSplit[1].trim('\n');
			

			//Optional Data
			var lecture_hours = infoSplit[2].trim('\n').replace('  ',' ');

			var lab_hours = "";
			if(lecture_hours!=='') { 
				var lab_hours = infoSplit[3].trim('\n');
			}

			var grade_basis = '';
			if(lab_hours !== "") {
				var grade_basis = infoSplit[5].split('>')[2].trim('\n').replace('&amp;', '&');
			} else if(lecture_hours !== "") {
				var grade_basis = infoSplit[4].split('>')[2].trim('\n').replace('&amp;', '&');
			} else {
				var grade_basis = infoSplit[3].split('>')[2].trim('\n').replace('&amp;', '&');
			}

			var course_attributes = '';
			if(infoSplit.length > 8) {
				var course_attributes = infoSplit[8].trim('\n').replace('&amp;', '&');
			}

			output[course_num] = {
				'name' : course_fullName,
				'description' : course_description,
				'creditHours' : credit_hours,
				'lectureHours' : lecture_hours,
				'labHours' : lab_hours,
				'grade_basis' : grade_basis,
				'course_attributes' : course_attributes
			}
		}
		if(typeof(callback) == 'function') {
			callback(JSON.stringify(output));
		} else {
			return output;
		}
	}
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