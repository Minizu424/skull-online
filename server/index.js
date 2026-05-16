// server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // 1. 入室処理
  socket.on("join_room", ({ roomId, playerName }) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    const newPlayer = {
      id: socket.id,
      name: playerName,
      isHost: rooms[roomId].length === 0,
      isReady: false,
      frameColor: ["blue", "green", "purple", "red"][rooms[roomId].length] || "blue",
    };

    rooms[roomId].push(newPlayer);
    io.to(roomId).emit("update_players", rooms[roomId]);
    console.log(`${playerName} joined room: ${roomId}`);
  });

  // 2. Ready切り替え（1箇所に集約）
  socket.on("toggle_ready", ({ roomId }) => {
    console.log("toggle_ready received:", socket.id);
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].map((p) =>
        p.id === socket.id ? { ...p, isReady: !p.isReady } : p
      );
      io.to(roomId).emit("update_players", rooms[roomId]);
    }
  });

  // 3. ゲーム開始（1箇所に集約）
  socket.on("start_game", ({ roomId }) => {
    console.log("start_game received for:", roomId);
    io.to(roomId).emit("game_started");
  });

  // 4. 切断処理
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((p) => p.id !== socket.id);
      io.to(roomId).emit("update_players", rooms[roomId]);
    }
    console.log("disconnected:", socket.id);
  });
});

server.listen(3001, "0.0.0.0", () => {
  console.log("server running on port 3001");
});