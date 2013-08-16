var api = require('../../api/oscar_api').init();

/* Export list of courses the requested department offers E.G: ECE */
exports.department = function(req, res){
 res.send(api.getDepartment(req.params.department));
}

/* Particular Course information - E.g: ECE 2035 */
exports.course = function(req, res){
 res.send(api.getCourse(req.params.department, req.params.course));
}

/* every section in the current year for requested course */
exports.year = function(req, res){
 res.send(api.getYear(req.params.department, req.params.course, req.params.year));
}

/* List of sections in the current year/semester for requested course */
exports.semester = function(req, res){
 res.send(api.getSemester(req.params.department, req.params.course, req.params.year, 
                          req.params.semester));
}

/* Information on the requested section */
exports.section = function(req, res){
 res.send(api.getSection(req.params.department, req.params.course, req.params.year, 
                         req.params.semester, req.params.section));
}