var request = require('request');
var cheerio = require('cheerio');

exports.init = function() {
    return new core_api();
}

function core_api() {
}

core_api.prototype.getURL = function(url, callback) {
    request.get(url, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            typeof callback === 'function' && callback(body);
        } else {
            console.log(response.statusCode + " - ERROR couldn't fetch URL"); 
            callback("ERROR: " + response.statusCode); 
        }
    });
}

core_api.prototype.areaC = function(callback) {
	this.getURL('http://www.catalog.gatech.edu/students/ugrad/core/corec.php', process);
    function process(data) {
    	try { 
        	$ = cheerio.load(data);
        	var courseLists = $(".pcourses");
        	var output = [];
        	for(var i = 0; i < courseLists.length; i++) {
	        	var courseList_children = $(courseLists[i]).children();
        		for(var j = 0; j < courseList_children.length; j++) {
	        		var courseName = $(courseList_children[j]).text().trim().split(' '); 
        			output.push({ 
        				"department" : courseName[0],
        				"number"	 : courseName[1]
        			});
        		}
        	}
        } catch(e) {
			console.log("ERROR - core_api.areaC()");
          	var output = "ERROR, please refer to documentation";
        }


        if(typeof(callback) === 'function') {
            callback(output);
        } else {
            return output;
        }
    }
}

core_api.prototype.areaE = function(callback) {
	this.getURL('http://www.catalog.gatech.edu/students/ugrad/core/coree.php', process);
	function process(data) {
		try {
        	$ = cheerio.load(data);
			var courseLists = $(".pcourses");
        	var output = [];
        	for(var i = 0; i < courseLists.length; i++) {
	        	var courseList_children = $(courseLists[i]).children();
        		for(var j = 0; j < courseList_children.length; j++) {
	        		var courseName = $(courseList_children[j]).text().trim().split(' '); 
        			output.push({ 
        				"department" : courseName[0],
        				"number"	 : courseName[1]
        			});
        		}
        	}
		} catch(e) {
			console.log("ERROR - core_api.areaC()");
          	var output = "ERROR, please refer to documentation";
        }

        
        if(typeof(callback) === 'function') {
            callback(output);
        } else {
            return output;
        }
	}
}