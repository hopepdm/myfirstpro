var mongoose = require('mongoose');
var proModel = require('../models/proModel');
var log4js = require('./log4js');
var logger = log4js.logger();

var data = {};
/**
 * [exports description]
 * @method pageQuery
 * @param  {[number]} page [当前页数]
 * @return {[object]}      [数据]
 */
module.exports = function(page, cb) {
    proModel.count({}, function(err, count) {
        if (err) return cb(err)
        data.page = page; //当前查询页,不能小于1
        data.count = count; //总数量
        data.limit = 9; //每页数量
        data.pages = Math.ceil(data.count / data.limit); //总页数
        data.page = Math.min(data.pages, data.page) || 1; //当前页数不能大于总页数,且不能小于1
        var skip = (data.page - 1) * data.limit;
        var query = proModel.find({});
        query.skip(skip).limit(data.limit).sort({ '_id': -1 }).exec(function(err, docs) {
            if (err) {
                logger.error(err)
                return cb(err)
            }
            data.content = []
            for (var i = 0; i < docs.length; i++) {
                var doc = {};
                doc.projectID = docs[i]._id;
                doc.proName = docs[i].proName;
                doc.proDate = docs[i].proDate;
                doc.culturalCount = docs[i].culturalCount;
                doc.publishedCount = docs[i].publishedCount;
                doc.proDescription = docs[i].proDescription;
                data.content[i] = doc;
            }
            cb(null, data)
        })
    })

};