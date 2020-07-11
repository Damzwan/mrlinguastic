var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + "/dist/"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/dist/main.html');
});

let port = process.env.PORT;
if (port == null || port == "") port = 3000;
http.listen(port, function () {
    console.log('listening on *:' + port);
});

io.on('connection', function (socket) {
    console.log("connected!")
});