
/*
exports.init = function(io) {
  io.sockets.on('connection', function (socket) {
    try {
     // insert here your event
    } catch (e) {
    }
  });
}*/



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
}
