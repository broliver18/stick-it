const quizController = require("../controllers/quizController");
const games = require("../utils/Games");
const players = require("../utils/Players");

module.exports = (io, socket) => {
  const startGame = () => {
    const game = games.getGame(socket.id);
    game.gameLive = true;
    socket.emit("game-started", game.hostId);
  };

  const getQuestion = (num, playerId) => {
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
    quizController.getQuiz(gameId).then((quiz) => {
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
  };

  const playerScore = (score, playerId) => {
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
  };

  const getPlayerFinalScore = (playerId) => {
    const player = players.getPlayer(playerId);
    const finalScore = player.gameData.score;
    socket.emit("player-final-score", finalScore);
  };

  socket.on("start-game", startGame);
  socket.on("get-question", getQuestion);
  socket.on("player-score", playerScore);
  socket.on("get-player-final-score", getPlayerFinalScore);
};
