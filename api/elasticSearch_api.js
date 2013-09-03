var oscar_api = require('./oscar_api.js').init();
var core_curriculum = require('./core_curriculum_api.js').init();
var grade_api = require('./grade_api.js').init();

//run and inherit core_api constructor
function elasticSearch_api() {
	//Get The core_api course list so-as to be included into es
	var that = this;
	this.core_areas = [ 'areaC', 'areaE', 'globalPerspectives', 'usPerspectives', 'ethics' ];
	//TEMP
	this.refreshES('2013', 'fall');
}

exports.init = function() {
   return new elasticSearch_api();
}
/*
	Wrapper function which refreshes the core curriculum cache, then refreshes ES Records
																							*/
elasticSearch_api.prototype.refreshES = function(year, semester) {
	var that = this;
	this.refreshCore(function() {
		that.refreshESRecords(year, semester);
	});
}


elasticSearch_api.prototype.refreshCore = function(callback) {
	var that = this;
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
						callback();
					});	
				});
			});
		});
	});
}

elasticSearch_api.prototype.getGPA = function(courseDepart, courseNumber, callback) {
	var cacheID = grade_api.genCacheID(courseDepart, courseNumber);
	var dbName = 'grade_data_api';

	grade_api.checkCache(dbName, cacheID, cacheHit, cacheMiss);

	function cacheHit(cache) {
		if(cache.hasOwnProperty('data') && cache.data.hasOwnProperty('statistics')) {
			callback(cache.data.statistics);
		} else {
			throw new Error("Course ("+courseDepart+courseNumber+") does not have a statistics subset, please refresh grade statistics");
		}
	}

	function cacheMiss() { //Must be new course
		callback('');
	}
	
}
/*
	Checks the core records to find which areas it matches the specified course
																				*/
elasticSearch_api.prototype.check_core_areas = function(courseDepart, courseNumber) {
	var output = [];
	for(var area in this.core_areas) {
		var courseList = this[this.core_areas[area]];
		for(var entry in courseList) {
			if((courseDepart.toUpperCase() === courseList[entry].department.toUpperCase()) && 
			   (courseNumber.toUpperCase() === courseList[entry].number.toUpperCase())) { 
				output.push(this.core_areas[area]);
				break; //No need to keep checking the courseList, we've found our course
			}
		}
	}
	return output;
}

elasticSearch_api.prototype.refreshESRecords = function(year, semester) {
	var that = this;
	var departments = oscar_api.departments;
	var params = {
		"year" : year,
		"semester" : semester,
		"department" : ""
	};
	for(var depart in departments) {
		params.department = depart;
		oscar_api.getDepartment(params, processDepartment);
	}

	function processDepartment(data) {
		for(var courseNum in data) {
			that.genESRecord(data[courseNum]);
		}
	}
}

elasticSearch_api.prototype.genESRecord = function(courseData) {
	var that = this;
	var core_areas = this.check_core_areas(courseData.department, courseData.number); //Ethics, Social Science...

	this.getGPA(courseData.department, courseData.number, function(gpaStats) {
		var esRecord = ({
			"name" : courseData.name,
			"department" : {
				"code" : courseData.department, 
				"name" : grade_api.departments[courseData.department]
			},
			"number" : courseData.number,
			"description" : courseData.description,
			"creditHours" : courseData.creditHours,
			"lectureHours" : courseData.lectureHours,
			"labHours" : courseData.labHours,
			"gradeBasis" : courseData.grade_basis,
			"core_areas" : core_areas,
			"grade" : gpaStats
		});
		that.pushESRecord(esRecord, (courseData.department+""+courseData.number));
	});
}

elasticSearch_api.prototype.pushESRecord = function(esRecord, id) {
	//TODO
}