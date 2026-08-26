const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app.js");
const connectDB = require("./src/config/db");
const { corsOriginCheck } = require("./src/config/Corsoptions");
const { socketAuth } = require("./src/middleware/Socket.middleware.js");
const { initChatSockets } = require("./src/socket/Chat.socket.js");

const PORT = process.env.PORT || 5000;

// socket.io needs a raw http.Server to attach to — app.listen() (Express)
// alone can't host a websocket server alongside the HTTP one.
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOriginCheck, // same origin-checking logic as Express's cors()
    credentials: true, // required for the httpOnly auth cookie to ride along
  },
});

io.use(socketAuth);
initChatSockets(io);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode and Database Connected!`
      );
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err.message);
    process.exit(1);
  });