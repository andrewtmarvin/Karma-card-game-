module.exports = class Player {
	constructor (user) {
		this.userID = user[0];
		this.name = user[1];
		this.cards = [ [], [], [] ];
	}

	playCard () {
		console.log(`a card is played by ${this.name}.`);
	}

	drawCard () {
		this.cards[0].push(card);
		console.log('a card is drawn.');
	}

	pickUpDeck () {
		console.log('a deck is picked up.');
	}

	swapCards () {
		console.log('some cards are swapped.');
	}
}