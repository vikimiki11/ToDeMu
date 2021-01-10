connected = false
username = false
spam = false
if (window.location.hostname == "localhost") {
	socket = io("localhost:8080");
} else {
	socket = io(window.location.hostname);
}
async function sha256(message) {
	const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
	const hashHex = hashArray.map(b => b.toString(36).padStart(2, '0')).join(''); // convert bytes to hex string
	return hashHex;
}
function switchchat() {
	sa = document.querySelector("#rs").className
	if (sa == "SwitchG") {
		if (membersact[username].room !== "") {
			document.querySelector("#rs").className = "SwitchL"; document.querySelector("#rs").innerHTML = "Local chat"
		}
	} else {
		document.querySelector("#rs").className = "SwitchG"; document.querySelector("#rs").innerHTML = "Global chat"
	}
	if (document.querySelector("#rs").className != sa) {
		document.querySelector(".chat").innerHTML = ""
		rs = document.querySelector("#rs").className.split("Switch")[1]
		if (rs != "G") { rs = membersact[username].room; if (typeof zpravy[membersact[username].room] == "undefined") { zpravy[membersact[username].room] = [] } }
		for (let i of zpravy[rs]) {
			addChatMessage(i, false)
		}
	}
}
socket.on('new message', (data) => {
	addChatMessage(data, true);
}
);
const addChatMessage = (data, save) => {
	rs = document.querySelector("#rs").className.split("switch")[1]
	if (rs == data.skupina || (rs == "l" && typeof data.skupina == "number")) {
		document.querySelector(".chat").innerHTML += '<p class="message" style="display: block;"><span class="username" style="color: #' + getUsernameColor(data.username) + ';">' + data.username + '</span><span class="messageBody">' + data.message + '</span></p>'
	}
	if (typeof zpravy[data.skupina] == "undefined") { zpravy[data.skupina] = [] }
	if (save == true) { zpravy[data.skupina][zpravy[data.skupina].length] = data }
}
const sendMessage = () => {
	var message = $("#mes").val();
	// Prevent markup from being injected into the message
	message = cleanInput(message);
	// if there is a non-empty message and a socket connection
	if (message) {
		$("#mes").val('');
		rs = document.querySelector("#rs").className.split("switch")[1]
		if (rs == "g") {
			addChatMessage({
				username: username,
				message: message,
				skupina: "g"
			}, true); socket.emit('new message', [message, "g"]);
		} else {
			addChatMessage({
				username: username,
				message: message,
				skupina: membersact[username].room
			}, true); socket.emit('new message', [message, membersact[username].room]);
		}
	}
}
$(window).keydown(event => {
	if (event.which === 13) {
		if (!username) {
			$(".usernameInput").focus();
			setUsername();// TODO: set username function
		} else {
			sendMessage()
		}
	}
})
const setUsername = () => {
	username = cleanInput($(".usernameInput").val().trim());
	// If the username is valid
	if (username) {
		// Tell the server your username
		socket.emit('add user', username);
		localStorage.setItem('name', username);
		console.log(socket)
	}
}
if (localStorage.getItem('name')) {
	document.querySelector(".usernameInput").value = localStorage.getItem('name');// TODO: localStorage.setItem('name', username);
}
socket.on('', data => {

})
function removeElement(el) {
	el.parentNode.removeChild(el);
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
		const hash = await sha256(Name + pass)
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
		const hash = await sha256(Name + pass)
		socket.emit("login", [Name, hash])
		setTimeout(() => {
			spam = false
		}, 200);
	}
}
socket.on('backlogin', data => {
	console.log("login: " + data)
	if (data) {
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
		// TODO: addmesage
	}
})

// Mark: Comunication from server