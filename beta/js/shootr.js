var canvas;
var canvasWidth = 640;
var canvasHeight = 640;

var debug = false;

var playerTwo = false;

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
var esc = false;
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
var inSpace = true;

var startStar;
var endStar;

function changeLevel(level) {

	gameModel.currentLevel = Boss.isInTargetSystem() ? Math.max(starLevelModify(Boss.currentLevel()), calculateAdjustedStarLevel(level)) : calculateAdjustedStarLevel(level);

	var levelDifficultyModifier = Math.pow(Constants.difficultyLevelScaling, gameModel.currentLevel - 1);

	//gameModel.currentLevel = 1;

	Bullets.enemyBullets.enemyShotStrength = 2 * gameModel.currentLevel * levelDifficultyModifier;
	Bullets.enemyBullets.enemyShotSpeed = Math.min(200 + (gameModel.currentLevel * 2), 400);
	PlayerShip.playerShip.maxSpeed = getUpgradedSpeed();

	if (gameModel.p1.shield) {
		PlayerShip.playerShip.maxShield = gameModel.p1.shield.capacity;
		PlayerShip.playerShip.currShield = gameModel.p1.shield.capacity;
    PlayerShip.playerShip.shieldRegen = gameModel.p1.shield.chargePerSecond;
		PlayerShip.playerShip.shieldDelay = gameModel.p1.shield.chargeDelay * 1000;
	} else {
		PlayerShip.playerShip.maxShield = 1;
		PlayerShip.playerShip.currShield = 1;
    PlayerShip.playerShip.shieldRegen = 1;
		PlayerShip.playerShip.shieldDelay = 5000;
	}

	if (inSpace) {
		Stars.stars.show();
		Terrain.hide();
	} else {
		Stars.stars.hide();
		Terrain.show();
	}

	startStar = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y);
	endStar = StarChart.generateStar(gameModel.targetSystem.x, gameModel.targetSystem.y);

	Stars.nebulaBackground.initTexture(StarChart.generateStar(gameModel.targetSystem.x, gameModel.targetSystem.y).seed);

	EnemyShips.waveBulletFrequency = Math.max(2500 - gameModel.currentLevel, 500);
	EnemyShips.shipHealth = (10 * gameModel.currentLevel * levelDifficultyModifier) - 5 + gameModel.currentLevel;
	EnemyShips.maxBulletsPerShot = Math.min(8, gameModel.currentLevel / 7);
	Boss.health = EnemyShips.shipHealth * 100;
	Boss.initialized = false;

	distance = StarChart.distanceBetweenStars(gameModel.currentSystem.x,gameModel.currentSystem.y, gameModel.targetSystem.x, gameModel.targetSystem.y);
	resetGame();
	save();
}

function systemsEqual(systemA, systemB) {
	return systemA.x == systemB.x && systemA.y == systemB.y;
}

function changeState(state) {

	setTimeout(function(){
		currentState = state;



		Enemies.activeShips = [];

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
			Sounds.music.pause();
		}

		if (state == states.levelComplete) {
			GameText.status.hide();
			playerShipContainer.visible = false;
			bulletContainer.visible = false;
			GameText.levelComplete.show();
			Sounds.music.fadeOut();
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

		}

		if (state == states.station) {
			Sounds.music.reset();
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
	Weapons.reset();
	Powerups.reset();
	Boss.reset();
	Enemies.reset();



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
	for (var j = 0; j < EnemyShips.wavePatterns.length; j++) {
		EnemyShips.wavePatterns[j].inUse = false;
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
		var slowDownRatio = gameModel.maxScreenShake ? 1 - (stageSprite.screenShake / gameModel.maxScreenShake * 0.3) : 1;
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
				Math.round(startStar.tint.r * percentageOfStartTint) + Math.round(endStar.tint.r * percentageOfEndTint),
				Math.round(startStar.tint.g * percentageOfStartTint) + Math.round(endStar.tint.g * percentageOfEndTint),
				Math.round(startStar.tint.b * percentageOfStartTint) + Math.round(endStar.tint.b * percentageOfEndTint)
			);

			// update game state
	// 		Terrain.update(timeDiff);
			PlayerShip.updatePlayerShip(timeDiff);
			Enemies.update(timeDiff);
			Weapons.update(timeDiff);
			Bullets.enemyBullets.update(timeDiff);
			PlayerShip.controllerPointer.update();
			Powerups.update(timeDiff);

			stageSprite.screenShake = Math.min(stageSprite.screenShake, gameModel.maxScreenShake);
			updateScreenShake(timeDiff);

			ShootrUI.updateFps(updateTime);
		} else {
			MainMenu.updateAll(timeDiff);
		}

		GameText.update(timeDiff);
		Stars.powerupParts.update(timeDiff);
		Bullets.blasts.updateBlasts(timeDiff);
		Bullets.splashDamage.update(timeDiff);
		Ships.blasts.update(timeDiff);
		Bullets.explosionBits.update(timeDiff);
		Ships.explosionBits.update(timeDiff);
		Ships.fragments.update(timeDiff);

		renderer.render(stage, stageTexture);
		renderer.render(gameContainer);
}

var screenShakeXrate = 20;
var screenShakeYrate = 18;

var updateScreenShake =  function(timeDiff) {
	if (stageSprite.screenShake > 0) {
		if (!stageSprite.screenShakeSins) {
			stageSprite.screenShakeSins = {x:0, y:0.5};
		}

		stageSprite.screenShakeSins.x += timeDiff * screenShakeXrate;
		stageSprite.screenShakeSins.y += timeDiff * screenShakeYrate;

		stageSprite.position.x = ((canvas.width - canvas.height) / 2) + (Math.sin(stageSprite.screenShakeSins.x) * scalingFactor * stageSprite.screenShake);
		stageSprite.position.y = Math.sin(stageSprite.screenShakeSins.y) * scalingFactor * stageSprite.screenShake;
		stageSprite.screenShake -= timeDiff * 30;
	} else {
		stageSprite.position.x = (canvas.width - canvas.height) / 2;
		stageSprite.position.y = 0;
	}
};

var coords;
var stage;

var starContainer;
var bulletContainer;
var playerBulletContainer;
var enemyShipContainer;
var backgroundEnemyContainer;
var frontEnemyContainer;
var powerupContainer;
var playerShipContainer;
var explosionContainer;
var uiContainer;

var gameContainer;

var stageTexture;
var stageSprite;
var stageBackground;

var renderer;

var scalingFactor = 1;
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

var minAspectRatio = 16 / 10;
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

	canvas.width=width * gameModel.resolutionFactor;
	canvas.height=height * gameModel.resolutionFactor;

	if (renderer)
		renderer.resize(canvas.width, canvas.height);
	else
		renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height, { view: canvas, backgroundColor: 0x000900, antialias:gameModel.antialiasing });

	scalingFactor = canvas.height / 640;

}

function resizeElements() {
	blurFilters = false;
	resizeCanvas();

	stageTexture.resize(canvas.height, canvas.height, false);

	resizeBackgroundSprite();
	stageBackgroundCreate();

	stageSprite.height = canvas.height;
	stageSprite.width = canvas.height;

	stageSprite.position.x = (canvas.width - canvas.height) / 2;
	PlayerShip.updateSize();
	PlayerShip.controllerPointer.resize();
	Powerups.resize();
	Weapons.reset();
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

	var loadMessage = document.getElementById("loading-message");
	loadMessage.parentNode.removeChild(loadMessage);

	window.addEventListener("resize",updateAfterScreenSizeChange);

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
		aimLocX = data.data.getLocalPosition(gameContainer).x;
    aimLocY = data.data.getLocalPosition(gameContainer).y;
		cursorPosition = data.data.getLocalPosition(gameContainer);
		StarChart.mousemove(data);
		CheckForMenuMouseOver();
	};
	document.addEventListener("mousewheel", mouseWheelHandler, false);
	document.addEventListener("DOMMouseScroll", mouseWheelHandler, false);

	// create different sprite layers
	starContainer = new PIXI.Container();
	bulletContainer = new PIXI.Container();
	playerBulletContainer = new PIXI.Container();
	enemyShipContainer = new PIXI.Container();
	backgroundEnemyContainer = new PIXI.Container();
	frontEnemyContainer = new PIXI.Container();

	enemyShipContainer.addChild(backgroundEnemyContainer);
	enemyShipContainer.addChild(bulletContainer);
	enemyShipContainer.addChild(frontEnemyContainer);
	powerupContainer = new PIXI.Container();
	playerShipContainer = new PIXI.Container();
	playerShipContainer.visible=false;
	explosionContainer = new PIXI.Container();
	uiContainer = new PIXI.Container();

	stage.addChild(starContainer);
	stage.addChild(enemyShipContainer);
	stage.addChild(powerupContainer);
	stage.addChild(playerBulletContainer);
	stage.addChild(playerShipContainer);
	stage.addChild(explosionContainer);
	stage.addChild(uiContainer);

	// init game objects and sprites

	Stars.nebulaBackground.initTexture(1);
	Stars.stars.initialize();
  PlayerShip.initialize();
// 	Terrain.initialize();

  PlayerShip.controllerPointer.initialize();
	Ships.blasts.initialize();
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
		// .add("fonts/dosis-v6-latin-300.woff2")
		// .add("fonts/dosis-v6-latin-300.woff")
		.add("fonts/dosis-v6-latin-300.ttf")
		// .add("fonts/dosis-v6-latin-300.eot")
		// .add("fonts/dosis-v6-latin-300.svg")
		// .add("fonts/NotoSans-Regular.ttf")
		// .add("fonts/NotoSans-Bold.ttf")
		.add("img/perspective-dice-random.svg")
		.add("img/sapphire.svg")
		.add("img/diamond.svg")
		.add("img/hot-dog-icon.svg")
		// .add("img/level-one.svg")
		// .add("img/level-two.svg")
		// .add("img/level-three.svg")
		// .add("img/target-laser.svg")
		// .add("img/barbed-arrow.svg")
		// .add("img/blaster.svg")
		// .add("img/shield.svg")
		.add("img/ship-emblem.svg")
		.load(startGame);

	// loader.onProgress.add(function(){
	// 	document.getElementById("loading-message").innerText += ".";
	// });
	// startGame();
};
