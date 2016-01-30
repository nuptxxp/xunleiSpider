'use strict';

var fs = require('fs');

exports.saveVipAccountList = function (vipAccountList, filename, callback) {
    fs.writeFile(filename, JSON.stringify(vipAccountList, null, 4), function (err) {
        callback(err);
    });
};
