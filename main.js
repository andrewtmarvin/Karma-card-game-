const express = require('express');
const app = express();
const path = require('path');

// Initial page load
app.get('/', (req, res) => {
    const hostRoom = generateRoom();
    console.log(`Room created with ID ${hostRoom.roomID}`)
    numPlayers = 4;
    hostRoom.newGame(numPlayers);
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Ajax requests
app.post('/', (req, res) => {
    // If regarding players joined
    // Add/ remove player from room
    // Return players joined promise

    // If host clicked begin game
    // Return players joined promise with end flag
    // Start game
    // Return game status promise

    // If regarding a player's move
    // Game logic
    // Return game status promise
    res.send('data');
});

app.use(express.static(__dirname));

// Simulating 4 concurrent users
app.listen(3001, ()=>{
    console.log('listening for user 1');
})

app.listen(3002, ()=>{
    console.log('listening for user 2');
})

app.listen(3003, ()=>{
    console.log('listening for user 3');
})

app.listen(3004, ()=>{
    console.log('listening for user 4');
})

function generateRoom() {
    const Room = require('./room.js');
    const userRoom = new Room(generateRoomID());
    return userRoom;
    // Function generates unique room ID
    function generateRoomID() {
        return Math.random().toString(36).substr(2, 5).toUpperCase();
    }    
}




/*
Server side to do:
- When user opens page, ajax call -> instantiate room object with unique room code -> displays on page
- When user tries to connect to another room, ajax call -> adds user to game and return players joined promise to all users -> update UI
- When host clicks start, return players joined promise with loop end flag begin game logic 
*/
