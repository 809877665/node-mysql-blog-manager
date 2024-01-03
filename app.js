// 导入express
const express = require('express')
var bodyParser = require('body-parser');
// 导入数据库操作模块
const db = require('./db/mysql')
// 导入 session 中间件
var session = require('express-session')
const ejs = require("ejs");
const fs = require("fs");
const cors = require('cors')  // express的中间件，用来解决跨域问题
const moduleApi = require('./api/index')
// 导入生成Token的包
const jwt = require('jsonwebtoken')
//token解析中间件 一定要在路由之前配置解析 Token 的中间件
const expressJWT = require('express-jwt');
const config = require('./config')


// 创建web服务器
const app = express()

// 跨域
app.use(cors())

// session中各字段介绍：https://www.dandelioncloud.cn/article/details/1611667482941292545
app.use(session({
  name: 'node-blog-sid',  //cookie的名字，默认为'connect.sid'
  secret: 'keyboard cat',  // secret 属性的值可以为任意字符串，用于对session、cookie签名，防止篡改
  resave: false,           // 固定写法
  saveUninitialized: true  // 固定写法
}))
// 中间件定义post传递的格式

// 设置将image文件夹转为静态文件，这样上传的图片可在浏览器地址栏中直接访问
app.use(express.static('image'))

app.use(express.json())
//Context-Type 为application/x-www-form-urlencoded 时 返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
app.use(bodyParser.urlencoded({ extended: true }));
//用于解析json 会自动选择最为适宜的解析方式于解析json 会自动选择最为适宜的解析方式
app.use(bodyParser.json());


// node中使用mysql插件可参考教程：https://www.runoob.com/nodejs/nodejs-mysql.html

// 注册全局token解析中间件
app.use(expressJWT({
  // 加密时设置的密钥
  secret: config.jwtSecretKey,
  // 设置算法
  algorithms: ['HS256'],
	// 无token请求不进行解析，并且抛出异常
	// credentialsRequired: false
}).unless({
  // 设置不需要token请求的path路径， /^\/avatar\//使用正则设置访问静态资源图片时无需token
  path: [
    '/zw-blog-api/login',
    // /^\/avatar\//
  ]
}))

//封装错误处理函数
app.use((req, res, next) => {
  /**
   * @params: code-响应状态码
   * @params: info-响应数据
   * @params: msg-响应提示信息 
   */
  res.selfCallback = function (obj) {
    const err = obj.msg
    res.send({
      code: obj.code || '000000',
      info: obj.info || {},
      msg: err instanceof Error ? err.message : err
    })
  }
  next()
})

// 错误中间件 当token失效时 返回信息
app.use((err, req, res, next) => {
  console.log('err::', err);
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({
      code: '401',
      info: {},
      msg: '身份认证失败！'
    })
  }
})

// 将后台博客接口api模块进行注册
for (const key in moduleApi) {
  app.use(`/zw-blog-api/`, moduleApi[key])
}

// 如果所有的请求路径都没匹配上，则进行提示
app.use('*', function (req, res) {
  res.send({
    code: '000404',
    msg: '该请求路径不存在，请检查'
  })
})

// 调用app.listen(端口号， 启动成功后的回调函数)  启动服务器
const server = app.listen(8081, () => {
  var port = server.address().port
  console.log("应用访问地址为 http://127.0.0.1:%s", port)
})