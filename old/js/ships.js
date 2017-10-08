var Ships = {};

Ships.blasts = {
	texture : (function () {
		var blast = document.createElement('canvas');
		blast.width = 64;
		blast.height = 64;
		var blastCtx = blast.getContext('2d');

		var radgrad = blastCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
		radgrad.addColorStop(0, 'rgba(255,255,255,1)');
		radgrad.addColorStop(0.8, 'rgba(255,255,128,0.2)');
		radgrad.addColorStop(1, 'rgba(255,180,0,0)');

		// draw shape
		blastCtx.fillStyle = radgrad;
		blastCtx.fillRect(0, 0, 64, 64);

		return PIXI.Texture.fromCanvas(blast);
	})(),
	maxBlasts :10,
	currentBlast:0,
	sprite:[],
	newBlast : function(x, y) {
		if (Ships.blasts.currentBlast >= Ships.blasts.maxBlasts)
        	Ships.blasts.currentBlast = 0;

		Ships.blasts.sprite[Ships.blasts.currentBlast].visible = true;
		Ships.blasts.sprite[Ships.blasts.currentBlast].scale = {x:2 * scalingFactor,y:2 * scalingFactor};
		Ships.blasts.sprite[Ships.blasts.currentBlast].position.x = x * scalingFactor;
		Ships.blasts.sprite[Ships.blasts.currentBlast].position.y = y * scalingFactor;

		Ships.blasts.currentBlast++;
	},
	initialize:function(){
		Ships.blasts.sprites = new PIXI.Container();
		for (var i=0; i<Ships.blasts.maxBlasts;i++){
			Ships.blasts.sprite[i] = new PIXI.Sprite(Ships.blasts.texture);
			Ships.blasts.sprite[i].visible = false;
			Ships.blasts.sprite[i].anchor = { x: 0.5, y: 0.5 };
			Ships.blasts.sprites.addChild(Ships.blasts.sprite[i]);
		}
		explosionContainer.addChild(Ships.blasts.sprites);
	},
	update : function(timeDiff) {
	    for (var i=0; i< Ships.blasts.maxBlasts; i++) {
	        if (Ships.blasts.sprite[i].visible) {
	            Ships.blasts.sprite[i].scale.y -= (10 * timeDiff);
	            Ships.blasts.sprite[i].scale.x -= (10 * timeDiff);
	            if (Ships.blasts.sprite[i].scale.x <= 0)
	                Ships.blasts.sprite[i].visible = false;
	        }
	    }
	}
};

// enemy colors
// Taken from https://www.google.co.uk/design/spec/style/color.html
Ships.enemyColors = [
	["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#F44336", "#E53935", "#D32F2F", "#C62828", "#B71C1C"], // Red
	["#FCE4EC", "#F8BBD0", "#F48FB1", "#F06292", "#EC407A", "#E91E63", "#D81B60", "#C2185B", "#AD1457", "#880E4F"], // Pink
	["#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5" ,"#1976d2" ,"#1565c0", "#0d47a1"], // blue
	["#f3e5f5", "#e1bee7", "#ce93d8", "#ba68c8", "#ab47bc", "#9c27b0", "#8e24aa", "#7b1fa2", "#6a1b9a", "#4a148c"], // Purple
	["#ede7f6", "#d1c4e9", "#b39ddb", "#9575cd", "#7e57c2", "#673ab7", "#5e35b1", "#512da8", "#4527a0", "#311b92"], // Deep Purple
	["#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688", "#00897b", "#00796b", "#00695c", "#004d40"], // Teal
	["#FFFDE7", "#FFF9C4", "#FFF59D", "#FFF176", "#FFEE58", "#FFEB3B", "#FDD835", "#FBC02D", "#F9A825", "#F57F17"], // Yellow
	["#FFF8E1", "#FFECB3", "#FFE082", "#FFD54F", "#FFCA28", "#FFC107", "#FFB300", "#FFA000", "#FF8F00", "#FF6F00"], // Amber
	["#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D", "#FFA726", "#FF9800", "#FB8C00", "#F57C00", "#EF6C00", "#E65100"], // Orange
	["#efebe9", "#d7ccc8", "#bcaaa4", "#a1887f", "#8d6e63", "#795548", "#6d4c41", "#5d4037", "#4e342e", "#3e2723"], // Brown
	["#fafafa", "#f5f5f5", "#eeeeee", "#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#616161", "#424242", "#212121"], // Grey
	["#eceff1", "#cfd8dc", "#b0bec5", "#90a4ae", "#78909c", "#607d8b", "#546e7a", "#455a64", "#37474f", "#263238"]  // Blue Grey
 ];
// Ships.enemyColors = [["#FF0000"]];

var nextXLoc, nextYLoc;

Ships.shipArt = function (size, seed, enemy, colors, white) {
		size = Math.round(size * scalingFactor) % 2 === 0 ? Math.round(size * scalingFactor) : Math.round(size * scalingFactor) + 1;
    Math.seedrandom(seed);
    var shipLines = 25;
    var shipCanvas = document.createElement('canvas');
    shipCanvas.width = size;
    shipCanvas.height = size;
    var shipctx = shipCanvas.getContext('2d');

		shipctx.lineWidth = Math.min(Math.max(1,Math.floor(size / PlayerShip.SHIP_SIZE)), 5);

		var shadowCanvas = document.createElement('canvas');
		shadowCanvas.width = size + 2;
    shadowCanvas.height = size + 2;
    var shadowCtx = shadowCanvas.getContext('2d');
		shadowCtx.save();
		shadowCtx.shadowBlur = 20;
		shadowCtx.shadowColor = "#000";
    shadowCtx.fillStyle = "#000";
		shadowCtx.beginPath();
    shadowCtx.moveTo(1 + size / 2, 1 + Math.round(size * 0.05));
    shadowCtx.lineTo(1 + Math.round(size * 0.75), 1 + Math.round(size * 0.8));
		shadowCtx.lineTo(1 + Math.round(size * 0.25), 1 + Math.round(size * 0.8));
    shadowCtx.fill();
		shadowCtx.fill();
		shadowCtx.fill();
		// shadowCtx.fill();
		// shadowCtx.fill();

		shadowCtx.restore();


		shipctx.shadowBlur = shipctx.lineWidth;
		shipctx.shadowColor = colors[Math.round(colors.length / 2)];

    lastX = size / 2;
    lastY = 0;

    var colorindex = 0;
    for (var i = 0; i < shipLines; i++) {
        nextYLoc = (Math.random() * size);
        nextXLoc = (((Math.random() * size / 2) * (nextYLoc / size)) + size / 2);
        drawline(shipctx, white ? "#FFFFFF" : colors[colorindex], lastX, lastY, nextXLoc, nextYLoc);

        colorindex++;
        if (colorindex >= colors.length - 1)
            colorindex = 0;
    }

    shipctx.save();
    shipctx.translate(size / 2, 0);
    shipctx.scale(-1, 1);
    shipctx.drawImage(shipCanvas, -size / 2, 0);
    shipctx.restore();

    if (enemy) {
        var enemyCanvas = document.createElement('canvas');
        enemyCanvas.width = size;
        enemyCanvas.height = size;
        shipctx = enemyCanvas.getContext('2d');
        shipctx.save();
        shipctx.scale(1, -1);
				shipctx.transform(1,0,0,1,0,-size);
        shipctx.clearRect(0, 0, size, size);
				shipctx.drawImage(shadowCanvas,0,0,size,size);
        shipctx.drawImage(shipCanvas, 0, 0, size, size);
        shipctx.restore();
        return enemyCanvas;
    }

//     return shipCanvas;
		shadowCtx.drawImage(shipCanvas,1,1,size,size);
	return shadowCanvas;
};
var collisionCushion = 3; // num pixels to reduce collision area by

Ships.detectShipCollision = function(enemyShip, playerShip) {
    if (playerShip.inPlay === 1 && playerShip.rolling > 0.3 &&
        enemyShip.yLoc < playerShip.yLoc + playerShip.offset * 2 &&
		enemyShip.yLoc + enemyShip.offset * 2 > playerShip.yLoc &&
		enemyShip.xLoc < playerShip.xLoc + playerShip.offset * 2 &&
		enemyShip.xLoc + enemyShip.offset * 2 > playerShip.xLoc) {

		if (Ships.detectCollision(enemyShip, playerShip.xLoc, playerShip.yLoc - playerShip.offset))
			return true;

		if (Ships.detectCollision(enemyShip, playerShip.xLoc - playerShip.offset, playerShip.yLoc + playerShip.offset))
			return true;

		if (Ships.detectCollision(enemyShip, playerShip.xLoc + playerShip.offset, playerShip.yLoc + playerShip.offset))
			return true;

		if (Ships.detectCollision(playerShip, enemyShip.xLoc, enemyShip.yLoc + enemyShip.offset))
			return true;

		if (Ships.detectCollision(playerShip, enemyShip.xLoc - enemyShip.offset, enemyShip.yLoc - enemyShip.offset))
			return true;

		if (Ships.detectCollision(playerShip, enemyShip.xLoc + enemyShip.offset, enemyShip.yLoc - enemyShip.offset))
			return true;

	}
	return false;
};

Ships.detectCollision = function (ship, xLoc, yLoc) {
	if (!ship.enemyShip && ship.rolling < 0.3)
		return false;

	if (ship.inPlay === 1 && yLoc > ship.yLoc - ship.offset && yLoc < ship.yLoc + ship.offset) {
		var yPos = yLoc - (ship.yLoc - ship.offset);
		var xOffset;
		if (!ship.enemyShip) {
			xOffset = ship.offset * (yPos / (ship.offset * 2));
		} else {
			xOffset = ship.offset * (((ship.offset * 2 )- yPos) / (ship.offset * 2));
		}
		if (xLoc > ship.xLoc - xOffset + collisionCushion && xLoc < ship.xLoc + xOffset - collisionCushion) {
			return true;
		}
	}
	return false;
};

var boundry = 24;

Ships.updateShipSpeed = function (ship, xDiff, yDiff, timeDiff) {
    var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

    ship.xSpeed = xDiff / multi * ship.maxSpeed;
    ship.ySpeed = yDiff / multi * ship.maxSpeed;

    if (ship.enemyShip || (ship.xLoc + ship.xSpeed * timeDiff > boundry && ship.xLoc + ship.xSpeed * timeDiff < canvasWidth - boundry))
        ship.xLoc += ship.xSpeed * timeDiff;
    if (ship.enemyShip || (ship.yLoc + ship.ySpeed * timeDiff > boundry && ship.yLoc + ship.ySpeed * timeDiff < canvasHeight - boundry))
        ship.yLoc += ship.ySpeed * timeDiff;
};

Ships.updateShipSpeedFromController = function (ship, xDiff, yDiff, timeDiff) {

    ship.xSpeed = xDiff * ship.maxSpeed;
    ship.ySpeed = yDiff * ship.maxSpeed;

    if (ship.enemyShip || (ship.xLoc + ship.xSpeed * timeDiff > boundry && ship.xLoc + ship.xSpeed * timeDiff < canvasWidth - boundry))
        ship.xLoc += ship.xSpeed * timeDiff;
    if (ship.enemyShip || (ship.yLoc + ship.ySpeed * timeDiff > boundry && ship.yLoc + ship.ySpeed * timeDiff < canvasHeight - boundry))
        ship.yLoc += ship.ySpeed * timeDiff;
};

Ships.updateRotation = function (ship, timeDiff) {
	var maxRot = ship.xSpeed / 500;

	if (ship.rotation >= maxRot) {
		if (ship.rotation - timeDiff >= maxRot)
			ship.rotation -= timeDiff;
		else
			ship.rotation = maxRot;
	}
	if (ship.rotation <= maxRot) {
		if (ship.rotation + timeDiff <= maxRot)
			ship.rotation += timeDiff;
		else
			ship.rotation = maxRot;
	}

	var tempX = -2 + Math.random() * 4;
	var tempY = ship.enemyShip ? -20 : 20;
	var tempRotation = ship.enemyShip ? ship.rotation * -1 : ship.rotation;

	ship.trailX = Math.cos(tempRotation) * tempX - Math.sin(tempRotation) * tempY + ship.xLoc;
	ship.trailY = Math.sin(tempRotation) * tempX + Math.cos(tempRotation) * tempY + ship.yLoc;
};

Ships.fragments = {
	texture: (function() {
		var blast = document.createElement('canvas');
		blast.width = 1;
		blast.height = 15;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(0, 0, 2, 20);

		return PIXI.Texture.fromCanvas(blast);
	})(),
	bitsPerExplosion: 12,
	sprite:[],
	discardedSprites:[],
	update:function(timeDiff){
		for (var i = 0; i < Ships.fragments.sprite.length; i++) {
			if (Ships.fragments.sprite[i].visible) {
				Ships.fragments.sprite[i].alpha -= 0.7 * timeDiff;
				if (Ships.fragments.sprite[i].alpha <= 0) {
					Ships.fragments.sprite[i].visible = false;
					Ships.fragments.discardedSprites.push(Ships.fragments.sprite[i]);
				} else {
					Ships.fragments.sprite[i].position.x += Ships.fragments.sprite[i].xSpeed * timeDiff;
					Ships.fragments.sprite[i].position.y += Ships.fragments.sprite[i].ySpeed * timeDiff;
					Ships.fragments.sprite[i].rotation += Ships.fragments.sprite[i].rotSpeed * timeDiff;
				}
			}
		}
	},
	initialize:function(){
			Ships.fragments.sprites = new PIXI.Container();
			for (var i = 0; i < Ships.fragments.bitsPerExplosion; i++) {
				var sprite = new PIXI.Sprite(Stars.stars.texture);
				sprite.anchor = {x:0.5,y:0.5};
				Ships.fragments.sprite.push(sprite);
				Ships.fragments.sprites.addChild(sprite);
			}
			starContainer.addChild(Ships.fragments.sprites);
	},
	newFragment: function (xLoc, yLoc, colors, size) {

		var sprite;

		if (Ships.fragments.discardedSprites.length > 0) {
			sprite = Ships.fragments.discardedSprites.pop();
		} else {
			sprite = new PIXI.Sprite(Stars.stars.texture);
			sprite.anchor ={x:0.5,y:0.5};
			Ships.fragments.sprite.push(sprite);
			Ships.fragments.sprites.addChild(sprite);
		}

		sprite.visible = true;
		sprite.alpha = 1;

		sprite.rotation = Math.random() * Math.PI * 2;
		sprite.scale.x = Math.round(1.5 * scalingFactor);
		sprite.scale.y = (20 + Math.random() * 10) * scalingFactor;
		sprite.tint = calculateTintFromString(colors[Math.floor(Math.random() * colors.length)]);

		var speed = RotateVector2d(0, Math.random() * (size - 25) * scalingFactor, Math.random() * 2 * Math.PI);

		sprite.xSpeed = speed.x;
		sprite.ySpeed = speed.y;
		sprite.position.x = xLoc * scalingFactor;
		sprite.position.y = yLoc * scalingFactor;
		sprite.rotSpeed = -5 + Math.random() * 10;
	}
};

Ships.explosionBits = {
  bitsPerExplosion: 64,
	discardedSprites: [],
	initNumber : 256,
	sprite:[],
	update:function(timeDiff){
		for (var i = 0; i < Ships.explosionBits.sprite.length; i++) {
			if (Ships.explosionBits.sprite[i].visible) {
				Ships.explosionBits.sprite[i].alpha -= 0.7 * timeDiff;
				if (Ships.explosionBits.sprite[i].alpha <= 0) {
					Ships.explosionBits.sprite[i].visible = false;
					Ships.explosionBits.discardedSprites.push(Ships.explosionBits.sprite[i])
				} else {
					Ships.explosionBits.sprite[i].position.x += Ships.explosionBits.sprite[i].xSpeed * timeDiff;
					Ships.explosionBits.sprite[i].position.y += Ships.explosionBits.sprite[i].ySpeed * timeDiff;

				}
			}
		}
	},
	initialize:function(){
		Ships.explosionBits.sprites = new PIXI.Container();
		starContainer.addChild(Ships.explosionBits.sprites);
		for (var i = 0; i < Ships.explosionBits.initNumber; i++) {
			var sprite = new PIXI.Sprite(Stars.stars.texture);
			Ships.explosionBits.sprite.push(sprite);
			Ships.explosionBits.sprites.addChild(sprite);
		}
	},
	newExplosionBit: function (xLoc, yLoc, colors, size) {
		var sprite;

		if (Ships.explosionBits.discardedSprites.length > 0) {
			sprite = Ships.explosionBits.discardedSprites.pop();
			sprite.visible = true;
		} else {
			sprite = new PIXI.Sprite(Stars.stars.texture);
			Ships.explosionBits.sprite.push(sprite);
			Ships.explosionBits.sprites.addChild(sprite);
		}

		sprite.visible = true;
		sprite.alpha = 1;
		sprite.position.x = xLoc * scalingFactor;
		sprite.position.y = yLoc * scalingFactor;
		sprite.scale.x =
		sprite.scale.y = (1 + Math.random() * 2) * scalingFactor;
		sprite.tint = calculateTintFromString(colors[Math.floor(Math.random() * colors.length)]);

		var speed = Math.random() > 0.5 ?
				RotateVector2d(0, (Math.random() * size) * scalingFactor, Math.random() * 2 * Math.PI) :
				RotateVector2d(0, size * scalingFactor, Math.random() * 2 * Math.PI);
		sprite.xSpeed = speed.x;
		sprite.ySpeed = speed.y;
	}
};

Ships.generateExplosion = function (ship) {
	var size = Math.random();
	var explosionSize = 75 + size * 150;

	if (ship.enemyShip && ship.wave) {
		Bullets.splashDamage.createSplash(ship.xLoc, ship.yLoc, explosionSize, ship.wave.shipHealth, ship.wave.shipHealth * 2);
	}

	var numParts = Ships.explosionBits.bitsPerExplosion + size * Ships.explosionBits.bitsPerExplosion;
	for (var i = 0; i < numParts; i++) {
			Ships.explosionBits.newExplosionBit(ship.xLoc, ship.yLoc, ship.colors || ship.wave.colors, explosionSize);
	}
	for (var i = 0; i < Ships.fragments.bitsPerExplosion; i++) {
			Ships.fragments.newFragment(ship.xLoc, ship.yLoc, ship.colors || ship.wave.colors, explosionSize);
	}
	Ships.blasts.newBlast(ship.xLoc,ship.yLoc);
};