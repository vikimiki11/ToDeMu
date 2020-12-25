var express = require('express');
var app = express();
var path = require('path');
const { Socket } = require('net');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;
const MongoClient = require('mongodb').MongoClient;
const { resolve } = require('path');
const url = require('fs').readFileSync('url.txt', 'utf8');
var createUser
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
	socket.on('register', (username) => {
	});
	socket.on('disconnect', () => {
	});
})
async function CreateUser(name,pass){
	if(!await FindUser(name)){
		return new Promise(resolve => {
			MongoClient.connect(url, function(err, db) {
				if (err) throw err;
				db.db("ToDeMu").collection("users").insertOne({ name: name, password: pass }, function(err, res) {
					if (err) throw err;
					if(res.result.ok) logit("was created user "+name);
					resolve(Boolean(res.result.ok));
				});
			});
		});
	}else return false;
}
function FindUser(name){
	return new Promise(resolve => {
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			db.db("ToDeMu").collection("users").findOne({name:name}, function(err, result) {
				if (err) throw err;
				resolve(result);
			});
		});
	});
};
function login(name,pass){
	return new Promise(async resolve => {
		x=await FindUser(name)
		resolve(x.password==pass)
	})
}
setTimeout(async() => {
	x=await CreateUser("viki","jede")
	console.log(x)
	x=await login("viki","jede")
	console.log(x)
}, 2000);