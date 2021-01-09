/* 
this is where client js is located 
*/

// ROOM SETUP
const nameForm = document.querySelector(".player-name-form");
nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Update UI and server with new player name
    let playerName = document.querySelector("#player-name").value;
    if (playerName == '') {
        playerName = "anon";
    }
    document.querySelector(".player-name-display").innerText += playerName;
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
            const openGames = document.querySelector(".game-lobby__open-games");
            openGames.innerHTML = '';
            
            const responseData = res.data;
            
            // If response is JSON and object has rooms
            if (res.headers['content-type'].substring(0,4) != 'text' && Object.keys(responseData).length > 0) {
                const joinGame = document.createElement('p');
                joinGame.innerText = "Join a game:";
                openGames.appendChild(joinGame);

                for (const game in responseData) {
                    // Put links into page
                    const link = document.createElement('a');
                    link.setAttribute('href', "#");
                    link.setAttribute('class', "join-link");
                    console.dir(responseData);
                    const p = document.createElement('p');
                    p.innerText = responseData[game][0][1] +  "'s game";
                    p.setAttribute('data-roomID', responseData[game][0][0]);
                    link.appendChild(p);
                    openGames.appendChild(link);
                }
                const allJoinLinks = document.getElementsByClassName('join-link')
                for (const link of allJoinLinks) {
                    link.addEventListener('click', (e)=>{
                        const targetRoomID = e.target.dataset.roomid;
                        axios.post('/join', {targetRoomID, userID})
                        .then(response => {
                            const {roomJoined} = response.data;
                            if (roomJoined) {
                                roomID = targetRoomID;
                                document.querySelector('#roomID').innerText = targetRoomID;
                                exitLobby();
                                startRoomStatusPing();
                            } else {
                                console.log("room doesn't exist");
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        })
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