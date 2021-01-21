module.exports = class Player {
	constructor (user) {
		this.userID = user[0];
		this.name = user[1];
		this.cards = [ [], [], [] ];
	}

	playCard (playerMove) {
		for (let i = 0; i < 3; i++){
			for (let j = 0; j < this.cards[i].length; j++) {
				if (this.cards[i][j]?.['title'] == playerMove) {
					// Check for duplicates at this level
					const cardType = this.cards[i][j].type;
					// Don't allow duplicates in face down cards to apply
					let duplicates = 1;
					// Don't look in face down cards
					if (i != 2) {
						// Ignore duplicate 10s because player gets to go again anyways
						if (this.cards[i][j]?.['type'] != "10") {
							duplicates = this.cards[i].filter(card => card['type'] == cardType).length;
						}
					} 

					return {
						'playedCard': this.cards[i].splice(j, 1)[0],
						duplicates
					}
				}
			}
		}
	}

	drawCard (card) {
		this.cards[0].push(card);
	}

	pickUpPile (pile) {
		this.cards[0].push(...pile);
	}

	swapCards () {
		console.log('cards are swapped.');
	}
}