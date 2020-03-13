import { Player } from './player.js';
import { Card } from './card.js';

export class Game {
	constructor () {
		this.numPlayers = null;
		this.deck = [];
		this.players = [];
	}

	makePlayers (numPlayers) {
		for (let i = 0; i < numPlayers; i++) {
			this.players.push(new Player(prompt(`Enter player ${i + 1}'s name: `)));
		}
	}

	makeDeck () {
		this.types = [ '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace' ];
		this.suits = [ 'Hearts', 'Diamonds', 'Clubs', 'Spades' ];
		this.types.forEach((type) => {
			this.suits.forEach((suit) => {
				this.deck.push(new Card(type, suit));
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
		console.log(this.shuffledDeck);
	}

	dealCards () {
		this.players.forEach((player) => {
			for (let i = 0; i < 3; i++) {
				player.cards[i] = this.deck.splice(0, 3);
			}
		});
	}
}
