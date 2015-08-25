var PlayerShip = {};

PlayerShip.allPlayersDead = 0;
PlayerShip.allDeadTimer = 0;
PlayerShip.allDeadTime = 3000;

PlayerShip.SHIP_SIZE = 64;

PlayerShip.controllerPointer = {
    initialize: function () {
        var blast = document.createElement('canvas');
        blast.width = 10;
        blast.height = 16;
        var blastCtx = blast.getContext('2d');

        blastCtx.lineWidth = 2;

        drawline(blastCtx, "#0b0", 1, 1, 9, 8);
        drawline(blastCtx, "#0b0", 1, 15, 9, 8);

        PlayerShip.controllerPointer.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(blast));
        PlayerShip.controllerPointer.sprite.anchor = { x: 0.5, y: 0.5 };
        PlayerShip.controllerPointer.sprite.visible = false;
        uiContainer.addChild(PlayerShip.controllerPointer.sprite);
    },
    update: function (timeDiff) {
        if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {

            PlayerShip.controllerPointer.sprite.position.x = PlayerShip.playerShip.xLoc + playerOneAxes[2] * 70;
            PlayerShip.controllerPointer.sprite.position.y = PlayerShip.playerShip.yLoc - 16 + playerOneAxes[3] * 70;
            PlayerShip.controllerPointer.sprite.rotation = Math.atan2(playerOneAxes[3], playerOneAxes[2]);
            PlayerShip.controllerPointer.sprite.visible = true;
        } else {
            PlayerShip.controllerPointer.sprite.visible = false;
        }
    }
};

PlayerShip.cursor = {
	initialize:function(){
		var blast = document.createElement('canvas');
		blast.width = 31;
		blast.height = 31;
		var blastCtx = blast.getContext('2d');

		blastCtx.lineWidth=2;
		
		drawline(blastCtx, "#0b0", 15, 1, 15, 29);
		drawline(blastCtx, "#0b0", 1, 15, 29, 15);

		PlayerShip.cursor.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(blast));
		PlayerShip.cursor.sprite.anchor = {x:0.5,y:0.5};
		uiContainer.addChild(PlayerShip.cursor.sprite);
	},
	update:function(timeDiff) {
		if (aimLocX && aimLocY){
	 		PlayerShip.cursor.sprite.position.x=aimLocX;
			PlayerShip.cursor.sprite.position.y=aimLocY;
			PlayerShip.cursor.sprite.visible=true;
		} else {
			PlayerShip.cursor.sprite.visible=false;
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
	lastTrail:0,
	colors: Ships.playerColors[0],

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

    PlayerShip.playerShip.lastDmg += timeDiff * 1000;
    if(PlayerShip.playerShip.lastDmg >= PlayerShip.playerShip.shieldDelay && PlayerShip.playerShip.currShield < PlayerShip.playerShip.maxShield) {
        PlayerShip.playerShip.currShield += PlayerShip.playerShip.shieldRegen * timeDiff;
        if (PlayerShip.playerShip.currShield > PlayerShip.playerShip.maxShield) {
            PlayerShip.playerShip.currShield = PlayerShip.playerShip.maxShield;
        }
    }
    PlayerShip.playerShip.sprite.position.x = PlayerShip.playerShip.xLoc;
    PlayerShip.playerShip.sprite.position.y = PlayerShip.playerShip.yLoc;
    PlayerShip.playerShip.sprite.rotation = PlayerShip.playerShip.rotation;
	Stars.shipTrails.updateShip(PlayerShip.playerShip,timeDiff);
	if (tintOn && PlayerShip.playerShip.currShield <= PlayerShip.playerShip.maxShield / 2)
		PlayerShip.playerShip.sprite.tint = calculateTint(PlayerShip.playerShip.currShield/PlayerShip.playerShip.maxShield);
	else
		PlayerShip.playerShip.sprite.tint = 0xFFFFFF;
};

PlayerShip.damagePlayerShip = function (playerShip, damage) {
    playerShip.currShield -= damage;
    playerShip.lastDmg = 0;
    if (playerShip.currShield <= 0 && playerShip.inPlay === 1) {
        playerShip.sprite.visible=false;
        playerShip.inPlay = 0;
        PlayerShip.allPlayersDead = 1;
        PlayerShip.allDeadTimer = 0;
        Ships.generateExplosion(playerShip);
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

PlayerShip.initialize = function () {
    PlayerShip.playerShip.art = Ships.shipArt(PlayerShip.SHIP_SIZE, gameModel.p1.shipSeed, false, Ships.playerColors[Math.floor(Math.random() * Ships.playerColors.length)]);
    PlayerShip.playerShip.xLoc = canvasWidth / 2;
    PlayerShip.playerShip.yLoc = canvasHeight - (canvasHeight / 6);

    PlayerShip.playerShip.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(PlayerShip.playerShip.art));

    PlayerShip.playerShip.sprite.anchor = { x: 0.5, y: 0.5 };

    PlayerShip.playerShip.sprite.position.x = PlayerShip.playerShip.xLoc;
    PlayerShip.playerShip.sprite.position.y = PlayerShip.playerShip.yLoc;

    playerShipContainer.addChild(PlayerShip.playerShip.sprite);
};