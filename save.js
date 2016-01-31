'use strict';

var redis = require('redis');
var poolModule = require('generic-pool');
var dateFormat = require('dateformat');
var debug = require('debug')('crawl:save');
var config = require('./config');
var pool = poolModule.Pool({
    name : 'redisPool',
    create : function (callback) {
        var client = redis.createClient();
        callback(null, client);
    },
    destroy : function (client) {
        client.quit();
    },
    max : 100,
    min : 5,
    idleTimeoutMillis : 30000,
    log : false
});

exports.saveVipAccountList = function (vipAccount, callback) {
    pool.acquire(function (err, client) {
        if (err) {
            return callback(err);
        }
        var key = dateFormat(new Date(), 'yyyy-mm-dd');
        client.SELECT(config.redis.dbId, function() {
            client.HMSET(key, vipAccount, function (err, result) {
                if (err) {
                    return callback(err);
                }
                debug('save success');
                client.EXPIRE(key, 86400 * 5, function () {
                    pool.release(client);
                });
                callback(null);
            });
        });
    });
};
