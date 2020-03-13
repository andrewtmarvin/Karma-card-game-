import { Player } from './player.js';
import { Card } from './card.js';

export class Game {
	constructor () {
		this.numPlayers = null;
		this.deck = [];
		this.players = [];
	}

	makePlayers (numPlayers) {
		this.numPlayers = numPlayers;
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
		this.deck = this.deck.concat([ new Card('Joker', 'Red'), new Card('Joker', 'Black') ]);
	}

	shuffleDeck () {
		this.shuffledDeck = [];
		for (let i = 0; i < 53; i++) {
			this.shuffledDeck.push(this.deck[Math.floor(Math.random() * 54)]);
		}
		this.deck = this.shuffledDeck;
	}

	dealCards () {
		this.players.forEach((player) => {
			for (let i = 0; i < 3; i++) {
				player.cards[i] = this.deck.splice(0, 3);
			}
		});
	}

	allowCardSwap () {
		this.players.forEach((player) => {
			console.log(`${player.name}'s cards:`);
			let x = '';
			player.cards[0].forEach((card) => (x += card.type + ' '));
			console.log(x);
			x = '';
			// console.log(`${player.name}'s face up cards:`);
			player.cards[1].forEach((card) => (x += card.type + ' '));
			console.log(x);

			// if (prompt('want to swap?') === 'yes') {
			// 	player.swapCards();
			// } else {
			// 	console.log('a card is not swapped.');
			// }
		});
	}

	gameBegin () {
		console.log('a game is begun.');
		console.log(`${this.goesFirst()} goes first.`);
	}

	goesFirst () {
		// This variable increments if no single player is chosen at the end of each round.
		let decidingValue = 3;
		// This array corresponds with the players. It starts with everyone true. A player is marked false if they fail a round
		// for example, if they don't have a 3 on the first round.
		let playerStarterStatus = Array.from({ length: this.numPlayers }).fill(true);
		// While loops breaks when only one player is marked as true, meaning they will go first.
		while (playerStarterStatus.indexOf(true) !== playerStarterStatus.lastIndexOf(true)) {
			this.players.forEach((player) => {
				// playerIndex corresponds with a player's index location in both the playerStarterStatus and this.players arrays.
				let playerIndex = this.players.indexOf(player);
				// Filters out players who failed previous selection rounds
				if (playerStarterStatus[playerIndex] === true) {
					playerStarterStatus[playerIndex] = false;
					// If a single card matches the decidingValue for a round, player status is marked true.
					for (let i = 0; i < 2; i++) {
						for (let j = 0; j < 3; j++) {
							if (player.cards[i][j].type === decidingValue.toString()) {
								playerStarterStatus[playerIndex] = true;
							}
						}
					}
				}
			});
			// If more than one player has a decidingValue card but one player has more copies of it, they are chosen
			if (playerStarterStatus.indexOf(true) !== playerStarterStatus.lastIndexOf(true)) {
				let x = [];
				while (playerStarterStatus.length !== 0) {
					let y = playerStarterStatus.pop();
					if (y == true) {
						x.push(this.players[playerStarterStatus.length]);
					}
				}
				let counter = Array.from({ length: x.length }).fill(0);
				// continue here...
			}

			decidingValue++;
			// If no players are marked true, i.e. nobody has a "3" in the first round, all are marked true before start of the next "4" round.
			if (playerStarterStatus.indexOf(true) === -1) {
				playerStarterStatus = Array.from({ length: this.numPlayers }).fill(true);
			}
		}
		return this.players[playerStarterStatus.indexOf(true)].name;
	}
}
