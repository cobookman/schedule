var config = {};
/*
	CouchDB configuration parameters
												*/
config.db = {
	host: "http://localhost",
	port: 5984
};

/*
	List of the mappings of 
	API -> its particular table in couchdb
												*/
config.cache_tables  = {
	'oscar_api' : 'oscar_api_cache',
	'core_curriculum_api'  : 'core_api_cache',
	'grade_data_api'	   : 'grade_data',
	'schedules' : 'schedules'
};

/*
	ElasticSearch configuration parameters
												*/
config.es = {
	host : 'http://localhost',
	port : 9200
};
/*
	Specify the first year/semester in 
	the semester drop-down menu (front end)
												*/
config.starting = {
	year : 2012,
	semester: "Fall"	//First letter must be capitolized
};
/*
	 list of semesters in order
						*/
config.semesters = ["Spring", "Summer", "Fall"];
/* 
	How long until the seat information should
	be refreshed
												*/
config.crnCacheHoldTime = 5 * 60000; //# in ms, 1 min = 60000ms -> 5mins


module.exports = config;
