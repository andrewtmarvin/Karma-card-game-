/* 

this is where client js is located 

Client side (this file) to do:
- State changes:
    - When more than one player is in room, join field and button disappear
    - Start button only works if game full and user is host
- Update UI (game has begun, whose turn it is, cards displayed)

*/
        
const joinBtn = document.querySelector("#join-room");
joinBtn.addEventListener('submit', (e) =>{
    e.preventDefault();
    const userID = document.querySelector('#roomID').innerText;
    const roomIDField = document.querySelector('#roomID-field').value;
    axios.post('/join', {roomIDField, userID})
    .then(response => {
        const {roomJoined} = response.data;
        if (roomJoined) {
            roomID = roomIDField;
            document.querySelector('#roomID').innerText = roomIDField;
            document.querySelector('#join-room').remove();
        } else {
            document.querySelector('#roomID-field').value = "Room not found";
        }
    })
    .catch(error => {
        console.log(error);
    })
})

const beginBtn = document.querySelector("#begin-game");
beginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    axios.post('/begin', {
        userID,
        roomID
    })
    .then(response=> {
        console.log(response.data)
    })
    .catch(error => {
        console.log(error);
    })
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

// Ping server for status update
setTimeout(
    setInterval(()=> {
        axios.get('./roomStatus', {
            params: {
                roomID,
                userID
            }
        })
        .then(res => {
            if (res.data) {
                const responseData = res.data;
                const {curUsers, gameEnded} = responseData;
                console.log(responseData);
                // When multiple users in room, show game board
                if (curUsers.length > 1) {
                    showGameBoard();
                } else {
                    showLobby();
                }
                // When game has ended, show lobby
                if (gameEnded == true) {
                    showLobby();
                }
            }
        })
        .catch(error => {
            console.log(error);
        })
    }, 2000), 1000);

    const showGameBoard = () => {
        const gameLobby = document.querySelector('.game-lobby');
        gameLobby.classList.add('hidden');
        const gameBoard = document.querySelector('.game-area');
        gameBoard.classList.remove('hidden');
    }

    const showLobby = () => {
        const gameLobby = document.querySelector('.game-lobby');
        gameLobby.classList.remove('hidden');
        const gameBoard = document.querySelector('.game-area');
        gameBoard.classList.add('hidden');
    }