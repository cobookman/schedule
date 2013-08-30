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
			for(var i = 0; i < data.length; i++) {
				// console.log("data["+i+"]: " + data[i].length);
			}
			
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
					structuredData[item.courseID] = {};
				}
				if(typeof structuredData[item.courseID][item.profID] === 'undefined') {
					structuredData[item.courseID][item.profID] = { 'name' : item.Prof };
				}
				if(typeof structuredData[item.courseID][item.profID][year] === 'undefined') {
					structuredData[item.courseID][item.profID][year] = {};
				}
				if(typeof structuredData[item.courseID][item.profID][year][semester] ==='undefined') {
					structuredData[item.courseID][item.profID][year][semester] = { };
				}

				structuredData[item.courseID][item.profID][year][semester][item.Section] = {
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
			console.log("DONE");
	});
}
