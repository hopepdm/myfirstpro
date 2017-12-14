### 三维文物平台开发

##### log4js的使用

```javascript
log4js.configure(config)//配置
log4js.connectLogger(log4js.getLogger(name))//获取可以作为express中间件的实例
log4js.getLogger(name)//获取配置中 category为name的实例，然后就可以使用这个实例 eg:log.info
```

##### mongoose

```javascript
find({}) //查询所有结果
find({}).count() //查询结果数量
.limit(n)//数量为n的文档
.skip(n)//n后面的文档，就是跳过n前面的文档
```

##### moment

处理时间的中间件

##### multiparty

文件上传

```javascript
var multiparty = require('multiparty');
var form = new multiparty.Form(options);
form.parse(req,function(err,fields,fiels){
  //dosomething
})
```

文件压缩

```javascript
// create a file to stream archive data to.
var output = fs.createWriteStream(__dirname + '/example.zip');
var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});
archive.pipe(output);

// append a file from stream
var file1 = __dirname + '/file1.txt';
archive.append(fs.createReadStream(file1), { name: 'file1.txt' });//这里的name表示最终在example.zip中的文件名,并且name不可省略

// append a file from string
archive.append('string cheese!', { name: 'file2.txt' });

// append a file from buffer
var buffer3 = new Buffer('buff it!');
archive.append(buffer3, { name: 'file3.txt' });

// append a file
archive.file('file1.txt', { name: 'file4.txt' });

// append files from a directory
archive.directory('./test/');//最终的目录为example.zip/example/test/some.txt

// finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();
```
##### RESTful风格api

```javascript
url:http://example/test/data
api:/upload/:name

url:http://example/data1/data2
api:/upload/:data1/:data2
```
##### 错误处理

express 有一个缺省错误处理，当发生错误，且没有指定错误处理句柄

会执行这个缺省的错误处理，此时后续的中间件都会被跳过，如果有自定义错误处理句柄

会执行这个错误处理句柄

404并不是一个错误，只是表示一个功能没有实现，相当于此时没有中间件会执行这个路由 ，就会跳到404的路由

在404处理中  没有返回，而是使用next(err)把错误传给了 错误处理句柄



##### module.exports 和exports

```javascript
var name = 'rainbow';
exports.name = name;
exports.sayName = function(){
  console.log(name);
}
// 给 exports 赋值相当于给 module.exports 这个空对象添加了两个属性，相当于：
var name = 'rainbow';
module.exports.name = name;
module.exports.sayName = function(){
  console.log(name);
}
```

在使用require时，得到的始终是module.exports（也可以说导出的始终是module.exports），而module.exports=exports   exports.xxx相当于给exports挂属性，也就是对module.exports挂属性，也就是对require得到的模块挂属性，而使用module.exports =xxx 就是直接让这个模块等于xxx



##### 

##### PM2

###### 安装

`npm install pm2 -g`

###### 使用

`pm2 start app.js`

在express项目中，这里需要使用 `pm2 start ./bin/www`

###### 使用文件配置的方式

新建一个配置文件，配置文件可以使用多种格式。PM2 内置一个新建js格式配置文件的命令

`pm2 ecosystem`

使用这个命令会自动生成一个 `ecosystem.config.js`文件

```javascript
module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : "API",//名称
      script    : "app.js",//入口程序
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production : {
        NODE_ENV: "production"
      }
    },

    // Second application
    {
      name      : "WEB",
      script    : "web.js"
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : "node",
      host : "212.83.163.1",
      ref  : "origin/master",
      repo : "git@github.com:repo.git",
      path : "/var/www/production",
      "post-deploy" : "npm install && pm2 startOrRestart ecosystem.config.js --env production"
    },
    dev : {
      user : "node",
      host : "212.83.163.1",
      ref  : "origin/master",
      repo : "git@github.com:repo.git",
      path : "/var/www/development",
      "post-deploy" : "npm install && pm2 startOrRestart ecosystem.config.js --env dev",
      env  : {
        NODE_ENV: "dev"
      }
    }
  }
}
```

`json`格式的配置文件更好,新建一个 `process.json`文件

```json
{
  "apps" : [{
    "name"        : "worker",
    "script"      : "./worker.js",
    "watch"       : true,
    "env": {
      "NODE_ENV": "development"
    },
    "env_production" : {
       "NODE_ENV": "production"
    }
  },{
    "name"       : "api-app",
    "script"     : "./api.js",
    "instances"  : 4,
    "exec_mode"  : "cluster"
  }]
}
```

配置文件使用方法

`pm2 start process.json`

###### 代码更新

代码更新后使用 `pm2 reload` 重启 

reload可以做到0秒宕机加载新的代码，restart则是重新启动，生产环境中多用reload来完成代码更新！