'use strict';

const express = require('express');
const http = require('http');
const socket = require('socket.io');
const Game = require('./libs/Game');

const app = express();
const server = http.Server(app);
const io = socket(server);
const game = new Game();

game.start(io);
app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('server is listening on port ' + port)
});