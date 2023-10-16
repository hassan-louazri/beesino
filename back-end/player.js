const { Game } = require("./game");
const {io} = require("socket.io-client");

class Player {
  constructor(game) {
    this.game = game || new Game();

    this.events = {
      leaveEvent: "leave", // info
      playerLeaveEvent: "player_leave", // action
      gameStartedEvent: "game_start", // info
      pairRequestEvent: "pair_me", // action
      gameEndedEvent: "game_ended", // info
      newPlayerEvent: "new_player", // info
      playerDisconnectedEvent: "disconnect",
      playerEndGameEvent: "end_game_notification", // action
      playerReadyEvent: "player_ready", // action
      announcePlayerReadyEvent: "player_ready_announcement", // info
    };
  }
  async playerDisconnect(socket) {
    const context = this;
    socket.on(this.events.playerDisconnectedEvent, async function () {
      const tableName = await context.game.deletePlayer(socket.client.id);
      context.playerLeave(socket, tableName);
    });
  }

  playerRequestedLeave(socket) {
    socket.on(this.events.playerLeaveEvent, async function () {
      const table = Array.from(socket.rooms)[socket.rooms.size - 1];
      if (table) {
        this.playerLeave(socket, table);
      }
    });
  }

  async playerLeave(socket, tableName) {
    await this.game.leaveTable(tableName, socket.client.id);

    const eventPayload = {
      user_id: socket.client.id,
    };
    socket.leave(tableName);
    socket.to(tableName).emit("leave", eventPayload);
  }

  async playerRequestedPair(socket, tableName) {

    await this.game.tableLock(tableName);
    let playersCount = await this.game.getCurrentPlayersCountOnTable(tableName);
    if (playersCount === this.game.maxPlayersAllowed) throw "Table full"; // we already full here

    // a critical section// update count since we have been waiting
    await this.game.joinTable(tableName, socket.client.id);

    socket.join(tableName);

    const eventPayload = {
      all_players: ++playersCount,
    };

    if (playersCount === this.game.maxPlayersAllowed) await this.game.startGame(socket, tableName);
    await this.game.tableUnlock(tableName);
    return eventPayload;// release critical section
  }

  endGame(socket) {
    const context = this;
    socket.on(this.events.playerEndGameEvent, async function () {
      const table = Array.from(socket.rooms)[socket.rooms.size - 1];
      context.game.endGameOnTable(table);
      socket.to(table).emit(context.events.gameEndedEvent, {});
    });
  }
  async playerState(io, socket, tableName) {
    const readyCount = await this.game.updatePlayerState(socket.client.id, tableName);
    io.to(tableName).emit("player_ready_announcement", {user_id: socket.client.id, total_ready_count: readyCount});
  }




}
module.exports = {Player};
