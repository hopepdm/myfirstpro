var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var pug = require('pug');
var proModel = require('../models/proModel');
var mongoose = require('mongoose');
var moment = require('moment');
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');
var debuglog = require('../middlewares/log4js').debuglog(); //开发调试用
var logger = require('../middlewares/log4js').logger(); //运行日志
var ziphandler = require('../middlewares/ziphandler');
var decompress = require('decompress');
var fileManage = require('../middlewares/fileManage');
/*
新建项目API POST /project
 */
router.post('/project', function(req, res, next) {
    if (!req.body.proName || !req.body.proDescription) {
        return res.send(
            'message: "请输入完整信息！"'
        );
    }
    var proData = {
        //这里的req.body后面的字段名，对应着前端的input name属性
        proName: req.body.proName,
        proDescription: req.body.proDescription,
        proDate: Date.now(),
    };
    var project = new proModel(
        proData
    );
    project.save(function(err, mes) {
        if (err) {
            logger.error(err);
            next(err);
            return;
        }
        //重定向，返回
        res.redirect('back');
    });
});

/*
上传文件API POST /upload
 */
//var culturalList = [];
router.post('/upload/', function(req, res, next) {
    var culturalList = [];
    var id = mongoose.Types.ObjectId(req.session.project);
    //解析一个文件上传并设置存储路径
    var form = new multiparty.Form({
        uploadDir: './.temp/'
    });
    form.parse(req, function(err, fields, files) {
        if (err) {
            logger.error(err);
            next(err);
            return;
        }
        var file = files.model[0]; //取得文件   obj FormData :fd.append('model', oFile[0]);
        var realPath = form.uploadDir + file.originalFilename; //文件真实名字
        fs.renameSync(file.path, realPath); //同步重命名文件
        /*
这里通过filter筛选有问题，因为他解压时会遍历所有的文件和文件夹，在这里不适用。把筛选和处理放在最后的回调里比较好
         */
        //为每一个项目单独创建文件夹，保存文物模型和发布文件
        var projectPath = './dist/' + id;
        fileManage.createFolder(projectPath);

        ziphandler.decompress({
            input: realPath,
            output: projectPath,

        }, function(filelist) {
            var culturalCount = filelist.length;
            proModel.update({
                _id: mongoose.Types.ObjectId(req.session.project)
            }, {
                $addToSet: {
                    'proCulturals': {
                        '$each': filelist
                    }
                },
                '$inc': {
                    'culturalCount': culturalCount
                }
            }, function(err) {
                if (err) next(err);
            });

            logger.debug('back');
            res.send('success');
        });

    });

});


//发布数据处理
router.post('/publish', function(req, res, next) {
    var _id = req.session.project;
    var sid = mongoose.Types.ObjectId(req.body.id);
    debuglog.debug(req.body);
    Promise.promisifyAll(proModel); //调用bluebird中的promise对象（当然是用es6的promise也可以）
    var mod = proModel.findById({
        _id: _id
    }, {
        proCulturals: {
            '$elemMatch': {
                _id: sid
            }
        }
    }, function(err, doc) {

        if (err) {
            logger.error(err);
        }
        // debuglog.debug(doc);
        var data = {};
        if (req.body.isEditor) {
            data.isPublish = doc.proCulturals[0].isPublish;
            data.path = doc.proCulturals[0].filePath;
            data.title = doc.proCulturals[0].pageTitle;
            data.pageName = doc.proCulturals[0].pageName;
            data.near = req.body.near;
            data.far = req.body.far;
            data.minfov = req.body.minfov;
            data.maxfov = req.body.maxfov;
            data.moveSpeed = req.body.moveSpeed;
            data.rotateSpeed = req.body.rotateSpeed;
            data.zoomSpeed = req.body.zoomSpeed;
            data.modelPosition = req.body.modelPosition;
            data.modelRotation = req.body.modelRotation;
            data.lightSet = req.body.lightSet;
            data.ambient = req.body.ambient;
            data.bgColor = req.body.bgColor;
            data.isMaterialColor = req.body.isMaterialColor;
            data.isSpecularColor = req.body.isSpecularColor;
            data.isMaterialShininess = req.body.isMaterialShininess;
            data.isMaterialOpacity = req.body.isMaterialOpacity;
            data.wireFrame = req.body.wireFrame;
        } else {
            data.isPublish = doc.proCulturals[0].isPublish;
            data.path = doc.proCulturals[0].filePath;
            data.title = doc.proCulturals[0].pageTitle;
            data.pageName = doc.proCulturals[0].pageName;
            data.near = 0.001;
            data.far = 10000;
            data.minfov = 0.5;
            data.maxfov = 8;
            data.moveSpeed = 0.5;
            data.rotateSpeed = 0.2;
            data.zoomSpeed = 0.5;
            data.modelPosition = { x: 0, y: 0, z: 0 };
            data.modelRotation = { x: 0, y: 0, z: 0 };
            data.lightSet = { intensity: 1, color: 0xFFFFFF };
            data.ambient = true;
            data.bgColor = 0x4f5355;
            data.isMaterialColor = 0x959595;
            data.isSpecularColor = 0x000000;
            data.isMaterialShininess = 10;
            data.isMaterialOpacity = 1;
            data.wireFrame = false;

        }


        var fn = pug.compileFile('./views/template.pug', {
            pretty: true
        });
        var html = fn({
            data: data
        });
        fs.writeFileSync(path.join('./dist/' + _id, data.pageName + '.html'), html, {
            encoding: 'utf8'
        }, function(err) {
            if (err) {
                logger.error(err);
            }
        });
        Promise.resolve(next);
    }).then(function(next) {
        return proModel.update({
            _id: _id,
            'proCulturals._id': sid
        }, {
            '$set': {
                'proCulturals.$.isPublish': 1
            }
        });
        // Promise.resolve(next);
    }).then(function(next) {
        //debuglog.debug(next, 'publish dont success');
        if (next == 'true') {
            return Promise.reject();
        }
        proModel.findById({
            _id: _id
        }, function(err, doc) {
            //debuglog.debug(doc['proCulturals']);
            var counts = 0;
            for (var i = 0; i < doc['proCulturals'].length; i++) {
                if (doc['proCulturals'][i].isPublish) {
                    counts += 1;
                }
            }
            // debuglog.debug(counts);
            proModel.update({
                _id: _id,

            }, {
                '$set': {
                    'publishedCount': counts
                }
            }, function(err, mes) {

            });
        });


        // proModel.update({
        //     _id: _id
        // }, {
        //     '$inc': {
        //         'publishedCount': +1
        //     }
        // }, function(err, mes) {
        //     //res.send({a:1});
        // });

    }).catch(function(e) {
        console.error(e.stack);
    });
    res.end();
});

//删除文物路由
router.post('/delete', function(req, res, next) {
    var id = req.body.id;
    var fileName = req.body.fileName;
    var pageName = req.body.pageName;
    var stat = (req.body.isPublish == true) ? true : false;

    if (!stat) {
        //没有发布时，删除文物文件；发布时先删除发布文件,然后改变发布状态，使得可以重新发布
        var culturalPath = './dist/' + mongoose.Types.ObjectId(req.session.project) + '/' + fileName;
        fileManage.deleteFolder(culturalPath);
        proModel.update({
            _id: req.session.project
        }, {
            '$pull': {
                'proCulturals': {
                    _id: id
                }
            },
            '$inc': {
                'culturalCount': -1
            }
        }, function(err, mes) {
            if (err) {
                logger.error(err);
                next(err);
            }
            logger.debug(mes, 'post:/delete');
            //res.end('delete');
        });
        res.end();
    }
    if (stat) {
        //当文物已经发布时，先删除发布文件，变更发布状
        var filePath = './dist/' + mongoose.Types.ObjectId(req.session.project) + '/' + pageName + '.html';
        fileManage.deleteFile(filePath);
        proModel.update({
            _id: req.session.project,
            'proCulturals._id': id
        }, {
            '$set': {
                'proCulturals.$.isPublish': 0
            },
            '$inc': {
                'publishedCount': -1
            }
        }, function(err, mes) {
            if (err) {
                logger.error(err);
                next(err);
            }
            logger.debug(mes, 'post:/delete');

        });

        res.end();

    }

});

//删除项目路由
router.post('/deleteProject', function(req, res, next) {
    var proName = req.body.proName;
    proModel.find({
        'proName': proName
    }, function(err, doc) {
        console.log(doc["_id"]);

        proModel.remove({
            "proName": proName
        }, function(er, mes) {
            if (er) {
                logger.error(er);
                next(err);
            }
        });

        //删除项目所在目
        var culturalPath = './dist/' + mongoose.Types.ObjectId(doc[0]._id);
        fileManage.deleteProjectFolder(culturalPath);
        res.end();
    });

});

//编辑文物页面操作路由
router.post('/culturalUp', function(req, res, next) {
    var editId = req.body.id;
    var title = req.body.pageTitle;
    var name = req.body.pageName;
    proModel.update({
        _id: req.session.project,
        'proCulturals._id': editId
    }, {
        '$set': {
            'proCulturals.$.pageName': name,
            'proCulturals.$.pageTitle': title
        }
    }, function(err, mes) {
        if (err) {
            logger.error(err);
            next();
        }
        res.end();
    });

});

module.exports = router;