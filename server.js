var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var auth = require('./routes/user_authorization.js');

rooms = [
    "general",
    "devops",
    "cloud computing",
    "covid19",
    "sports",
    "nodeJS"
]

app.get('/chat', function(req, res) {
    res.sendfile('./view/chat.html');
});

app.get('/', function(req, res) {
    res.sendfile('./view/login.html');
});

app.get('/signup', function(req, res) {
    res.sendfile('./view/signup.html');
});

users = [];
io.on('connection', function(socket) {
    currentRoom = rooms[0]

    console.log('A user connected');
    socket.on('setUsername', function(data) {
        console.log(data);

        if(users.indexOf(data) > -1) {
            socket.emit('userExists', `someone already took the name ${data}`);
        } else {
            users.push(data);
            socket.emit('userSet', {username: data});
            socket.join("general")
        }
    });

    socket.on('cngrm', function(data) { //change room
        socket.leave(currentRoom);
        console.log(data["newRoom"])
        console.log(data["newRoom"])
        socket.join(data["newRoom"]);
    })

    socket.on('msg', function(data) {
        //Send message to everyone
        console.log(data);
        console.log(data["room"]);
        io.sockets.in(data["room"]).emit('newmsg', data);
    })

    socket.on("disconnect", () => {
        console.log(`client id ${socket.id} disconnected.`)
    })
});


http.listen(4000, function() {
    console.log('listening on localhost:4000');
});