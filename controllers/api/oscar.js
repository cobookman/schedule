var api = require('../../api/oscar_api').init();

/* Export list of courses the requested department offers E.G: ECE */
exports.department = function(req, res){
    api.getDepartment(req.params.department, function(data) {
        res.json(data);
    });
}

/* Particular Course information - E.g: ECE 2035 */
exports.course = function(req, res){
    api.getCourse(req.params.department, req.params.course, function(data) {
        res.json(data);
    });
}

/* every section in the current year for requested course */
exports.year = function(req, res){
    api.getYear(req.params.department, req.params.course, req.params.year, function(data) {
        res.json(data);
    });
}

/* List of sections in the current year/semester for requested course */
exports.semester = function(req, res){
    api.getSemester(req.params.department, req.params.course, req.params.year, 
                          req.params.semester, function(data) {
        res.json(data);
    });
}

/* Information on the requested section */
exports.section = function(req, res){
    api.getSection(req.params.department, req.params.course, req.params.year, 
                         req.params.semester, req.params.section, function(data) {
        res.json(data);
    });
}