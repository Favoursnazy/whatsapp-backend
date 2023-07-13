import mongoose from "mongoose";
import { Server } from "socket.io";
import { PeerServer } from "peer";
import app from "./app.js";
import logger from "./configs/logger.config.js";
import SocketServer from "./SocketServer.js";

//env variables
const { DATABASE_URI } = process.env;
const PORT = process.env.PORT || 8000;

//exit on mongodb error
mongoose.connection.on("error", (err) => {
  logger.error(`Mongodb connection error: ${err}`);
  process.exit(1);
});

//mongodb debug mode
if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true);
}

//mongosedb connection
mongoose
  .connect(DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Connected to Mongodb.");
  });

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Socket Io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_ENDPOINT,
  },
});

io.on("connection", (socket) => {
  SocketServer(socket, io);
});

// Creating Peer Server
PeerServer({
  port: 3001,
  path: "/",
});

//handle server errors
const exitHandler = () => {
  if (server) {
    logger.info("Server closed!!!");
    process.exit(1);
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandleRejection", unexpectedErrorHandler);

//SIGTERM
process.on("SIGTERM", () => {
  if (server) {
    logger.info("Server closed!!!");
    process.exit(1);
  }
});
