const { Games } = require("../utils/Games");
const { Players } = require("../utils/Players");

const games = new Games();
const players = new Players();

module.exports = (io, socket) => {
  const disconnect = () => {
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
  };

  const playerDisconnect = () => {
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
  };

  const removeExistingGames = () => {
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
  };

  socket.on("disconnect", disconnect);
  socket.on("player-disconnect", playerDisconnect);
  socket.on("remove-existing-games", removeExistingGames);
};
