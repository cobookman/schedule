app = module.parent.exports.app;

/*Get controllers*/
var searchController = require('./controllers/search');
var oscarController = require('./controllers/api/oscar.js');
var coreCurriculumController = require('./controllers/api/core_curriculum.js');
var errorAPIController = require('./controllers/api/error.js');
var gradeController = require('./controllers/api/grades.js');
/* Site Routes */
app.get('/search', searchController.search);

/* restFul API */
app.get('/api/oscar/:department', oscarController.department);
app.get('/api/oscar/:department/:course', oscarController.course);
app.get('/api/oscar/:department/:course/:year/:semester', oscarController.semester);
app.get('/api/oscar/:department/:course/:year/:semester/:section', oscarController.section);

app.get(/^\/api\/core\/(c|humanities)\/?$/i, coreCurriculumController.areaC);
app.get(/^\/api\/core\/(e|socialsciences)\/?$/i, coreCurriculumController.areaE);
app.get(/^\/api\/core\/(gp|globalperspectives)\/?$/i, coreCurriculumController.globalPerspectives);
app.get(/^\/api\/core\/(usp|usPerspectives)\/?$/i, coreCurriculumController.usPerspectives);
app.get('/api/core/ethics', coreCurriculumController.ethics);


app.get('/api/grade/:department/:course', gradeController.course);
app.get('/api/grade/:department/:course/:profID', gradeController.prof);
app.get('/api/grade/:department/:course/:profID/:year', gradeController.year);
app.get('/api/grade/:department/:course/:profID/:year/:semester', gradeController.semester);
/*
	WARNING DO NOT ENABLE UNLES YOU WANT TO RUN THEM, POTENTIAL GRADE DATA LOSS, BACKUP DATABASE!
							ONCE FUNCTION RUNS PLEASE RE-COMMENT		
														*/
//app.get('/api/grade/refreshStatistics', gradeController.refreshStatistics); //Enable this to allow refreshing of statistics through web interface
//app.get('/api/grade/importJson', gradeController.importJSON); 	//Import the JSON database dump to couchDB, filepath defined in gradeController


/* Catch-All API ERROR MESSAGES */
app.get('/api/*', errorAPIController.error);


