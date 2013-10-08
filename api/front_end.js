var core_api = require('core_api.js');

var front_end = function() {
    core_api.call(this); //Init core_api
}
//Inherit core_api
front_end.prototype = Object.create(core_api.prototype);

var login = function(params, callback) {
	if(params.hasOwnProperty('username') && params.hasOwnProperty('password')) {
		callback(true);
	} else {
		throw new Error("No login details provided"); 
	}
}
var schedules = function() {
	var that = this;
	function push2couchDB(params, obj, next) {
		that.setCache('schedules', params.username, { 'schedules' : obj }, function(error, res) {
			if(error) {
				next(false);
			} else {
				next(true);
			}
		}
	}
	/*
		Get all the schedules
								*/
	var get = function(params, callback) {
		if(params.hasOwnProperty('username')) {
			var schedule_list = {};
			globalSchedules(function() { //First get global schedules
				userSchedules(function() { //Then get the user schedules
					callback(schedule_list); //Then callback w/scheduleList
				});
			});
		} else {
			callback(false);
		}
		/*
			Get the global schedule datastructure - must be run before userSchedules
																						*/
		function globalSchedules(next) { 	
 			that.getCache('schedules', 'global', function(globalSchedules) {
	 			if(globalSchedules === false || !globalSchedules.hasOwnProperty('schedules')) {
 					throw new Error("Could not fetch global semester list"); 
 				} else {
 					schedule_list = globalSchedules.list;
 				}
 			});
 			next();
 		}
 		/*
 			Get the user specific schedules - must be run after globalSchedules 
 																					*/
		function userSchedules(next) {
			that.getCache('schedules', params.username, function(userSchedules) {
				if(!userSchedules === false && globalSchedules.hasOwnProperty('schedules')) { //Given user schedules/no errors
					for(var year in userSchedules) {
						if(userSchedules.hasOwnProperty(year)) {
							for(var semester in userSchedules[year]) {
								if(userSchedules[year].hasOwnProperty(semester)) {
									for(var custScheduleName in userSchedules[year][semester]) {
										//Push the custom user's schedule to our schedule list
										schedule_list[year][semester].push(custScheduleName); 
									}
								}
							}
						}
					}
				}
			}
			next();
		}//End userSchedules(next)
	}//End get(params, callback)
	
	/*
		Put the new scheduleID into storage -TODO
											*/ 
	var put = function(params, callback) {
		if(!params.hasOwnProperty('username') || !params.hasOwnProperty('year') || !params.hasOwnProperty('semester') || !params.hasOwnProperty('id')) {
			getSchedules(params.username, function(userSchedules) {
				userSchedules[params.year][params.semester][params.id] = {};
				if(params.hasOwnProperty('data')) {
					userSchedules[params.year][params.semester][params.id] = params.data;
				}
				push2couchDB(params, userSchedules, callback)
			});
		} else {
			callback(false);
		}
		function getSchedules(username, next) {
			that.getCache('schedules', username, funciton(userSchedules)) {
				next(userSchedules);
			}
		}s
	}
	
	/*
		Delete the ID from user schedules
											*/
	var delete = function(params, callback) {
		if(!params.hasOwnProperty('username') || !params.hasOwnProperty('year') || !params.hasOwnProperty('semester') || !params.hasOwnProperty('id')) {
			callback(false);
		} else {
			that.getCache('schedules', params.username, function(userSchedules) {
				var wasDeleted = delete userSchedules[params.year][params.semester][params.id];
				if(wasDeleted)) {
					push2couchDB(params, userSchedules, callback);
				} else {
					callback(false);
				}
			});
		}
	}
	
}//end schedules()


module.exports = front_end;