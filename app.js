/*
* projectNmae:三维数字平台
* create by wdk/pzw/pdm/jabinzhou
*
* */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var session = require('express-session')
var mongoose = require('mongoose');
mongoose.Promise = global.Promise; //mongoose内置的promise已经被移除，需要手动指定
var log4js = require('./server/middlewares/log4js')
var bodyParser = require('body-parser');
var config = require('./lib/config');
var main = require('./server/routes/main');
var api = require('./server/routes/api');

var app = express();

// view engine setup
app.set('views', './views');
app.set('view engine', 'pug');
app.set('view cache', false) //生产环境打开

var logger = log4js.logger() //取得log4js的实例

/*
还不确定需不需要session
 */
app.use(session({
    resave: false, //在值未做修改前不重新保存
    saveUninitialized: false, //在保存前不创建session,
    secret: 'three',
}))
app.use(log4js.useLog())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//静态文件入口
app.use(express.static(path.join(__dirname, '/public')));
//数据库压缩文件入口
app.use(express.static(path.join(__dirname, '/dist')));

app.use('/', main);
app.use('/api', api);

// 处理错误情况下的事件

// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });
//数据库连接


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    logger.error(err)
    res.render('error', { err: err });
});


if (module.parent) {
    module.exports = app;
} else {
    // 监听端口，启动程序
    mongoose.connect(config.db.url + config.db.database,{
        useMongoClient: true
    },function(err) {
        if (err) {
            logger.error("数据库连接失败: ", err);
            return;
        } else {
            logger.info("数据库连接成功")
            app.listen(config.app.port, function() {
                logger.info("listening" + config.app.port);
            });
        }
    })

}
