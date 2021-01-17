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
    const { roomID, curUsers, curGame, prevLoser } = data;
    
    // Each if statement compares local data to incoming data. Updates and takes action if different.

    
    // PLAYER JOINS
    if (players.length != curUsers.length) {
        players = curUsers;

        // Update names in UI and ID data in DOM
        const playerDivs = [document.querySelector(".player-1"), 
        document.querySelector("#player2"),
        document.querySelector("#player3"), 
        document.querySelector("#player4"),
        document.querySelector("#player5"),];

        const playerNames = [document.querySelector(".player-1__name"), 
        document.querySelector("#player2 > .opponent__name"),
        document.querySelector("#player3 > .opponent__name"), 
        document.querySelector("#player4 > .opponent__name"),
        document.querySelector("#player5 > .opponent__name"),];

        // Each player plays from the large bottom player-1 area
        while (true) {
            // Reorder players until player is at the bottom of the stack
            if (players[0][0] != userID) {
                players.push(players.shift());
                continue;
            } 
            // Once player is at the bottom of the stack, fill UI clockwise
            for (let i = 0; i < players.length; i++) {
                playerNames[i].innerText = players[i][1];
                playerDivs[i].setAttribute('data-userID', players[i][0]);
                playerDivs[i].classList.remove('hidden');
            }
            break;
        }

        // Display game begin game button for host when at least 3 players
        if (curUsers.length >= 3 && userID == roomID) {
            document.querySelector("#begin-game").classList.remove("hidden");
        }
    }
        
    // GAME STATE CHANGES
    if (curGame != undefined && game?.turn != curGame?.turn) {
        game = curGame;
        updateCards(game);
        // Give activePlayer visual cue in UI
        document.querySelector('.active-player')?.classList?.remove('active-player');
        document.querySelector(`div[data-userid='${game.activePlayer}'`).classList.add('active-player');

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

    // GAME ENDS
    if (game != undefined && curGame?.gameOver == true) {
        console.log("a game is ended");
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

const updateCards = (game) => {
    const { playerCards, opponentsCards, deckRemaining, pile } = game;

    // GAME PLAY AREA SECTION
    // Deck remaining
    document.getElementById("deckRemaining").innerText = deckRemaining;

    // Pile
    document.querySelector(".play-area__pile-cards").innerText = `Top card: ${pile[pile.length-1]?.title || 'pile empty'}`;

    // Burn


    // UPDATE PLAYER SECTION
    // Hand
    const playerHand = document.querySelector('.player-1__hand');
    playerHand.innerHTML = "";
    for (const card of playerCards[1]) {
        const link = document.createElement('a');
        link.setAttribute('href', "#");
        link.setAttribute('class', "card-link");
        const p = document.createElement('p');
        p.innerText = card['title'];
        p.setAttribute('data-card', card['title']);
        p.classList.add("card");
        link.appendChild(p);
        playerHand.appendChild(link);
    }

    // Face up
    const playerFaceUp = document.querySelector('.player-1__face-up');
    playerFaceUp.innerHTML = "";
    for (const card of playerCards[2]) {
        const link = document.createElement('a');
        link.setAttribute('href', "#");
        link.setAttribute('class', "card-link");
        const p = document.createElement('p');
        p.innerText = card['title'];
        p.setAttribute('data-card', card['title']);
        p.classList.add("card");
        link.appendChild(p);
        playerFaceUp.appendChild(link);
    }
    
    // Number of face down
    const playerFaceDown = document.querySelector('.player-1__face-down');
    playerFaceDown.innerHTML = "";
    for (let i = 0; i < playerCards[3]; i++) {
        const link = document.createElement('a');
        link.setAttribute('href', "#");
        link.setAttribute('class', "card-link");
        const p = document.createElement('p');
        p.innerText = "? ? ?";
        p.setAttribute('data-card', "faceDown"+i);
        p.classList.add("card");
        link.appendChild(p);
        playerFaceDown.appendChild(link);
    }

    // Make cards clickable
    const allCardLinks = document.getElementsByClassName('card-link');
    for (const link of allCardLinks) {
        link.addEventListener('click', (e)=>{
            e.preventDefault();
            const cardData = e.target.dataset.card;
            axios.post('/gameAction', {roomID, userID, cardData})
            .catch(error => {
                console.log(error);
            })
        })
    };

    // UPDATE OPPONENTS SECTION
    for (const cards of opponentsCards) {
        const opponentDiv = document.querySelector(`div[data-userid="${cards[0]}"]`);
        
        // Hand
        const opponentHand = opponentDiv.querySelector('.opponent__hand');
        const handCards = document.createElement('p');
        for(let i = 0; i < cards[1]; i++) {
            handCards.innerText += "? ";
        }
        opponentHand.innerHTML = "";
        opponentHand.appendChild(handCards);
        
        // Face up
        const opponentFaceUp = opponentDiv.querySelector('.opponent__face-up');
        opponentFaceUp.innerHTML = "";
        for (const card of cards[2]) {

            const faceUpCard = document.createElement('p');
            faceUpCard.innerText = card['title'];
            faceUpCard.setAttribute('data-card', card['title']);
            faceUpCard.classList.add("card");

            opponentFaceUp.appendChild(faceUpCard);
        }
        
        // Face down
        const opponentFaceDown = opponentDiv.querySelector('.opponent__face-down');
        const faceDownCards = document.createElement('p');
        for(let i = 0; i < cards[3]; i++) {
            faceDownCards.innerText += "? ";
        }
        opponentFaceDown.innerHTML = "";
        opponentFaceDown.appendChild(faceDownCards);
    }

}