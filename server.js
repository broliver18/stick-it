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

const deleteQuiz = (id) =>
  Quiz.deleteOne({ _id: id }).then((quiz) => console.log(quiz));
const getAllQuizzes = () => Quiz.find().then((quizzesArray) => quizzesArray);
const getQuiz = (gameId) => Quiz.findOne({ _id: gameId }).then((quiz) => quiz);

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

io.on("connection", (socket) => {
  socket.on("player-join", (displayName, pin) => {
    if (!displayName) {
      socket.emit("no-name");
      return;
    }

    const pinInt = parseInt(pin);
    let gameFound = false;
    let playersInGame;
    let hostId;
    for (let i = 0; i < games.games.length; i++) {
      if (pinInt === games.games[i].pin) {
        hostId = games.games[i].hostId;
        playersInGame = players.getPlayers(hostId);
        gameFound = true;
        break;
      }
    }
    if (gameFound === true) {
      if (playersInGame.find((player) => player.name === displayName)) {
        socket.emit("name-already-exists");
        console.log("There's already a player with that name");
      } else {
        players.addPlayer(hostId, socket.id, displayName, {
          score: 0,
          answer: 0,
        });
        const updatedPlayersInGame = players.getPlayers(hostId);
        socket.join(pinInt);
        io.to(pinInt).emit("update-player-lobby", updatedPlayersInGame);
        socket.emit("game-found-status", gameFound);
        console.log("Player connected to game");
      }
    }
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

  socket.on("delete-quiz", (gameId) => deleteQuiz(gameId));

  socket.on("host-join", (gameId) => {
    const gamePin = Math.floor(Math.random() * 90000) + 10000;
    games.addGame(gamePin, socket.id, false, {
      playersAnswered: 0,
      questionsLive: false,
      gameId: gameId,
      question: 1,
    });
    const game = games.getGame(socket.id);
    socket.join(game.pin);
    console.log(`Game created with pin: ${game.pin}`);
    socket.emit("show-game-pin", game.pin);
  });

  socket.on("disconnect", () => {
    const game = games.getGame(socket.id);
    if (game) {
      games.removeGame(socket.id);
      console.log(`game ended with pin: ${game.pin}`);

      const playersToRemove = players.getPlayers(game.hostId);

      for (let i = 0; i < playersToRemove.length; i++) {
        players.removePlayer(playersToRemove[i].playerId);
      }

      io.to(game.pin).emit("host-disconnect");
      socket.leave(game.pin);
    } else {
      const player = players.getPlayer(socket.id);

      if (player) {
        const hostId = player.hostId;
        const game = games.getGame(hostId);
        const pin = game.pin;

        players.removePlayer(socket.id);
        socket.leave(pin);

        if (game.gameLive === false) {
          const playersInGame = players.getPlayers(hostId);

          io.to(hostId).emit("update-player-lobby", playersInGame);
          console.log("Player removed from game");
        } else {
          console.log("Player left game");
        }
      }
    }
  });

  socket.on("remove-existing-games", () => {
    const game = games.getGame(socket.id);
    if (game) {
      if (game.gameLive === false) {
        games.removeGame(socket.id);
        console.log(`game ended with pin: ${game.pin}`);

        const playersToRemove = players.getPlayers(game.hostId);

        for (let i = 0; i < playersToRemove.length; i++) {
          players.removePlayer(playersToRemove[i].playerId);
        }

        io.to(game.pin).emit("host-disconnect");
        socket.leave(game.pin);
      }
    }
  });

  socket.on("player-disconnect", () => {
    const player = players.getPlayer(socket.id);

    if (player) {
      const hostId = player.hostId;
      const game = games.getGame(hostId);
      const pin = game.pin;
      if (game.gameLive === false) {
        players.removePlayer(socket.id);
        const playersInGame = players.getPlayers(hostId);
        io.to(hostId).emit("update-player-lobby", playersInGame);
        socket.leave(pin);
        console.log("Player removed from game");
      }
    }
  });

  socket.on("start-game", () => {
    const game = games.getGame(socket.id);
    game.gameLive = true;
    socket.emit("game-started", game.hostId);
  });

  socket.on("host-join-game", (hostId) => {
    const game = games.getGame(hostId);
    if (game) {
      const gameId = game.gameData.gameId;
      getQuiz(gameId).then((quiz) =>
        socket.emit("get-quiz-title", quiz.quizName)
      );
      io.to(game.pin).emit("game-started-player");
      game.gameData.questionsLive = true;
    } else {
      socket.emit("no-game-found");
    }
  });

  socket.on("player-join-game", (playerId) => {
    const player = players.getPlayer(playerId);
    if (player) {
      const game = games.getGame(player.hostId);
      if (!game) return;
      const gameId = game.gameData.gameId;
      getQuiz(gameId).then((quiz) =>
        socket.emit("get-quiz-info", {
          name: quiz.quizName,
          minPoints: quiz.minPoints,
          maxPoints: quiz.maxPoints,
          numberOfQuestions: quiz.questions.length,
        })
      );
    } else {
      socket.emit("no-game-found");
    }
  });

  socket.on("get-question", (num, playerId) => {
    const player = players.getPlayer(playerId);
    if (!player) {
      socket.emit("no-game-found");
      return;
    }
    const game = games.getGame(player.hostId);
    if (!game) {
      socket.emit("no-game-found");
      return;
    }
    const gameId = game.gameData.gameId;
    getQuiz(gameId).then((quiz) => {
      let questionData;
      const questions = quiz.questions;
      const questionInfo = questions[num];
      const {
        questionType,
        question,
        shortAnswer,
        answerOne,
        answerTwo,
        answerThree,
        answerFour,
        correctAnswer,
      } = questionInfo;
      if (questionType === "short-answer") {
        questionData = {
          questionType,
          question,
          shortAnswer,
        };
      } else {
        questionData = {
          questionType,
          question,
          answerOne,
          answerTwo,
          answerThree,
          answerFour,
          correctAnswer,
        };
      }
      socket.emit("question", questionData);
    });
  });

  socket.on("player-score", (score, playerId) => {
    const player = players.getPlayer(playerId);

    if (player) {
      player.gameData.score = score;
      player.gameData.answer += 1;

      const hostId = player.hostId;
      const game = games.getGame(hostId);
      if (game) {
        const listOfCurrentPlayers = players.getPlayers(hostId);
        const sortedPlayers = listOfCurrentPlayers.sort(
          (a, b) => b.gameData.score - a.gameData.score
        );
        io.to(hostId).emit("player-rankings", sortedPlayers);
      }
    }
  });

  socket.on("get-final-score", (playerId) => {
    const player = players.getPlayer(playerId);
    const finalScore = player.gameData.score;
    socket.emit("player-final-score", finalScore);
  });

  socket.on("end-game-player", () => {
    const player = players.getPlayer(socket.id);

    if (player) {
      const hostId = player.hostId;
      const game = games.getGame(hostId);
      const pin = game.pin;
      if (game.gameLive === true) {
        players.removePlayer(socket.id);
        socket.leave(pin);
        console.log("Player left game");
      }
    }
  });

  socket.on("end-game-host", () => {
    const game = games.getGame(socket.id);
    if (game) {
      if (game.gameLive === true) {
        games.removeGame(socket.id);
        console.log(`game ended with pin: ${game.pin}`);

        const playersToRemove = players.getPlayers(game.hostId);

        for (let i = 0; i < playersToRemove.length; i++) {
          players.removePlayer(playersToRemove[i].playerId);
        }

        io.to(game.pin).emit("host-disconnect");
        socket.leave(game.pin);
      }
    }
  });
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
