//Libraries and Initialization
var express = require('express')
var fs = require("fs")
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var sql = require('sqlite3')
var db = new sql.Database('data.db')
var wdb = new sql.Database('data.db')
db.exec("PRAGMA BUSY_TIMEOUT=60000;") //always open db connection for read-only queries
//queries that require a lock will be spawened individually as needed, and named wdb

//Web Socket Interface
io.on('connection', function (socket) {
    console.log(`Connected to socket: ${socket.id}`)

  socket.on('disconnect', function () {
      console.log(`Disconnected from socket: ${socket.id}`)
  })

  socket.on('login', function (user_name, password, response) {
    db.get(`select * from users where login='${user_name}';`, function (err, row){
      if (err) {console.log(err)}
      response(row)
    })
  })

  socket.on('new_user', function (user_name, password, response) {
    let wdb = new sql.Database('data.db')
    wdb.exec("begin exclusive transaction;")
    wdb.get(`select * from users where login='${user_name}';`, function (err, row){
      if (err) {console.log(err); wdb.exec("commit transaction;")}
      if (!row) {
        wdb.exec(`insert into users (login, pwd) values ('${user_name}', '${password}'); commit transaction;`)
        response("added")
      }
      else if (row) { wdb.exec("commit transaction;"), response("taken") }
      wdb.close()
    })
  })

  socket.on('consent', function (user_name, response) {
    db.exec (`update users set consent = 1 where login='${user_name}';`)
    response ("consent")
  })

  socket.on('survey', function (user_name, native, second, age, gender, email, response) {
    db.exec (`update users set native = '${native}', second = '${second}', age = ${age}, gender = '${gender}', email = '${email}' where login='${user_name}';`)
    response ("survey")
  })

  socket.on('join_lineage', function (gender, response) {
    let wdb = new sql.Database('data.db')
    wdb.exec("begin exclusive transaction")
    wdb.all(`select * from lineage where condition = '${gender}' and open = 1 order by generation`, function (err, rows) {
      if (rows.length > 0) {
        console.log(rows)
        lineage = rows[0].id
        generation = rows[0].generation
        wdb.exec(`update lineage set open = 0 where id = ${lineage}; commit transaction`)
        response({"lineage": lineage, "generation": generation})
      }
      else if (rows.length == 0){response('closed');wdb.exec("commit transaction;")}
    })
  })

  socket.on('free_lineage', function(lineage, response) {
      let wdb = new sql.Database('data.db')
      wdb.exec(`begin exclusive transaction;`)
      wdb.exec(`update lineage set open = 1 where id = ${lineage}; commit transaction;`)
      response("left")
  })


  socket.on('get_words', function(lineage, generation, response) {
    db.get(`select * from dataevents where lineage= ${lineage} and generation = ${generation}`, function (err, row) {
      db.all(`select * from language where dataevent = ${row.id}`, function (err, rows) {
        response(rows)
      })
    })
  })

  socket.on('record_data', function(items, lineage, generation, user_id, response) {
    let wdb = new sql.Database('data.db')
    console.log(items, lineage, generation, user_id)
    wdb.serialize(function(){
      wdb.exec(`begin exclusive transaction;`)
      wdb.exec(`insert into dataevents (user, time, lineage, generation) values (${user_id}, ${Date.now()}, ${lineage}, ${JSON.parse(generation) + 1});`)
      wdb.get(`select * from dataevents where user=${user_id} and generation=${JSON.parse(generation) + 1} and lineage=${lineage};`, function(err, row){
        data_id = row.id
        for (const item of items) {
          wdb.exec(`insert into language (dataevent, stimuli, word) values (${data_id}, ${item.stimuli}, '${item.signal}');`)
        }
        wdb.exec(`update lineage set generation = generation + 1 where id = ${lineage};`)
        wdb.exec("commit transaction;")
        response("entered")
      })
    })
  })

  // socket.on('render', function (page) {
  //   console.log("custom render",`public/html/${page}.html`)
  //   fs.readFile(`public/html/${page}.html`, 'utf-8', function (err, data) {
  //     //socket.emit('render', data)
  //     socket.emit('render', `js/${page}.js`, data)
  //   })
  // })

});

//Routing
app.use(express.static('public'))

//Boot
server.listen(80);
