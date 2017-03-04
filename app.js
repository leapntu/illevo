var express = require('express');
var app = express()
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var sql = require('sqlite3');
var db = new sql.Database('data.db');

var users = {}

app.use(express.static('public'))

io.on('connection', function(socket){
    console.log(`Connected to socket: ${socket.id}`)

  socket.on('disconnect', function(){
      console.log(`Disconnected from socket: ${socket.id}`)
  })

  socket.on('sql_all', function (req, res) {
    query = req.sql
    params = req.params
    db.serialize ( function () {
      db.all ( query, params, function (err, rows) {
        res(rows)
      })
    })
  })

  socket.on('is_open', )

});

server.listen(80);
