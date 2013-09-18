var core_api = require("./core_api.js");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; //OSCAR's cert has some issues hence disabling of certs

//run and inherit core_api constructor
function oscar_api() {
    core_api.call(this);
}
//Inherit core_api's
oscar_api.prototype = Object.create(core_api.prototype);

exports.init = function() {
   return new oscar_api();
}

/* 
   Helper Methods of oscar_api class 
                                    */
//Returns string in format of: $(DEPARTMENT)$(COURSENUM)_$(YEAR)$(SEMESTER)
oscar_api.prototype.genCacheID = function(req) {
    var cacheID = '';
    if(typeof req.params.year !== 'string' ||
       typeof req.params.semester !== 'string' ||
       typeof req.params.department !== 'string') {
        
        throw new Error("Cannot gen cacheID without year/semester/department defined");
    } else {
        cacheID += (req.params.year + req.params.semester.toUpperCase() + "-" + req.params.department.toUpperCase());
    }
    
    //Check if given course, else return cacheID
    if(typeof req.params.course !== 'string' && typeof req.params.crn !== 'number') {
        return this.safeString(cacheID);
    } else {
        cacheID += req.params.course.toUpperCase();;
    }

    //Check if given crn
    if(typeof req.params.crn !== 'string' && typeof req.params.crn !== 'number') {
        return this.safeString(cacheID);
    } else {
        return this.safeString(cacheID += '-' + req.params.crn.toUpperCase());
    }
}
oscar_api.prototype.currSemester = function() {
    date = new Date();
    var month = date.getMonth() + 1; //getMonth() has jan as 0
    var semester;
    if(month >= 8) {
        semester = 'fall';
    } else if(month >= 5) {
        semester = 'summer';
    } else {
        semester = 'spring';
    }
    return semester;
}

oscar_api.prototype.genDate = function(year, semester) {
    //Find current year if not provided
    var date = new Date();
    if(typeof year !== "string" && typeof year !== "number") {
        year = date.getFullYear();
    }

    //Find current semester if not provided
    if(typeof semester !== "string") {
        semester = this.currSemester();
    } else {
        semester = semester.toLowerCase();
    }

    switch(semester) {
        case "spring" : semester = '02'; break; 
        case "summer" : semester = '05'; break;
        case "fall"   : semester = '08'; break;
        default : throw new Error("Unknown semester"); return undefined; break;
    }
    return year + semester;
}
oscar_api.prototype.credit2num = function(str) {
    str = str.toLowerCase().split(/to|or/);
    var output = [];
    for(var i = 0; i < str.length; i++) {
        var num = parseFloat(str[i]);
        if(isNaN(num)) { 
            num = ""; 
        } else {
            num = num.toFixed(2);
        }
        output.push(num);
    }
    return output;

}


/*
    converts am/pm time in format of:
    [ "12:00 am" , "1:00 pm"]
    to:
    [ "12:00", "13:00"]

    if not given proper time string outputs ""
*/
oscar_api.prototype.to24hour = function(time) {
    for(var j = 0; j < time.length; j ++) {
        time[j] = time[j].split(/:| /); 
        //Convert 12 hour to 24 hour
        if(time[j].length === 3) {

            time[j][0] = parseInt(time[j][0], 10);
            //Convert pm times to 24 hour format, and handle that 12:xx pm = 12:xx
            if(time[j][2].indexOf('pm') !== -1 && time[j][0] < 12) {
                time[j][0] += 12; 
            //convert 12:00 am to 24 hour format (00:xx)
            } else if(time[j][2].indexOf('am') !== -1 && time[j][0] == 12) {
                time[j][0] = 0;
            }
            time[j] = time[j][0] + ":" + time[j][1];   
        //If not given correct time format of: xx:xx am
        } else {
            time[j] = "";
        }
    }
    return time;
}

/* 
   Core  Methods of oscar_api class 
                                    */
oscar_api.prototype.getDepartment = function(department, year, semester, callback) {

    var year = this.safeString(this.genDate(year, semester));
    department = this.safeString(department.toUpperCase());
    semester = this.safeString(semester);

    var that = this;
    try { 
        this.getURL('https://oscar.gatech.edu/pls/bprod/bwckctlg.p_display_courses?sel_attr=dummy&sel_attr=%25&sel_coll=dummy&sel_coll=%25&sel_crse_end=9999&sel_crse_strt=0&sel_dept=dummy&sel_dept=%25&sel_divs=dummy&sel_divs=%25&sel_from_cred=&sel_levl=dummy&sel_levl=%25&sel_schd=dummy&sel_schd=%25&sel_subj=dummy&sel_subj='+department+'&sel_title=&sel_to_cred=&term_in='+year, process);
    } catch(e) {
        console.log("Error fetching and parsing url: " + JSON.stringify(e));
    }
    
    function process(data) {
        $ = that.cheerio.load(data);
        //a .nttitle has a corr .ntdefault as of Aug 16, 2013
        var courseTitles = $(".nttitle");
        var courseInfos = $(".ntdefault");
        var output = [];
        
        //BUILD JSON for each course
        for(var i = 0; i < courseTitles.length; i++) {
            try {
                var courseSplit = $(courseTitles[i]).text().split(' ');
                var course_fullName = (function() {
                    var fullName = "";
                    for(var j = 3; j < courseSplit.length; j++ ) {
                        fullName += courseSplit[j] + " ";
                    }
                    return fullName.slice(0,-1);
                })();
                var course_num = courseSplit[1],
                infoSplit = $(courseInfos[i]).html().split('<br>');
            
                //Always present
                var course_description = infoSplit[0].trim('\n'),
                credit_hours = infoSplit[1].trim('\n');
            
                //Optional Data
                var lecture_hours = infoSplit[2].trim('\n');

                var lab_hours = "";
                if(lecture_hours!=='') { 
                    var lab_hours = infoSplit[3].trim('\n').replace(/ +(?= )/g,'');
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
                //Fix credit data to numbers
                credit_hours = that.credit2num(credit_hours);
                lecture_hours = that.credit2num(lecture_hours);
                lab_hours = that.credit2num(lab_hours);
                output.push({
                    'department' : department,
                    'number' : course_num,
                    'name' : course_fullName,
                    'description' : course_description,
                    'creditHours' : credit_hours,
                    'lectureHours' : lecture_hours,
                    'labHours' : lab_hours,
                    'grade_basis' : grade_basis,
                    'course_attributes' : course_attributes
                });
            } catch(e) {
                console.log("ERROR, oscar_api.getDepartment("+department+",...), i: " + i);
            }
        }
        //Sanatize output
        for(var i = 0; i < output.length; i++) {
            for(var property in output[i]) {
                output[i].property = that.safeString(output[i].property);
            }
        }
        callback(output);
    }//End Process
}//End getDepartment

oscar_api.prototype.getCourse = function(department, course, year, semester, callback) {
    //Sanatize inputs
    department = this.safeString(department.toUpperCase());
    course = this.safeString(course.toUpperCase());
    year = this.safeString(year);
    semester = this.safeString(semester);

    var date = this.genDate(year, semester);

    var that = this;
    try {
        this.getURL('https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_listcrse?term_in='+date+'&subj_in='+department+'&crse_in='+course+'&schd_in=%', process);
    } catch(e) {
        console.log("Error fetching and parsing url: " + JSON.stringify(e));
    }

    function process(data) {
        $ = that.cheerio.load(data);

        var sectionTitles = $('th.ddtitle');
        var sectionInfo = $('.captiontext'); //Disregard first result
        var output = {
            'department' : department,
            'number' : course,
            'year' : year,
            'semester' : semester,
            'sections' : []
        };

        for(var i = 0; i < sectionTitles.length; i++) {
            var title = $(sectionTitles[i]).text().split(" - "),
                course_CRN      = title[1],
                course_Section  = title[3];
            
            /* Get course Time - Remember that the first sectionInfo is the "Sections Found", so we disregard
                                 hence the +1  
                                 There also might be multiple rows of meeting time information  */

            var meetingInfoRow = $(sectionInfo[i+1]).next().next(),
                meetingInfo = $(meetingInfoRow).children();
                var where = [];
            do {
                var day = $(meetingInfo[2]).text().trim(); //TRIM() needed as day might be empty
                var time = $(meetingInfo[1]).text().split(' - ');
                var location = $(meetingInfo[3]).text();
                if(!location || location.toLowerCase() === 'tba') {
                    location = "";
                }
                var type = $(meetingInfo[5]).text().replace('*','');
                var profs = $(meetingInfo[6]).text().replace(/ +(?= )/g,'').trim();
                
                //Change time from AM/PM to 24 hour format
                var time = that.to24hour(time);
                
                var data = {
                    'day' : day,
                    'time' : time,
                    'location' : location,
                    'type' : type,
                    'profs' : profs
                };
                //Sanatize 
                for(var prop in data) {
                    data[prop] = that.safeString(data[prop]);
                }

                /* Sometimes two profs given */
                data.profs = data.profs.split(', ');

                where.push(data);;
                
                //Get next row
                meetingInfoRow = $(meetingInfoRow).next();
                meetingInfo = $(meetingInfoRow).children();
            } while($(meetingInfo[0]).text() !== "");

                output.sections.push({
                    'crn' : that.safeString(course_CRN),
                    'section' : that.safeString(course_Section),
                    'where' : where
                });
        }

        callback(output);
    }//End Process
}//End getSemester

oscar_api.prototype.getCRN = function(department, course, year, semester, crn, callback) {
    department = this.safeString(department.toUpperCase());
    course = this.safeString(course.toUpperCase());
    year = this.safeString(year);
    semester = this.safeString(semester);
    crn = this.safeString(crn.toUpperCase());

    var date = this.genDate(year, semester);
    
    try { 
        this.getURL('https://oscar.gatech.edu/pls/bprod/bwckschd.p_disp_detail_sched?term_in='+date+'&crn_in='+crn, process);
    } catch(e) {
        console.log("Error fetching and parsing url: " + JSON.stringify(e));
    }

    var that = this;
    function process(data) {
        $ = that.cheerio.load(data);

        var titleHeader = $($(".ddlabel")[0]).text().split(' - ');
        var course_fullName = titleHeader[0],
                course_Section  = titleHeader[3];

        var tableData = $(".dddefault"); 
        var seatsCapacity = $(tableData[1]).text(),
            seatsActual   = $(tableData[2]).text(),
            seatsRemaining =$(tableData[3]).text(),
            waitCapacity = $(tableData[4]).text(),
            waitActual   = $(tableData[5]).text(),
            waitRemaining = $(tableData[6]).text();
        
        var output = {
            'department' : department,
            'number' : course,
            'year' : year,
            'semester' : semester,
            'crn' : crn,
            'name' : course_fullName,
            'section' : course_Section,
            'seats' : {
                'capacity' : seatsCapacity,
                'actual' : seatsActual,
                'remaining' : seatsRemaining,
            },
            'waitlist' : {
                'capacity' : waitCapacity,
                'actual' : waitActual,
                'remaining' : waitRemaining
            }
        }
        for(var i in output) {
            for(var j in output[i]) {
                output[i][j] = that.safeString(output[i][j]);
            }
        }

        callback(output);
    }//End Process
}//End getCRN