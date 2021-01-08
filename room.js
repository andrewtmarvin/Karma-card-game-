const Game = require('./game.js');

module.exports = class Room {
    constructor(ID) {
        this.roomID = ID;
        this.curUsers = [ID, ];
        this.curGame = null;
        this.gameEnded = false;
        this.prevLoser = null;
        this.roomSetupComplete = false;
    }

    joinOtherRoom(otherRoomID) {
        // Update UI (remove buttons since not the host, begin game status promise loop)
        console.log(`joining room ${otherRoomID}...`);
        // Destroy this room object
        
    }

    userJoin(newUser) {
        // Add user to this room
        this.curUsers.push(newUser);
    }

    newGame(numPlayers) {
        this.roomSetupComplete = true;

        // Game setup
        this.curGame = new Game();
        
        this.curGame.makePlayers(numPlayers);
        this.curGame.makeDeck();
        this.curGame.shuffleDeck();
        this.curGame.dealCards();
        this.curGame.allowCardSwap();
        
        // Game start
        this.curGame.gameBegin();
    }

    getRoomStatus() {
        return {
            roomID: this.roomID,
            curUsers: this.curUsers,
            curGame: this.curGame,
            prevLoser: this.prevLoser,
            roomSetupComplete: this.roomSetupComplete
        };
    }
}