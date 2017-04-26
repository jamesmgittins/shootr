var PlayerShip = {};

PlayerShip.allPlayersDead = 0;
PlayerShip.allDeadTimer = 0;
PlayerShip.allDeadTime = 3000;

PlayerShip.SHIP_SIZE = 64;

PlayerShip.controllerPointer = {
	initialize: function () {
		var blast = document.createElement('canvas');
		blast.width = 10 * scalingFactor;
		blast.height = 16 * scalingFactor;
		var blastCtx = blast.getContext('2d');

		blastCtx.lineWidth = 2 * scalingFactor;

		drawline(blastCtx, "#0b0", 1, 1, 9 * scalingFactor, 8 * scalingFactor);
		drawline(blastCtx, "#0b0", 1, 15 * scalingFactor, 9 * scalingFactor, 8 * scalingFactor);

		PlayerShip.controllerPointer.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(blast));
		PlayerShip.controllerPointer.sprite.anchor = { x: -6, y: 0.5 };
		PlayerShip.controllerPointer.sprite.visible = false;
		uiContainer.addChild(PlayerShip.controllerPointer.sprite);
	},
	resize : function() {
		uiContainer.removeChild(PlayerShip.controllerPointer.sprite);
		PlayerShip.controllerPointer.sprite.destroy();
		PlayerShip.controllerPointer.initialize();
	},
	update: function (timeDiff) {
		if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {

			PlayerShip.controllerPointer.sprite.position.x = PlayerShip.playerShip.xLoc * scalingFactor;
			PlayerShip.controllerPointer.sprite.position.y = PlayerShip.playerShip.yLoc * scalingFactor;
			PlayerShip.controllerPointer.sprite.rotation = Math.atan2(playerOneAxes[3], playerOneAxes[2]);
			PlayerShip.controllerPointer.sprite.visible = true;
		} else {
			PlayerShip.controllerPointer.sprite.visible = false;
		}
	}
};



PlayerShip.playerShip = {
  seed: 1,
  xLoc: 320,
  yLoc: 480,
  maxSpeed: 100,
  offset: PlayerShip.SHIP_SIZE / 2,
  rotation: 0,
  maxShield: 10,
  currShield: 10,
  shieldRegen: 2,
  shieldDelay: 5000,
  lastDmg: 0,
  inPlay: 1,
	charge:0,
	lastTrail:0,
	spreadShot: 0,
	crossShot: 0,
  powerupTime:0
};



PlayerShip.updatePlayerShip = function (timeDiff) {

    if (PlayerShip.allPlayersDead === 1) {
        PlayerShip.allDeadTimer += (timeDiff * 1000);
        if (PlayerShip.allDeadTimer > PlayerShip.allDeadTime) {
            changeState(states.levelFailed);
        }
        return;
    }

		PlayerShip.playerShip.rolling += timeDiff;

    PlayerShip.playerShip.powerupTime += timeDiff;
    if (PlayerShip.playerShip.powerupTime >= Powerups.powerupLength) {
        PlayerShip.playerShip.spreadShot = 0;
        PlayerShip.playerShip.crossShot = 0;
    }

		// Player has been bumped by collision
		if (PlayerShip.playerShip.bumpMagnitude) {

			var bumpAmountX = PlayerShip.playerShip.bumpSpeedX * PlayerShip.playerShip.bumpMagnitude /  PlayerShip.playerShip.bumpMagMulti * timeDiff;
			var bumpAmountY = PlayerShip.playerShip.bumpSpeedY * PlayerShip.playerShip.bumpMagnitude /  PlayerShip.playerShip.bumpMagMulti * timeDiff;

			if (PlayerShip.playerShip.xLoc + bumpAmountX > boundry && PlayerShip.playerShip.xLoc + bumpAmountX < canvasWidth - boundry)
	        PlayerShip.playerShip.xLoc += bumpAmountX;
	    if (PlayerShip.playerShip.yLoc + bumpAmountY > boundry && PlayerShip.playerShip.yLoc + bumpAmountY < canvasHeight - boundry)
	        PlayerShip.playerShip.yLoc += bumpAmountY;

			PlayerShip.playerShip.bumpMagnitude -= 1000 * timeDiff;

			PlayerShip.playerShip.xSpeed = 0;
			PlayerShip.playerShip.ySpeed = 0;

			if (PlayerShip.playerShip.bumpMagnitude < 0) {
				PlayerShip.playerShip.bumpMagnitude = 0;
			}
		} else {
			if (PlayerShip.playerShip.rolling < 0.3) {
				PlayerShip.playerShip.engine1.alpha = PlayerShip.playerShip.engine2.alpha = 0;
				if (PlayerShip.playerShip.rollingLeft) {
					Ships.updateShipSpeed(PlayerShip.playerShip, -1, 0, timeDiff * 2.5);
				} else {
					Ships.updateShipSpeed(PlayerShip.playerShip, 1, 0, timeDiff * 2.5);
				}
				// Ships.updateRotation(PlayerShip.playerShip, timeDiff);
				PlayerShip.playerShip.container.scale.x = (1 - (PlayerShip.playerShip.rolling > 0.15 ? PlayerShip.playerShip.rolling - 0.15 : PlayerShip.playerShip.rolling) * 13.333);

				if (PlayerShip.playerShip.rolling < 0.15) {
					PlayerShip.playerShip.container.scale.y = 1 + (PlayerShip.playerShip.rolling / 0.15) * 0.2;
				} else {
					PlayerShip.playerShip.container.scale.y = 1 + ((0.3 / PlayerShip.playerShip.rolling) - 1) * 0.2;
				}
			} else {
				if (playerOneAxes[0] > 0.25 || playerOneAxes[0] < -0.25 || playerOneAxes[1] > 0.25 || playerOneAxes[1] < -0.25) {
						Ships.updateShipSpeedFromController(PlayerShip.playerShip, playerOneAxes[0], playerOneAxes[1], timeDiff);
						clickLocX = 0;
						clickLocY = 0;
				} else if (w || a || s || d) {
						var xDiff = 0;
						var yDiff = 0;
						if (w) yDiff--;
						if (a) xDiff--;
						if (s) yDiff++;
						if (d) xDiff++;
						Ships.updateShipSpeed(PlayerShip.playerShip, xDiff, yDiff, timeDiff);
						clickLocX = 0;
						clickLocY = 0;
				} else if (clickLocX && clickLocY && Math.sqrt(Math.pow(PlayerShip.playerShip.xLoc - clickLocX, 2) + Math.pow(PlayerShip.playerShip.yLoc - clickLocY, 2)) > 5) {
						Ships.updateShipSpeed(PlayerShip.playerShip,
										clickLocX - PlayerShip.playerShip.xLoc,
										clickLocY - PlayerShip.playerShip.yLoc,
										timeDiff);
				} else {
						clickLocX = 0;
						clickLocY = 0;
						Ships.updateShipSpeed(PlayerShip.playerShip, 0, 0, timeDiff);
				}
				var maxRot = PlayerShip.playerShip.xSpeed / 500;
				var timeMult = timeDiff;

				Ships.updateRotation(PlayerShip.playerShip, timeDiff);
				PlayerShip.playerShip.container.scale.x = 1;

				if (PlayerShip.playerShip.rolling > 1) {
					if (q || ekey || playerOneButtonsPressed[4] || playerOneButtonsPressed[5]) {
						PlayerShip.playerShip.rolling = 0;
						PlayerShip.playerShip.rollingLeft = q || playerOneButtonsPressed[4];
						Sounds.dodge.play(PlayerShip.playerShip.xLoc);
					}
				}
			}
		}

    PlayerShip.playerShip.lastDmg += timeDiff * 1000;
    if(PlayerShip.playerShip.lastDmg >= PlayerShip.playerShip.shieldDelay && PlayerShip.playerShip.currShield < PlayerShip.playerShip.maxShield) {
        PlayerShip.playerShip.currShield += PlayerShip.playerShip.shieldRegen * timeDiff;
        if (PlayerShip.playerShip.currShield > PlayerShip.playerShip.maxShield) {
            PlayerShip.playerShip.currShield = PlayerShip.playerShip.maxShield;
        }
    }
		if(PlayerShip.playerShip.lastDmg >= 60) {
			PlayerShip.playerShip.sprite.texture = PlayerShip.playerShip.sprite.nonDamageTexture;
		}
    PlayerShip.playerShip.container.position.x = PlayerShip.playerShip.xLoc * scalingFactor;
    PlayerShip.playerShip.container.position.y = PlayerShip.playerShip.yLoc * scalingFactor;

    PlayerShip.playerShip.container.rotation = PlayerShip.playerShip.rotation;

	if (PlayerShip.playerShip.rolling > 0.3) {
		Stars.shipTrails.updatePlayerShip(PlayerShip.playerShip,timeDiff);
		PlayerShip.playerShip.engine1.alpha = 0.5 + Math.random() * 0.5;
		PlayerShip.playerShip.engine2.alpha = 0.5 + Math.random() * 0.5;
	}

	if (PlayerShip.playerShip.currShield <= PlayerShip.playerShip.maxShield * 0.7)
		PlayerShip.playerShip.sprite.tint = calculateTint(PlayerShip.playerShip.currShield/PlayerShip.playerShip.maxShield);
	else
		PlayerShip.playerShip.sprite.tint = 0xFFFFFF;
};



PlayerShip.damagePlayerShip = function (playerShip, damage) {
	playerShip.currShield -= damage * getDamageReduction();
	playerShip.lastDmg = 0;
	Sounds.damage.play(PlayerShip.playerShip.xLoc);
	stageSprite.screenShake = gameModel.maxScreenShake;
	playerShip.sprite.texture=playerShip.sprite.damageTexture;
	GameText.damage.newText((damage * getDamageReduction()), playerShip);
	if (playerShip.currShield <= 0 && playerShip.inPlay === 1) {
		playerShip.container.visible=false;
		playerShip.inPlay = 0;
		PlayerShip.allPlayersDead = 1;
		PlayerShip.allDeadTimer = 0;
		Ships.generateExplosion(playerShip);
		Sounds.shipExplosion.play(PlayerShip.playerShip.xLoc);
	}
};



PlayerShip.engineTexture = function(){
	var size = 16 * scalingFactor;
	var blast = document.createElement('canvas');
	blast.width = size + 4;
	blast.height = size + 4;
	var blastCtx = blast.getContext('2d');
	blastCtx.shadowBlur = 5;
	blastCtx.shadowColor = "white";
	var radgrad = blastCtx.createRadialGradient(size / 2 + 2, size / 2 + 2, 0, size / 2 + 2, size / 2 + 2, size / 2);
	radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
	radgrad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
	radgrad.addColorStop(1, 'rgba(255,255,255,0)');
	blastCtx.fillStyle = radgrad;
	blastCtx.fillRect(0, 0, size + 4, size + 4);
	return PIXI.Texture.fromCanvas(blast);
};



PlayerShip.setupTextures = function(){
	PlayerShip.playerShip.art = Ships.shipArt(PlayerShip.SHIP_SIZE, gameModel.p1.ship.seed, Ships.enemyColors[gameModel.p1.ship.colorIndex]);
	PlayerShip.playerShip.artWhite = Ships.shipArt(PlayerShip.SHIP_SIZE, gameModel.p1.ship.seed, Ships.enemyColors[gameModel.p1.ship.colorIndex], true);
	// PlayerShip.playerShip.turnArt = skewImage(PlayerShip.playerShip.art);

	if (!PlayerShip.playerShip.sprite) {
		PlayerShip.playerShip.container = new PIXI.Container();
		PlayerShip.playerShip.sprite = new PIXI.Sprite(glowTexture(PIXI.Texture.fromCanvas(PlayerShip.playerShip.art)));
		PlayerShip.playerShip.engine1 = new PIXI.Sprite(PlayerShip.engineTexture());
		PlayerShip.playerShip.engine2 = new PIXI.Sprite(PlayerShip.engineTexture());
		PlayerShip.playerShip.container.addChild(PlayerShip.playerShip.engine1);
		PlayerShip.playerShip.container.addChild(PlayerShip.playerShip.engine2);
		PlayerShip.playerShip.container.addChild(PlayerShip.playerShip.sprite);

		PlayerShip.playerShip.engine1.tint = PlayerShip.playerShip.engine2.tint = 0xFFCC00;
		PlayerShip.playerShip.engine1.scale.y = PlayerShip.playerShip.engine2.scale.y = 1.5;
	}	else {
		PlayerShip.playerShip.sprite.texture = glowTexture(PIXI.Texture.fromCanvas(PlayerShip.playerShip.art));
		PlayerShip.playerShip.engine1.texture = PlayerShip.playerShip.engine2.texture = PlayerShip.engineTexture();
	}

	PlayerShip.playerShip.sprite.nonDamageTexture = PlayerShip.playerShip.sprite.texture;
	PlayerShip.playerShip.sprite.damageTexture = glowTexture(PIXI.Texture.fromCanvas(PlayerShip.playerShip.artWhite));

	// PlayerShip.playerShip.sprite.turnTexture = glowTexture(PIXI.Texture.fromCanvas(PlayerShip.playerShip.turnArt));
};



PlayerShip.updateSize = function() {
	PlayerShip.playerShip.colors = Ships.enemyColors[gameModel.p1.ship.colorIndex];
	PlayerShip.setupTextures();
};



PlayerShip.initialize = function () {
	PlayerShip.setupTextures();
	PlayerShip.playerShip.colors = Ships.enemyColors[gameModel.p1.ship.colorIndex];
	PlayerShip.playerShip.xLoc = canvasWidth / 2;
	PlayerShip.playerShip.yLoc = canvasHeight - (canvasHeight / 6);

	PlayerShip.playerShip.engine1.anchor = PlayerShip.playerShip.engine2.anchor =
	PlayerShip.playerShip.sprite.anchor = PlayerShip.playerShip.container.anchor = { x: 0.5, y: 0.5 };

	PlayerShip.playerShip.rolling = 100;

	PlayerShip.playerShip.container.position.x = PlayerShip.playerShip.xLoc * scalingFactor;
	PlayerShip.playerShip.container.position.y = PlayerShip.playerShip.yLoc * scalingFactor;

	playerShipContainer.addChild(PlayerShip.playerShip.container);
};



PlayerShip.reset = function() {
	PlayerShip.playerShip.currShield = PlayerShip.playerShip.maxShield;
	PlayerShip.playerShip.dualEngines = gameModel.p1.ship.dualEngines;

	PlayerShip.playerShip.engine2.position.y = PlayerShip.playerShip.engine1.position.y = 24 * scalingFactor;
	PlayerShip.playerShip.engine2.position.x = PlayerShip.playerShip.engine1.position.x = 0;
	if (PlayerShip.playerShip.dualEngines) {
		PlayerShip.playerShip.engine2.visible = true;
		PlayerShip.playerShip.engine2.position.x = 12 * scalingFactor;
		PlayerShip.playerShip.engine1.position.x = -12 * scalingFactor;
	}

	PlayerShip.playerShip.xLoc = canvasWidth / 2;
	PlayerShip.playerShip.yLoc = canvasHeight - (canvasHeight / 6);
	PlayerShip.playerShip.inPlay = 1;
	PlayerShip.playerShip.lastDmg = 10000;
	PlayerShip.allPlayersDead = 0;
	PlayerShip.allDeadTimer = 0;
	PlayerShip.playerShip.bumpSpeedX = 0;
	PlayerShip.playerShip.bumpSpeedY = 0;
	PlayerShip.playerShip.bumpMagnitude = 0;
	PlayerShip.playerShip.bumpMagMulti = 0;
	PlayerShip.playerShip.xSpeed = PlayerShip.playerShip.ySpeed = 0;
};
