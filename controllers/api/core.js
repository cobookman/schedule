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