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

elasticSearch_api.prototype.getGradeData = function(courseDepart, courseNumber, callback) {
	var cacheID = grade_api.genCacheID(courseDepart, courseNumber);
	var dbName = 'grade_data_api';

	grade_api.checkCache(dbName, cacheID, cacheHit, cacheMiss);

	function cacheHit(cache) {
		if(cache.hasOwnProperty('data') && cache.data.hasOwnProperty('statistics') && cache.data.hasOwnProperty('profs')) {
			var profList = [];
			for(var prof in cache.data.profs) {
				profList.push(cache.data.profs[prof].name);
			}
			callback(cache.data.statistics, profList);
		} else {
			throw new Error("Course ("+courseDepart+courseNumber+") does not have a statistics/profs property, please refresh grade statistics");
		}
	}

	function cacheMiss() { 
		callback({}, []); //New course there fore give empty grade obj, and empty profList array
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
	for(var depart in departments) {
		oscar_api.getDepartment(depart, year, semester, processDepartment);
	}

	function processDepartment(data) {
		for(var courseNum in data) {
			that.genESRecord(data[courseNum], function(esRecord) {
				//Generate ES document path (E.g: 2013/Fall/ECE2031)
				var courseID = "" + esRecord.department.code.toUpperCase() + esRecord.number;
				var esPath = year + "/" +semester.toUpperCase() +"/" + courseID;
				that.pushESRecord(esPath, esRecord)
			});
		}
	}
}

elasticSearch_api.prototype.genESRecord = function(courseData, callback) {
	var that = this;
	var core_areas = this.check_core_areas(courseData.department, courseData.number); //Ethics, Social Science...

	this.getGradeData(courseData.department, courseData.number, function(gpaStats, profList) {
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
			"grade" : gpaStats,
			"profs" : profList
		});
		callback(esRecord);
	});
}

elasticSearch_api.prototype.pushESRecord = function(esPath, esRecord) {
	var esURL = oscar_api.config.esHost + ":" + oscar_api.config.esPort + "/" + esPath;
	console.log("Pushing to ES: " + esPath); 

	oscar_api.request.put({ "uri" : esURL, "body" : JSON.stringify(esRecord) }, function(error, response, body) {
		if(JSON.parse(body).error) {
			console.log(esPath);
			console.log(esRecord);
			throw new Error(JSON.parse(body).error);
		} else {
			if(JSON.parse(body).error) {
				console.log("esURL" + esURL);
				throw new Error(JSON.stringify(esRecord));
			}
		}
	});
	// console.log("Record: " + esPath);
	// console.log(esRecord);
}