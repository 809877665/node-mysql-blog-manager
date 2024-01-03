const db = require('../db/mysql')
const app = require("express").Router()
// 导入全局配置文件（里面有token的密钥）
const config = require('../config')
// 导入生成Token的包
const jwt = require('jsonwebtoken')


// 登录接口
app.post('/login', function (req, res) {
  const sqlStr = 'select username,password from tb_user;'
  db.query(sqlStr, (err, results) => {
    // 查询数据失败
    if (err) return console.log('查询数据库出错了：', err.message)
    // 查询数据成功
    // 注意：如果执行的是 select 查询语句，则执行的结果是数组
    let userData = results.map(item => item.username)
    let pwdData = results.map(item => item.password)

    const { username, password } = req.body
    // req.body获取参数时在postman中需要使用x-www-form-urlencoded方式请求
    // req.query 获取参数时，可使用多种方式发起请求
    console.log('request body 数据：', req.body);
    console.log('request query data:', req.query);

    if (userData.indexOf(username) === -1) {
      res.selfCallback({
        code: '000002',
        msg: '该用户不存在',
      })
    } else {
      // 用户存在，判断密码
      if (password === pwdData[userData.indexOf(username)]) {
        // 将用户的信息，存储到Session中
        req.session.user = req.body
        // 将用户的登陆状态，存储到Session中
        req.session.islogin = true
        // 在服务器端生成 Token 字符串
        const user = {
          username, // 解构用户信息
          password: '', //密码等敏感信息置空
        }
        // 对用户的信息进行加密，生成 token 字符串 
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {
          expiresIn: config.expiresIn //tonken 有效期
        })
        res.selfCallback({
          info: {
            user,
            token: `Bearer ${tokenStr}`
          },
          msg: '登录成功',
        })
      } else {
        res.selfCallback({
          code: '000001',
          msg: '登录失败,密码不正确',
        })
      }
    }
  })
})

// 退出登录
app.post('/logout', function (req, res) {
  // 销毁session
  req.session.destroy()
  res.selfCallback({
    code: '000000',
    msg: '退出登录成功'
  })
})

// 注册接口
app.post('/register', function (req, res) {
  //  如果数据库中已经存在该用户名，提示“用户已存在”
  const queryStr = 'select username from tb_user;'
  db.query(queryStr, (err, results) => {
    if (err) {
      return console.log('查询数据库出错了！')
    }
    // console.log('查询结果：', results);  // res返回的是对象数组[{username: xxx}]
    const userList = results.map(ele => ele.username)
    const { username, password } = req.body
    console.log('接收的请求参数：', req.body, req.query);
    if (!userList.includes(username)) {
      // 新用户可继续注册
      // const sqlStr = `insert into tb_user(username, password) values('${username}','${password}')`
      const sqlStr = `insert into tb_user(username, password) values(?,?)`
      const sqlParams = [username, password]
      db.query(sqlStr, sqlParams, function (error, result) {
        if (error) {
          return console.log('数据库操作失败%s', error);
        } else {
          console.log('操作结果：', result);
          res.selfCallback({
            msg: '注册成功'
          })
        }
      })
    } else {
      // 该用户已存在，
      res.selfCallback({
        code: '000001',
        msg: '注册失败，该用户已存在'
      })
    }
  })
})

module.exports = app