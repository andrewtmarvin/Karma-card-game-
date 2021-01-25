module.exports = class Player {
	constructor (user) {
		this.userID = user[0];
		this.name = user[1];
		this.cards = [ [], [], [] ];
		this.cardSwapFinished = false;
		this.cardToSwap = null;
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
						playedCard: this.cards[i].splice(j, 1)[0],
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

	swapCards (cardTitle) {
		console.log("looking for ", cardTitle);
		for (let i = 0; i < 2; i++){
			for (let j = 0; j < 3; j++) {
				if (this.cards[i][j]?.['title'] == cardTitle) {
					if (this.cardToSwap == null) {
						this.cardToSwap = this.cards[i][j];
					} else {
						for(let k = 0; k < 2; k++) {
							for (let l = 0; l < 3; l++) {
								if (this.cards[k][l]?.['title'] == this.cardToSwap['title']) {
									this.cards[k][l] = this.cards[i][j];
									this.cards[i][j] = this.cardToSwap;
									console.log(this.cards);
									break;
								}
							}
						}
					}
				}
			}
		}
	}
}