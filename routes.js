app = module.parent.exports.app;

/*Get controllers*/
var searchController = require('./controllers/search');

/* Site Routes */
app.get('/search', searchController.search);
