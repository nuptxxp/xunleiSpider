'use strict';

var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var debug = require('debug')('crawl:get');

exports.getVipPage = function (url, callback) {
    debug('获取最新迅雷账号网页: %s', url);
    request(url, function (err, response, body) {
        if(err) return callback(err);
        var $ = cheerio.load(body);
        var hrefList = $('.frame-1-3-r .frame-3-1 .frame-3-1-l .dxb_bc .xl1 a').filter(function () {
            var href = $(this).attr('href');
            return typeof href === 'string' && href.match(/^thread-.*\.html$/);
        });
        for(var i = 0, hrefListLength = hrefList.length; i < hrefListLength; ++i) {
            if($(hrefList[i]).find('font').length === 0) {
                callback(err, $(hrefList[i]).attr('href'));
                return;
            }
        }
    });
};

exports.getVipTextList = function (url, callback) {
    debug('获取最新迅雷账号: %s', url);
    request({
        url : url,
        encoding : null,
    }, function (err, response, body) {
        if(err) return callback(err);
        body = iconv.decode(body, 'gbk');
        var $ = cheerio.load(body);
        var vipTextList = [];
        $('.t_fsz .t_f').find('font').filter(function () {
            var text = $(this).text();
            return text.match(/[a-z0-9]+:[0-9]/);
        }).each(function () {
            vipTextList.push($(this).text());
            debug($(this).text());
        });
        callback(null, vipTextList);
    });
};

exports.getVipAccountList = function (vipTextList, callback) {
    var res = {};
    for (var i = 0, len = vipTextList.length; i < len; ++i) {
        var tmpVipList = vipTextList[i].split();
        for (var j = 0, jlen = tmpVipList.length; j < jlen; ++j) {
            var tmpVip = tmpVipList[j].trim();
            var vipAccount = null;
            var vipPasswd = null;
            var vipAccountRes = tmpVip.match(/[0-9a-z]+:[0-9a-z]/);
            if (vipAccountRes) vipAccount = vipAccountRes[0];
            var vipPasswdRes = tmpVip.match(/[0-9a-z]+$/);
            if (vipPasswdRes) vipPasswd = vipPasswdRes[0];
            if (vipAccount && vipPasswd) {
                res[vipAccount] = vipPasswd;
            }
        }
    }
    callback(null, res);
};

module.exports = exports;
