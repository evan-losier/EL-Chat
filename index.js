// Evan Losier (30022571)

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let allMessages = [];

function fillMessageHistory() {
	let i = 0;
	for(i; i < 200; i++) {
		allMessages.push({msg: "", time: "", user: ""});
	}
}

function getZeroTime(t) {
	if(t < 10) {
		t = "0" + t;
	}
	return t;
}

function findUser(id) {
	let i = 0;
	for(i = 0; i < allUsers.length; i++) {
		if(allUsers[i].id === id) {
			return allUsers[i];
		}
	}
}

function findUserPos(id) {
	let i = 0;
	for(i = 0; i < allUsers.length; i++) {
		if(allUsers[i].id === id) {
			return i;
		}
	}
}

function sendMessage(m, u) {
	if(m.length === 0) {
		return;
	}
	let timestamp = new Date();
	let t = '' + getZeroTime(timestamp.getHours()) + ':' + getZeroTime(timestamp.getMinutes()) + ':' + getZeroTime(timestamp.getSeconds()) + ' ';
	m = m.replace(':)', ' \u{1F642} ');
	m = m.replace(':o', ' \u{1F62E} ');
	m = m.replace(':O', ' \u{1F62E} ');
	m = m.replace(':(', ' \u{1F641} ');
	allMessages.shift();
	allMessages.push({msg: m, time: t, user: u});
	io.emit('message update', allMessages);
}

function rename(id, newName) {
	let i = 0;
	let pos = 0;
	if(newName.substring(0,5) === "User " && newName.length > 5 && newName.charAt(5) >= totalUsers) {
		return;
	}
	for(i; i < allUsers.length; i++) {
		if(allUsers[i].name === newName) {
			return;
		}
		if(allUsers[i].id === id) {
			pos = i;
		}
	}
	allUsers[pos].name = newName;
	io.emit('user update', allUsers);
	io.emit('message update', allMessages);
}

function newColour(id, newColour) {
	let i = 0;
	let pos = 0;
	if(newColour.length != 6) {
		return;
	}
	for(i; i < allUsers.length; i++) {
		if(allUsers[i].id === id) {
			pos = i;
		}
	}
	allUsers[pos].colour = '#' + newColour;
	io.emit('user update', allUsers);
	io.emit('message update', allMessages);
}

let totalUsers = 0;
let allUsers = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	totalUsers++;
	allUsers.push({id: socket.id, name: "User " + totalUsers, colour: "#000000"});
	io.emit('message update', allMessages);
	io.emit('user update', allUsers);
	
	socket.on('chat message', (msg) => {
	
		if(msg.charAt(0) === '/') {
			if(msg.substring(0,6) === "/name ") {
				rename(socket.id, msg.substring(6));
			} else if(msg.substring(0,7) === "/color ") {
				newColour(socket.id, msg.substring(7));
			} else if(msg.substring(0,8) === "/colour ") {
				newColour(socket.id, msg.substring(8));
			}
		} else {
			sendMessage(msg, allUsers[findUserPos(socket.id)]);
		}
	});
	
	socket.on('disconnect', () => {
		allUsers.splice(findUserPos(socket.id), 1);
		io.emit('message update', allMessages);
		io.emit('user update', allUsers);
	});
});

http.listen(3000, () => {
  console.log('listening on *:3000');
  fillMessageHistory();
});