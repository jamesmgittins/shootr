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

    PlayerShip.playerShip.powerupTime += timeDiff;
    if (PlayerShip.playerShip.powerupTime >= Powerups.powerupLength) {
        PlayerShip.playerShip.spreadShot = 0;
        PlayerShip.playerShip.crossShot = 0;
    }

	// handle super charge activation
		PlayerShip.playerShip.charge = PlayerShip.playerShip.superCharged ? Math.max(-20, PlayerShip.playerShip.charge - 10 * timeDiff) : Math.max(0, PlayerShip.playerShip.charge - 3 * timeDiff);

		if (PlayerShip.playerShip.charge >= 100) {
			if (!PlayerShip.playerShip.superChargeMessaged) {
				GameText.bigText.newBigText("Fully Charged\nPress " + ShootrUI.getInputButtonDescription(buttonTypes.select) + " to Supercharge");
				PlayerShip.playerShip.superChargeMessaged = true;
			}
			if ((playerOneButtonsPressed[0] || spaceBar) && !PlayerShip.playerShip.superCharged) {
// 				GameText.bigText.newBigText("Supercharge Activated!");
				PlayerShip.playerShip.superCharged = true;
			}
		} else {
			if (PlayerShip.playerShip.charge < 90)
				PlayerShip.playerShip.superChargeMessaged = false;

			if (PlayerShip.playerShip.charge <= 0)
				PlayerShip.playerShip.superCharged = false;
		}

		PlayerShip.playerShip.rolling += timeDiff;
		if (PlayerShip.playerShip.rolling < 0.3) {
			if (PlayerShip.playerShip.rollingLeft) {
				Ships.updateShipSpeed(PlayerShip.playerShip, -1, 0, timeDiff * 2.5);
			} else {
				Ships.updateShipSpeed(PlayerShip.playerShip, 1, 0, timeDiff * 2.5);
			}
			Ships.updateRotation(PlayerShip.playerShip, timeDiff);
			PlayerShip.playerShip.sprite.scale.x = (1 - (PlayerShip.playerShip.rolling > 0.15 ? PlayerShip.playerShip.rolling - 0.15 : PlayerShip.playerShip.rolling) * 13.333);
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
					PlayerShip.playerShip.xSpeed = 0;
					PlayerShip.playerShip.ySpeed = 0;
			}
			var maxRot = PlayerShip.playerShip.xSpeed / 500;
			var timeMult = timeDiff;

			Ships.updateRotation(PlayerShip.playerShip, timeDiff);
			PlayerShip.playerShip.sprite.scale.x = 1;

			if (PlayerShip.playerShip.rolling > 1) {
				if (q || ekey || playerOneButtonsPressed[4] || playerOneButtonsPressed[5]) {
					PlayerShip.playerShip.rolling = 0;
					PlayerShip.playerShip.rollingLeft = q || playerOneButtonsPressed[4];
					Sounds.dodge.play();
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
    PlayerShip.playerShip.sprite.position.x = PlayerShip.playerShip.xLoc * scalingFactor;
    PlayerShip.playerShip.sprite.position.y = PlayerShip.playerShip.yLoc * scalingFactor;
    PlayerShip.playerShip.sprite.rotation = PlayerShip.playerShip.rotation;
	Stars.shipTrails.updateShip(PlayerShip.playerShip,timeDiff);
	if (PlayerShip.playerShip.currShield <= PlayerShip.playerShip.maxShield * 0.7)
		PlayerShip.playerShip.sprite.tint = calculateTint(PlayerShip.playerShip.currShield/PlayerShip.playerShip.maxShield);
	else
		PlayerShip.playerShip.sprite.tint = 0xFFFFFF;
};

PlayerShip.damagePlayerShip = function (playerShip, damage) {
	playerShip.currShield -= damage;
	playerShip.lastDmg = 0;
	Sounds.damage.play();
	stageSprite.screenShake = gameModel.maxScreenShake;
	playerShip.sprite.texture=playerShip.sprite.damageTexture;
	if (playerShip.currShield <= 0 && playerShip.inPlay === 1) {
		playerShip.sprite.visible=false;
		playerShip.inPlay = 0;
		PlayerShip.allPlayersDead = 1;
		PlayerShip.allDeadTimer = 0;
		Ships.generateExplosion(playerShip);
		Sounds.shipExplosion.play();
	}
};

PlayerShip.drawPlayerShipLine = function (ctx) {
    if (PlayerShip.playerShip.inPlay === 1) {
        if (clickLocX && clickLocY) {
            ctx.strokeStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc);
            ctx.lineTo(clickLocX, clickLocY);
            ctx.stroke();

            ctx.strokeStyle = '#0B0';
            ctx.beginPath();
            ctx.moveTo(clickLocX - 4, clickLocY - 4);
            ctx.lineTo(clickLocX + 5, clickLocY + 5);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(clickLocX + 4, clickLocY - 4);
            ctx.lineTo(clickLocX - 5, clickLocY + 5);
            ctx.stroke();
        }

        if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {

            ctx.strokeStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc - 16);
            ctx.lineTo(PlayerShip.playerShip.xLoc + playerOneAxes[2] * 100, PlayerShip.playerShip.yLoc - 16 + playerOneAxes[3] * 100);
            ctx.stroke();
        }
    }
};

var lastPlayerShield = 0;
var destroyedWarning = false;
var shieldRed = 0;
var shieldBlue = 255;

PlayerShip.drawShield = function (ctx) {
    var shieldWidth = PlayerShip.playerShip.currShield / PlayerShip.playerShip.maxShield * 100;

    if (lastPlayerShield != shieldWidth) {
        shieldRed = Math.floor((100 - shieldWidth) * 2.55);
        shieldBlue = Math.floor(shieldWidth * 2.55);
        ctx.fillStyle = "rgb(" + shieldRed + ",0," + shieldBlue + ")";
        ctx.clearRect(0, 0, 100, 25);
        ctx.fillRect(0, 0, Math.round(shieldWidth), 25);
        lastPlayerShield = shieldWidth;

        setTimeout(function () {

            if (shieldWidth <= 0 && !destroyedWarning) {
                destroyedWarning = true;
                $("#p1-shield-div").addClass("destroyed");
            }
        });
    }
};

PlayerShip.updateSize = function() {
	PlayerShip.playerShip.colors = Ships.enemyColors[gameModel.p1.ship.colorIndex];
	PlayerShip.playerShip.art = Ships.shipArt(PlayerShip.SHIP_SIZE, gameModel.p1.ship.seed, false, Ships.enemyColors[gameModel.p1.ship.colorIndex]);
	PlayerShip.playerShip.artWhite = Ships.shipArt(PlayerShip.SHIP_SIZE, gameModel.p1.ship.seed, false, Ships.enemyColors[gameModel.p1.ship.colorIndex], true);
	PlayerShip.playerShip.sprite.texture = PlayerShip.playerShip.sprite.nonDamageTexture = PIXI.Texture.fromCanvas(PlayerShip.playerShip.art);
	PlayerShip.playerShip.sprite.damageTexture = PIXI.Texture.fromCanvas(PlayerShip.playerShip.artWhite);
};

PlayerShip.initialize = function () {
	PlayerShip.playerShip.art = Ships.shipArt(PlayerShip.SHIP_SIZE, gameModel.p1.ship.seed, false, Ships.enemyColors[gameModel.p1.ship.colorIndex]);
	PlayerShip.playerShip.artWhite = Ships.shipArt(PlayerShip.SHIP_SIZE, gameModel.p1.ship.seed, false, Ships.enemyColors[gameModel.p1.ship.colorIndex], true);
	PlayerShip.playerShip.colors = Ships.enemyColors[gameModel.p1.ship.colorIndex];
	PlayerShip.playerShip.xLoc = canvasWidth / 2;
	PlayerShip.playerShip.yLoc = canvasHeight - (canvasHeight / 6);

	PlayerShip.playerShip.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(PlayerShip.playerShip.art));
	PlayerShip.playerShip.sprite.nonDamageTexture = PlayerShip.playerShip.sprite.texture;
	PlayerShip.playerShip.sprite.damageTexture = PIXI.Texture.fromCanvas(PlayerShip.playerShip.artWhite);

	PlayerShip.playerShip.sprite.anchor = { x: 0.5, y: 0.5 };

	PlayerShip.playerShip.rolling = 100;

	PlayerShip.playerShip.sprite.position.x = PlayerShip.playerShip.xLoc * scalingFactor;
	PlayerShip.playerShip.sprite.position.y = PlayerShip.playerShip.yLoc * scalingFactor;

	playerShipContainer.addChild(PlayerShip.playerShip.sprite);
};

PlayerShip.reset = function() {
	PlayerShip.playerShip.currShield = PlayerShip.playerShip.maxShield;
	PlayerShip.playerShip.xLoc = canvasWidth / 2;
	PlayerShip.playerShip.yLoc = canvasHeight - (canvasHeight / 6);
	PlayerShip.playerShip.inPlay = 1;
	PlayerShip.playerShip.charge = 0;
	PlayerShip.allPlayersDead = 0;
	PlayerShip.allDeadAllDeadTimer = 0;
};

PlayerShip.setBackgroundFromShipColor = function() {
	// var color = hexToRgb(Ships.enemyColors[gameModel.p1.ship.colorIndex][Ships.enemyColors[gameModel.p1.ship.colorIndex].length - 1]);
	// var maxColorPart = 20;
	// var factor = 50 / (color.r + color.g + color.b);
	// renderer.backgroundColor = rgbToHex(color.r * factor, color.g * factor, color.b * factor);
	renderer.backgroundColor = 0x000000;;
};