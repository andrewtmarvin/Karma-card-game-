module.exports = class Player {
	constructor (user) {
		this.userID = user[0];
		this.name = user[1];
		this.cards = [ [], [], [] ];
	}

	playCard (playerMove) {
		for (let i = 0; i < 3; i++){
			for (let j = 0; i < this.cards[i].length; j++) {
				if (this.cards[i][j]['title'] == playerMove) {
					return this.cards[i].pop(j);
				}
			}
		}
	}

	drawCard () {
		this.cards[0].push(card);
		console.log('a card is drawn.');
	}

	pickUpPile () {
		console.log('a pile is picked up.');
	}

	swapCards () {
		console.log('cards are swapped.');
	}
}