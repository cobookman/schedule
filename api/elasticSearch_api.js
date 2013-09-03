var oscar_api = require('./oscar_api.js').init();
var core_curriculum = require('./core_curriculum_api.js').init();

//run and inherit core_api constructor
function elasticSearch_api(dbName, year, semester) {
	//Get The core_api course list so-as to be included into es
	var that = this;
	this.core_areas = [ 'areaC', 'areaE', 'globalPerspectives', 'usPerspectives', 'ethics' ];
	core_curriculum.areaC(function(data) { 
		that.areaC = data; 
		core_curriculum.areaE(function(data) {
			that.areaE = data; 
			core_curriculum.globalPerspectives(function(data) {
				that.globalPerspectives = data;
				core_curriculum.usPerspectives(function(data) { 
					that.usPerspectives = data;
					core_curriculum.ethics(function(data) {
						that.ethics = data;
						that.refreshES(dbName, year, semester);
					});	
				});
			});
		});
	});
}

exports.init = function(dbName, year, semester) {
   return new elasticSearch_api(dbName, year, semester);
}

elasticSearch_api.prototype.check_core_areas = function(courseDepart, courseNumber) {
	var output = [];
	for(var area in this.core_areas) {
		var courseList = this[this.core_areas[area]];
		for(var entry in courseList) {
			if((courseDepart.toUpperCase() === courseList[entry].department.toUpperCase()) && 
			   (courseNumber.toUpperCase() === courseList[entry].number.toUpperCase())) { 
				output.push(this.core_areas[area]);
			}
		}
	}
	return output;
}

elasticSearch_api.prototype.refreshES = function(dbName, year, semester) {
	var that = this;
	var departments = oscar_api.departments;
	var params = {
		"year" : year,
		"semester" : semester,
		"department" : ""
	};
	for(var depart in departments) {
		// console.log("Updating ElasticSearch for department: " + depart);
		params.department = depart;
		oscar_api.getDepartment(params, processDepartment);
	}

	function processDepartment(data) {
		for(var courseNum in data) {
			var esRecord = that.genESRecord(data[courseNum]);
			//TODO - PUSH RECORD
		}
	}
}

elasticSearch_api.prototype.genESRecord = function(courseData) {
	//TODO - GET GPA
	var core_areas = this.check_core_areas(courseData.department, courseData.number); //Ethics, Social Science...
	return ({
		"name" : courseData.name,
		"department" : courseData.department,
		"number" : courseData.number,
		"description" : courseData.description,
		"creditHours" : courseData.creditHours,
		"lectureHours" : courseData.lectureHours,
		"labHours" : courseData.labHours,
		"gradeBasis" : courseData.grade_basis,
		"core_areas" : core_areas
	});
}