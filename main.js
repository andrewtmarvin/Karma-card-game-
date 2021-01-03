import { Game } from './game.js';
const game1 = new Game();

// Game setup


game1.makePlayers(prompt('how many players?'));
game1.makeDeck();
game1.shuffleDeck();
game1.dealCards();
game1.allowCardSwap();

// Game start
game1.gameBegin();


/*
Server side to do:
- Move logic from this file to the sever on Node
- When user opens page, ajax call -> generates a room code (create function) -> displays on page
- When user tries to connect to another room, ajax call -> adds user to game and send return players joined promise to all users -> update UI
- When host clicks start, return players joined promise with loop end flag begin game logic 

Client side (this file) to do:
- Loop over promise which asks server how many players have joined room
- When anyone joins, connect button turns to start button
- When host clicks start, tell server to begin game
- Receive players joined promise with loop end flag from server
- Begin loop over game status promise which asks server for game status
- Update UI (game has begun, whose turn it is, cards displayed)
*/