var express = require('express');
var path = require('path');
var IO = require('socket.io');
var router = express.Router();

var app = express();
var server = require('http').Server(app);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200);
        /让options请求快速返回/
    } else {
        next();
    }
});
// 创建socket服务
var socketIO = IO(server);
// 房间用户名单  topic_id 为房间的id  
var topicId = [];
var socketManager = {};
app.post('/message', function(req, res) {
    var data = '';
    req.on('readable', function() {
        //初始判断是否有数据可读
        // console.log('readable...');
    });
    req.on('data', function(chunk) {
        data += chunk;
    })
    req.on('end', function() {
        data = JSON.parse(data);
        for (var id of topicId) {
            console.log('readend...');
            if (id == data.topic_id) {
                res.end(data.topic_id);
                return;
            }
        }
        topicId.push(data.topic_id);
        socketIO.of('/' + data.topic_id).on('connection', function(socket) {
            socketManager[data.topic_id] = socketIO;
            socket.on('client_data', function(res) {
                socketIO.of('/' + data.topic_id).emit('sever_data', res);
            })
            socket.on('disconnect', function() {
                console.log(data.topic_id + '号房间断开socket', socketManager);
            })
        })
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end(data.topic_id);
    })
});
app.use('/', router);
server.listen(5000, function() {
    console.log('server listening on port 5000');
});