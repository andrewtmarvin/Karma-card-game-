/* 
this is where client js is located 
*/

// Local data 
window.players = [];
window.game = null;
window.loser = null;

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
    // Assign client a user ID which is also its starting room ID
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
    })
    .catch(error => console.log(error));
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
    .catch(error => console.log(error))
})
        
// LOBBY STATUS PING
let lobbyIntervalKey = 0;
const startLobbyStatusPing = () => {
    lobbyIntervalKey = setInterval(() => {
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
                                console.log("room is full");
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
    gameIntervalKey = setInterval(()=> {
        axios.get('./roomStatus', {
            params: {
                roomID,
                userID
            }
        })
        .then(res => {
            if (res.data) {
                handleGameData(res.data);
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

const handleGameData = (data) => {
    const {roomID, curUsers, curGame, prevLoser} = data;
    
    // Each if statement compares local data to incoming data. Updates and takes action if different.

    
    // PLAYER JOINS
    if (players.length != curUsers.length) {
        players = curUsers;
        // Update names in UI
        const playerNames = [document.querySelector(".player-1__name"), 
        document.querySelector("#player2 > .opponent__name"),
        document.querySelector("#player3 > .opponent__name"), 
        document.querySelector("#player4 > .opponent__name"),
        document.querySelector("#player5 > .opponent__name"),];
        // Each player plays from the large bottom player-1 area
        for (let i = 0, j = 0; i < players.length; i++, j++) {
            if (players[i][0] == userID) {
                playerNames[0].innerText = players[i][1];
                j--;
            } else {
                playerNames[j+1].innerText = players[i][1];
                // Reveal next open player slot
                if (j < 3) {
                    playerNames[j+2].parentElement.classList.remove('hidden');
                }
            }
        }
        // Display game begin game button for host when at least 3 players
        if (curUsers.length >= 3 && userID == roomID) {
            document.querySelector("#begin-game").classList.remove("hidden");
        }
    }
    
    // GAME BEGINS
    if (game != undefined && curGame?.gameStarted == true) {
        // Hide game begin button
        document.querySelector("#begin-game").classList.add("hidden");
        
        // Hide extra opponent slot
        if (curUsers.length < 5) {
            const opponents = document.querySelectorAll('.opponent');
            opponents[curUsers.length-1].classList.add('hidden');
        }
    }
    
    // GAME STATE CHANGES
    if (curGame != undefined || game?.turn != curGame?.turn) {
        game = curGame;
        console.log("updated game: ");
        console.dir(game);
    }

    // GAME ENDS
    if (game != undefined && curGame?.gameOver == true) {
        console.log("game over");
        clearInterval(gameIntervalKey);
        // Need to give option to play again. Would be nice if players from lobby could join in between games
        // showLobby();
    }

    // NEW LOSER
    if (loser != prevLoser) {
        console.log("updated prevLoser");
        loser = prevLoser;
    }
    
};