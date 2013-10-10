var core_api = require('./core_api.js')

//inherit core_api constructor
function front_end() {
	core_api.call(this);
}
//Inherit core_api's
front_end.prototype = Object.create(core_api.prototype);

exports.init = function() {
   return new front_end();
}

front_end.prototype.login = function(params, callback) {
	if(params.hasOwnProperty('username') && params.hasOwnProperty('password')) {
		callback(true);
	} else {
		throw new Error("No login details provided"); 
	}
}
front_end.prototype.push2couchDB = function(params, obj, callback) {
	this.setCache('schedules', params.username, { 'schedules' : obj }, function(error, res) {
		if(error) {
			callback(false);
		} else {
			callback(true);
		}
	});
}
/*
		Get all the schedules
								*/
front_end.prototype.schedules_get = function(params, callback) {
	var that = this;
	if(params.hasOwnProperty('username')) {
		genSchedules();
	} else {
		callback(false);
	}
	function sendData(data) {
		callback(data);
	}
	/*
		Get the global schedule datastructure - must be run before userSchedules
																					*/
	function genSchedules() { 	
 		that.getCache('schedules', 'global', function(data) {
	 		if(data === false || !data.hasOwnProperty('schedules')) {
 				throw new Error("Could not fetch global semester list"); 
 			} else {
 				data = data.schedules;
 			}
 			//Clone globalSchedule
 			var clone = {};
 			for(var year in data) {
 				if(data.hasOwnProperty(year)) {
 					clone[year] = {};
	 				for(var semester in data[year]) {
	 					if(data[year].hasOwnProperty(semester)) {
	 						clone[year][semester] = {}; //If you reference original object...bad things will happen
	 					}
 					}
 				}
 			}
			userSchedules(clone)
 		});
 	}
 	/*
 			Get the user specific schedules - must be run after globalSchedules 
 																				*/
	function userSchedules(globalSchedules) {
		that.getCache('schedules', params.username, function(userSchedules) {
			if(!userSchedules === false && userSchedules.hasOwnProperty('schedules')) { //Given user schedules/no errors
				userSchedules = userSchedules.schedules;
				for(var year in userSchedules) {
					if(userSchedules.hasOwnProperty(year)) {
						for(var semester in userSchedules[year]) {
							if(userSchedules[year].hasOwnProperty(semester)) {
								globalSchedules[year][semester] = userSchedules[year][semester];
							}
						}
					}
				}
			}
			sendData(globalSchedules);
		});
	}//End userSchedules(next)
}//End get(params, callback)
/*
		Put the new scheduleID into storage -TODO
													*/ 
front_end.prototype.schedules_put = function(params, callback) {
	var that = this;
	if(!params.hasOwnProperty('username') || !params.hasOwnProperty('year')
	   || !params.hasOwnProperty('semester') || !params.hasOwnProperty('schedule_id') 
	   || !params.hasOwnProperty('schedule_data')) {

		throw new Error("in front_end.schedules.put - Not given necessary params");
	} else {
		getSchedules(params.username, function(userSchedules) {
			//If no user schedule stored yet, create new one
			if(!userSchedules) {
				userSchedules = {};
			}
			//if never stored under this year, create it
			if(!userSchedules.hasOwnProperty(params.year)) {
				userSchedules[params.year] = {};
			}
			//if never stored under this semester, create it
			if(!userSchedules[params.year].hasOwnProperty(params.semester)) {
				userSchedules[params.year][params.semester] = {};
			}
			//Store new schedule
			userSchedules[params.year][params.semester][params.schedule_id] = params.schedule_data;
			
			//Push to couch
			that.push2couchDB(params, userSchedules, callback)
		});
	}

	function getSchedules(username, next) {
		that.getCache('schedules', username, function(userSchedules) {
			next(userSchedules);
		});
	}
}

/*
	Delete the schedule_id from user schedules
										*/
front_end.prototype.delete = function(params, callbac) {
	if(!params.hasOwnProperty('username') || !params.hasOwnProperty('year')
	   || !params.hasOwnProperty('semester') || !params.hasOwnProperty('schedule_id')) {
		callback(false);
	} else {
		this.getCache('schedules', params.username, function(userSchedules) {
			var wasDeleted = delete userSchedules[params.year][params.semester][params.schedule_id];
			if(wasDeleted) {
				that.push2couchDB(params, userSchedules, callback);
			} else {
				callback(false);
			}
		});
	}
}