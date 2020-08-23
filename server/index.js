const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");
const cors = require("cors");
const { createRoom, joinRoom, deleteRoom, makeMove } = require("./room");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.on("connect", (socket) => {
  console.log(`Hello! ${socket.id}`);

  socket.on("create", ({ roomName }, callback) => {
    console.log(`Welcome ${socket.id} to ${roomName}`);

    const { room, error } = createRoom(socket.id, roomName);

    if (error) {
      callback({ error });
      return;
    }

    socket.broadcast.to(room.name).emit("message", { text: `Has joined` });
    socket.join(room.name);
  });

  socket.on("join", ({ roomName }, callback) => {
    console.log(`Adding ${socket.id} to ${roomName}`);
    const { room, error } = joinRoom(socket.id, roomName);

    if (error) {
      callback({ error });
      return;
    }

    socket.broadcast.to(room.name).emit("playerJoin");

    socket.join(room.name);

    callback({
      board: room.board,
      current: room.current,
    });
  });

  socket.on("selfMove", ({ roomName, board }) => {
    const { newBoard, current } = makeMove(roomName, board);
    io.to(roomName).emit("opponentMove", {
      user: socket.id,
      board: newBoard,
      current: current,
    });
  });

  socket.on("clearBoard", ({ roomName }) => {
    io.to(roomName).emit("clearBoard");
  });

  socket.on("disconnect", () => {
    console.log(`Bye! ${socket.id}`);
    const room = deleteRoom(socket.id);
    if (room) {
      io.to(room.name).emit("playerLeft");
    }
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
