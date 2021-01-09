/* 
this is where server js is located 
*/

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json()); 

// {ID : Room object}
const rooms = {};
// {ID : {name, lastConnectedTimestamp}}
const users = {};
// {ID : [[playerID, playerName], ]}
const lobby = {};

// Initial page load
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Creates room and returns user/ room ID to client
app.get('/roomSetUp', (req, res) => {
    let { playerName } = req.query;
    if (playerName == '') {
        playerName = "anon";
    }
    const room = generateRoom();
    const ID = room.roomID;
    rooms[ID] = room;
    users[ID] = {
        'name' : playerName,
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
            // Add user to game in lobby
            lobby[userID].push([userID, users[userID]['name']]);
            roomJoined = true;
        }
    }
    res.json({roomJoined});
});
app.post('/host', (req, res) => {
    const {userID} = req.body;
    lobby[userID] = [[userID, users[userID]['name']], ];
    res.end();
})
// Host begins game
app.post('/begin', (req, res) => {
    const {roomID, userID} = req.body;
    const numPlayers = rooms[roomID].curUsers.length;
    // Game must have 3-5 players. Only host can start the game.
    if (2 < numPlayers && numPlayers < 6 && roomID == userID) {
        rooms[roomID].newGame(numPlayers);
        delete lobby[roomID];
    }
    res.end();
});

app.post('/gameAction', (req, res) => {
    // Game logic
    res.end();
});

// Send back username and roomID of users who have clicked to host a game
app.get('/lobbyStatus', (req, res) =>{
    const {userID} = req.query;
    res.json(lobby);

    // Update lastConnected timestamp
    users[userID]['lastConnected'] = Date.now();
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

setInterval(()=> {
    // Find users who have closed browser or lost connection, delete them and reset page for any users from their room
    for (const userID in users) {
        if (Date.now() - users[userID]['lastConnected'] > 4001) {
            const currentRoom = rooms[users[userID]['curRoom']];
            // End any game user was playing
            currentRoom['gameEnded'] = true;
            // Remove user from room
            currentRoom['curUsers'] = currentRoom['curUsers'].filter(user => user !== userID);
            // Delete room if empty
            console.log(currentRoom['curUsers'].length);
            if (currentRoom['curUsers'].length == 0) {
                delete currentRoom;
            }
            // Remove user from user list
            delete users[userID];
            // Remove user from lobby games
            for (const game in lobby) {
                for (const player of lobby[game]) {
                    player.forEach((user, i)=> {
                        console.log(user);
                        if (user[0] == userID ) {
                            game.pop(i);
                        }
                    }) 

                }

            }
        }
    }
    // console.log(users);
    console.log("rooms:");
    console.log(rooms);
    // console.log(lobby);
}, 2000);