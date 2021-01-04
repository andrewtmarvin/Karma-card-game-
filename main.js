const Game = require('./game.js');

// Game setup
const game1 = new Game();

// Move into Game constructor?
game1.makePlayers(4);
game1.makeDeck();
game1.shuffleDeck();
game1.dealCards();
game1.allowCardSwap();

// Game start
game1.gameBegin();


/*
Server side to do:
- When user opens page, ajax call -> generates a room code (create function) -> displays on page
- When user tries to connect to another room, ajax call -> adds user to game and send return players joined promise to all users -> update UI
- When host clicks start, return players joined promise with loop end flag begin game logic 
*/
