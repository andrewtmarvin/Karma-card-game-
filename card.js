export class Card {
	constructor (type, suit) {
		this.type = type;
		this.suit = suit;
		this.value = this.getValue(type);
		this.title = `${type} of ${suit}`;
	}

	getValue (type) {
		if ([ '2', '3', '10', 'Joker' ].includes(type) === true) {
			return undefined;
		} else if ([ 'Jack', 'Queen', 'King', 'Ace' ].includes(type) === true) {
			return [ 'Jack', 'Queen', 'King', 'Ace' ].indexOf(type) + 11;
		} else {
			return parseInt(type);
		}
	}
}
