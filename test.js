import { Game } from './game.js';
let game1 = new Game();
game1.makePlayers(prompt('how many players?'));
game1.makeDeck();
game1.shuffleDeck();
game1.dealCards();
game1.players[0].swapCards();
