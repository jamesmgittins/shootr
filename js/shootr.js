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

var playerOneSelectedLevel = -1;
var playerOneSelectedUpgrade = -1;
var playerOneAxes = [];
var playerOneButtonsPressed = [];
var playerTwoSelectedUpgrade = -1;
var playerTwoAxes = [];
var playerTwoButtonsPressed = [];

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
		    playerShipContainer.visible = true;
		}

		if (state == states.paused) {
			$("#message-overlay").html("Game paused<br>Press start or click to continue");
			$("#message-overlay").show();
		}

		if (state == states.levelComplete) {
		    playerShipContainer.visible = false;
			var levelCompleteBonus = gameModel.currentLevel * 20 * Math.pow(1.2, gameModel.currentLevel - 1);
			if (gameModel.currentLevel == gameModel.levelsUnlocked) {
				gameModel.levelsUnlocked++;
			    $("#message-overlay").html("Level Complete!<br>Credit bonus: " + formatMoney(levelCompleteBonus) + "<br>You've unlocked level " + gameModel.levelsUnlocked + ". Press start or click to play");
			    addCredits(levelCompleteBonus);
			    changeLevel(gameModel.levelsUnlocked);
			    ShootrUI.updateUpgrades();
			} else {
			    $("#message-overlay").html("Level Complete<br>Credit bonus: " + formatMoney(levelCompleteBonus) + "<br>Press start or click to play again");
			    addCredits(levelCompleteBonus);
			}
			$("#message-overlay").fadeIn(600);
			resetGame();
		}

		if (state == states.levelFailed) {
		    playerShipContainer.visible = false;
			resetGame();
			$("#message-overlay").html("You have failed to complete the level<br>Press start or click to try again");
			$("#message-overlay").fadeIn(600);
		}
	});
}

function resetGame() {
    enemyShipContainer.removeChildren();
	Bullets.enemyBullets.resetAll();
	Bullets.playerBullets.resetAll();
	
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
    PlayerShip.playerShip.sprite.visible = true;
}
var tintOnTime = 0.1;
var tintOffTime = 0.3;
var tintFlashTime = 0;
var tintOn = false;

function update() {
    
	requestAnimationFrame(update);
	//setTimeout(update); // use instead of request animation frame to turn of v-sync

    // get time difference since last frame
    var updateTime = new Date().getTime();
    var timeDiff = (Math.min(100, Math.max(updateTime - lastUpdate, 0))) / 1000;
    lastUpdate = updateTime;

	tintFlashTime += timeDiff;
	if ((tintOn && tintFlashTime >= tintOnTime) || (tintFlashTime >= tintOffTime)) {
		tintOn = !tintOn;
		tintFlashTime = 0;
	}

	updateGamepads();

	Stars.stars.update(timeDiff);
	Stars.shipTrails.update(timeDiff);
	PlayerShip.cursor.update(timeDiff);
	
    if (currentState == states.running) {
		
        // update game state
		PlayerShip.updatePlayerShip(timeDiff);
		Bullets.updatePlayerBullets(timeDiff);
		EnemyShips.update(timeDiff);
		Bullets.updateEnemyBullets(timeDiff);
		PlayerShip.controllerPointer.update();
    }
	
	Bullets.blasts.updateBlasts(timeDiff);
	Ships.blasts.update(timeDiff);
	Bullets.explosionBits.update(timeDiff);
	Ships.explosionBits.update(timeDiff);
	Ships.fragments.update(timeDiff);
	GameText.credits.update(timeDiff);
	GameText.bigText.update(timeDiff);
	renderer.render(stage);
    PlayerShip.drawShield(shield1Ctx);

    ShootrUI.updateFps(updateTime);
}

var coords;
var stage;

var starContainer;
var bulletContainer;
var enemyShipContainer;
var playerShipContainer;
var explosionContainer;
var uiContainer;

var renderer;

function startGame() {
	
	load();

	// create game canvas
	canvas = document.getElementById('game_canvas');

	renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight, { view: canvas, backgroundColor: 0x000000 });
	
	stage = new PIXI.Container();
	
	// set interactions
	stage.interactive = true;
	stage.hitArea = new PIXI.Rectangle(0, 0, canvasWidth, canvasHeight);
	stage.defaultCursor = 'crosshair';
	stage.tap = clickCanvas;
	stage.click = clickCanvas;
	stage.mousemove = function(data){
		aimLocX = data.data.getLocalPosition(stage).x;
        aimLocY = data.data.getLocalPosition(stage).y;
		if (aimLocX < 0 || aimLocX > canvasWidth || aimLocY < 0 || aimLocY > canvasHeight) {
			aimLocX=0;
			aimLocY=0;	
		}
	};
	$("#message-overlay").off("click").on("click", function () {
	    if (currentState != states.running) {
	        changeState(states.running);
	    }
	});
	
	// create different sprite layers
	starContainer = new PIXI.Container();
	bulletContainer = new PIXI.Container();
	enemyShipContainer = new PIXI.Container();
	playerShipContainer = new PIXI.Container();
	playerShipContainer.visible=false;
	explosionContainer = new PIXI.Container();
	uiContainer = new PIXI.Container();
	
	stage.addChild(starContainer);
	stage.addChild(bulletContainer);
	stage.addChild(enemyShipContainer);
	stage.addChild(playerShipContainer);
	stage.addChild(explosionContainer);
	stage.addChild(uiContainer);
    
    shield1 = document.getElementById('p1-shield');
    shield1Ctx = shield1.getContext("2d");
    shield1.width = 100;
    shield1.height = 25;

	// init game objects and sprites
	Stars.stars.initialize();
	Stars.shipTrails.initialize();
    PlayerShip.initialize();
    PlayerShip.cursor.initialize();
    PlayerShip.controllerPointer.initialize();
    Bullets.playerBullets.initialize();
	Bullets.enemyBullets.initialize();
	Bullets.blasts.initialize();
	Ships.blasts.initialize();
	Bullets.explosionBits.initialize();
	Ships.fragments.initialize();
	Ships.explosionBits.initialize();
	
	GameText.credits.initialize();
	GameText.bigText.initialize();
	
	resetGame();

    ShootrUI.updateGamepadSelect();

    update();
    ShootrUI.updateUI();
    ShootrUI.updateUpgrades();
    changeLevel(gameModel.currentLevel);
}

function clickCanvas(data) {
    if (currentState == states.running) {
        clickLocX = data.data.getLocalPosition(stage).x;
        clickLocY = data.data.getLocalPosition(stage).y;
        aimLocX = 0;
        aimLocY = 0;
    } else {
        changeState(states.running);
    }
}

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

function updateGamepads() {
    // Update gamepad state
    if (player1Gamepad > -1 && typeof navigator.getGamepads !== 'undefined' && navigator.getGamepads()[player1Gamepad]) {

        playerOneAxes = navigator.getGamepads()[player1Gamepad].axes;
        playerOneButtons = navigator.getGamepads()[player1Gamepad].buttons;

        for (var i = 0; i < playerOneButtons.length; i++) {

            if (playerOneButtons[i].pressed) {

                if (!playerOneButtonsPressed[i]) {

                    switch (i) {
                        // start button
                        case 9:
                            if (currentState == states.running) {
                                changeState(states.paused);
                            } else {
                                changeState(states.running);
                            }
                            break;
                        // A button
                        case 0:
                            if (playerOneSelectedUpgrade > -1) {
                                setTimeout(function () {
                                    $("#p1-upgrades button.selected").trigger('click');
                                });
                                
                            } else if (playerOneSelectedLevel > -1) {
                                setTimeout(function () {
                                    $("#level-select div.selected").trigger('click');
                                });
                            }
                            break;
                        // up
                        case 12:
                            playerOneSelectedLevel = -1;
                            if (playerOneSelectedUpgrade == -1) {
                                playerOneSelectedUpgrade = 0;
                            } else {
                                playerOneSelectedUpgrade--;
                                if (playerOneSelectedUpgrade < 0)
                                    playerOneSelectedUpgrade = $('#p1-upgrades button').length - 1;
                            }
                            setTimeout(function () {
                                ShootrUI.updateUpgrades();
                                ShootrUI.renderLevelSelect();
                            });
                            break;
                        // down
                        case 13:
                            playerOneSelectedLevel = -1;
                            if (playerOneSelectedUpgrade == -1) {
                                playerOneSelectedUpgrade = 0;
                            } else {
                                playerOneSelectedUpgrade++;
                                if (playerOneSelectedUpgrade >= $('#p1-upgrades button').length)
                                    playerOneSelectedUpgrade = 0;
                            }
                            setTimeout(function () {
                                ShootrUI.updateUpgrades();
                                ShootrUI.renderLevelSelect();
                            });
                            break;
                        // left
                        case 14:
                            playerOneSelectedUpgrade = -1;
                            if (playerOneSelectedLevel == -1) {
                                playerOneSelectedLevel = gameModel.currentLevel;
                            } else {
                                playerOneSelectedLevel--;
                                if (playerOneSelectedLevel < 1)
                                    playerOneSelectedLevel = gameModel.levelsUnlocked;
                            }
                            setTimeout(function () {
                                ShootrUI.updateUpgrades();
                                ShootrUI.renderLevelSelect();
                            });
                            break;
                        // right
                        case 15:
                            playerOneSelectedUpgrade = -1;
                            if (playerOneSelectedLevel == -1) {
                                playerOneSelectedLevel = gameModel.currentLevel;
                            } else {
                                playerOneSelectedLevel++;
                                if (playerOneSelectedLevel > gameModel.levelsUnlocked)
                                    playerOneSelectedLevel = 1;
                            }
                            setTimeout(function () {
                                ShootrUI.updateUpgrades();
                                ShootrUI.renderLevelSelect();
                            });
                            break;
                    }
                }
            }
            playerOneButtonsPressed[i] = playerOneButtons[i].pressed;
        }
    }
}

startGame();
