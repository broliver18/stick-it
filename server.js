if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const passport = require("passport");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const dbURI = `mongodb+srv://brunoolive504:${process.env.MONGODB_PASSWORD}@stick-it.6mxliys.mongodb.net/stick-it?retryWrites=true&w=majority`;
const {
  corsConfig,
  sessionMiddleware,
} = require("./controllers/serverController");
const io = new Server(server, {
  cors: corsConfig,
});

const authRouter = require("./routes/authRouter");
const quizRouter = require("./routes/quizRouter");
const initializePassport = require("./passport-config");
const registerHostHandlers = require("./handlers/hostHandlers");
const registerPlayerHandlers = require("./handlers/playerHandlers");
const registerGameHandlers = require("./handlers/gameHandlers");
const registerDisconnectHandlers = require("./handlers/disconnectHandlers");

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sessionMiddleware);

initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/profile", quizRouter);

const onConnection = (socket) => {
  registerHostHandlers(io, socket);
  registerPlayerHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerDisconnectHandlers(io, socket);
};

io.engine.use(sessionMiddleware);
io.on("connection", onConnection);

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) =>
    server.listen(4000, () => {
      console.log("Listening on port 4000");
    })
  )
  .catch((err) => console.log(err));