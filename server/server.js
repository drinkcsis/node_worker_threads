// @ts-nocheck
var server = require('http').createServer();
var io = require('socket.io')(server);
const HallInit = require('./director')

io.on("connection", socket => {
    console.log('Connected...');

    socket.on('run', () => {
        socket.emit('run');
        HallInit(socket);

    })
});

server.listen(3000);