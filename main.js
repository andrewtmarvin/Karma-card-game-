const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json()); 

// {ID : Room object}
const rooms = {};
// {ID : {name, lastConnectedTimestamp}}
const users = {};

// Initial page load
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Creates room and returns user/ room ID to client
app.get('/roomSetUp', (req, res) => {
    const room = generateRoom();
    const ID = room.roomID;
    rooms[ID] = room;
    users[ID] = {
        'name' : "anon",
        'curRoom' : ID,
        'lastConnected' : Date.now()
    };
    res.send(ID);
})

app.post('/join', (req, res) => {
    // If regarding players joined
    // Add/ remove player from room
    // Return players joined promise
    const {userID, roomIDField} = req.body;
    let roomJoined = false;
    // If room exists, proceed
    if (rooms[roomIDField] != null) {
        const roomToJoin = rooms[roomIDField];
        // If room still has space for new player
        if (roomToJoin.curUsers.length < 5) {
            // Update user's room ID
            users[userID]['curRoom'] = roomIDField;
            // Add user to room they're joining
            roomToJoin.userJoin(userID);
            // Delete room that user is leaving
            delete rooms[userID];
            roomJoined = true;
        }
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
    res.end();
});

app.post('/gameAction', (req, res) => {
    // Game logic
    res.end();
});

app.get('/roomStatus', (req, res) =>{
    const {roomID, userID} = req.query;
    if (rooms[roomID] != null && users[userID] != null) {
        const room = rooms[roomID];
        res.json(room.getRoomStatus());
        
        // Update lastConnected timestamp
        users[userID]['lastConnected'] = Date.now();

    }
    res.end();
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

// Every 10 seconds, check if all users still connected. Remove users who haven't connected in over 10 seconds
setInterval(()=> {
    // Find users who have closed browser or lost connection, delete them and reset page for any users from their room
    console.log(users);
    for (const userID in users) {
        if (Date.now() - users[userID]['lastConnected'] > 10000) {
            const currentRoom = rooms[users[userID]['curRoom']];
            // End any game user was playing
            currentRoom['gameEnded'] = true;
            // Remove user from room
            currentRoom['curUsers'] = currentRoom['curUsers'].filter(user => user !== userID);
            // Remove user from user liset
            delete users[userID];
            
        }
    }

}, 5000)