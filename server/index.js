const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.on("connect", (socket) => {
  console.log(`Hello! ${socket.id}`);

  socket.on("join", ({ room }) => {
    console.log(`Welcome ${socket.id} to ${room}`);
    socket.broadcast
      .to(room)
      .emit("message", { user: "admin", text: `Has joined` });
    socket.join(room);
  });

  socket.on("selfMove", ({ board, room }) => {
    io.to(room).emit("opponentMove", { user: socket.id, board });
  });

  socket.on("clearBoard", ({ room }) => {
    io.to(room).emit("clearBoard");
  });

  socket.on("disconnect", () => {
    console.log(`Bye! ${socket.id}`);
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
