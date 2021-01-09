/* 
this is where client js is located 
*/

// ROOM SETUP
const nameForm = document.querySelector(".player-name-form");
nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Update UI and server with new player name
    const playerName = document.querySelector("#player-name").value;
    document.querySelector(".player-name").innerText = playerName;
    axios.get('/roomSetUp', {
        params: {
            playerName
        }
    })
    // Asign client a user ID which is also its starting room ID
    .then(response => {
        document.querySelector('#roomID').innerText = response.data;
        window.userID = response.data;
        window.roomID = response.data;
        nameForm.classList.add('hidden');
        startLobbyStatusPing();
    })
    .catch(error => {
        console.log("failed to set up room"+ error);
    })
});

// HOST GAME BUTTON
const hostBtn = document.querySelector(".host-game");
hostBtn.addEventListener('click', (e)=> {
    startRoomStatusPing();
    exitLobby();
    axios.post('./host', {
        userID
    })
    .then(res => {
        console.log(res);

    })
});

// JOIN OTHER ROOM BUTTON
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
            exitLobby();
        } else {
            document.querySelector('#roomID-field').value = "Room not found";
        }
    })
    .catch(error => {
        console.log(error);
    })
})

// BEGIN GAME BUTTON
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
        
// LOBBY STATUS PING
let lobbyIntervalKey = 0;
const startLobbyStatusPing = () => {
    lobbyIntervalKey = setInterval(()=> {
        axios.get('./lobbyStatus', {
            params: {
                userID
            }
        })
        .then(res => {
            const openGames = document.querySelector(".open-games");
            openGames.innerHTML = '';
            
            const responseData = res.data;
            if (Object.keys(responseData).length > 0) {
                for (const game in responseData) {
                    // Put links into page
                    const link = document.createElement('a');
                    link.setAttribute('href', "#");
                    link.setAttribute('class', "join-link");
                    const p = document.createElement('p');
                    p.innerText = responseData[game][0][1];
                    link.appendChild(p);
                    openGames.appendChild(link);
                }
                const allJoinLinks = document.getElementsByClassName('join-link')
                for (const link of allJoinLinks) {
                    link.addEventListener('click', ()=>{
                        console.log('you clicked me');
                    })
                };
            } else {
                const p = document.createElement('p');
                p.innerText = "No games in lobby. Host one!";
                openGames.appendChild(p);
            }
        })
        .catch(error => {
            console.log(error);
        })
    }, 1000);
}

const exitLobby = () => {
    // End lobby status ping
    clearInterval(lobbyIntervalKey);
    // Switch from lobby view to game board view
    const gameLobby = document.querySelector('.game-lobby');
    gameLobby.classList.add('hidden');
    const gameBoard = document.querySelector('.game-area');
    gameBoard.classList.remove('hidden');
}

// ROOM STATUS PING
let gameIntervalKey = 0;
const startRoomStatusPing = () => {
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
                // When game has ended, show lobby
                if (gameEnded == true) {
                    showLobby();
                }
            }
        })
        .catch(error => {
            console.log(error);
        })
    }, 2000);
}

const exitGame = () => {
    // End lobby status ping
    clearInterval(gameIntervalKey);
    // Switch from lobby view to game board view
    const gameLobby = document.querySelector('.game-lobby');
    gameLobby.classList.remove('hidden');
    const gameBoard = document.querySelector('.game-area');
    gameBoard.classList.add('hidden');
}