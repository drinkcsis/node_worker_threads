// @ts-nocheck
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const DirectorInit = require('./director')

io.on("connection", socket => {
    console.log('connected');

    socket.on('run', data => {

        socket.emit('run');
        DirectorInit(socket);

    })
});


server.listen(3000);