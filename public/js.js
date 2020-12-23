connected=false
if (window.location.hostname == "localhost") {
  socket = io("localhost:8080");
} else {
  socket = io(window.location.hostname);
}
if (localStorage.getItem('name')) {
  document.querySelector(".usernameInput").value = localStorage.getItem('name');//TODO localStorage.setItem('name', username);
}
socket.on('', data=>{

}
)
