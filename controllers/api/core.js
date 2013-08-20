var api = require('../../api/core_api').init();


exports.areaC = function(req, res){
    api.areaC(function(data) {
        res.json(data);
    });
}

exports.areaE = function(req, res) {
   api.areaE(function(data) {
        res.json(data);
    });
}

exports.globalPerspectives = function(req, res) {
	api.globalPerspectives(function(data) {
		res.json(data);
	});
}

exports.usPerspectives = function(req, res) {
	api.usPerspectives(function(data) {
		res.json(data);
	});
}

exports.ethics = function(req, res) {
	api.ethics(function(data) {
		res.json(data);
	});
}