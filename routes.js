app = module.parent.exports.app;

/*Get controllers*/
var searchController = require('./controllers/search');
var oscarController = require('./controllers/api/oscar.js');
var errorAPIController = require('./controllers/api/error.js')
 
/* Site Routes */
app.get('/search', searchController.search);

/* restFul API */
app.get('/api/oscar/:department', oscarController.department);
app.get('/api/oscar/:department/:course', oscarController.course);
app.get('/api/oscar/:department/:course/:year', oscarController.year);
app.get('/api/oscar/:department/:course/:year/:semester', oscarController.semester);
app.get('/api/oscar/:department/:course/:year/:semester/:section', oscarController.section);

/* Catch-All API ERROR MESSAGES */
app.get('/api/oscar/*', errorAPIController.error);

