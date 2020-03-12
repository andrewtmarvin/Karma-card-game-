export class Player {
	constructor (name) {
		this.name = name;
		this.cards = [ [], [], [] ];
	}
	playCard () {
		this.cards.forEach((card) => {
			console.log(`${this.name} has played card ${card}.`);
		});
	}
	drawCard () {
		console.log('a card is drawn.');
		this.cards[0].push(card);
	}
	pickUpDeck () {
		console.log('a deck is picked up.');
	}
	swapCards () {}
}
