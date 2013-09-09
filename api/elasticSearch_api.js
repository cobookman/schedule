var oscar_api = require('./oscar_api.js').init();
var core_curriculum = require('./core_curriculum_api.js').init();
var grade_api = require('./grade_api.js').init();

//run and inherit core_api constructor
function elasticSearch_api() {
	//Get The core_api course list so-as to be included into es
	this.core_areas = [ 'areaC', 'areaE', 'globalPerspectives', 'usPerspectives', 'ethics' ];
}

exports.init = function() {
   return new elasticSearch_api();
}

/* For function query params is:
	{
		"query" : req.query.query,
		"from" : from, //Optional Param
		"year" : req.params.year,
		"semester" : req.params.semester //case insensitve
	};
*/
elasticSearch_api.prototype.query = function(params, callback) {
	var esquery = {
		"from" : 0, "size" : 25,
		"query" : {
			"bool" : {
				"must" : [
					{
						"query_string" : { 
							"analyze_wildcard" : "true",
							"query" : params.query
						}
					}
				]
			}
		}
	};

	if(!isNaN(params.from)) {
		esquery.from = params.from;
	}

	//gpa filtering regex
	var gpaMore = /gpa\s*(?:more than|greater than|>)\s*([0-9]+\.*[0-9]*)/i,
		gpaLess = /gpa\s*(?:less than|<)\s*([0-9]+\.*[0-9]*)/i,
		gpaRange = /gpa\s*(?:between|from|range|range from|ranges|ranges from|>)\s*([0-9]+\.*[0-9]*)\s*(?:to|-|<|and <)\s*([0-9]+\.*[0-9]*)/i;
	if(match = gpaRange.exec(params.query)) {
		esquery.query.bool.must.push({
			"range" : {
				"grade.gpa.mean" : {
					"from" : match[1],
					"to" : match[2]
				}
			}
		});
	} else if(match = gpaLess.exec(params.query)) {
		esquery.query.bool.must.push({
			"range" : {
				"grade.gpa.mean" : {
					"from" : "0",
					"to" : match[1]
				}
			}
		});
	} else if(match = gpaMore.exec(params.query)) {
		esquery.query.bool.must.push({
			"range" : {
				"grade.gpa.mean" : {
					"from" : match[1],
					"to" : "99"
				}
			}
		});
	}
	//Course Level filtering
	var courseLevel = /([0-9]+)(?:x+)/i;
	if(match = courseLevel.exec(params.query)) {
		esquery.query.bool.must.push({
			"wildcard" : {
				"number" : match[1] + "*"
			}
		});
	}

	//Parse out professor
	var profs = /(?:taught by)\s*(\w+)/
	if(match = profs.exec(params.query)) {
		esquery.query.bool.must.push({
			"query_string" : {
				"default_field" : "profs",
				"query" : match[1]
			}
		});
	}
	
	var esURL = oscar_api.config.es.host + ":" + oscar_api.config.es.port + "/" + params.year + "/" + params.semester.toUpperCase();
	oscar_api.request.get({ "uri" : esURL + '/_search', "body" : JSON.stringify(esquery) }, function(error, response, body) {
		if(error || !body || JSON.parse(body).error) {		
			throw new Error(JSON.parse(body).error);
		} else {
			//Get search results from scrollID
			body  = JSON.parse(body);
			callback(body);
		}
	});
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
	var esURL = oscar_api.config.es.host + ":" + oscar_api.config.es.port + "/" + esPath;

	oscar_api.request.put({ "uri" : esURL, "body" : JSON.stringify(esRecord) }, function(error, response, body) {
		if(error || !body || JSON.parse(body).error) {
			console.log(esPath);
			console.log(esRecord);
			throw new Error(JSON.parse(body).error);
		} else {
			console.log("Pushed to ES: " + esPath); 
		}
	});
}