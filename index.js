var express = require("express");
var app = express();
var path = require("path");
const { Socket } = require("net");
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 8080;
var DbConnection = require("./db");
var serverlist = {}
server.listen(port, () => {
	console.log("Server listening at port %d", port);
});
var membersact = { "": { name: "", room: false } }
app.use(express.static(path.join(__dirname, "public")));
buildings = {}
units = {}
const fs = require("fs");
const { unit } = require("./public/units/basicunit");
const { TIMEOUT } = require("dns");
fs.readdir("./public/units/", (err, files) => {
	console.log("***load units and buildings***");
	files.forEach(file => {
		if (file != "img") {
			let temp = require("./public/units/" + file);
			if (!temp.template) {
				if (temp.name + ".js" != file) console.warn("please name files as units in them(maybe can cause trauble)name of unit: " + temp.name + " File name:" + file)
				console.log(temp);
				units[temp.name] = temp.object;
			}
		}
	});
});
placebuildings = {}
setTimeout(() => {
	fs.readdir("./public/buildings/", (err, files) => {
		files.forEach(file => {
			if (file != "img") {
				let temp = require("./public/buildings/" + file);
				if (!temp.template) {
					if (temp.name + ".js" != file) console.warn("please name files as buildings in them(maybe can cause trauble)name of building: " + temp.name + " File name:" + file)
					console.log(temp);
					buildings[temp.name] = temp.object;
					for (i of temp.placement) {
						if (placebuildings[i] != undefined) {
							placebuildings[i][placebuildings[i].length] = new temp.object
						}
						else {
							placebuildings[i] = [new temp.object]
						}
					}
				}
			}
		});
		console.log("***end of load units and buildings***");
	});
	setTimeout(() => {
		samplebuildings = {}
		for (i in buildings) {
			samplebuildings[i] = new buildings[i]
		}
	}, 10);

}, 10);


logs = []
function logit(mes) {
	var d = new Date();
	mes = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds() + "<br>" + mes
	io.to("log").emit("nlog", mes)
	console.log(mes)
	logs[logs.length] = mes
}







// MARK: Comunication
var updategame = function () { }
io.on("connection", (socket) => {
	socket.emit("buildings", [placebuildings, samplebuildings])
	socket.on("signup", async (data) => {
		temp = await CreateUser(data[0], data[1])
		console.log("backsignup" + temp)
		socket.emit("backsignup", temp)
	});
	socket.on("loginin", async (data) => {
		if (await login(data[0], data[1])) {
			socket.userdata = await FindUser(data[0])
			console.log("login")
			console.log(socket.userdata)
			membersact[data[0]] = { name: data[0], room: false }
			io.emit("players", membersact)
			socket.emit("backlogin", socket.userdata)
		} else {
			socket.emit("backlogin", false)
		}
	})
	socket.on("disconnect", () => {
		if (socket.userdata) {
			console.log("disconect")
			console.log(socket.userdata)
			temp = removeFromObject(membersact, socket.userdata.name)
			if (temp == membersact) console.warn("no change in membersact after disconect")
			membersact = temp
			io.emit("players", membersact);
			console.log(membersact)
		} else {
			console.log("some ... didnt login and just quit")
		}
	});
	socket.on("new message", data => {
		if (data[1] == "g") {
			console.log("G Mes" + JSON.stringify(data))
			socket.broadcast.emit("new message", data[0])
		} else {
			console.log(data[1] + " Mes:" + JSON.stringify(data))
			socket.broadcast.to(data[1]).emit("new message", data[0])
		}
	});
	socket.on("creategame", data => {
		socket.join(socket.userdata.name)
		membersact[socket.userdata.name].active = 1;
		membersact[socket.userdata.name].room = socket.userdata.name;
		if (data[0]) {
			serverlist[socket.userdata.name] = { name: socket.userdata.name, score: socket.userdata.score, active: 1 }
		} else {
			console.log("//TODO: friend server")
		}
		console.log("server created: " + socket.userdata.name)
		io.emit("serverlist", serverlist)
	})
	socket.on("joingame", data => {
		if (serverlist[data[0]].active == 1 && data[0] != socket.userdata.name && membersact[data[0]].active) {
			socket.join(data[0]);
			serverlist[data[0]].active = 2;
			membersact[socket.userdata.name].room = data[0];
			membersact[socket.userdata.name].active = 1;
			membersact[socket.userdata.name].room = data[0]
			console.log(socket.userdata.name + " joined to game with " + data[0]);
			removeFromObject(serverlist, data[0]);
			start_of_game(data[0], socket.userdata.name);
		}
	})
	socket.on("build", data => {
		let groundtype = data[0]
		let x = data[1]
		let y = data[2]
		let building = data[3]
		let game = games[membersact[socket.userdata.name].room]
		let num = game.us1 == socket.userdata.name ? 1 : 2
		if (!samplebuildings[building]) {
			console.error(building)
			console.error(samplebuildings[building])
			console.error("tak to mě poser já jsem ded xd kill me")
		} else {
			if (samplebuildings[building].cost >= game["data" + num].money) {
				game["data" + num].money -= samplebuildings[building].cost
				t = game["grid" + num][y][x]
				t.beforetype.push(t.type)
				t.type = building
				t.object = new buildings[building](x, y)
			}
		}
	})
	updategame = function (data) {
		io.to(data.us1).emit("clock", data)
	}
})







// MARK: Database functions
async function CreateUser(name, pass) {
	if (!await FindUser(name)) {
		return new Promise(async resolve => {
			let db = await DbConnection.Get();
			db.db("ToDeMu").collection("users").insertOne({ name: name, password: pass, friends: ["viki", "f"], startedgames: 0, win: 0, lost: 0, buildtowers: 0, buildtroopers: 0, score: 1000 }, function (err, res) {
				if (err) throw err;
				if (res.result.ok) logit("was created user " + name);
				resolve(Boolean(res.result.ok));
			});
		});
	} else return false;
}
function FindUser(name) {
	return new Promise(async resolve => {
		let db = await DbConnection.Get();
		db.db("ToDeMu").collection("users").findOne({ name: name }, function (err, result) {
			if (err) throw err;
			resolve(result);
		});
	});
};
function login(name, pass) {
	if (!membersact[name]) {
		return new Promise(async resolve => {
			x = await FindUser(name)
			x = x ? x : resolve(false)
			resolve(x.password == pass)
		})
	}
}







// MARK: Usefull functions
function removeFromArray(arr, el) {
	return arr.filter(function (x) {
		return x != el;
	});
}
function removeFromObject(arr, el) {
	i = 0
	ret = {}
	for (x in arr) {
		if (x != el) {
			ret[x] = arr[x]
		}
	}
	arr = ret
	return ret
}







// TODO: DO the FuCKInG GaMe lol
startdata = { money: 0 }
gridsize = [7, 12]//[x,y] Tell how big is gaming grid
games = {}
grid = []
gamesints={}
for (i = 0; i < gridsize[1]; i++) {
	grid[i] = []
	for (y = 0; y < gridsize[0]; y++) {
		if (i == gridsize[1] - 1) {
			grid[i][y] = { type: "deploy", beforetype: [], object: null, units: [] }
		} else {
			grid[i][y] = { type: "ground", beforetype: [], object: null, units: [] }
		}
	}
}
function start_of_game(us1, us2) {
	games[us1] = { us1: us1, us2: us2, grid1: [...grid], grid2: [...grid], units1: {}, units2: {}, data1: { ...startdata }, data2: { ...startdata } }
	gamesints[us1]=setInterval(() => {
		game_tick(games[us1])
	}, 100);
	console.log(games[us1])
	io.to(us1).emit("startgame", games[us1]);
}
function game_tick(gamedata) {
	gamedata.shoots=[]
	for (i of gamedata.grid1) {
		for (z of i) {
			if (z.object) z.object.clock(gamedata)
		}
	}
	for (i of gamedata.grid2) {
		for (z of i) {
			if (z.object) z.object.clock(gamedata)
		}
	}
	if (gamedata.units1 == {}) for (i of gamedata.units1) {
		i.clock(gamedata)
	}
	if (gamedata.units2 == {}) for (i of gamedata.units2) {
		i.clock(gamedata)
	}
	updategame(gamedata)
}