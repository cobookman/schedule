var api = require('../api/elasticSearch_api').init();

/* Search Results Rendering */
exports.search = function(req, res){
    var semesters = ["Spring", "Summer", "Fall"], //In order from earliest->latest semester
        start_year = 2012;
        end_year = (new Date()).getFullYear(); //Current Year


    var global_semesters = [];
    for(var year = start_year; year < end_year; year++) {
        for(var i = 0; i < semesters.length; i++ ) {
            global_semesters.push({
                "name" : semesters[i] +' '+year,
                "id" : semesters[i].toUpperCase()+year
            }); 
        }
    }

    // var global_semesters = [{ "name" : "Fall 2013", "id" : "FALL2013" },
    //                         { "name" : "Summer 2013", "id" : "Spring 2013"}];
    var active = { "name" : "Colin Custom", "id" : "c01FALL2013" };

    var cust_semester = [{ "name" : "Colin Custom", "id" : "c01FALL2013" }];
    //Check if passed a query string
    var query_str = "";
    if(req.params.hasOwnProperty('query')) {
        console.log("Query str: " + req.params.query);
        query_str = req.params.query;
    }
    res.locals = {
        title: "Page Title Here",
        active_semester: active,
        semesters: [ cust_semester, global_semesters ],
        query : query_str
    }
  res.render('search'); //Render search.hbs template
};