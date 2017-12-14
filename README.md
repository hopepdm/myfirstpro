#ThreePlatform
文件操作逻辑

上传压缩文件（大包）->.temp->解压到dist/proname(项目汉字拼音)->文物编辑界面的路径dist/proname/model/objfile/obj(设置了dist为静态文件目录),在页面需要加上proname/model/->
发布 /html文件生成到dist/proname/下,与model同级



### 启动：

`gulp`命令  ：启动node服务（自刷新），less编译，浏览器自刷新 （自刷新有问题，还是手动吧）

`nodemon app`:只启动node服务器（自刷新）

```javascript
// 配置文件

module.exports = {
    db: {
        url: 'mongodb://localhost/',//mongodb 地址
        port: '27017',//端口
        database: 'threePlatform'//数据库名称
    },
    app: {
        port: 3000//  node服务器端口号,自刷新服务也设置了代理（8080）,所以两个端口都可以访问
    }
};

```

部分api说明：
Model.update 更新修改器
`$inc`增减修改器，只对数字有效
Article.update({_id : id}, {$inc : {views : 1}})

//找到id=id，并且将 views递增，返回后的views为之前的views+1。ps：这个属性很有用，对数字直接进行增减。用于更新一些数字（如阅读数）很有用

`$set` 指定字段的值，这个字段不存在就创建它。可以是任何MondoDB支持的类型。

Article.update({_id : id}, {$set : {views : 51, title : '修改后的标题' ...}})
//更新后views为51,标题为'修改后的标题'

`$unset` 同上取反，删除一个字段
Article.update({views : 50}, {$unset : {views : 'remove'}})
//执行后: views字段不存在

save是一个实例方法，需要先new Model()来获取实例；

remove查找并删除，用法：
Model.remove(conditions, [callback])
Model.findByIdAndRemove(id, [options], [callback])
Model.findOneAndRemove(conditions, [options], [callback])

数组修改器:

`$push` 给一个键push一个数组成员,键不存在会创建

Model.update({’age’:22}, {’$push’:{’array’:10} } ); 执行后: 增加一个 array 键,类型为数组, 有一个成员 10

`$addToSet` 向数组中添加一个元素,如果存在就不添加

Model.update({’age’:22}, {’$addToSet’:{’array’:10} } ); 执行后: array中有10所以不会添加

`$each` 遍历数组, 和 $push 修改器配合可以插入多个值

Model.update({’age’:22}, {’$push’:{’array’:{’$each’: [1,2,3,4,5]}} } ); 执行后: array : [10,1,2,3,4,5]

`$pop` 向数组中尾部删除一个元素

Model.update({’age’:22}, {’$pop’:{’array’:1} } ); 执行后: array : [10,1,2,3,4] tips: 将1改成-1可以删除数组首部元素

`$pull` 向数组中删除指定元素

Model.update({’age’:22}, {’$pull’:{’array’:10} } ); 执行后: array : [1,2,3,4] 匹配到array中的10后将其删除


着色器类型会影响模型的表现

无shader时模型呈一片纯色区域，无区分度；PBR类型与matcap类型能表现模型表面的立体感，同时前者的着色方式有两种：光滑组和平滑组。


可调参数：
	常规变换
		旋转
		位置（标识世界坐标中心）
		复位
		模型亮度
		渲染背景（天空盒子）
		缩放级别（据说要绑定）
	灯光
		平行光
		环境光
	材质
		基础颜色
		反射
		光滑度（三者决定了材质的质地，是木材、石头、金属等质感）
		
		法线
		
		背面消隐（可选）
		
	控制面板动态可选
	指定模型导出标准，给定一个合适的面数与材质贴图的最大值，给工程部制定模型导出标准。
	（设想）多级贴图加载，避免高清贴图加载过慢导致的长时间显示模型网格
	（设想）内部视角、缩放手感、漫游播放、复位
	仰俯视等视图面板
		
目前（2017-10.30）存在的问题：首次操作无反应时，可能需要手动刷新。
							  为满足批量发布，需要初始化文件名和页面title。
							  批量发布和删除的ui设计。
							  修改模型状态交互，包含哪些参数及参数的继承。
							  
关于ajax请求status为cancel的解决方案
1、百度网上大部分回答是由于跨域的原因

2、本项目中遇到则是因为get/post请求无返回值，故而datatype无需设置，当设置为json 时就会出现cancel的情况。  另外一种是在get/post请求中没有在最后执行res.end()或者res.send()方法来结束请求，导致请求一直挂起直至超时取消。另外，我百度了下，datatype不设置时ajax会自动识别返回类型的，影响貌似不大。
3、另外百度也有说设置async为false或者timeout时间长一些，这些对本项目都没有用！！！

							  