const Game = require('./game.js');

module.exports = class Room {
    constructor(ID, playerName) {
        this.roomID = ID;
        this.curUsers = [[ID, playerName], ];
        this.curGame = null;
        this.gameStarted = false;
        this.gameEnded = false;
        this.prevLoser = null;
    }

    joinOtherRoom(otherRoomID) {
        // Update UI (remove buttons since not the host, begin game status promise loop)
        console.log(`joining room ${otherRoomID}...`);
        // Destroy this room object
        
    }

    userJoin(newUser, userName) {
        // Add user to this room
        this.curUsers.push([newUser, userName]);
    }

    newGame(numPlayers) {
        this.gameStarted = true;

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
            gameStarted: this.gameStarted,
            gameEnded: this.gameEnded
        };
    }
}