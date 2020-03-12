import { Player } from './player.js';

export class Game {
	constructor (numPlayers) {
		this.numPlayers = numPlayers;
		this.deck = [];
		this.players = [];
		for (let i = 0; i < numPlayers; i++) {
			this.players.push(new Player(prompt(`Enter player ${i + 1}'s name: `)));
		}
		this.players.forEach((player) => {
			console.dir(player);
		});
	}

	makeDeck () {
		this.nums = [ '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace' ];
		this.suits = [ 'Hearts', 'Diamonds', 'Clubs', 'Spades' ];
		this.nums.forEach((num) => {
			this.suits.forEach((suit) => {
				this.deck.push(`${num} of ${suit}`);
			});
		});
		this.deck = this.deck.concat([ 'Black Joker', 'Red Joker' ]);
	}

	shuffleDeck () {
		this.shuffledDeck = [];
		for (let i = 0; i < 53; i++) {
			this.shuffledDeck.push(this.deck[Math.floor(Math.random() * 54)]);
		}
		this.deck = this.shuffledDeck;
	}

	dealCards () {
		console.log(this.players);
		this.players.forEach((player) => {
			for (let i = 0; i < 3; i++) {
				player.cards[i] = this.deck.splice(0, 3);
			}
			console.log(player.cards);
		});
	}
}
