const quizController = require("../controllers/quizController");
const games = require("../utils/Games");
const players = require("../utils/Players");

module.exports = (io, socket) => {
  const playerJoin = (displayName, pin) => {
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
        return;
      } else {
        players.addPlayer(hostId, socket.id, displayName, {
          score: 0,
          answer: 0,
        });
        const updatedPlayersInGame = players.getPlayers(hostId);
        socket.join(pinInt);
        io.to(pinInt).emit("update-player-lobby", updatedPlayersInGame);
        console.log("Player connected to game");
      }
    }
    socket.emit("game-found-status", gameFound);
  };

  const playerJoinGame = (playerId) => {
    const player = players.getPlayer(playerId);
    if (player) {
      const game = games.getGame(player.hostId);
      if (!game) return;
      const gameId = game.gameData.gameId;
      quizController.getQuiz(gameId).then((quiz) =>
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
  };

  const playerEndGame = () => {
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
  };

  socket.on("player-join", playerJoin);
  socket.on("player-join-game", playerJoinGame);
  socket.on("player-end-game", playerEndGame);
};
