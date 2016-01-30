'use strict';

var async = require('async');
var debug = require('debug')('crawl:all');
var config = require('./config');
var crawl = require('./crawl');
var save = require('./save');

var xunleiVipPage;
var xunleiVipList;
var xunleiCountList;

async.series([
    function (done) {
        crawl.getVipPage(config.url, function (err, vipPage) {
            xunleiVipPage = config.domain + '/' + vipPage; 
            done(err);
        });
    },
    function (done) {
        crawl.getVipTextList(xunleiVipPage, function (err, vipList) {
            xunleiVipList = vipList;
            done(err);
        });
    },
    function (done) {
        crawl.getVipAccountList(xunleiVipList, function (err, countList) {
            xunleiCountList = countList;
            done(err);
        });
    },
    function (done) {
        save.saveVipAccountList(xunleiCountList, config.storgeFile, function (err) {
            done(err);
        });
    }
], function (err) {
    if (err) {
        console.error(err.stack);
        process.exit(1); 
    }
    debug('抓取完成');
    process.exit(0);
});

