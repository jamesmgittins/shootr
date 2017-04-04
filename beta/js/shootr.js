var canvas;
var canvasWidth = 640;
var canvasHeight = 640;

var debug = false;

var playerTwo = false;

var enemiesToKillConstant = 50;
var enemiesKilled = 0;
var enemiesToKill = 0;

var loader;

var levelTime = 118;
// var levelTime = 10;
var timeLeft = levelTime;
var distance = 5;

var cursorPosition = {x:0,y:0};

var w = false;
var a = false;
var s = false;
var d = false;
var q = false;
var ekey = false;
var esc = false
var spaceBar = false;
var enter = false;

var states = {
	running: 0,
	paused: 1,
	waitingToStart: 2,
	levelComplete: 3,
	levelFailed: 4,
	station:5
};
var currentState = 2;

var shield1;
var shield1Ctx;

var ctx;

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
var startTint = {r:0,g:0,b:0};
var endTint = {r:0,g:0,b:0};
var inSpace = true;

function changeLevel(level) {

	var shipLevel = calculateShipLevel();

	gameModel.currentLevel = Math.max(parseInt(level), Math.floor(shipLevel * 0.9));

	var levelDifficultyModifier = Math.pow(Constants.difficultyLevelScaling, gameModel.currentLevel - 1);

	//gameModel.currentLevel = 1;

	Bullets.enemyBullets.enemyShotStrength = 2 * gameModel.currentLevel * levelDifficultyModifier;
	Bullets.enemyBullets.enemyShotSpeed = Math.min(200 + (gameModel.currentLevel * 2), 400);
	PlayerShip.playerShip.maxSpeed = 100 * gameModel.p1.ship.speed;

	if (gameModel.p1.shield) {
		PlayerShip.playerShip.maxShield = gameModel.p1.shield.capacity;
		PlayerShip.playerShip.currShield = gameModel.p1.shield.capacity;
    PlayerShip.playerShip.shieldRegen = gameModel.p1.shield.chargePerSecond;
		PlayerShip.playerShip.shieldDelay = gameModel.p1.shield.chargeDelay * 1000;
	} else {
		PlayerShip.playerShip.maxShield = 1;
		PlayerShip.playerShip.currShield = 1;
    PlayerShip.playerShip.shieldRegen = 1;
	}

	if (inSpace) {
		Stars.stars.show();
		Terrain.hide();
	} else {
		Stars.stars.hide();
		Terrain.show();
	}

	startTint = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y).tint;
	endTint = StarChart.generateStar(gameModel.targetSystem.x, gameModel.targetSystem.y).tint;

	Stars.nebulaBackground.initTexture(StarChart.generateStar(gameModel.targetSystem.x, gameModel.targetSystem.y).seed);

	EnemyShips.waveBulletFrequency = Math.max(2500 - gameModel.currentLevel, 500);
	EnemyShips.shipHealth = (10 * gameModel.currentLevel * levelDifficultyModifier) - 5 + gameModel.currentLevel;
	EnemyShips.maxBulletsPerShot = Math.min(10, gameModel.currentLevel / 5);
	enemiesKilled = 0;
	enemiesToKill = enemiesToKillConstant + Math.floor(gameModel.currentLevel / 5);
	Boss.health = EnemyShips.shipHealth * 100;
	Boss.initialized = false;

	distance = StarChart.distanceBetweenStars(gameModel.currentSystem.x,gameModel.currentSystem.y, gameModel.targetSystem.x, gameModel.targetSystem.y);
	resetGame();
	save();
}

function systemsEqual(systemA, systemB) {
	return systemA.x == systemB.x && systemA.y == systemB.y;
}

function addToHistory(systemA, systemB) {
	var alreadyInHistory = false;

	gameModel.history.forEach(function(history){
		if ((systemsEqual(history.start, systemA) && systemsEqual(history.end, systemB)) ||
			 (systemsEqual(history.start, systemB) && systemsEqual(history.end, systemA))) {
			alreadyInHistory = true;
		}
	})

	if (!alreadyInHistory) {
		gameModel.history.push({start:systemA,end:systemB});
	}
}

function changeState(state) {

	setTimeout(function(){
		currentState = state;

		Sounds.music.pause();

		if (state == states.running) {
		  stageSprite.visible=true;
		  playerShipContainer.visible = true;
			bulletContainer.visible = true;
			GameText.status.show();
			GameText.levelComplete.hide();
			Sounds.music.play();
		}

		if (state == states.paused) {
			PauseMenu.show();
		}

		if (state == states.levelComplete) {
			GameText.status.hide();
			playerShipContainer.visible = false;
			bulletContainer.visible = false;
			GameText.levelComplete.show();
			Sounds.winChimes.play();
			Boss.shield.hide();

			if (Boss.isInTargetSystem()) {
				gameModel.bossesDefeated++;
				Boss.randomLocation();
			}

			gameModel.lootCollected.forEach(function(item) {
				if (item.type == Constants.itemTypes.weapon)
					gameModel.p1.weapons.push(item);
				if (item.type == Constants.itemTypes.shield)
					gameModel.p1.shields.push(item);
			});

			addToHistory(gameModel.currentSystem, gameModel.targetSystem);
			gameModel.currentSystem = gameModel.targetSystem;
			gameModel.timeStep++;
			gameModel.purchaseHistory = [];
			addCredits(gameModel.p1.temporaryCredits);
			gameModel.p1.temporaryCredits = 0;
			save();
			Sounds.music.reset();
		}

		if (state == states.station) {

			stageSprite.visible=false;
			GameText.status.hide();
			GameText.levelComplete.hide();
			resetGame();
			StationMenu.show();
			save();
		}

		if (state == states.levelFailed) {
			Boss.shield.hide();
			Sounds.music.reset();
		  playerShipContainer.visible = false;
			stageSprite.visible=false;
			GameText.status.hide();

			DeathMenu.show();

			if (Boss.bossActive()) {
				Boss.nudgeLocation();
				save();
			}

			resetGame();
		}
	});
}

function resetGame() {
	Bullets.enemyBullets.resetAll();
	Weapons.reset();
	Powerups.reset();

	EnemyShips.waves = [];
	enemiesKilled = 0;
	enemiesToKill = enemiesToKillConstant + Math.floor(gameModel.currentLevel / 2);
	EnemyShips.allDeadTimer = 0;

	EnemyShips.discardedSprites = [];
	EnemyShips.sprites.forEach(function(sprite){
		sprite.visible = false;
		EnemyShips.discardedSprites.push(sprite);
	})

	timeLeft = levelTime;
	PlayerShip.reset();
	Stars.StartEndStars.sprite.visible = false;
	gameModel.lootCollected = [];
	GameText.status.lootIcons = [];
	GameText.levelComplete.lootLayouts = [];
	gameModel.p1.temporaryCredits = 0;

	for (var i = 0; i < Bullets.enemyBullets.maxEnemyBullets; i++) {
		Bullets.enemyBullets.inPlay[i] = 0;
	}
	for (var i = 0; i < EnemyShips.wavePatterns.length; i++) {
		EnemyShips.wavePatterns[i].inUse = false;
	}
	destroyedWarning = false;
	PlayerShip.playerShip.sprite.visible = true;
}

var tintPercent = 0;
var tintNumber = 0;
var vSyncOff = false;
var startTintPercentOnBackground = 1.50;

var animationFrameId;

function update() {

		if (vSyncOff)
			animationFrameId = setTimeout(update);
		else
			animationFrameId = requestAnimationFrame(update);

		// get time difference since last frame
		var updateTime = new Date().getTime();
		var slowDownRatio = 1 - (stageSprite.screenShake / gameModel.maxScreenShake * 0.3);
		var timeDiff = slowDownRatio * (Math.min(100, Math.max(updateTime - lastUpdate, 0))) / 1000;
		lastUpdate = updateTime;

		tintNumber += timeDiff * 6;
		tintPercent = Math.abs(Math.sin(tintNumber));

		updateGamepads();

		Stars.stars.update(timeDiff);
		Stars.nebulaBackground.update(timeDiff);
		Stars.shipTrails.update(timeDiff);
	// 	PlayerShip.cursor.update(timeDiff);

		if (currentState == states.running) {

			timeLeft -= timeDiff;

			var percentageOfStartTint = Math.min(0.1,Math.max(timeLeft / levelTime - 0.9,0)) * startTintPercentOnBackground;
			var percentageOfEndTint = Math.min(0.1,Math.max(0.1 - timeLeft / levelTime,0)) * startTintPercentOnBackground;

			stageBackground.tint = rgbToHex(
				Math.round(startTint.r * percentageOfStartTint) + Math.round(endTint.r * percentageOfEndTint),
				Math.round(startTint.g * percentageOfStartTint) + Math.round(endTint.g * percentageOfEndTint),
				Math.round(startTint.b * percentageOfStartTint) + Math.round(endTint.b * percentageOfEndTint));

			// update game state
	// 		Terrain.update(timeDiff);
			PlayerShip.updatePlayerShip(timeDiff);
			EnemyShips.update(timeDiff);
			Weapons.update(timeDiff);
			Bullets.updateEnemyBullets(timeDiff);
			PlayerShip.controllerPointer.update();
			Powerups.update(timeDiff);

			stageSprite.screenShake = Math.min(stageSprite.screenShake, gameModel.maxScreenShake);

			if (stageSprite.screenShake > 0) {
				stageSprite.position.x = ((canvas.width - canvas.height) / 2) - (scalingFactor * stageSprite.screenShake ) + (Math.random() * scalingFactor * stageSprite.screenShake  * 2);
				stageSprite.position.y = 0 - (scalingFactor * stageSprite.screenShake ) + (Math.random() * scalingFactor * stageSprite.screenShake  * 2);
				stageSprite.screenShake -= timeDiff * 30;
			} else {
				stageSprite.position.x = (canvas.width - canvas.height) / 2;
				stageSprite.position.y = 0;
			}
		}

		GameText.update(timeDiff);

		Bullets.blasts.updateBlasts(timeDiff);
		Bullets.splashDamage.update(timeDiff);
		Ships.blasts.update(timeDiff);
		Bullets.explosionBits.update(timeDiff);
		Ships.explosionBits.update(timeDiff);
		Ships.fragments.update(timeDiff);

		ShootrUI.updateFps(updateTime);

		renderer.render(stage, stageTexture);

		StarChart.update(timeDiff);
		Shipyard.update(timeDiff);

		renderer.render(gameContainer);

}

var coords;
var stage;

var starContainer;
var bulletContainer;
var enemyShipContainer;
var playerShipContainer;
var explosionContainer;
var uiContainer;

var gameContainer;

var stageTexture;
var stageSprite;
var stageBackground;

var renderer;

var scalingFactor = 1;
var resolutionFactor = 1;
var resizeTimeout;

function updateAfterScreenSizeChange() {
	if (vSyncOff) {
		clearTimeout(animationFrameId);
	} else {
		cancelAnimationFrame(animationFrameId);
	}

	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(function(){
		resizeElements();

		if (vSyncOff) {
			animationFrameId = setTimeout(update);
		} else {
			animationFrameId = requestAnimationFrame(update);
		}
	}, 100);
}

var minAspectRatio = 16 / 10
var maxAspectRatio = 21 / 9;

function resizeCanvas() {
	canvas = document.getElementById('game_canvas');

	var height = window.innerHeight;
	var width = window.innerWidth;

	if (width / height > maxAspectRatio) {
		width = height * maxAspectRatio;
	}
	if (width / height < minAspectRatio) {
		// width = height * minAspectRatio;
		height = width / minAspectRatio;
	}

	canvas.style.width = Math.round(width) + "px";
	canvas.style.height = Math.round(height) + "px";

	canvas.width=width * resolutionFactor;
	canvas.height=height * resolutionFactor;

	if (renderer)
		renderer.resize(canvas.width, canvas.height);
	else
		renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height, { view: canvas, backgroundColor: 0x000900, antialias:gameModel.antialiasing });

	scalingFactor = canvas.height / 640;

}

function resizeElements() {

	resizeCanvas()

	stageTexture.resize(canvas.height, canvas.height, false);

	resizeBackgroundSprite();
	stageBackgroundCreate();

	stageSprite.height = canvas.height;
	stageSprite.width = canvas.height;

	stageSprite.position.x = (canvas.width - canvas.height) / 2;
	PlayerShip.updateSize();
	PlayerShip.controllerPointer.resize();
	Powerups.resize();
	Bullets.playerBullets.initialize();
	Bullets.enemyBullets.initialize();
	GameText.resize();
	gameContainer.hitArea = new PIXI.Rectangle(0, 0, canvas.width, canvas.height);
	ResizeMenus();
}

function stageBackgroundCreate() {
	if (stageBackground)
		stageBackground.clear();
	else
		stageBackground = new PIXI.Graphics();

	stageBackground.beginFill(0xFFFFFF);
  stageBackground.drawRect(0, 0, stageTexture.width, stageTexture.height);

	stageBackground.tint = rgbToHex(10,10,10);
// 	stageBackground.tint = calculateTintFromString("#E65100");
}

function startGame() {

	load();

	resizeCanvas();

	window.addEventListener("resize",updateAfterScreenSizeChange);

	PlayerShip.setBackgroundFromShipColor();

	// stageTexture = new PIXI.RenderTexture(renderer, canvas.height, canvas.height);
	stageTexture = PIXI.RenderTexture.create(canvas.height, canvas.height);
	stageSprite = new PIXI.Sprite(stageTexture);
	stageSprite.height = canvas.height;
	stageSprite.width = canvas.height;
	stageSprite.position.x = (canvas.width - canvas.height) / 2;
	stageSprite.screenShake = 1;
	gameContainer = new PIXI.Container();
	stageSprite.visible=false;

	gameContainer.addChild(getBackgroundSprite());

	gameContainer.addChild(stageSprite);

	stage = new PIXI.Container();

	stageBackgroundCreate();
	stage.addChild(stageBackground);

	// set interactions
	gameContainer.interactive = true;
	gameContainer.hitArea = new PIXI.Rectangle(0, 0, canvas.width, canvas.height);
	gameContainer.tap = clickCanvas;
	gameContainer.click = clickCanvas;
	gameContainer.mousedown = function(data) {
		setLastUsedInput(inputTypes.mouseKeyboard);
		window.focus();
		StarChart.mousedown(data);
	};
	gameContainer.mouseup = function(data) {
		setLastUsedInput(inputTypes.mouseKeyboard);
		StarChart.mouseup(data);
	};
	gameContainer.mousemove = function(data){
		setLastUsedInput(inputTypes.mouseKeyboard);
		aimLocX = data.data.getLocalPosition(stageSprite).x;
    aimLocY = data.data.getLocalPosition(stageSprite).y;
		cursorPosition = data.data.getLocalPosition(gameContainer);
		StarChart.mousemove(data);
		CheckForMenuMouseOver();
		if (aimLocX < 0 || aimLocX > stageSprite.width || aimLocY < 0 || aimLocY > stageSprite.height) {
			aimLocX=0;
			aimLocY=0;
		}
	};
	document.addEventListener("mousewheel", mouseWheelHandler, false);
	document.addEventListener("DOMMouseScroll", mouseWheelHandler, false);

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

	// init game objects and sprites

	Stars.nebulaBackground.initTexture(1);
	Stars.stars.initialize();
	Stars.shipTrails.initialize();
  PlayerShip.initialize();
// 	Terrain.initialize();

  PlayerShip.controllerPointer.initialize();
  Bullets.playerBullets.initialize();
	Bullets.enemyBullets.initialize();
	Bullets.blasts.initialize();
	Ships.blasts.initialize();
	Bullets.explosionBits.initialize();
	Ships.fragments.initialize();
	Ships.explosionBits.initialize();
	Powerups.initialize();

	GameText.initialize();

	resetGame();

  ShootrUI.updateGamepadSelect();

	InitializeMenus();

	if (!gameModel.bossPosition) {
		Boss.randomLocation();
	}

	MainMenu.show();
// 	PlayerShip.cursor.initialize();

  update();
  changeLevel(gameModel.currentLevel);

}

window.onload = function() {
	loader = PIXI.loader
		.add("fonts/dosis-v6-latin-300.woff2")
		.add("fonts/dosis-v6-latin-300.woff")
		.add("fonts/dosis-v6-latin-300.ttf")
		.add("fonts/dosis-v6-latin-300.eot")
		.add("fonts/dosis-v6-latin-300.svg")
		.load(startGame);
	// startGame();
};
