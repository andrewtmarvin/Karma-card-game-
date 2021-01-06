/* 

this is where client js is located 

Client side (this file) to do:
- Loop over promise which asks server how many players have joined room
- When anyone joins, connect button turns to start button
- When host clicks start, tell server to begin game
- Receive players joined promise with loop end flag from server
- Begin loop over game status promise which asks server for game status
- Update UI (game has begun, whose turn it is, cards displayed)

*/


// players joined promise
let joinRoomComplete = false;

const checkJoinedStatus = () => {
    console.log(userID);
    axios.get('./joinStatus', {
        userID,
        roomIDField : document.querySelector('#roomID-field').value
    })
    .then(response =>{
        console.log(response.data);
        if (response.data.complete == true) {
            joinRoomComplete = true;
        } else {
            checkJoinedStatus()
        }
    })
    .catch(error => {
        console.log(error);
    })
}




// game status promise
let gameStatusEnded = false;



const joinBtn = document.querySelector("#join-room");
joinBtn.addEventListener('submit', (e) =>{
    e.preventDefault();
    const userID = document.querySelector('#roomID').innerText;
    const roomIDField = document.querySelector('#roomID-field').value;
    axios.post('/join', {roomIDField, userID})
    .then(response => {
        document.querySelector('#roomID').innerText = response.data;
        document.querySelector('#join-room').remove();
    })
    .catch(error => {
        console.log(error);
    })
})

const beginBtn = document.querySelector("#begin-game");
beginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    axios.post('/begin', {
        'roomID': document.querySelector('#roomID').innerText,
        'numPlayers': 4
    })
    .then(response=> {
        console.log(response.data)
    })
    .catch(error => {
        console.log(error);
    })
    console.log('a game is begun');
})

// Set up room, asign client a user ID which is also its starting room ID
window.addEventListener('load', () => {
    axios.get('/roomSetUp')
    .then(response => {
        document.querySelector('#roomID').innerText = response.data;
        window.userID = response.data;

        checkJoinedStatus();
    })
    .catch(error => {
        console.log("failed to set up room");
    })
  });