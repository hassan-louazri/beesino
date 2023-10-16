const { Game } = require("./game.js");
const poker = require('./poker.js');
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { deposit, withdraw } = require("../blockchain/index");

const dotenv = require("dotenv");
const {Player} = require("./player");
const {playersHand} = require("./poker");
dotenv.config();

const PORT = process.env.PORT || 3001;
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const game = new Game();
const player = new Player(game);
const deckArray = [];
let init = false;

io.on("connection", (socket) => {

  let playerInfo = {
    ready: false,
    pseudo: "",
    stand: false,
    id: socket.client.id,
    turn: null,
    fold: false
  };

  game.registerPlayer(socket.client.id, playerInfo);

  // listen for createTable
  socket.on("createTable", async (gameMode) => {
    try {
      // create a new table in redis
      const table = game.createTable(gameMode);
      const tableInfo = {
        tableName: await table,
        playerCount: await game.getCurrentPlayersCountOnTable(table),
        maxPLayer: game.maxPlayersAllowed,
        minPLayer: game.minPlayersAllowed,
      };

      let gameInfo = {
        deck: poker.createDeck(),
        tableName: await table,
        dealerHand: [],
        playersHand: [],
        turnOrder: [],
        init: false,
      };

      deckArray.push(gameInfo);

      io.sockets.emit("createTable", { status: 200, tableInfo: tableInfo, error: null });
    } catch (e) {
      socket.emit("createTable", { status: 400, tableInfo: null, error: e });
    }
  });

  // get all tables available to play
  socket.on("getTables", async (gameMode) => {
    try {
      const tablesName = await game.getNonEmptyTables(gameMode);
      const tablesInfo = Promise.all(
        tablesName.map(async (e) => ({
          tableName: e,
          playerCount: await game.getCurrentPlayersCountOnTable(e),
          maxPLayer: game.maxPlayersAllowed,
          minPLayer: game.minPlayersAllowed,
        }))
      );
      socket.emit("getTables", {
        status: 200,
        tablesInfo: await tablesInfo,
        error: null,
      });
    } catch (e) {
      console.error(e);
      socket.emit("getTables", { status: 400, tablesInfo: null, error: e });
    }
  });

  // join a specific table if possible
  socket.on("joinTable", async (tableName) => {
    try {
      const eventPayload = await player.playerRequestedPair(socket, tableName);
      const res = {
        all_players: eventPayload.all_players,
        playersID: await game.getPlayersOnTable(tableName),
        readyNumber: await game.getNbReadyOnTable(tableName),
      };
      socket.emit("joinTable", {
        status: 200,
        tableName: await tableName,
        error: null,
        minPlayer: game.minPlayersAllowed,
        maxPlayer: game.maxPlayersAllowed,
      });
      io.to(tableName).emit("new_player", res);
      io.sockets.emit("updatePlayerCount", {
        status: 200,
        tableName: tableName,
        playerCount: await game.getCurrentPlayersCountOnTable(tableName),
        error: null,
      });
    } catch (e) {
      socket.emit("joinTable", {status: 400, tableNames: null, error: e});
    }
  });

  socket.on("playerState", async (tableName) => {
      await player.playerState(io, socket, tableName);
  });

  socket.on("endTurn", async () => {
    try {
      socket.emit("endTurn", { status: 200, error: null });
    } catch (e) {
      socket.emit("endTurn", { status: 400, error: e });
    }
  });

  socket.on("clientID", async () => {
    try {
      socket.emit("clientID", {
        status: 200,
        clientID: socket.client.id,
        error: null,
      });
    } catch (e) {
      socket.emit("clientID", { status: 400, clientID: "NC", error: null });
    }
  });

  socket.on("readyNumber", async (tableName) => {
    try {
      socket.emit("readyNumber", {
        status: 200,
        readyNb: await game.getNbReadyOnTable(tableName),
        error: null,
      });
    } catch (e) {
      socket.emit("readyNumber", { status: 400, readyNb: 0, error: null });
    }
  });

  socket.on("playerNumber", async (tableName) => {
    try {
      socket.emit("playerNumber", {
        status: 200,
        playerNb: await game.getCurrentPlayersCountOnTable(tableName),
        error: null,
      });
    } catch (e) {
      socket.emit("playerNumber", { status: 400, playerNb: 0, error: null });
    }
  });

  socket.on("leaveTable", async (tableName) => {
    try {
      await player.playerLeave(socket, tableName);
      io.sockets.emit("updatePlayerCount", {status: 200, tableName: tableName,
        playerCount: await game.getCurrentPlayersCountOnTable(tableName), error: null});
      io.sockets.emit("updatePlayersID", {status: 200, tableName: tableName,
        playersID: await game.getPlayersOnTable(tableName), error: null});
      io.to(tableName).emit("updatePlayersName",{playersName: await game.getPlayersPseudo(tableName)});
    } catch (e) {}
  });

  socket.on("sendBet", (data) => {
    io.to(data.tableName).emit("bet", data);
  });

  socket.on("send_message", (data) => {
    io.in(data.tableName).emit("receive_message", data);
  });

  socket.on("newMessage", (data) =>{
    io.to(data.tableName).emit("newMessage", data);
  })

  socket.on("dealPlayerCardB", (tableName) => {
    const card = poker.dealCard(poker.deck(deckArray, tableName));
    const index = poker.playersHand(deckArray,tableName).findIndex(elt => elt.id === socket.client.id);
    const playerHand = poker.getPlayerHand(poker.playersHand(deckArray, tableName), socket.client.id)
    playerHand.hand.push(card);
    poker.playersHand(deckArray, tableName).splice(index,1, playerHand);
    io.to(tableName).emit("cardPlayerB",poker.playersHand(deckArray, tableName));
  });

  socket.on("dealDealerCardB", (tableName) => {
    if (poker.sumValueCards(poker.dealerHand(deckArray, tableName)) <= 17) {
      poker.dealerHand(deckArray, tableName)[1].face === ""
        ? poker.dealerHand(deckArray, tableName)[1] = poker.dealCard(poker.deck(deckArray, tableName))
        : poker.dealerHand(deckArray, tableName).push(poker.dealCard(poker.deck(deckArray, tableName)));
    }
    socket.emit("cardDealerB", poker.dealerHand(deckArray, tableName));
  });

  socket.on("cardInitPlayerB",async (tableName) => {
    if((poker.playersHand(deckArray,tableName).length === 0) && (poker.initBlackJack(deckArray, tableName) === false)){
      deckArray.filter(elt => elt.tableName === tableName).init = true;
      const players = await game.getPlayersOnTable(tableName);
      for (const player of players) {
        poker.playersHand(deckArray, tableName).push({
          id: player,
          hand: [poker.dealCard(poker.deck(deckArray, tableName)), poker.dealCard(poker.deck(deckArray, tableName))],
          pseudo: await game.getPlayerPseudo(player)
        });
      }
      io.to(tableName).emit("cardPlayerB",poker.playersHand(deckArray, tableName));
    }
  });

  socket.on("cardInitDealerB", (tableName) => {
    if (poker.dealerHand(deckArray, tableName).length === 0) {
      poker.dealerHand(deckArray, tableName).push(poker.dealCard(poker.deck(deckArray, tableName)),
          {suit: "", face: "",});
    }
    socket.emit("cardDealerB", poker.dealerHand(deckArray, tableName));
  });

  socket.on("endGameB", (tableName) => {
    if (poker.initBlackJack(deckArray,tableName) === true) {
      deckArray.filter(elt => elt.tableName === tableName).init = false;
    }
  });

  socket.on("initPokerGame", async (tableName) => {
    if (poker.dealerHand(deckArray, tableName).length === 0) {
      poker.dealerHand(deckArray, tableName).push(...poker.dealTableCards(poker.deck(deckArray, tableName)));

      const players = await game.getPlayersOnTable(tableName);
      players.forEach((player, i) => {
        game.registerPlayerTurn(player, i);
        poker.playersHand(deckArray, tableName).push({id: player, hand: [
            poker.dealCard(poker.deck(deckArray, tableName)), poker.dealCard(poker.deck(deckArray, tableName))],
            pseudo: game.getPlayerPseudo(player)});
        poker.playerOrder(deckArray, tableName).push({id: player, turn: i});
      });
    }
    socket.emit("initPokerGame", {dealerhand: poker.dealerHandTurn(deckArray, tableName), hand: poker.getPlayerHand(
        poker.playersHand(deckArray, tableName), socket.client.id), order: poker.playerOrder(deckArray, tableName),
    });
  });

  socket.on("pokerBet", (tableName, bet) => {
    io.to(tableName).emit("pokerBet", { id: socket.client.id, bet: bet });
  });

  socket.on("pseudo",async (tableName, pseudo) => {
    const errorName = await game.checkPseudo(pseudo, tableName);
    if(errorName === false) await game.updatePlayerPseudo(socket.client.id, pseudo);
    socket.emit("pseudo",{errorName: errorName});
  });

  socket.on("getPlayerIds", async (tableName) => {
    socket.emit("updatePlayersID", {status: 200, tableName: tableName,
      playersID: await game.getPlayersOnTable(tableName), error: null,});
  });

  socket.on("updatePlayersName", async(tableName) => {
    const playersName = await game.getPlayersPseudo(tableName);
    io.to(tableName).emit("updatePlayersName",{playersName: playersName});
  });

  socket.on("standUpdate",async (tableName) => {
    const standNb = await game.updatePlayerStand(socket.client.id, tableName);
    const nbPlayer = await game.getCurrentPlayersCountOnTable(tableName);
    const stand = (standNb === nbPlayer);
    io.to(tableName).emit("standNb",stand);
  });


  socket.on("endTurnPoker", async (tableName, turn, statePoker, gameInfo, playerStatusBet, options) => {
    let _options = options;
    let next = false;
    const playerOrder = poker.playerOrder(deckArray, tableName);
    let NextTurn = await game.getNextPlayer(playerOrder, turn, tableName);
    if (_options.raisedTurn && _options.initialTurn !== NextTurn) {
      io.to(tableName).emit("continueTurnPoker", {NextTurn, starting: _options.initialTurn,
        updatedGameInfo: gameInfo, updatedPlayerStatus: playerStatusBet, id: socket.client.id});
      return;
    } else if (_options.raisedTurn) {
      _options.raisedTurn = false;
      next = true;
    }
    if (NextTurn !== gameInfo.initTurn && !_options.raisedTurn && !next) {
      io.to(tableName).emit("newTurnPoker", {turn: NextTurn, statePoker: statePoker, board: [],
        updatedGameInfo: {...gameInfo, options: _options}, updatedPlayerStatus: playerStatusBet, id: socket.client.id
      });
    } else if (statePoker !== "River" && !_options.raisedTurn) {
      io.to(tableName).emit("newTurnPoker", {
        turn: NextTurn, statePoker: game.getNextStatePoker(statePoker),
        board: poker.getNextCardBoard(statePoker, deckArray, tableName) ,
        updatedGameInfo: {...gameInfo, options: _options}, updatedPlayerStatus: playerStatusBet, id: socket.client.id
      });
    } else {
      const cards = JSON.parse(JSON.stringify(poker.playersHand(deckArray, tableName)));
      const winnerID = poker.endPoker(poker.dealerHand(deckArray, tableName), poker.playersHand(deckArray, tableName));
      const winner = await game.getPlayerPseudo(winnerID);
      io.to(tableName).emit("endGamePoker", {statePoker: "end", cards: cards, winner: winner});
    }
  });

  socket.on("foldPoker", async (tableName, gameInfo) => {
    const playerOrder = poker.playerOrder(deckArray, tableName);
    await game.updatePlayerFoldPoker(socket.client.id);
    const gameUpdate = await game.updateInitTurn(playerOrder, gameInfo, tableName);
    if (await game.getNumberFold(tableName) === (await game.getPlayersOnTable(tableName)).length - 1) {
      console.log("everyone folded !");
      // io.to(tableName).emit("endGamePokerFold")
      io.to(tableName).emit("endGamePokerFold", {statePoker: "end",
      board: poker.dealerHand(deckArray, tableName),
      cards: poker.playersHand(deckArray, tableName),
        winner: null});
    } else {
      io.to(tableName).emit("foldPoker", {id: socket.client.id, gameInfoInitTurn: gameUpdate})
    }
  }) 

});

app.post("/deposit", async (req, res) => {
  let amount = req.body.amount;
  let addr = req.body.addr;
  console.log(amount * 10 ** 18);
  console.log("starting deposit");
  deposit(addr, amount * 10 ** 18)
    .then(() => {
      console.log("then sending 200|");
      res.status(200).json({ result: "done; check your account" });
    })
    .catch((error) => {
      console.log("error sending 400|");
      console.log(error);
      res.status(400).json({ result: "sorry, soomething went wrong" });
    });
});

app.post("/withdraw", async (req, res) => {
  let amount = req.body.amount;
  let addr = req.body.addr;
  console.log(amount * 10 ** 18);
  console.log("starting witthdrawal");
  withdraw(addr, amount * 10 ** 18)
    .then(() => {
      console.log("then sending 200|");
      res.status(200).json({ result: "done; check your account" });
    })
    .catch((error) => {
      console.log("error sending 400|");
      console.log(error);
      res.status(400).json({ result: "sorry, soomething went wrong" });
    });
});

// socket.on("welcome", async (arg) => {
//   console.log(arg);
// })

server.listen(PORT, () => {
  console.log(`listening on localhost:${PORT}`);
});

const safeQuit = async () => {
  console.log("\nShuting down the server and closing all tables...");
  try {
    await game.clearAllTables();
    io.close();
    process.exit();
  } catch (e) {
    console.log(e);
    console.log("**********\nCould not remove all tables");
    io.close();
    process.exit();
  }
};

// catch ctrl-c | need to close all tables in redis
process.on("SIGINT", async () => {
  await safeQuit();
});

// catch nodemon restart
process.once("SIGUSR2", async () => {
  await safeQuit();
});
