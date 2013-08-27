var core_api = require('./core_api.js')
//run and inherit core_api constructor
function core_curriculum_api() {
    core_api.call(this);
}
//Inherit core_api's
core_curriculum_api.prototype = Object.create(core_api.prototype);

exports.init = function() {
   return new core_curriculum_api();
}

core_curriculum_api.prototype.parseLists = function($, courseLists) {
    var output = [];
    for(var i = 0; i < courseLists.length; i++) {
        var courseList_children = $(courseLists[i]).children();
        for(var j = 0; j < courseList_children.length; j++) {
            var courseName = $(courseList_children[j]).text().trim().split(' '); 
                output.push({ 
                    "department" : courseName[0],
                    "number"     : courseName[1]
            });
        }
    }
    return output;
}
core_curriculum_api.prototype.areaC = function(callback) {
    this.getURL('http://www.catalog.gatech.edu/students/ugrad/core/corec.php', process);
    var that = this;
    function process(data) {
        try { 
            var $ = that.cheerio.load(data)
            var output = that.parseLists($, $(".pcourses"));
         } catch(e) {
            console.log("ERROR - core_curriculum_api.areaC()");
            var output = [];
         }


        if(typeof(callback) === 'function') {
            callback(output);
        } else {
            return output;
        }
    }
}
core_curriculum_api.prototype.areaE = function(callback) {
    this.getURL('http://www.catalog.gatech.edu/students/ugrad/core/coree.php', process);
    var that = this;
    function process(data) {
        try {
            var $ = that.cheerio.load(data)
            var output = that.parseLists($, $(".pcourses"));
        } catch(e) {
            console.log("ERROR - core_curriculum_api.areaC()");
            var output = [];
        }

        
        if(typeof(callback) === 'function') {
            callback(output);
        } else {
            return output;
        }
    }
}

core_curriculum_api.prototype.globalPerspectives = function(callback) {
    this.getURL('http://www.catalog.gatech.edu/students/ugrad/core/gp.php', process);
    var that = this;
    function process(data) {
        try {
            var $ = that.cheerio.load(data)
            var output = that.parseLists($, $(".pcourses"));
        } catch(e) {
            console.log("ERROR - core_curriculum_api.globalPerspectives()");
            var output = [];
        }

        if(typeof(callback) === 'function') {
            callback(output);
        } else {
            return output;
        } 
    }
}

core_curriculum_api.prototype.usPerspectives = function(callback) {
    this.getURL('http://www.catalog.gatech.edu/students/ugrad/core/up.php', process);
    var that = this;
    function process(data) {
        try {
            var $ = that.cheerio.load(data);
            var output = that.parseLists($, $(".pcourses"));
        } catch(e) {
            console.log("ERROR - core_curriculum_api.usPerspectives()");
            var output = [];
        }

        if(typeof(callback) === 'function') {
            callback(output);
        } else {
            return output;
        } 
    }
}

core_curriculum_api.prototype.ethics = function(callback) {
    this.getURL('http://www.catalog.gatech.edu/students/ugrad/core/ethics.php', process);
    var that = this;
    function process(data) {
        try {
            var $ = that.cheerio.load(data);
            var output = that.parseLists($, $(".pcourses"));
        } catch(e) {
            console.log("ERROR - core_curriculum_api.ethics()");
            var output = [];
        }

        if(typeof(callback) === 'function') {
            callback(output);
        } else {
            return output;
        } 
    }
}