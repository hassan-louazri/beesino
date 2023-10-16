# game server

## Features

Server:

- registers new users to server via sockets (must have username).
- connects players by adding them to a table (socket.io room).
- removes players from table (and memory) upon disconnection. (bug: player isn't deleted from memory)
- informs others when player leaves the table.
- informs all players when the game ends.
- informs other players of "playerReady" status.

Users:

- user can send request to join a table.
- user can announce that he's ready to start a game. (game starts when enough players are ready to play).
- user can stop playing the game.
- user can exit the table.

Tables and games:

- Server is able to create tables (socket.io room) and put/remove players in them.
- Server starts a game upon reaching a sufficient number of players joined.
- Server starts game automatically if max players reached.
- Server removes table from memory when empty.

TO DO:

- partage des données entre clients (deck cartes, etc).
- possibilité de choisir la table.
- chat.
