import { Game } from './game.js';
let numPlayers = prompt('how many players?');
let game1 = new Game(numPlayers);
game1.makeDeck();
game1.shuffleDeck();
game1.dealCards();
console.log(game1.shuffledDeck);
console.log(game1.players[1]);
