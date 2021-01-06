/* 

this is where client js is located 

Client side (this file) to do:
- Loop over promise which asks server how many players have joined room
- When more than one player in room, join field and button disappear
- Start button only works if game full and user is host
- When host clicks start, tell server to begin game
- Update UI (game has begun, whose turn it is, cards displayed)

*/
        
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
        window.roomID = response.data;
    })
    .catch(error => {
        console.log("failed to set up room"+ error);
    })
});

let gameBegun = false;
// Main loop
setTimeout(
    setInterval(()=> {
        if (gameBegun == false) {
            console.log("getting room status");
            axios.get('./roomStatus', {
                params: {
                    roomID
                }
            })
            .then(res => {
                if (res.data) {
                    const responseData = res.data;
                    console.log(responseData);
                    gameBegun = true;
                }
            })
            .catch(error => {
                console.log(error);
            })
        } else {
            console.log("getting game status");
        }
    }, 2000), 1000);