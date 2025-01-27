const env = require("dotenv");
env.config();

require("./schemas/db");

// import libraries & functions
const express = require("express");
const cors = require("cors");
const { createServer } = require('node:http');
const { Server } = require('socket.io');
// const connectDB = require("./config/db");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", //client url
    methods: ["GET", "POST"],
    credentials: true
  }
});

// connect to MongoDB
// connectDB();

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import controllers
const dummyDataController = require("./controllers/DummyData.controller");
const userRoutes = require("./routes/User.routes");

const leaderboardRoutes = require("./routes/Leaderboard.routes");
const quizRoutes = require("./routes/Quiz.routes");
const contentGenerationRoutes = require("./routes/GenerateContent.router")
const gameRoutes = require('./routes/Game.routes');

// const roomReadyStatus = new Map()

// io.on('connection', (socket) => {
//   console.log('user ' + socket.id + ' connected');
//   socket.emit("server connection", "you have connected to the server!");

//   socket.join("room 1");
//   socket.emit("room join", "you have joined room 1!");
//   console.log('user ' + socket.id + ' joined room 1');
//   io.to('room 1').emit("joinAnnouncement", 'user ' + socket.id + ' joined room 1');

//   if (!roomReadyStatus.has('room 1')) {
//     roomReadyStatus.set("room 1", new Map())
//   }
//   roomReadyStatus.get('room 1').set(socket.id, false);

//   socket.on('ready', (data) => {
//     socket.emit('readyAcknowledged', "we understand you are ready!");
//     console.log(data.name + " is ready to play!");
//     roomReadyStatus.get('room 1').set(socket.id, true);
//     const allReady = Array.from(roomReadyStatus.get("room 1").values()).every(status => status);
  
//     if (allReady) {
//       console.log("all players are ready, starting game");
//       io.to('room 1').emit('allReady', "all players are ready! starting the game!");
//     } else {
//       io.to('room 1').emit('readyAnnouncement', data.name + " is ready to play!");
//     }
//   })
  
  // socket.on('error', (error) => {
  //   console.error('Socket error:', error);
  // });

  // socket.on('disconnect', () => {
  //   console.log('user ' + socket.id + ' disconnected');
  //   if (roomReadyStatus.has('room 1')) {
  //     roomReadyStatus.get('room 1').delete(socket.id);
  //   }
  // });
// });

// adding the controller
app.use("/api/DummyData", dummyDataController);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/generate-course-content", contentGenerationRoutes);
app.use('/api/game', gameRoutes);

app.get("/", (req, res) => {
  res.send("Hello, world!")
});

const port = process?.env?.PORT || 8081;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
