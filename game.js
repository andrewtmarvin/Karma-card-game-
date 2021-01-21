const Player = require('./player.js');
const Card = require('./card.js');

// Static variable declaration
let prevLoser = "";

module.exports = class Game {
	constructor () {
		this.numPlayers = null;
		this.deck = [];
		this.pile = [];
		this.burned = [];
		this.players = [];
		this.rotation = [];
		this.activePlayer = null;
		this.details = {
			clockwise : true,
			turn : 0,
			duplicates : false,
			gameStarted : false,
			gameOver : false,
		}
	}

	makePlayers (curUsers) {
		this.numPlayers = curUsers.length;
		for (let i = 0; i < this.numPlayers; i++) {
			const newPlayer = new Player(curUsers[i]);
			this.players.push(newPlayer);
			this.rotation.push(newPlayer);
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
		while (this.deck.length > 0) {
			this.shuffledDeck.push(...this.deck.splice(Math.floor(Math.random() * this.deck.length), 1));
		}
		this.deck = [ ...this.shuffledDeck ];
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
		this.details.gameStarted = true;
		const firstPlayID = this.goesFirst()['userID'];
		this.jumpRotate(firstPlayID);
	}

	// Returns player who goes first
	goesFirst () {
		// This variable increments if no single player is chosen at the end of each round.
		let decidingValue = 3;
		// This array corresponds with the players. It starts with everyone true. A player is marked false if they fail a round
		// for example, if they don't have a 3 on the first round.
		let playerStarterStatus = Array.from({ length: this.numPlayers }).fill(true);
		// While loops breaks when only one player is marked as true, meaning they will go first.
		while (playerStarterStatus.indexOf(true) !== playerStarterStatus.lastIndexOf(true)) {
			// Keeps track of starter status from the beginning of the round
			let roundStartValues = [...playerStarterStatus];
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
			// Needed for resetting playerStarterStatus after items popped in the following if statement
			let updatedPlayerStarterStatus = [...playerStarterStatus];
			// If more than one player has a decidingValue card but one player has more copies of it, they are chosen
			if (playerStarterStatus.indexOf(true) !== playerStarterStatus.lastIndexOf(true)) {
				let x = [];
				while (playerStarterStatus.length !== 0) {
					if (playerStarterStatus.pop() == true) {
						x.push(this.players[playerStarterStatus.length]);
					}
				}
				playerStarterStatus = [...updatedPlayerStarterStatus];
				// counter and x have corresponding indexes
				let counter = Array.from({ length: x.length }).fill(0);
				// Counts how many duplicates of the decidingValue card a player has
				x.forEach((player) => {
					for (let i = 0; i < 2; i++) {
						for (let j = 0; j < 3; j++) {
							if (player.cards[i][j].type === decidingValue.toString()) {
								counter[x.indexOf(player)] += 1;
							}
						}
					}
				});
				// If one player has a higher count of the decidingValue card, they are chosen
				let highestCount = Math.max(...counter);
				if (counter.indexOf(highestCount) === counter.lastIndexOf(highestCount)) {
					// One player has more of the decidingValue card
					return x[counter.indexOf(highestCount)];
				} else {
					// Players have the same number of decidingValue card. Continue to next round...`
				}
			}
			// Only runs if none are true. Resets values to how they were at the start of this loop.
			// If two are true, only those players will continue to the next round.
			if (playerStarterStatus.indexOf(true) === -1) {
				playerStarterStatus = [...roundStartValues];
				// No round winner for decidingValue, continue to the next round...
			}
			decidingValue++;
			// Certain scenarios result in unexplained infinite loop. Just let host start
			if (decidingValue > 15) {
				return this.players[0];
			}
		}
		return this.players[playerStarterStatus.indexOf(true)];
	}

	getGameStatus(userID) {
		const thisPlayer = this.players.filter(player => player.userID == userID)[0];
		const opponents = this.players.filter(player => player.userID != userID);
		// userID, number in hand, faceup, number of facedown
		const opponentsCards = [];
		opponents.forEach(opponent => {
			opponentsCards.push([
				opponent.userID,
				opponent.cards[0].length,
				opponent.cards.slice(1, 2)[0],
				opponent.cards[2].length
			])
		});
		return {
			// Only give player their hand, all face up cards on board, and number of face down cards
			playerCards: [userID].concat(thisPlayer.cards.slice(0,2)).concat(thisPlayer.cards[2].length),
			opponentsCards,
			deckRemaining: this.deck.length,
			pile: this.pile,
			burned: {
				number: this.burned.length,
				topCard: this.burned.slice(-1)[0] || ""
			},
			activePlayer: this.activePlayer.userID,
			gameStarted: this.details.gameStarted,
			gameOver: this.details.gameOver,
			turn: this.details.turn,
			duplicates: this.details.duplicates
        };
	}

	rotate() {
		while(this.activePlayer.cards[0].length < 3 && this.deck.length > 0) {
			this.activePlayer.drawCard(this.deck.pop());
		}
		if (this.details.clockwise) {
			this.rotation.push(this.rotation.shift());
			this.activePlayer = this.rotation [0];
		} else {
			this.rotation.unshift(this.rotation.pop());
			this.activePlayer = this.rotation[0];
		}
		this.details.turn++;
	}

	// Jump to the player who is starting the game, or the player who burns the pile out of turn
	jumpRotate(userID) {
		while (this.rotation[0]['userID'] != userID) {
			this.rotation.unshift(this.rotation.pop());
		}
		this.activePlayer = this.rotation[0];
		while(this.activePlayer.cards[0].length < 3 && this.deck.length > 0) {
			this.activePlayer.drawCard(this.deck.pop());
		}
		this.details.turn++;
	}

	advanceGame(userID, playerMove) {
		console.log(playerMove);
		if (this.activePlayer['userID'] == userID) {
			// Short circuit if user is passing instead of playing a duplicate card
			if (playerMove == "pass") {
				// Case choosing not to play a second 10
				if (playerMove.slice(0,2) == "10") {
					this.details.duplicates = false;
					// Draw cards before next turn
					while(this.activePlayer.cards[0].length < 3 && this.deck.length > 0) {
						this.activePlayer.drawCard(this.deck.pop());
					}
					this.details.turn++;
					return;
				} 

				this.rotate();
				// Skip a player if an 8 is played
				if (this.pile.slice(-1) == "8") {
					this.rotate();
				}
				this.details.duplicates = false;
				return;
				
			}
			// Short circuit if user is picking up pile
			if (playerMove == "pickup") {
				if (this.pile.length > 0){
					this.activePlayer.pickUpPile(this.pile);
					this.pile = [];
					this.rotate();
					return;
				} else {
					// User tried to pick up empty pile
					return;
				}
			}
			// Retrieve face down card title
			if (playerMove.slice(4,8) == "Down") {
				const cardIndex = parseInt([playerMove[8]]);
				playerMove = this.activePlayer.cards[2][cardIndex].title;
			}
			if (this.moveAllowed(playerMove)){
				const res = this.activePlayer.playCard(playerMove);
				// As soon as a card is played, draw to 3 in hand if possible
				while(this.activePlayer.cards[0].length < 3 && this.deck.length > 0) {
					this.activePlayer.drawCard(this.deck.pop());
				}
				console.log(res);
				const { playedCard, duplicates } = res;
				this.pile.push(playedCard);
				if (playedCard['type'] == "10") {
					this.burned.push(...this.pile);
					this.pile = [];
					while(this.activePlayer.cards[0].length < 3 && this.deck.length > 0) {
						this.activePlayer.drawCard(this.deck.pop());
					}
					this.details.turn++
				}
				if (duplicates > 1) {
					this.details.duplicates = true;
					this.details.turn++
				} else {
					this.details.duplicates = false;
					// Reverse game flow if a Joker is played
					if (playerMove.slice(-5) == "Joker") {
						this.details.clockwise = !this.details.clockwise;
					}
					// Do not rotate players if 10 was played
					if (playedCard['type'] != "10"){
						this.rotate();
						// Skip a player if an 8 is played
						if (playerMove.slice(0,1) == "8") {
							this.rotate();
						}
					}
				}
			}
		} else {
			return;
		}
	}

	moveAllowed(playerMove) {
		// Needed for legality checks
		let playerMoveValue;
		let playerMoveType;
		let pileType = this.pile[this.pile.length-1]?.['type'];
		let pileValue = this.pile[this.pile.length-1]?.['value'];
		// Locate the card, determine whether in hand, faceup, or facedown
		for (let i = 0; i < 3; i++){
			for (let j = 0; j < this.activePlayer.cards[i].length; j++) {
				// Check that playerMove is from allowed cards (hand, faceup, facedown)
				if (this.activePlayer.cards[i][j]?.['title'] == playerMove) {
					// Extract card type and value for later comparison
					playerMoveValue = this.activePlayer.cards[i][j]['value'];
					playerMoveType = this.activePlayer.cards[i][j]['type'];
					if (i == 0) {
						// Always allow cards in hand to be played
					} else if (i == 1 && this.activePlayer.cards[0].length == 0) {
						// Allow face up cards to be played only when hand is empty
					} else if (i == 2 && this.activePlayer.cards[0].length == 0 && this.activePlayer.cards[1].length == 0) {
						// Allow face down cards to be played only when hand and face up cards are empty
					} else {
						return false;
					}

					// Allow duplicates to be played
					if (this.details.duplicates == true) {
						if (pileType == playerMoveType) {
							return true;
						} else {
							return false;
						}
					} 
					// Allow any card to be played on empty pile or a 2
					if (this.pile.length == 0 || pileType == "2") {
						return true;
					}
					// 3 or Joker looks at the previous card, can look past any number of 3s and Jokers
					if (["3", "Joker"].includes(pileType)){
						let i = 1;
						while (["3", "Joker"].includes(pileType)) {
							// Hit the bottom of the pile, still only 3s and Jokers, return true
							if (this.pile[this.pile.length-i] == undefined) {
								return true;
							}
							// Apply Joker power if found
							if (this.pile[this.pile.length-i].type == "Joker") {
								this.details.clockwise = !this.details.clockwise;
							}
							pileType = this.pile[this.pile.length - i]['type'];
							pileValue = this.pile[this.pile.length - i]['value'];
							i++;
						}
					}					
					// Seven rule
					if (pileValue == 7) {
						if (playerMoveValue >= 7) {
							return false;
						} else {
							return true;
						}
					}
					// General value fail
					if (pileValue > playerMoveValue) {
						return false;
						// General value pass, wildcards also pass here because their value is undefined
					} else {
						return true;
					}
				}
			}
		}
		// Catch all pass
		return true;
	}
}