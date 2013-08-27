var api = require('../../api/core_curriculum_api').init();
var dbName = 'core_curriculum_api';

function sendData(req, res, cacheID, api_hook) {
    if(!api.cacheRequest(req)) {
        cacheMiss();
    } else {
        api.checkCache(res, dbName, cacheID, cacheMiss);
    }

    function cacheMiss() {
        api_hook.call(api, (function(data) {
            api.resetCache(dbName, cacheID, data);
            res.jsonp(data);
        }));
    }
}

exports.areaC = function(req, res){
    sendData(req, res, 'areaC', api.areaC);
}

exports.areaE = function(req, res) {
   sendData(req, res, 'areaE', api.areaE);
}

exports.globalPerspectives = function(req, res) {
    sendData(req, res, 'globalPerspectives', api.globalPerspectives);
}

exports.usPerspectives = function(req, res) {
    sendData(req, res, 'usPerspectives', api.usPerspectives);
}

exports.ethics = function(req, res) {
    sendData(req, res, 'ethics', api.ethics);
}