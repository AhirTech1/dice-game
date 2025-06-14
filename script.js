'use strict';

// Menu Buttons
const btnLocal = document.querySelector('.btn1');
const btnCpu = document.querySelector('.btn2');
const btnOnline = document.querySelector('.btn3');

// Sound effects
const soundHold = new Audio('click.mp3');
const soundNew = new Audio('click2.mp3');
const soundDice = new Audio('dice.mp3');
const soundSuccess = new Audio('success.mp3');

// Selecting Elements
const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');
const score0El = document.querySelector('#score--0');
const score1El = document.getElementById('score--1');
const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');

const diceEl = document.querySelector('.dice');
const btnNew = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');

const modeSelect = document.querySelector('.mode-select');
let gameMode = 'local'; // default

let scores = [], currentScore, activePlayer, playing, isComputerGame;

const COMPUTER_HOLD_THRESHOLD = 15;

// Starting Conditions
const init = function () {
    scores = [0, 0];
    currentScore = 0;
    activePlayer = 0;
    playing = true;

    score0El.textContent = 0;
    score1El.textContent = 0;
    current0El.textContent = 0;
    current1El.textContent = 0;

    diceEl.classList.add('hidden');
    player0El.classList.remove('player--winner');
    player1El.classList.remove('player--winner');
    player0El.classList.add('player--active');
    player1El.classList.remove('player--active');

    // Enable/disable buttons based on game mode
    if (isComputerGame && activePlayer === 1) {
        btnRoll.disabled = true;
        btnHold.disabled = true;
        setTimeout(computerPlay, 1000);
    } else {
        btnRoll.disabled = false;
        btnHold.disabled = false;
    }
};

// Switch Player Function
const switchPlayer = function () {
    document.getElementById(`current--${activePlayer}`).textContent = 0;
    currentScore = 0;
    activePlayer = activePlayer === 0 ? 1 : 0;
    player0El.classList.toggle('player--active');
    player1El.classList.toggle('player--active');

    if (isComputerGame && activePlayer === 1 && playing) {
        btnRoll.disabled = true;
        btnHold.disabled = true;
        setTimeout(computerPlay, 1000);
    } else {
        btnRoll.disabled = false;
        btnHold.disabled = false;
    }
};

// Hold function
const hold = function() {
    if (playing) {
        soundHold.play();
        // 1. Add score to active player's score
        scores[activePlayer] += currentScore;
        document.getElementById(`score--${activePlayer}`).textContent = scores[activePlayer];

        // 2. Check if player's score is >= 100
        if (scores[activePlayer] >= 100) {
            soundSuccess.play();
            // Finish the game
            playing = false;
            diceEl.classList.add('hidden');
            document.querySelector(`.player--${activePlayer}`).classList.add('player--winner');
            document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');
            btnRoll.disabled = true;
            btnHold.disabled = true;
            return;
        }

        // 3. Switch to the next player
        switchPlayer();
    }
};

// New game function
const newGame = function() {
    soundNew.play();
    init();
};

// Computer play function
const computerPlay = function() {
    if (!playing) return;

    // 1. Generate random dice roll
    const dice = Math.trunc(Math.random() * 6) + 1;
    soundDice.play();

    // 2. Display dice roll
    diceEl.classList.remove('hidden');
    diceEl.src = `dice-${dice}.png`;

    // 3. Check for rolled 1
    if (dice !== 1) {
        currentScore += dice;
        document.getElementById(`current--${activePlayer}`).textContent = currentScore;

        // Decision: roll again or hold
        if (currentScore < COMPUTER_HOLD_THRESHOLD) {
            // Roll again after delay
            setTimeout(computerPlay, 1000);
        } else {
            // Hold after delay
            setTimeout(hold, 1000);
        }
    } else {
        // Switch player after delay if rolled 1
        setTimeout(switchPlayer, 1000);
    }
};

// Human play function (roll dice)
const humanRoll = function() {
    if (playing && activePlayer === 0) {
        soundDice.play();
        const dice = Math.trunc(Math.random() * 6) + 1;

        diceEl.classList.remove('hidden');
        diceEl.src = `dice-${dice}.png`;

        if (dice !== 1) {
            currentScore += dice;
            document.getElementById(`current--${activePlayer}`).textContent = currentScore;
        } else {
            switchPlayer();
        }
    }
};

// Setup event listeners for local multiplayer
const setupLocalMultiplayer = function() {
    btnRoll.addEventListener('click', function() {
        if (playing) {
            soundDice.play();
            const dice = Math.trunc(Math.random() * 6) + 1;

            diceEl.classList.remove('hidden');
            diceEl.src = `dice-${dice}.png`;

            if (dice !== 1) {
                currentScore += dice;
                document.getElementById(`current--${activePlayer}`).textContent = currentScore;
            } else {
                switchPlayer();
            }
        }
    });

    btnHold.addEventListener('click', hold);
    btnNew.addEventListener('click', newGame);
};

// Setup event listeners for vs computer
const setupComputerMode = function() {
    btnRoll.addEventListener('click', humanRoll);
    btnHold.addEventListener('click', function() {
        if (activePlayer === 0) {
            hold();
        }
    });
    btnNew.addEventListener('click', newGame);
};

// Select all buttons with class 'btns'
const buttons = document.querySelectorAll('.btns');

buttons.forEach(button => {
    button.addEventListener('click', function() {
        const btnClass = this.className.split(' ')[1];
        modeSelect.style.display = 'none';

        // Remove existing event listeners to avoid duplicates
        btnRoll.removeEventListener('click', humanRoll);
        btnHold.removeEventListener('click', hold);
        btnNew.removeEventListener('click', newGame);

        if (btnClass === 'btn1') {
            // Local multiplayer
            isComputerGame = false;
            setupLocalMultiplayer();
        } else if (btnClass === 'btn2') {
            // Vs computer
            isComputerGame = true;
            setupComputerMode();
        }

        init();
    });
});

// Initialize the game (but don't start until mode is selected)
init();
modeSelect.style.display = 'flex'; // Show mode selection initially