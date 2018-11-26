(function () {
    WinJS.UI.processAll().then(function () {
        var socket, serverGame;
        var username, playerColor;
        var usersOnline = [];
        var myGames = [];
        socket = io();
      
        socket.on('login', function(msg) {
            usersOnline = msg.users;
            updateUserList();
            
            myGames = msg.games;
            updateGamesList();
        });
      
        socket.on('joinlobby', function (msg) {
            addUser(msg);
        });
      
        socket.on('exitlobby', function (msg) {
            removeUser(msg);
        });

        socket.on('resign', function(msg) {
            if (msg.gameId == serverGame.id) {
                if(playerColor == "white") alert('Result: 1-0\n' + 'You win!');
                else if(playerColor == "black") alert('Result: 0-1\n' + 'You win!');
                socket.emit('login', username);

                $('#page-lobby').show();
                $('#page-game').hide();
            }            
        });
                  
        socket.on('joingame', function(msg) {
            playerColor = msg.color;
            initGame(msg.game);
        
            $('#page-lobby').hide();
            $('#page-game').show();
        
        });
        
        socket.on('move', function (msg) {
            if (serverGame && msg.gameId === serverGame.id) {
                game.move(msg.move);
                board.position(game.fen());
            }
        });

        socket.on('checkmate', function(msg){
            if (msg.gameId == serverGame.id) {
                if(msg.color == 'white'){
                    alert('Result: 1-0\n' + 'You lose!');
                }
                else if(msg.color == 'black'){
                    alert('Result: 0-1\n' + 'You lose!');
                }
                socket.emit('login', username);

                $('#page-lobby').show();
                $('#page-game').hide();

            }            

        });

        socket.on('logout', function (msg) {
            removeUser(msg.username);
        });


        $('#login').on('click', function() {
            username = $('#username').val();
        
            if (username.length > 0) {
                $('#userLabel').text("Welcome " + username + "!");
                socket.emit('login', username);
            
                $('#page-login').hide();
                $('#page-lobby').show();
            } 
        });
      
        $('#game-back').on('click', function() {
            socket.emit('login', username);
        
            $('#page-game').hide();
            $('#page-lobby').show();
        });
      
        $('#game-resign').on('click', function() {
            if(playerColor == "white") alert('Result: 0-1\n' + 'You lose!');
            else if(playerColor == "black") alert('Result: 1-0\n' + 'You lose!');
            socket.emit('resign', {userId: username, gameId: serverGame.id});
           
            socket.emit('login', username);
            $('#page-game').hide();
            $('#page-lobby').show();
        });
      
        var addUser = function(userId) {
            usersOnline.push(userId);
            updateUserList();
        };
    
        var removeUser = function(userId) {
            for (var i=0; i<usersOnline.length; i++) {
                if (usersOnline[i] === userId) {
                    usersOnline.splice(i, 1);
                }
            }
            updateUserList();
        };
      
        var updateGamesList = function() {
            document.getElementById('gamesList').innerHTML = '';
            myGames.forEach(function(game) {
            $('#gamesList').append($('<button>')
                            .text('#'+ game)
                            .on('click', function() {
                            socket.emit('resumegame',  game);
                            }));
            });
        };
      
        var updateUserList = function() {
            document.getElementById('userList').innerHTML = '';
            usersOnline.forEach(function(user) {
            $('#userList').append($('<button>')
                        .text(user)
                        .on('click', function() {
                        socket.emit('challenge',  user);
                        }));
            });
      };

      var initGame = function (serverGameState) {
        serverGame = serverGameState; 
        
          var cfg = {
            draggable: true,
            showNotation: false,
            orientation: playerColor,
            position: serverGame.board ? serverGame.board : 'start',
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: onSnapEnd
          };
               
          game = serverGame.board ? new Chess(serverGame.board) : new Chess();
          board = new ChessBoard('game-board', cfg);
      }

      var onDragStart = function(source, piece, position, orientation) {
        if (game.game_over() === true ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
            (game.turn() !== playerColor[0])) {
          return false;
        }
      };  
      
      var onDrop = function(source, target) {
        var move = game.move({
          from: source,
          to: target,
          promotion: 'q'
        });
      
        if (move === null) { 
          return 'snapback';
        } else {
           socket.emit('move', {move: move, gameId: serverGame.id, board: game.fen()});
        }
        
        //   // draw?
        //   else if (game.in_draw() === true) {
        //     console.log('draw');
        //   }
        
      };

      var onSnapEnd = function() {
        board.position(game.fen());
        if (game.in_checkmate() === true){
            if(playerColor == "white") alert('Result: 1-0\n' + 'You win!');
            else if(playerColor == "black") alert('Result: 0-1\n' + 'You win!');

            socket.emit('checkmate', {userId: username, gameId: serverGame.id, color: playerColor});

            socket.emit('login', username);
            $('#page-game').hide();
            $('#page-lobby').show();
            

        }
      };
    });

})();
