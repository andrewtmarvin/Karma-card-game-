const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const { connect } = require('tls');

app.use(bodyParser.json()); 

// ID : Room object
const rooms = {};
// ID : name
const users = {};

// Initial page load
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});


app.get('/roomSetUp', (req, res) => {
    const hostRoom = generateRoom();
    const ID = hostRoom.roomID;
    rooms[ID] = hostRoom;
    users[ID] = "anon";
    res.send(ID);
})

app.post('/join', (req, res) => {
    // If regarding players joined
    // Add/ remove player from room
    // Delete room user is leaving from rooms
    // Return players joined promise
    const {userID, roomIDField} = req.body;
    let roomJoined = false;
    if (rooms[roomIDField] != null) {
        rooms[roomIDField].userJoin(userID);

        delete rooms[userID];
        roomJoined = true;
    }
    res.json({roomJoined});
});

// Host begins game
app.post('/begin', (req, res) => {
    const {roomID, userID} = req.body;
    const numPlayers = rooms[roomID].curUsers.length;
    // Game must have 3-5 players. Only host can start the game.
    if (2 < numPlayers && numPlayers < 6 && roomID == userID) {
        rooms[roomID].newGame(numPlayers);
    }
});

app.post('/gameAction', (req, res) => {
    // Game logic

});

app.get('/roomStatus', (req, res) =>{
    const {roomID} = req.query;
    if (rooms[roomID]!=null) {
        const room = rooms[roomID];
        res.json(room.getRoomStatus());
    }
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
    const userRoom = new Room(generateID());
    return userRoom;
    // Function generates unique room ID
    function generateID() {
        return Math.random().toString(36).substr(2, 5).toUpperCase();
    }    
}