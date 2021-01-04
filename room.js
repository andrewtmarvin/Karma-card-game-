const Game = require('./game.js');

module.exports = class Room {
    constructor(roomID) {
        this.roomID = roomID;
        this.curUsers = ['host', ];
        this.curGame = null;
        this.prevLoser = null;
    }

    joinOtherRoom(otherRoomID) {
        // Update UI (remove buttons since not the host, begin game status promise loop)
        console.log(`joining room ${otherRoomID}...`);
        // Destroy this room object
    }

    userJoin(newUser) {
        // Add user to this room
        this.curUsers.add(newUser);
    }

    newGame(numPlayers) {
        // Game setup
        const game1 = new Game();
        
        game1.makePlayers(numPlayers);
        game1.makeDeck();
        game1.shuffleDeck();
        game1.dealCards();
        game1.allowCardSwap();
        
        // Game start
        game1.gameBegin();
    }
}