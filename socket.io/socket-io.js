/**
 * socket-io functions for all of solution. Allows communication between clients
 */
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

          //emits annotations on pictures
          socket.on('pic', function (room, width, height, prevX, prevY, currX, currY, color, thickness) {
              io.sockets.to(room).emit('pic_display', room, width, height, prevX, prevY, currX, currY, color, thickness)
          });

          //clear annotations on pictures
          socket.on('clear', function (room) {
              io.sockets.to(room).emit('clear-display', room)
          });

          //show knowledge graph to other users
          socket.on('knowledge', function (room, id, name, rc, qc, color) {
              //other users except sender
              socket.broadcast.to(room).emit('knowledge_display', id, name, rc, qc, color);
              //io.sockets.to(room).emit('knowledge_display', room, id, name, rc, qc, color)
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

