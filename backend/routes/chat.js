const express = require('express');
const app = express();
const mysql = require('mysql');
const config = require('../config/config.json');
const bodyParser = require('body-parser');
const pool = mysql.createPool(config);

const socket = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socket(server);

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))

io.sockets.on('connection', function (socket) {
    console.log('connection info -> ' +
        JSON.stringify(socket.request.connection._peername));
    // javascript 객체로 되어있는 json 문자열 형태로 바꿔주는 함수

    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;

    socket.on('login', function (input) {
        console.log('login 받음 ->' + JSON.stringify(input));

        login_ids[input.idx] = socket.idx;
        socket.login_idx = input.idx;

        sendResponse(socket, 'login', 200, 'ok');
    });
	// 클라이언트로부터 메세지를 받았을때,
    socket.on('message', function (message) {
        console.log('message 받음: ' + JSON.stringify(message));

            if (login_ids[message.recepient]) {
                console.log('socket : ' + login_ids[message.recepient]);
                // connected는 소켓번호를 안다면 연결된 소켓을 얻어올 수 있다.
                io.sockets.connected[login_ids[message.recepient]].emit('message', message);

                sendResponse(socket, 'message', 200, 'OK');
            } else {
                sendResponse(socket, 'message', 400, '상대방 ID를 찾을 수 없음');
            }
    });
});


module.exports = router