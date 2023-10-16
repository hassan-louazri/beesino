const Redis = require("ioredis");

const STAGED_TABLES = "STAGED_TABLES"; // tables en attente
const PLAYING_TABLES = "PLAYING_TABLES"; // tables en cours de jeu
const MAX_TABLES_POKER = 5;
const MAX_TABLES_BLACKJACK = 5;

class Game {
  constructor() {
    this.redis = new Redis();
    this.maxPlayersAllowed = process.env.MAX_PLAYERS || 8;
    this.minPlayersAllowed = process.env.MIN_PLAYERS || 3;
    this.nb_table_poker = 0;
    this.nb_table_blackjack = 0;
  }

  async checkNbTables(gameMode) {
    const playingTables = (await this.getPlayingTables(gameMode)).length;
    return gameMode === "Poker"
        ? this.nb_table_poker >= MAX_TABLES_POKER + playingTables
      : this.nb_table_blackjack >= MAX_TABLES_BLACKJACK + playingTables;
  }

  async createTable(gameMode) {
    // get the largest num used for a table already(largest + 1)
    const tableName = gameMode === "Poker"
        ? `Table${++this.nb_table_poker}_${gameMode}`
        : `Table${++this.nb_table_blackjack}_${gameMode}`;
    await this.tableLockInit(tableName);
    await this.tableLock(tableName);

    if (await this.checkNbTables(gameMode)) throw "Max Tables reached";

    await this.redis
      .multi()
      .lpush(STAGED_TABLES.concat("_", gameMode), tableName)
      .exec();

    await this.tableUnlock(tableName);
    return tableName;
  }

  getAllActiveTables(gameMode) {
    return this.redis.lrange(PLAYING_TABLES.concat("_", gameMode), 0, -1);
  }
  getNonEmptyTables(gameMode) {
    return this.redis.lrange(STAGED_TABLES.concat("_", gameMode), 0, -1);
  }
  getPlayingTables(gameMode) {
    return this.redis.lrange(PLAYING_TABLES.concat("_", gameMode), 0, -1);
  }
  getCurrentPlayersCountOnTable(tableName) {
    return this.redis.llen(tableName);
  }

  async joinTable(tableName, player) {
    return await this.redis
      .multi()
      .lpush(tableName, player)
      .exec();
  }

  async leaveTable(tableName, player) {
    const playerInfo = await this.getPlayer(player);
    if (playerInfo) {
      playerInfo.ready = false;
      playerInfo.pseudo = "";
      playerInfo.stand = false;
      playerInfo.turn = null;
    }

    return await this.redis
      .multi()
      .lrem(tableName, -1, player)
      .set(player, JSON.stringify(playerInfo))
      .exec();
  }

  registerPlayer(player, playerInfo) {
    return this.redis.set(player, JSON.stringify(playerInfo));
  }

  async registerPlayerTurn(player, turn) {
    const playerInfo = await this.getPlayer(player)
    playerInfo.turn = turn;
    this.redis.set(player, JSON.stringify(playerInfo))
  }

  async deletePlayer(player) {
    const { table } = await this.getPlayer(player);

    if (table) {
      await this.leaveTable(table, player);
    }

    await this.redis.del(player);
    return table;
  }

  async getPlayer(player) {
    return JSON.parse(await this.redis.get(player));
  }

  async startGame(socket, tableName) {
    const gameMode = tableName.split("_")[1];
    await this.redis.lrem(STAGED_TABLES.concat("_", gameMode), -1, tableName);
    await this.redis.lpush(PLAYING_TABLES.concat("_", gameMode), tableName);
  }
  endGameOnTable(tableName, gameMode) {
    return this.redis
      .multi()
      .lrem(PLAYING_TABLES.concat("_", gameMode), -1, tableName)
      .del(tableName)
      .exec();
  }

  tableLockInit(tableName) {
    this.tableUnlock(tableName);
  }

  tableLock(tableName) {
    return this.redis.blpop(`${tableName}_lock_token`, 0);
  }

  tableUnlock(tableName) {
    return this.redis.lpush(`${tableName}_lock_token`, "GREEN_LIGHT");
  }

  async updatePlayerState(player, table) {
    //markPlayerAsReady
    const playerInfo = await this.getPlayer(player);
    playerInfo.ready = !playerInfo.ready;
    await this.redis.multi().set(player, JSON.stringify(playerInfo)).exec();
    return await this.getNbReadyOnTable(table);
  }


  async updatePlayerStand(player, table){
    const playerInfo = await this.getPlayer(player);
    playerInfo.stand = true;
    await this.redis.multi().set(player, JSON.stringify(playerInfo)).exec();
    return await this.getNbStandOnTable(table);
  }

  async getNbStandOnTable(table){
    return (await this.getPlayersStandOnTable(table)).filter(elt => elt === true).length;
  }

  async getPlayersStandOnTable(table){
    const playersID = this.getPlayersOnTable(table);
    return Promise.all((await playersID).map(async (player) => (await this.getPlayer(player)).stand));
  }

  async checkPseudo(pseudo, table){
    const pseudoList = this.getPlayersPseudo(table);
    return ((await pseudoList).filter(elt => elt === pseudo).length > 0);
  }

  async getPlayersPseudo(table){
    const playersID = this.getPlayersOnTable(table);
    const players = Promise.all((await playersID).map(async (id) => (await this.getPlayer(id))));
    return (await players).map(elt => elt.pseudo);
  }

  async getPlayerPseudo(player){
    const playerInfo = await this.getPlayer(player);
    return playerInfo.pseudo;
  }

  async updatePlayerPseudo(player, pseudo){
    const playerInfo = await this.getPlayer(player);
    playerInfo.pseudo = pseudo;
    await this.redis.multi().set(player, JSON.stringify(playerInfo)).exec();
  }

  async getNbReadyOnTable(table) {
    return (await this.getPlayersReadyOnTable(table)).filter(elt => elt === true).length;
  }


  async getPlayersOnTable(table) {
    return this.redis.lrange(table, 0, -1);
  }

  async getPlayersReadyOnTable(table) {
    const playersID = this.getPlayersOnTable(table);
    return Promise.all((await playersID).map(async (player) => (await this.getPlayer(player)).ready));
  }

  async getNextTurn(turn, tableName) {
    const playerCount = this.getCurrentPlayersCountOnTable(tableName);
    return (turn + 1 < await playerCount ? turn + 1 : 0);
  }

  async getNextPlayer(playerOrder, turn, tableName) {
    const nextTurn = await this.getNextTurn(turn, tableName);
    const nextPlayerFold =  await this.checkPlayerAlive(playerOrder, nextTurn);
    return !nextPlayerFold ? nextTurn : this.getNextPlayer(playerOrder, nextTurn, tableName);
  }

  getNextStatePoker(statePoker) {
    return statePoker === "PreFlop" ? "Flop" : statePoker === "Flop" ? "Turn" : "River"
  }

  async updatePlayerFoldPoker(player){
    const playerInfo = await this.getPlayer(player);
    playerInfo.fold = true;
    await this.redis.multi().set(player, JSON.stringify(playerInfo)).exec();
  }

  async getPlayerByTurn(playerOrder, turn) {
    const playerInfo = playerOrder.find( player => player.turn === turn);
    return await this.getPlayer(playerInfo.id)
  }

  async checkPlayerAlive(playerOrder, nextTurn) {
    const playerInfo = await this.getPlayerByTurn(playerOrder, nextTurn);
    // console.log(playerInfo)
    return playerInfo.fold;
  }

  async updateInitTurn (playerOrder, gameInfo, tableName) {
    return !(await this.checkPlayerAlive(playerOrder, gameInfo.initTurn)) ? gameInfo.initTurn : this.updateInitTurn(playerOrder, {...gameInfo, initTurn: await this.getNextTurn(gameInfo.initTurn, tableName)});
  }

  async getNumberFold(tableName) {
    const playersID = this.getPlayersOnTable(tableName);
    const playersFold = (await Promise.all((await playersID).map(async (player) => (await this.getPlayer(player)).fold)));
    return (playersFold.filter((player) => player).length);
  }

  // called when ctrl-c to clear all tables if there are some still existing
  async clearAllTables() {
    let activeTables = [...(await this.getAllActiveTables("Poker")),
      ...(await this.getAllActiveTables("Blackjack"))];
    let nonEmptyTables = [...(await this.getNonEmptyTables("Poker")),
      ...(await this.getNonEmptyTables("Blackjack"))];

    activeTables.forEach(table => {
      this.redis
        .multi()
        .lrem(PLAYING_TABLES, 0, table)
        .del(table)
        .exec();
    });

    nonEmptyTables.forEach(table => {
      this.redis
        .multi()
        .lrem(STAGED_TABLES, 0, table)
        .del(table)
        .exec();
    })

    // clear all redis current database
    this.redis.flushdb();
  }
}
module.exports = {Game};
