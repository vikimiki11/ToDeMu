connected = false;
serverlist = {};
playerdata = {};
Name = false;
spam = false;
zpravy = { g: [] };
actualchat = "g";
temp = document.querySelectorAll(".chat");
DOMchatg = temp[0];
DOMchatl = temp[1];
ingame = false;
var COLORS = ['0F0', '0EE', '22F', 'EE0', 'E00', 'E0E'];
if (localStorage.getItem('name')) {
	document.querySelector(".usernameInput").value = localStorage.getItem('name');// TODO: localStorage.setItem('name', username);
}
var membersact = {}
if (window.location.hostname == "localhost") {
	socket = io("localhost:8080");
} else {
	socket = io(window.location.hostname);
}
function switchchat() {
	if (actualchat == "g" && ingame) {// TODO: switch to local only in game
		actualchat = "l"
		DOMchatl.style.display = "block"
		DOMchatg.style.display = "none"
	}
	else {
		actualchat = "g"
		DOMchatg.style.display = "block"
		DOMchatl.style.display = "none"
	}
}
socket.on('new message', (data) => {
	addChatMessage({ username: data.username, message: data.message, skupina: "L" });
});
const addChatMessage = (data) => {
	el = document.querySelector(".Chat" + data.skupina.toUpperCase())
	el.innerHTML += '<p class="message" style="display: block;"><span class="username" style="color: #' + getUsernameColor(data.username) + ';">' + data.username + '</span><span class="messageBody">' + data.message + '</span></p>'
}
const sendMessage = (mes) => {
	if (mes) {
		temp = actualchat == "g" ? "g" : membersact[Name].room
		temp2 = {
			username: Name,
			message: mes,
			skupina: actualchat
		}
		addChatMessage(temp2);
		socket.emit('new message', [temp2, temp]);
	}
}







// MARK: usefull functions
async function sha256(message) {
	const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
	const hashHex = hashArray.map(b => b.toString(36).padStart(2, '0')).join(''); // convert bytes to hex string
	return hashHex;
}
function removeElement(el) {
	el.parentNode.removeChild(el);
}
function removeFromArray(arr, el) {
	i = 0
	ret = []
	for (x of arr) {
		if (x != el) {
			ret[i] = x
			i++
		}
	}
}
function removeFromObject(arr, el) {
	i = 0
	ret = []
	for (x in arr) {
		if (x != el) {
			ret[i] = x
			i++
		}
	}
}
const cleanInput = (input) => {
	return $('<div/>').text(input).html();
}
const getUsernameColor = (username) => {
	// Compute hash code
	var hash = 7;
	for (var i = 0; i < username.length; i++) {
		hash = username.charCodeAt(i) + (hash << 5) - hash;
	}
	// Calculate color
	var index = Math.abs(hash % COLORS.length);
	return COLORS[index];
}







// MARK: game functions
function creategamefield(us1, us2, size) {
	el = document.createElement("table")
	for (i = 0; i < size[1]+1; i++) {
		el.appendChild(document.createElement("tr"))
		for (y = 0; y < size[0]; y++) {
			el.lastElementChild.appendChild(document.createElement("td"))
		}
	}
	el.lastElementChild.className = "deployzone"
	temp = document.querySelectorAll("#game>div>div")

	temp2 = document.createElement("h1")
	temp2.innerHTML = us1
	el.className = us1
	temp[0].appendChild(temp2)
	temp[0].appendChild(document.createElement("br"))
	temp[0].appendChild(el.cloneNode(true))

	temp2 = document.createElement("h1")
	temp2.innerHTML = us2
	el.className = us2
	temp[1].appendChild(temp2)
	temp[1].appendChild(document.createElement("br"))
	temp[1].appendChild(el);
}







// MARK: events
function switchtologin() {
	document.querySelector("#signup").style.display = "none"
}
function switchtosignup() {
	document.querySelector("#signup").style.display = "block"
}
async function signup() {
	if (!spam) {
		spam = true
		Name = document.querySelectorAll("#signup input")[0].value.trim()
		pass = document.querySelectorAll("#signup input")[1].value.trim()
		const hash = await sha256(Name + pass + Name + pass + pass + Name + Name + pass)
		socket.emit("signup", [Name, hash])
		setTimeout(() => {
			spam = false
		}, 200);
	}
}
socket.on('backsignup', data => {
	console.log("signup: " + data)
	if (data) {
		switchtologin()
	} else {
		alert("used name or error on server")
	}

})
async function login() {
	if (!spam) {
		spam = true
		Name = document.querySelectorAll("#login input")[0].value.trim()
		pass = document.querySelectorAll("#login input")[1].value.trim()
		const hash = await sha256(Name + pass + Name + pass + pass + Name + Name + pass)
		socket.emit("loginin", [Name, hash])
		setTimeout(() => {
			spam = false
		}, 200);
	}
}
socket.on('backlogin', data => {
	console.log("login: " + Boolean(data))
	if (data) {
		playerdata = data
		removeElement(document.querySelector("#signup"))
		removeElement(document.querySelector("#login"))
		document.querySelector("main").style.display = "block"
		document.querySelector("aside").style.display = "grid"
	} else {
		alert("wrong name or password or error")
	}

})
document.querySelectorAll("#login input").forEach(element => {
	element.addEventListener("keyup", function (event) {
		if (event.keyCode === 13) {
			document.querySelector("#login button").click();
		}
	})
})
document.querySelectorAll("#signup input").forEach(element => {
	element.addEventListener("keyup", function (event) {
		if (event.keyCode === 13) {
			document.querySelector("#signup button").click();
		}
	})
})
document.querySelector("aside input").addEventListener("keyup", function (event) {
	if (event.keyCode === 13) {
		sendMessage(cleanInput(event.target.value))
		event.target.value = ""
	}
})







// MARK: Comunication with server
socket.on('players', data => {
	membersact = data;
})
socket.on('updataplayerdata', data => {
	playerdata = data;
})
socket.on('serverlist', data => {
	serverlist = data;
	ret = "";
	for (i in serverlist) {
		ret += "<li><h3><b>" + serverlist[i].name + "</b></h3>" + serverlist[i].score + "<button onclick='socket.emit(\"joingame\",[\"" + serverlist[i].name + "\"])'>join</button></li>"
	}
	document.querySelector("#serverlist").innerHTML = ret
})
socket.on('placebase', data => {
	ingame = 1
	document.querySelector("#game").style.display = "block"
	document.querySelector("#hry").style.display = "none"
	document.querySelector(".ChatL").innerHTML = ""
	creategamefield(data[0], data[1], data[2])
})