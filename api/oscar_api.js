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
oscar_api.prototype.genDate = function(semester, year) {
    //Find current year if not provided
    var date = new Date();
    if(typeof year === "undefined") {
        year = date.getFullYear();
    }

    //Find current semester if not provided
    if(typeof semester === "undefined") {
        var month = date.getMonth() + 1; //getMonth() has jan as 0
        if(month >= 8) {
            semester = 'fall';
        } else if(month >= 5) {
            semester = 'summer';
        } else {
            semester = 'spring';
        }
    } else {
        semester = semester.toLowerCase();
    }
    switch(semester) {
        case "spring" : semester = '02'; break; 
        case "summer" : semester = '05'; break;
        case "fall"   : semester = '08'; break;
        default : console.log("ERROR - No semester provided"); return undefined; break;
    }
    return year + semester;
}
oscar_api.prototype.credit2num = function(str) {
    str = str.toLowerCase().split(/to|or/);
    var output = [];
    for(var i = 0; i < str.length; i++) {
        output.push(parseInt(str[i], 10));
    }
    return output;

}
oscar_api.prototype.to24hour = function(time) {
    for(var j = 0; j < time.length; j ++) {
        if(time[j].indexOf('pm') !== -1) { //has pm
            time[j] = time[j].split(/:| /);
            time[j] = parseInt(time[j][0], 10)+12 + ":" + time[j][1];
        } else if(time[j].indexOf('am') !== -1) {
            time[j] = time[j].split(/:| /);
            time[j] = time[j][0] + ":" + time[j][1];
        } 
    }
    return time;
}
oscar_api.prototype.getDepartment = function(department, callback) {
    department = department.toUpperCase();
    var year = this.genDate();
    var that = this;
    this.getURL('https://oscar.gatech.edu/pls/bprod/bwckctlg.p_display_courses?sel_attr=dummy&sel_attr=%25&sel_coll=dummy&sel_coll=%25&sel_crse_end=9999&sel_crse_strt=0&sel_dept=dummy&sel_dept=%25&sel_divs=dummy&sel_divs=%25&sel_from_cred=&sel_levl=dummy&sel_levl=%25&sel_schd=dummy&sel_schd=%25&sel_subj=dummy&sel_subj='+department+'&sel_title=&sel_to_cred=&term_in='+year, process);
    function process(data) {
        // try {        //If incorrect department given, this will crash...so we use try-catch
        $ = cheerio.load(data);
        //a .nttitle has a corr .ntdefault as of Aug 16, 2013
        var courseTitles = $(".nttitle");
        var courseInfos = $(".ntdefault");
        var output = [];


        //BUILD JSON for each course
        for(var i = 0; i < courseTitles.length; i++) {
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
                'number' : course_num,
                'name' : course_fullName,
                'description' : course_description,
                'creditHours' : credit_hours,
                'lectureHours' : lecture_hours,
                'labHours' : lab_hours,
                'grade_basis' : grade_basis,
                'course_attributes' : course_attributes
            });
        }



        // } catch (e) {
        //  console.log("ERROR - oscar_api.getDepartment("+department+", ..... )");
        //  var output = "ERROR, please refer to documentation";
        // }

        if(typeof(callback) === 'function') {
            callback(output);
        } else {
            return output;
        }
        
    }
}

oscar_api.prototype.getCourse = function(department, course, callback) {
    var year = this.genDate();
    var department = department.toUpperCase();
    var that = this;
    this.getURL('https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_course_detail?cat_term_in='+year+'&subj_code_in='+department+'&crse_numb_in='+course, process);
    function process(data) {
        try {       //If incorrect department/course given, this will crash...so we use try-catch
        $ = cheerio.load(data);
        var infoSplit = $(".ntdefault").html().split('<br>');
        var courseSplit = $(".nttitle").text().split(' ');


        /* 
            The code bellow repeates a lot of previous code (NOT DRY),
            This was done due to a few special cases, and to allow future 
            fine tuning per api 
        */

        //Parse course title
        var course_fullName = (function() {
            var fullName = "";
            for(var j = 3; j < courseSplit.length; j++ ) {
                fullName += courseSplit[j] + " ";
            }
            return fullName.slice(0,-1);
        })();

        //Parse course information
        //Always present data
        var course_description = infoSplit[0].trim('\n'),
            credit_hours = infoSplit[1].trim('\n').replace(/ +(?= )/g,'');  
        //Optional Data
        var lecture_hours = infoSplit[2].trim('\n').replace(/ +(?= )/g,'');

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

        var output = {
            'name' : course_fullName,
            'description' : course_description,
            'creditHours' : credit_hours,
            'lectureHours' : lecture_hours,
            'labHours' : lab_hours,
            'grade_basis' : grade_basis,
        }

        } catch (e) {
            console.log("ERROR - oscar_api.getCourse("+department+", " + course + " ..... )");
            var output = "ERROR, event logged";
        }

        if(typeof(callback) === "function") {
            callback(output);
        } else {
            return output;
        }
    }

}

oscar_api.prototype.getYear = function(department, course, year, callback) {
    //Run get getSemester (just use closest semester)
    this.getSemester(department, course, year, undefined, callback);
}

oscar_api.prototype.getSemester = function(department, course, year, semester, callback) {
    var date = this.genDate(semester, year);
    department = department.toUpperCase();
    var that = this;
    this.getURL('https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_listcrse?term_in='+date+'&subj_in='+department+'&crse_in='+course+'&schd_in=%', process);
    function process(data) {
        $ = cheerio.load(data);
        try {       //If incorrect department/course/year/sem given, this will crash...so we use try-catch

        var sectionTitles = $('th.ddtitle');
        var sectionInfo = $('.captiontext'); //Disregard first result
        var output = [];
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
                var type = $(meetingInfo[5]).text().replace('*','');
                var prof = $(meetingInfo[6]).text().replace(/ +(?= )/g,'');
                
                //Change time from AM/PM to 24 hour format
                var time = that.to24hour(time);
                
                where.push({
                    'day' : day,
                    'time' : time,
                    'location' : location,
                    'type' : type,
                    'prof' : prof
                });
                
                //Get next row
                meetingInfoRow = $(meetingInfoRow).next();
                meetingInfo = $(meetingInfoRow).children();
            } while($(meetingInfo[0]).text() !== "");

                output.push({
                    'crn' : course_CRN,
                    'section' : course_Section,
                    'where' : where,
                });
        }
        } catch (e) {
            console.log("ERROR - oscar_api.getSemester("+department+", " + course + ", " + year + ", " + semester+", ..... )");
            var output = "ERROR, event logged";
        }
        if(typeof(callback) === "function") {
            callback(output);
        } else {
            return output;
        }
    }
}

oscar_api.prototype.getSection = function(department, course, year, semester, crn, callback) {
    var date = this.genDate(semester, year);
    department = department.toUpperCase();
    this.getURL('https://oscar.gatech.edu/pls/bprod/bwckschd.p_disp_detail_sched?term_in='+date+'&crn_in='+crn, process);
    function process(data) {
        $ = cheerio.load(data);
        try {       //If incorrect department/course/year/sem given, this will crash...so we use try-catch
            
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
        } catch(e) {
            console.log("ERROR - oscar_api.getSection("+department+", " + course + ", " + year + ", " + semester+", "+crn+", ..... )");
            var output = "ERROR, event logged";
        }
        if(typeof(callback) === "function") {
            callback(output);
        } else {
            return output;
        }
    }
}