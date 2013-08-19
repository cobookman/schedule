/* Search Results Rendering */

exports.search = function(req, res){
    //Global generators
    var global_semesters = [{ "name" : "Fall 2013", "id" : "FALL2013" },
                            { "name" : "Summer 2013", "id" : "Spring 2013"}];
    var active = { "name" : "Colin Custom", "id" : "c01FALL2013" };
    var cust_semester = [{ "name" : "Colin Custom", "id" : "c01FALL2013" }];
    res.locals = {
        title: "Page Title Here",
        active_semester: active,
        semesters: [ cust_semester, global_semesters ],
    }
  res.render('search');
};