var core_api = require("./core_api.js");
//run and inherit core_api constructor
function grade_api() {
    core_api.call(this);
}
//Inherit core_api's
grade_api.prototype = Object.create(core_api.prototype);

exports.init = function() {
   return new grade_api();
}

grade_api.prototype.genCacheID = function(department, course) {
	if(typeof department === 'undefined' || typeof course === 'undefined') {
		return false;
	} else {
		return ("" + department.toUpperCase() + course.toUpperCase());
	}
}


grade_api.prototype.updateStatistics = function(dbName, callback) {
	var cacheIDlist = this.checkCache(dbName, '_all_docs', parseList, error);
	var that = this;
	function parseList(idList) {
		for(var i = 0; i < idList.length; i++) {
			/* For each ID in the list, fetch the data, and 'parse the course data'
				So that statistics can be generated
				if a cacheMiss occurs throw an error
														*/
			that.checkCache(dbName, idList[i].id, parseCourse, error);
		}

		//Action after updated
		callback();
		function parseCourse(course) {
			var courseOverall = {
				'A' : [],
				'B' : [],
				'C' : [],
				'D' : [],
				'F' : [],
				'W' : [],
				'gpa' : []
			}
			console.log("Running parseCourse for: " + course._id);
			for(var prof in course.data.profs) {
				var profOverall = {
					'A' : [],
					'B' : [],
					'C' : [],
					'D' : [],
					'F' : [],
					'W' : [],
					'gpa' : []
				}
				for(var year in course.data.profs[prof].years) {
					for(var semester in course.data.profs[prof].years[year].semesters) {
						for(var section in course.data.profs[prof].years[year].semesters[semester].sections) {
							var sectionData = course.data.profs[prof].years[year].semesters[semester].sections[section];
							for(var property in sectionData) {
								if(courseOverall.hasOwnProperty(property)) {
									courseOverall[property].push(sectionData[property]);
								}
								if(profOverall.hasOwnProperty(property)) {
									profOverall[property].push(sectionData[property]);
								}
							}//Property Loop
						}//Section loop
					}//Semester Loop
				}//year loop
				//End of enumeration of professor's statistics, calculate statistics and push
				var profStats = {
					'gpa' : that.genBoxplotStats(that.toFloat(profOverall.gpa)),
					'A' : that.jStat.mean(that.toFloat(profOverall.A)).toFixed(2),
					'B' : that.jStat.mean(that.toFloat(profOverall.B)).toFixed(2),
					'C' : that.jStat.mean(that.toFloat(profOverall.C)).toFixed(2),
					'D' : that.jStat.mean(that.toFloat(profOverall.D)).toFixed(2),
					'F' : that.jStat.mean(that.toFloat(profOverall.F)).toFixed(2),
					'W' : that.jStat.mean(that.toFloat(profOverall.W)).toFixed(2)
				};
				course.data.profs[prof].statistics = profStats;
			}//Prof Loop
			var courseStats = {
				'gpa' : that.genBoxplotStats(that.toFloat(courseOverall.gpa)),
				'A' : that.jStat.mean(that.toFloat(courseOverall.A)).toFixed(2),
				'B' : that.jStat.mean(that.toFloat(courseOverall.B)).toFixed(2),
				'C' : that.jStat.mean(that.toFloat(courseOverall.C)).toFixed(2),
				'D' : that.jStat.mean(that.toFloat(courseOverall.D)).toFixed(2),
				'F' : that.jStat.mean(that.toFloat(courseOverall.F)).toFixed(2),
				'W' : that.jStat.mean(that.toFloat(courseOverall.W)).toFixed(2)			
			}
			course.data.statistics = courseStats;
			//Update each cache
			that.setCache(dbName, course._id, course);
		}//End parseCourse function

	}

	function error() {
		throw new Error("Error while parsing data");
	}
}

/* 
	Super ugly code which I used to migrate my mysql database to couchdb
	phymyadmin gave incorrect json, hence the multiple replace statements - ugly I know
	This is being kept in case I need to perform this operation again sometime in the future
																						*/
grade_api.prototype.push2Cache = function(dbName, filepath) {
	fs = require('fs');
	var that = this;
	fs.readFile(filepath, 'utf8', function(err, data) {
		if(err) {
			console.log("ERROR!" + err); 
			return false; 
		}
		//Get rid of stupid phpmyadmin header /** **/
		
			data = data.split('/');
			// for(var i = 0; i < data.length; i++) {
			// 	console.log("data["+i+"]: " + data[i].length);
			// }
			
			data[6] = data[6].replace(/\\/g, "").replace(/(:\s+)(\w+\.?\w*)/g, '$1"$2"').replace(/\w+(\")+\w/g, '$1').replace(/\"\"(\w+)\"\"/g,'"$1"').replace(/\"(\w+)\"\"/g, '$1"');
			var data = JSON.parse(data[6]);
			console.log(data[0]);
			//Start generating structured objc
			var structuredData = {};
			for(item in data) {
				//Parse year/semester
				var item = data[item];
					item.Year= item.Year.split(' ');

				var year = item.Year[1],
					semester = item.Year[0].toLowerCase();
				
				//INIT crazy obj
				if(typeof structuredData[item.courseID] === 'undefined') {
					structuredData[item.courseID] = { 'profs' : {} };
				}
				if(typeof structuredData[item.courseID].profs[item.profID] === 'undefined') {
					structuredData[item.courseID].profs[item.profID] = { 'name' : item.Prof, 'years' : {} };
				}
				if(typeof structuredData[item.courseID].profs[item.profID].years[year] === 'undefined') {
					structuredData[item.courseID].profs[item.profID].years[year] = { 'semesters' : {} };
				}
				if(typeof structuredData[item.courseID].profs[item.profID].years[year].semesters[semester] ==='undefined') {
					structuredData[item.courseID].profs[item.profID].years[year].semesters[semester] = { 'sections' : {} };
				}

				structuredData[item.courseID].profs[item.profID].years[year].semesters[semester].sections[item.Section] = {
  					'A': item.A,
  					'B': item.B,
  					'C': item.C,
  					'D': item.D,
  					'F': item.F,
  					'W': item.W,
  					'size': item.Size,
  					'gpa': item.GPA 
				};
			}
			//Push data to database
			for(courseID in structuredData) {
				that.setCache(dbName, courseID, { 'data' : structuredData[courseID] });
			}
			//Update statistics
			// var dbName = 'grade_data_2';
			// that.updateStatistics(dbName, function() {});
			console.log("DONE");
	});
}
