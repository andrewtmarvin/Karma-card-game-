const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json()); 

const rooms = {};

// Initial page load
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});


app.get('/roomSetUp', (req, res) => {
    const hostRoom = generateRoom();
    rooms[hostRoom.roomID] = hostRoom;
    res.send(hostRoom.roomID);
})

app.get('/joinStatus', (req, res) =>{
    const {roomID, numPlayers} = req.body;
    setTimeout(()=> {
        res.send(rooms[roomID].roomSetupComplete);
    }, 1000);
});

app.post('/join', (req, res) => {
    // If regarding players joined
    // Add/ remove player from room
    // Delete room user is leaving from rooms
    // Return players joined promise
    const {userID, roomIDField} = req.body;
    if (rooms[roomIDField] != null) {
        rooms[roomIDField].userJoin(userID);
        res.send(roomIDField);
    } else {
        res.send("a room is not found");
    }

    
    
});

// Host begins game
app.post('/begin', (req, res) => {
    const {roomID, numPlayers} = req.body;
    // Start game
    rooms[roomID].newGame(numPlayers);
    // Return players joined promise with end flag
    res.send('started');
    // Return game status promise
    
});

app.post('/gameStatus', (req, res) => {
    // always looping and waiting for promise to resolve on client
});

app.post('/gameAction', (req, res) => {
    // Game logic
    // Return game status promise
    
});

app.use(express.static(__dirname));

// Simulating 4 concurrent users
app.listen(3001, ()=>{
    console.log('listening for user 1');
});

app.listen(3002, ()=>{
    console.log('listening for user 2');
});

app.listen(3003, ()=>{
    console.log('listening for user 3');
});

app.listen(3004, ()=>{
    console.log('listening for user 4');
});

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
