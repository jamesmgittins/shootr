var Ships = {};

Ships.playerColors = [
	["#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5" ,"#1976d2" ,"#1565c0", "#0d47a1"] // blue
//	["#32CF7C", "#32A035", "#50FF50", "#30B000"] // green
];

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
		Ships.blasts.sprite[Ships.blasts.currentBlast].scale = {x:2,y:2};
		Ships.blasts.sprite[Ships.blasts.currentBlast].position.x = x;
		Ships.blasts.sprite[Ships.blasts.currentBlast].position.y = y;

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
	["#f3e5f5", "#e1bee7", "#ce93d8", "#ba68c8", "#ab47bc", "#9c27b0", "#8e24aa", "#7b1fa2", "#6a1b9a", "#4a148c"], // Purple
	["#ede7f6", "#d1c4e9", "#b39ddb", "#9575cd", "#7e57c2", "#673ab7", "#5e35b1", "#512da8", "#4527a0", "#311b92"], // Deep Purple
	["#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688", "#00897b", "#00796b", "#00695c", "#004d40"], // Teal
	["#FFFDE7", "#FFF9C4", "#FFF59D", "#FFF176", "#FFEE58", "#FFEB3B", "#FDD835", "#FBC02D", "#F9A825", "#F57F17"], // Yellow
	["#FFF8E1", "#FFECB3", "#FFE082", "#FFD54F", "#FFCA28", "#FFC107", "#FFB300", "#FFA000", "#FF8F00", "#FF6F00"], // Amber
	["#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D", "#FFA726", "#FF9800", "#FB8C00", "#F57C00", "#EF6C00", "#E65100"], // Orange
	["#efebe9", "#d7ccc8", "#bcaaa4", "#a1887f", "#8d6e63", "#795548", "#6d4c41", "#5d4037", "#4e342e", "#3e2723"], // Brown
	["#fafafa", "#f5f5f5", "#eeeeee", "#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#616161", "#424242", "#212121"], // Grey
	["#eceff1", "#cfd8dc", "#b0bec5", "#90a4ae", "#78909c", "#607d8b", "#546e7a", "#455a64", "#37474f", "#263238"] // Blue Grey
 ];

var nextXLoc, nextYLoc;

Ships.shipArt = function (size, seed, enemy, colors) {
    Math.seedrandom(seed);
    var shipLines = 25;
    var shipCanvas = document.createElement('canvas');
    shipCanvas.width = size;
    shipCanvas.height = size;
    var shipctx = shipCanvas.getContext('2d');

    lastX = size / 2;
    lastY = 0;
	
    var colorindex = 0;
    for (var i = 0; i < shipLines; i++) {
        nextYLoc = Math.random() * size;
        nextXLoc = ((Math.random() * size / 2) * (nextYLoc / size)) + size / 2;
        drawline(shipctx, colors[colorindex], lastX, lastY, nextXLoc, nextYLoc);
        colorindex++;
        if (colorindex >= colors.length)
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
        shipctx.drawImage(shipCanvas, 0, 0, size, size);
        shipctx.restore();
        return enemyCanvas;
    }

    return shipCanvas;
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


Ships.updateShipSpeed = function (ship, xDiff, yDiff, timeDiff) {
    var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

    ship.xSpeed = xDiff / multi * ship.maxSpeed;
    ship.ySpeed = yDiff / multi * ship.maxSpeed;

    if (ship.enemyShip || (ship.xLoc + ship.xSpeed * timeDiff > 0 && ship.xLoc + ship.xSpeed * timeDiff < canvasWidth))
        ship.xLoc += ship.xSpeed * timeDiff;
    if (ship.enemyShip || (ship.yLoc + ship.ySpeed * timeDiff > 0 && ship.yLoc + ship.ySpeed * timeDiff < canvasHeight))
        ship.yLoc += ship.ySpeed * timeDiff;
};

Ships.updateShipSpeedFromController = function (ship, xDiff, yDiff, timeDiff) {
    
    ship.xSpeed = xDiff * ship.maxSpeed;
    ship.ySpeed = yDiff * ship.maxSpeed;

    if (ship.enemyShip || (ship.xLoc + ship.xSpeed * timeDiff > 0 && ship.xLoc + ship.xSpeed * timeDiff < canvasWidth))
        ship.xLoc += ship.xSpeed * timeDiff;
    if (ship.enemyShip || (ship.yLoc + ship.ySpeed * timeDiff > 0 && ship.yLoc + ship.ySpeed * timeDiff < canvasHeight))
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
		blast.width = 2;
		blast.height = 20;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(0, 0, 2, 20);

		return PIXI.Texture.fromCanvas(blast);
	})(),
    bitsPerExplosion: 16,
    maxFragments: 128,
    currentFragment: 0,
    sprite:[],
    xSpeed: [],
    ySpeed: [],
	rotSpeed : [],
    update:function(timeDiff){
        for (var i = 0; i < Ships.fragments.maxFragments; i++) {
            if (Ships.fragments.sprite[i].visible) {
                Ships.fragments.sprite[i].alpha -= 0.5 * timeDiff;
                if (Ships.fragments.sprite[i].alpha <= 0) {
                    Ships.fragments.sprite[i].visible = false;
                } else {
                    Ships.fragments.sprite[i].position.x += Ships.fragments.xSpeed[i] * timeDiff;
                    Ships.fragments.sprite[i].position.y += Ships.fragments.ySpeed[i] * timeDiff;
					Ships.fragments.sprite[i].rotation += Ships.fragments.rotSpeed[i] * timeDiff;
                }
            }
        }
    },
    initialize:function(){
        Ships.fragments.sprites = new PIXI.Container();
        for (var i = 0; i < Ships.fragments.maxFragments; i++) {
            Ships.fragments.sprite[i] = new PIXI.Sprite(Ships.fragments.texture);
			Ships.fragments.sprite[i].anchor ={x:0.5,y:0.5};
            Ships.fragments.sprite[i].visible = false;
            Ships.fragments.sprites.addChild(Ships.fragments.sprite[i]);
        }
        starContainer.addChild(Ships.fragments.sprites);
    },
    newFragment: function (ship, colors) {

        if (Ships.fragments.currentFragment >= Ships.fragments.maxFragments)
            Ships.fragments.currentFragment = 0;

        Ships.fragments.sprite[Ships.fragments.currentFragment].visible = true;
        Ships.fragments.sprite[Ships.fragments.currentFragment].alpha = 1;

		Ships.fragments.sprite[Ships.fragments.currentFragment].rotation = Math.random() * 7;
		Ships.fragments.sprite[Ships.fragments.currentFragment].scale.x = 
		Ships.fragments.sprite[Ships.fragments.currentFragment].scale.y = 0.5 + Math.random();
		Ships.fragments.sprite[Ships.fragments.currentFragment].tint = calculateTintFromString(colors[Math.floor(Math.random() * colors.length)]);
        Ships.fragments.xSpeed[Ships.fragments.currentFragment] = -50 + Math.random() * 100;
        Ships.fragments.ySpeed[Ships.fragments.currentFragment] = -50 + Math.random() * 100;
        Ships.fragments.sprite[Ships.fragments.currentFragment].position.x = ship.xLoc + 0.2 * Ships.fragments.xSpeed[Ships.fragments.currentFragment];
        Ships.fragments.sprite[Ships.fragments.currentFragment].position.y = ship.yLoc + 0.2 * Ships.fragments.ySpeed[Ships.fragments.currentFragment];
		Ships.fragments.rotSpeed[Ships.fragments.currentFragment] = -5 + Math.random() * 10;
        
        Ships.fragments.currentFragment++;
    }
};

Ships.explosionBits = {
    bitsPerExplosion: 32,
    maxExplosionBits: 128,
    currentExplosionBit: 0,
    sprite:[],
    xSpeed: [],
    ySpeed: [],
    update:function(timeDiff){
        for (var i = 0; i < Ships.explosionBits.maxExplosionBits; i++) {
            if (Ships.explosionBits.sprite[i].visible) {
                Ships.explosionBits.sprite[i].alpha -= 0.5 * timeDiff;
                if (Ships.explosionBits.sprite[i].alpha <= 0) {
                    Ships.explosionBits.sprite[i].visible = false;
                } else {
                    Ships.explosionBits.sprite[i].position.x += Ships.explosionBits.xSpeed[i] * timeDiff;
                    Ships.explosionBits.sprite[i].position.y += Ships.explosionBits.ySpeed[i] * timeDiff;
                }
            }
        }
    },
    initialize:function(){
        Ships.explosionBits.sprites = new PIXI.Container();
        for (var i = 0; i < Ships.explosionBits.maxExplosionBits; i++) {
            Ships.explosionBits.sprite[i] = new PIXI.Sprite(Stars.stars.texture);
            Ships.explosionBits.sprite[i].visible = false;
            Ships.explosionBits.sprites.addChild(Ships.explosionBits.sprite[i]);
        }
        starContainer.addChild(Ships.explosionBits.sprites);
    },
    newExplosionBit: function (ship, colors) {

        if (Ships.explosionBits.currentExplosionBit >= Ships.explosionBits.maxExplosionBits)
            Ships.explosionBits.currentExplosionBit = 0;

        Ships.explosionBits.sprite[Ships.explosionBits.currentExplosionBit].visible = true;
        Ships.explosionBits.sprite[Ships.explosionBits.currentExplosionBit].alpha = 1;
        Ships.explosionBits.sprite[Ships.explosionBits.currentExplosionBit].position.x = ship.xLoc;
        Ships.explosionBits.sprite[Ships.explosionBits.currentExplosionBit].position.y = ship.yLoc;
		Ships.explosionBits.sprite[Ships.explosionBits.currentExplosionBit].scale.x = 
		Ships.explosionBits.sprite[Ships.explosionBits.currentExplosionBit].scale.y = 2 + Math.random();
		Ships.explosionBits.sprite[Ships.explosionBits.currentExplosionBit].tint = calculateTintFromString(colors[Math.floor(Math.random() * colors.length)]);
        Ships.explosionBits.xSpeed[Ships.explosionBits.currentExplosionBit] = -100 + Math.random() * 200;
        Ships.explosionBits.ySpeed[Ships.explosionBits.currentExplosionBit] = -100 + Math.random() * 200;
        
        Ships.explosionBits.currentExplosionBit++;
    }
};

Ships.generateExplosion = function (ship) {
	
    for (var i = 0; i < Ships.explosionBits.bitsPerExplosion; i++) {
        Ships.explosionBits.newExplosionBit(ship, ship.colors || ship.wave.colors);
    }
	for (var i = 0; i < Ships.fragments.bitsPerExplosion; i++) {
        Ships.fragments.newFragment(ship, ship.colors || ship.wave.colors);
    }
	Ships.blasts.newBlast(ship.xLoc,ship.yLoc);
};
