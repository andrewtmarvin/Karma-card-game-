module.exports = class Card {
	constructor (type, suit) {
		this.type = type;
		this.suit = suit;
		this.value = this.getValue(type);
		this.title = this.getTitle(type);
	}

	getValue () {
		if ([ '2', '3', '10', 'Joker' ].includes(this.type) === true) {
			return undefined;
		} else if ([ 'Jack', 'Queen', 'King', 'Ace' ].includes(this.type) === true) {
			return [ 'Jack', 'Queen', 'King', 'Ace' ].indexOf(this.type) + 10;
		} else {
			return parseInt(this.type);
		}
	}

	getTitle () {
		if (this.type !== 'Joker') {
			return `${this.type} of ${this.suit}`;
		} else {
			return `${this.suit} ${this.type}`;
		}
	}
}