require("dotenv").config();

const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [`http://localhost:3000`],
  },
});

const authRouter = require("./routes/authRouter");
const registerHostHandlers = require("./handlers/hostHandlers");
const registerPlayerHandlers = require("./handlers/playerHandlers");
const registerGameHandlers = require("./handlers/gameHandlers");
const registerDisconnectHandlers = require("./handlers/disconnectHandlers");
const registerQuizHandlers = require("./handlers/quizHandlers");

const onConnection = (socket) => {
  registerHostHandlers(io, socket);
  registerPlayerHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerDisconnectHandlers(io, socket);
  registerQuizHandlers(socket);
};

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(session({
  secret: process.env.COOKIE_SECRET,
  credentials: true,
  name: "sid",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production" ? true : "auto",
    sameSite: process.env.ENVIRONMENT === "production" ? "none" : "lax",
  }
}))

app.use("/auth", authRouter);

io.on("connection", onConnection);

const dbURI = `mongodb+srv://brunoolive504:${process.env.MONGODB_PASSWORD}@stick-it.6mxliys.mongodb.net/stick-it?retryWrites=true&w=majority`;
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
