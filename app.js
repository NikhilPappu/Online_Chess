var express = require('express');
var app = express();
app.use(express.static('src'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 4000;

var users = {};
var lobbyUsers = {};
var currentGames = {};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/src/index.html');
});

io.on('connection', function(socket) {
    
    socket.on('login', function(userId) {
        login(socket, userId);
    });

    function login(socket, userId) {
        socket.userId = userId;  
     
        if (!users[userId]) {    
            users[userId] = {userId: socket.userId, games:{}};
        }

        socket.emit('login', {users: Object.keys(lobbyUsers), 
                              games: Object.keys(users[userId].games)});
        lobbyUsers[userId] = socket;
        
        socket.broadcast.emit('joinlobby', socket.userId);
    }
    
    socket.on('challenge', function(opponentId) {        
        socket.broadcast.emit('exitlobby', socket.userId);
        socket.broadcast.emit('exitlobby', opponentId);
      
        let oneOrZero = (Math.random()>0.5)? 1 : 0
        
        var game = {
            id: Math.floor((Math.random() * 100) + 1),
            board: null,
            users: {}
        };
        
        if (oneOrZero == 1){
            game.users = {white: socket.userId, black: opponentId};
        }
        else if (oneOrZero == 0){
            game.users = {white: opponentId, black: socket.userId};
        }

        socket.gameId = game.id;
        currentGames[game.id] = game;
        
        users[game.users.white].games[game.id] = game.id;
        users[game.users.black].games[game.id] = game.id;
     
        lobbyUsers[game.users.white].emit('joingame', {game: game, color: 'white'});
        lobbyUsers[game.users.black].emit('joingame', {game: game, color: 'black'});


        
        
        delete lobbyUsers[game.users.white];
        delete lobbyUsers[game.users.black];   

    });
    
     socket.on('resumegame', function(gameId) {
         
        socket.gameId = gameId;
        var game = currentGames[gameId];
        
        users[game.users.white].games[game.id] = game.id;
        users[game.users.black].games[game.id] = game.id;
  
        if (lobbyUsers[game.users.white]) {
            lobbyUsers[game.users.white].emit('joingame', {game: game, color: 'white'});
            delete lobbyUsers[game.users.white];
        }
        
        if (lobbyUsers[game.users.black]) {
            lobbyUsers[game.users.black] && 
            lobbyUsers[game.users.black].emit('joingame', {game: game, color: 'black'});
            delete lobbyUsers[game.users.black];  
        }
    });
    
    socket.on('move', function(msg) {
        socket.broadcast.emit('move', msg);
        currentGames[msg.gameId].board = msg.board;
    });

    socket.on('game_end', function(msg){
        delete users[currentGames[msg.gameId].users.white].games[msg.gameId];
        delete users[currentGames[msg.gameId].users.black].games[msg.gameId];
        delete currentGames[msg.gameId];

        socket.broadcast.emit('game_end', msg);
    });
    
    socket.on('resign', function(msg) {
        delete users[currentGames[msg.gameId].users.white].games[msg.gameId];
        delete users[currentGames[msg.gameId].users.black].games[msg.gameId];
        delete currentGames[msg.gameId];

        socket.broadcast.emit('resign', msg);
    });

    socket.on('disconnect', function(msg) {
      
      delete lobbyUsers[socket.userId];
      
      socket.broadcast.emit('logout', {
        userId: socket.userId,
        gameId: socket.gameId
      });
    });        
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});
