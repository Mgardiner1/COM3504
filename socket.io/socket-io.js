
exports.init = function(io) {
  io.sockets.on('connection', function (socket) {
      try {
          //it creates or joins a room
          socket.on('create or join', function (room, userId) {
              socket.join(room);
              io.sockets.to(room).emit('joined', room, userId);
          });
          // emits chats
          socket.on('chat', function (room, userId, chatText) {
              io.sockets.to(room).emit('chat', room, userId, chatText);
          });

          //emits pictures
          socket.on('pic', function (room, width, height, prevX, prevY, currX, currY, color, thickness) {
              //document.getElementById('who_you_are').innerHTML= "Second test";
              io.sockets.to(room).emit('pic_display', room, width, height, prevX, prevY, currX, currY, color, thickness)

          });

          //disconnects
          socket.on('disconnect', function () {
              console.log('someone disconnected');
          });
      } catch (e) {
      }
  });
}


/*
exports.init = function(io) {

  // the chat namespace
  const chat = io
      .of('/chat')
      .on('connection', function (socket) {
        try {
          //it creates or joins a room
          socket.on('create or join', function (room, userId) {
            socket.join(room);
            chat.to(room).emit('joined', room, userId);
          });
          // emits chats
          socket.on('chat', function (room, userId, chatText) {
            chat.to(room).emit('chat', room, userId, chatText);
          });

          //emits pictures
          socket.on('pic', function (ctx, room, userId, width, height, prevX, prevY, currX, currY, color, thickness) {
              chat.to(room).emit('pic', ctx, room, userId, width, height, prevX, prevY, currX, currY, color, thickness);
          });

          //disconnects
          socket.on('disconnect', function () {
            console.log('someone disconnected');
          });
        } catch (e) {
        }
      });
}*/

/*
exports.init = function(io) {

  // the chat namespace
  const chat = io
      .of('/chat')
      .on('connection', function (socket) {
        try {
          //it creates or joins a room
          socket.on('create or join', function (room, userId) {
            socket.join(room);
            chat.to(room).emit('joined', room, userId);
          });
          // emits chats
          socket.on('chat', function (room, userId, chatText) {
            chat.to(room).emit('chat', room, userId, chatText);
          });

          //disconnects
          socket.on('disconnect', function () {
            console.log('someone disconnected');
          });
        } catch (e) {
        }
      });
    // the news namespace
    const pic= io
        .of('/pic')
        .on('connection', function (socket) {
            try {
                socket.on('pic', function (ctx, room, userId, width, height, prevX, prevY, currX, currY, color, thickness) {
                    //socket.broadcast.to(room).emit('news', room, userId, chatText);
                    socket.broadcast.to(room).emit('pic_display', ctx, room, userId, width, height, prevX, prevY, currX, currY, color, thickness);
                });
            } catch (e) {
            }
        });
}*/
