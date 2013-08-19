app = module.parent.exports.app;

/*Get controllers*/
var searchController = require('./controllers/search');
var oscarController = require('./controllers/api/oscar.js');
var coreController = require('./controllers/api/core.js');
var errorAPIController = require('./controllers/api/error.js')
 
/* Site Routes */
app.get('/search', searchController.search);

/* restFul API */
app.get('/api/oscar/:department', oscarController.department);
app.get('/api/oscar/:department/:course', oscarController.course);
app.get('/api/oscar/:department/:course/:year', oscarController.year);
app.get('/api/oscar/:department/:course/:year/:semester', oscarController.semester);
app.get('/api/oscar/:department/:course/:year/:semester/:section', oscarController.section);

app.get(/api\/core\/(c|humanities)/gi, coreController.areaC);
app.get(/api\/core\/(e|socialscience)/gi, coreController.areaE);

/* Catch-All API ERROR MESSAGES */
app.get('/api/*', errorAPIController.error);


