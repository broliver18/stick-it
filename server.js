const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const Quiz = require("./models/quiz");

const { Games } = require("./utils/Games");
const { Players } = require("./utils/Players");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [`http://localhost:3000`],
  },
});

const games = new Games();
const players = new Players();

async function createQuiz(questions, quizDetails) {
  const { quizName, minPoints, maxPoints } = quizDetails;
  try {
    const existingQuiz = await Quiz.findOne({ quizName });
    if (existingQuiz) {
      return "A quiz with this name already exists.";
    } else {
      const quiz = await Quiz.create({
        quizName,
        minPoints,
        maxPoints,
        questions,
      });
      if (quiz) return "success";
    }
  } catch (e) {
    return e.message;
  }
}

const deleteQuiz = (id) =>
  Quiz.deleteOne({ _id: id }).then((quiz) => console.log(quiz));
const getAllQuizzes = () => Quiz.find().then((quizzesArray) => quizzesArray);

io.on("connection", (socket) => {
  socket.on("player-join", (displayName, pin) => {
    console.log("I ran once")
    const pinInt = parseInt(pin);
    let gameFound = false;
    for (let i = 0; i < games.games.length; i++) {
      if (pinInt === games.games[i].pin) {
        console.log("Player connected to game");
        const hostId = games.games[i].hostId;
        players.addPlayer(hostId, socket.id, displayName, { score: 0, answer: 0 });
        socket.join(pinInt);
        const playersInGame = players.getPlayers(hostId);
        io.to(pinInt).emit("update-player-lobby", playersInGame);
        gameFound = true;
      }
    }
    socket.emit("game-found-status", gameFound);
  });

  socket.on("quiz-info", (questions, quizDetails) => {
    if (
      questions.find(
        (questionInfo) =>
          (questionInfo.questionType === "short-answer" &&
            (!questionInfo.question || !questionInfo.shortAnswer)) ||
          (questionInfo.questionType === "multiple-choice" &&
            (!questionInfo.question ||
              !questionInfo.answerOne ||
              !questionInfo.answerTwo ||
              !questionInfo.answerThree ||
              !questionInfo.answerFour ||
              !questionInfo.correctAnswer))
      )
    ) {
      const errorMessage = "Please fill out all required input fields.";
      socket.emit("error-message", errorMessage);
    } else {
      const createdQuiz = createQuiz(questions, quizDetails);
      createdQuiz.then((message) => socket.emit("create-quiz", message));
    }
  });

  socket.on("initialize-quizzes", () =>
    getAllQuizzes().then((quizzes) => socket.emit("get-all-quizzes", quizzes))
  );

  socket.on("delete-quiz", (id) => deleteQuiz(id));

  socket.on("host-join", (id) => {
    const gamePin = Math.floor(Math.random()*90000) + 10000;
    games.addGame(gamePin, socket.id, false, {
      playersAnswered: 0,
      questionsLive: false,
      gameId: id,
      question: 1,
    });
    const game = games.getGame(socket.id);
    socket.join(game.pin);
    console.log(`Game created with pin: ${game.pin}`);
    socket.emit("show-game-pin", game.pin);
  })
});

const dbURI = `mongodb+srv://brunoolive504:562412504$BMo@stick-it.6mxliys.mongodb.net/stick-it?retryWrites=true&w=majority`;
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
