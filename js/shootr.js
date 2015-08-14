var canvas;
var canvasWidth = 480;
var canvasHeight = 640;

var debug = false;

var playerTwo = false;

var enemiesToKillConstant = 20;
var enemiesKilled = 0;
var enemiesToKill = 0;

var w = false;
var a = false;
var s = false;
var d = false;

var states = {
    running: 0,
    paused: 1,
    waitingToStart: 2,
    levelComplete: 3,
    levelFailed: 4
};
var currentState = 2;

var shield1;
var shield1Ctx;

var ctx;
var canvasData;
var canvasDataArr;

var clickLocX, clickLocY;
var aimLocX, aimLocY;

var lastUpdate = 0;
var playerOneAxes = [];
var playerTwoAxes = [];

function changeLevel(level) {
    gameModel.currentLevel = parseInt(level);
    ShootrUI.renderLevelSelect();

    var levelDifficultyModifier = Math.pow(1.2, gameModel.currentLevel - 1);
	
    Bullets.enemyBullets.enemyShotStrength = gameModel.currentLevel * levelDifficultyModifier;
	Bullets.enemyBullets.enemyShotSpeed = 100 + (gameModel.currentLevel * 2);
	EnemyShips.waveBulletFrequency = 3000 - gameModel.currentLevel;
	EnemyShips.shipHealth = 2 * gameModel.currentLevel * levelDifficultyModifier;
	enemiesKilled = 0;
	enemiesToKill = enemiesToKillConstant + Math.floor(gameModel.currentLevel / 5);
	if (gameModel.currentLevel != gameModel.levelsUnlocked)
	    enemiesToKill *= 5;
	resetGame();
	save();
}

function changeState(state) {
	
	setTimeout(function(){
		currentState = state;

		if (state == states.running) {
			$("#message-overlay").fadeOut();
		}

		if (state == states.paused) {
			$("#message-overlay").html("Game paused<br>Press start or click to continue");
			$("#message-overlay").show();
		}

		if (state == states.levelComplete) {
			if (gameModel.currentLevel == gameModel.levelsUnlocked) {
				gameModel.levelsUnlocked++;
			    $("#message-overlay").html("Level Complete!<br>Credit bonus: " + formatMoney(gameModel.currentLevel * 100) + "<br>You've unlocked level " + gameModel.levelsUnlocked + ". Press start or click to play");
			    addCredits((gameModel.currentLevel * 100));
			    changeLevel(gameModel.levelsUnlocked);
			    ShootrUI.updateUpgrades();
			} else {
			    $("#message-overlay").html("Level Complete<br>Credit bonus: " + formatMoney(gameModel.currentLevel * 100) + "<br>Press start or click to play again");
			    addCredits((gameModel.currentLevel * 100));
			}
			$("#message-overlay").fadeIn(600);
			resetGame();
		}

		if (state == states.levelFailed) {
			resetGame();
			$("#message-overlay").html("You have failed to complete the level<br>Press start or click to try again");
			$("#message-overlay").fadeIn(600);
		}
	});
}

function resetGame() {
    EnemyShips.waves = [];
	enemiesKilled = 0;
	enemiesToKill = enemiesToKillConstant + Math.floor(gameModel.currentLevel / 2);
	EnemyShips.allDeadTimer = 0;
	if (gameModel.currentLevel != gameModel.levelsUnlocked)
	    enemiesToKill *= 5;
    PlayerShip.playerShip.currShield = PlayerShip.playerShip.maxShield;
    PlayerShip.playerShip.xLoc = canvasWidth / 2;
    PlayerShip.playerShip.yLoc = canvasHeight - (canvasHeight / 6);
    PlayerShip.playerShip.inPlay = 1;
    PlayerShip.allPlayersDead = 0;
    PlayerShip.allDeadAllDeadTimer = 0;

    for (var i = 0; i < Bullets.enemyBullets.maxEnemyBullets; i++) {
        Bullets.enemyBullets.inPlay[i] = 0;
    }
    for (var i = 0; i < Bullets.playerBullets.maxPlayerBullets; i++) {
        Bullets.playerBullets.inPlay[i] = 0;
    }
    for (var i = 0; i < EnemyShips.wavePatterns.length; i++) {
        EnemyShips.wavePatterns[i].inUse = false;
    }
    $("#p1-shield-div").removeClass("destroyed");
    destroyedWarning = false;
}

function update() {
    
	requestAnimationFrame(update);
	//setTimeout(update); // use instead of request animation frame to turn of v-sync

    // get time difference since last frame
    var updateTime = new Date().getTime();
    var timeDiff = (Math.min(100, Math.max(updateTime - lastUpdate, 0))) / 1000;
    lastUpdate = updateTime;

    // Update gamepad state
    if (player1Gamepad > -1 && typeof navigator.getGamepads !== 'undefined' && navigator.getGamepads()[player1Gamepad]) {
        playerOneAxes = navigator.getGamepads()[player1Gamepad].axes;
    }

    if (currentState == states.running) {
        // update game state
        PlayerShip.updatePlayerShip(timeDiff);

        Bullets.updatePlayerBullets(timeDiff);

        EnemyShips.update(timeDiff);

        Bullets.updateEnemyBullets(timeDiff);
    }
    
    //resetCanvas();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // render current game state
	Stars.drawStars(timeDiff);

	if (currentState == states.running || currentState == states.paused) {
	    Stars.drawShipTrails(timeDiff);
	    Stars.drawExplosions(timeDiff);
	}

	//ctx.putImageData(canvasData, 0, 0);

	if (currentState == states.running || currentState == states.paused) {
	
	    Bullets.drawPlayerBullets();
        EnemyShips.drawShips(ctx, timeDiff);
	    EnemyShips.drawShipFragments(ctx, timeDiff);
	    PlayerShip.drawPlayerShipLine(ctx);
	    PlayerShip.drawPlayerShip(ctx, timeDiff);
	    PlayerShip.drawShield(shield1Ctx);
	}
    ShootrUI.updateFps(updateTime);
}

function resetCanvas() {
	// reset canvas data
	var len = canvasWidth * canvasHeight * 4;
	for (var i =3; i < len; i+=4) {
		if (canvasDataArr[i] !== 0)
			canvasDataArr[i] = 0;
	}
}

var coords;

function startGame() {
	
	load();

	// create game canvas
	canvas = document.getElementById('game_canvas');
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx = canvas.getContext("2d");

    shield1 = document.getElementById('p1-shield');
    shield1Ctx = shield1.getContext("2d");
    shield1.width = 100;
    shield1.height = 25;
		
    canvasData = ctx.createImageData(canvasWidth, canvasHeight);
	canvasDataArr = canvasData.data;

	canvas.addEventListener('click', function (event) {
	    if (currentState == states.running) {
	        coords = canvas.relMouseCoords(event);
	        clickLocX = coords.x;
	        clickLocY = coords.y;
	        aimLocX = 0;
	        aimLocY = 0;
	    } else {
	        changeState(states.running);
	    }
	});
	canvas.addEventListener("mousemove", function (event) {
	    coords = canvas.relMouseCoords(event);
	    aimLocX = coords.x;
	    aimLocY = coords.y;
	});
	canvas.addEventListener("mouseout", function (event) {
	    aimLocX = 0;
	    aimLocY = 0;
	});
	canvas.addEventListener("touchend", function (event) {
	    aimLocX = 0;
	    aimLocY = 0;
	});

	$("#message-overlay").off("click").on("click", function () {
	    $("#game_canvas").trigger("click");
	});
	
    Stars.resetStars();
    
    PlayerShip.playerShip.art = Ships.shipArt(PlayerShip.SHIP_SIZE, PlayerShip.playerShip.seed, false, Ships.playerColors[Math.floor(Math.random() * Ships.playerColors.length)]);
    PlayerShip.playerShip.xLoc = canvasWidth / 2;
    PlayerShip.playerShip.yLoc = canvasHeight - (canvasHeight / 6);
    PlayerShip.playerShip.shipTrail = new Stars.shipTrail(PlayerShip.playerShip);
	
	resetGame();

    ShootrUI.updateGamepadSelect();

    update();
    ShootrUI.updateUI();
    ShootrUI.updateUpgrades();
    changeLevel(gameModel.currentLevel);
}

startGame();

window.onkeydown = function (e) {
    switch (e.keyCode) {
        case 87:
            w = true;
            break;
        case 65:
            a = true;
            break;
        case 83:
            s = true;
            break;
        case 68:
            d = true;
            break;
        case 38:
            w = true;
            break;
        case 37:
            a = true;
            break;
        case 40:
            s = true;
            break;
        case 39:
            d = true;
            break;
        default:
            return true;
    }
    return false;
};

window.onkeyup = function (e) {
    switch (e.keyCode) {
        case 87:
            w = false;
            break;
        case 65:
            a = false;
            break;
        case 83:
            s = false;
            break;
        case 68:
            d = false;
            break;
        case 38:
            w = false;
            break;
        case 37:
            a = false;
            break;
        case 40:
            s = false;
            break;
        case 39:
            d = false;
            break;
        default:
            return true;
    }
    return false;
};