const Game = require('./game.js');

module.exports = class Room {
    constructor(ID, playerName) {
        this.roomID = ID;
        this.curUsers = [[ID, playerName], ];
        this.curGame = null;
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

    newGame() {
        // Game setup
        this.curGame = new Game();
        
        this.curGame.makePlayers(this.curUsers);
        this.curGame.makeDeck();
        this.curGame.shuffleDeck();
        this.curGame.dealCards();
        // this.curGame.allowCardSwap();
        
        // Game start
        this.curGame.gameBegin();
    }

    getRoomStatus(userID) {
        return {
            roomID: this.roomID,
            curUsers: this.curUsers,
            curGame: this.curGame?.getGameStatus(userID),
            prevLoser: this.prevLoser
        };
    }
}