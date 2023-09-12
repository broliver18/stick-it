const { getQuiz } = require("../utils/mongooseFunctions");
const games = require("../utils/Games");
const players = require("../utils/Players");

module.exports = (io, socket) => {
  const hostJoin = (gameId) => {
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
  };

  const hostJoinGame = (hostId) => {
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
  };

  const hostEndGame = () => {
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
  };

  socket.on("host-join", hostJoin);
  socket.on("host-join-game", hostJoinGame);
  socket.on("host-end-game", hostEndGame);
};