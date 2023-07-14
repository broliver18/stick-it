const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const Question = require("./models/question");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [`http://localhost:3000`],
  },
});

io.on("connection", (socket) => {
  socket.on('display-info', (nameInput, pinInput) => {
    console.log(nameInput);
    console.log(pinInput);
  })
})

const dbURI = `mongodb+srv://brunoolive504:562412504$BMo@stick-it.6mxliys.mongodb.net/stick-it?retryWrites=true&w=majority`;
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => server.listen(4000, () => {
    console.log("Listening on port 4000");
  }))
  .catch((err) => console.log(err));
