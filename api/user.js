const db = require('../db/mysql')
const app = require("express").Router()
const { SUCCESS_CODE } = require('../libs/constant')

// 获取数据库现有的所有用户数据，用于删除/更新某个用户后查询最新的数据
function getAllUser (res) {
  let info = []
  db.query('select username,password,id from tb_user', function (error, r) {
    if (error) {
      return console.log('数据库查询失败了，getAllUser', error);
    } else {
      info = r.map(ele => {
        const { id, username, password } = ele
        return {
          id,
          username,
          password
        }
      })
      res.send({
        code: '000000',
        info,
        msg: '操作成功'
      })
    }
  })
}

// 查询所有的用户
app.post('/userList', function (req, res) {
  // 查询库中已存在的用户信息
  let queryStr = "select id,username,password from tb_user where 1=1"
  const { username, password, id } = req.body
  console.log('token相关认证信息：', req.user);
  if (username) {
    queryStr = queryStr + ` and username='${username}'`
  }
  if (password) {
    queryStr = queryStr + ` and password='${password}'`
  }
  if (id) {
    queryStr = queryStr + ` and id='${id}'`
  }
  db.query(queryStr, (err, result) => {
    if (err) {
      return console.log('查询数据库出错了！');
    }
    console.log('查询结果：', result);
    const info = result.map(ele => {
      const { id, username, password } = ele
      return {
        id,
        username,
        password
      }
    })
    res.send({
      code: SUCCESS_CODE,
      info,
      msg: '查询成功'
    })
  })
})

// 根据id删除指定的用户
app.post('/deleteUser', function (req, res) {
  const {id } =req.body
  db.query(`delete from tb_user where id=${id}`, (err, result) => {
    if (err) {
      return console.log('数据库操作失败了，', err);
    }
    res.send({
      code: SUCCESS_CODE,
      msg: '操作成功'
    })
  })
})

// 根据id编辑指定的用户
app.post('/editUserById', function (req, res) {
  const { id, username, password } = req.body
  const querySql = `update tb_user set username='${username}', password='${password}' where id=${id};`
  db.query(querySql, async (err, r) => {
    if (err) {
      return console.log('数据库操作出错了、');
    } 
    res.send({
      code: '000000',
      msg: '操作成功'
    })
  })
})
// 根据id获取指定的用户详情
app.post('/getUserDetail', function (req, res) {
  const querySql = `select id,username, password from tb_user where id=${req.body.id};`
  db.query(querySql, async (err, r) => {
    if (err) {
      return console.log('数据库操作出错了、getDetailById');
    }
    let info = r.map(ele => {
      const { id, username, password } = ele
      return {
        id,
        username,
        password
      }
    })
    res.send({
      code: '000000',
      info: info.length > 0 ? info[0] : {},
      msg: '查询成功'
    })
  })
})

// 新增用户
app.post('/addUser', function (req, res) {
  const { username, password } = req.body
  // 判断该用户是否已存在
  db.query('select * from tb_user;', (err, r) => {
    let userData = r.map(item => item.username)
    if (userData.includes(username) ) {
      return res.selfCallback({
        code: '000002',
        msg: '该用户名已存在，请检查！',
      })
    }
    const querySql = 'insert into tb_user(username,password) values(?,?)'
    const queryParams = [username, password]
    db.query(querySql, queryParams, (err, result) => {
      if (err) {
        return console.log('数据库操作失败了，addUser');
      }
      res.send({
        code: SUCCESS_CODE,
        msg: '操作成功'
      })
    })
  })
})

module.exports = app