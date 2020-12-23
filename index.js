var express = require('express');
var app = express();
var path = require('path');
const { Socket } = require('net');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

logs=[]
function logit(mes){
  var d = new Date();
  mes=d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds()+"<br>"+mes
  io.to('log').emit("nlog",mes)
  console.log(mes)
  logs[logs.length]=mes
}
//io.emit('',data)
//socket.emit('',data);
io.on('connection', (socket) => {
  socket.on('', (username) => {
  });
  socket.on('disconnect', () => {
  });
})