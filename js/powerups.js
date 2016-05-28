var Powerups = {
	texture: (function() {
		var blast = document.createElement('canvas');
		blast.width = 32;
		blast.height = 32;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(0, 0, 32, 32);

		blastCtx.fillStyle = "#000";
		blastCtx.font = "30px Arial";
		blastCtx.fillText("?",8,27);
		
		return PIXI.Texture.fromCanvas(blast);
	})(),
	lastTrail:0,
	tint:0,
	tintMod:7,
    powerupLength:10,
	maxPowerups: 1,
	currPowerup: 0,
    maxSpeed: 50,
	sprite : [],
	xSpeed : [],
	ySpeed: [],
    rotSpeed: [],
	chance : 0.95,
	lastPowerupSpawned : 0,
	minFrequency: 30,
	reset:function() {
	    for (var i = 0; i < Powerups.maxPowerups; i++) {
	        if (Powerups.sprite[i].visible) {
	            Powerups.sprite[i].visible = false;
	        }
	    }
	    PlayerShip.playerShip.powerupTime = Powerups.powerupLength + 1;
	},
	initialize : function() {
	    Powerups.sprites = new PIXI.Container();
	    for (var i = 0; i < Powerups.maxPowerups; i++) {
	        Powerups.sprite[i] = new PIXI.Sprite(Powerups.texture);
	        Powerups.sprite[i].visible = false;
	        Powerups.sprite[i].anchor = { x: 0.5, y: 0.5 };
	        Powerups.sprites.addChild(Powerups.sprite[i]);
	    }
	    starContainer.addChild(Powerups.sprites);
	},
	update : function(timeDiff) {
	    Powerups.lastPowerupSpawned += timeDiff;

	    for (var i = 0; i < Powerups.maxPowerups; i++) {
	        if (Powerups.sprite[i].visible) {
	            Powerups.sprite[i].position.x += Powerups.xSpeed[i] * timeDiff;
	            Powerups.sprite[i].position.y += Powerups.ySpeed[i] * timeDiff;
	            Powerups.sprite[i].rotation += Powerups.rotSpeed[i] * timeDiff;
				
				Powerups.lastTrail += timeDiff * 1000;
				if (Powerups.lastTrail > 60) {
					Powerups.lastTrail = 0;
					Stars.shipTrails.newPowerupPart(
						Powerups.sprite[i].position.x - 20 + (Math.random() * 40), 
						Powerups.sprite[i].position.y - 20 + (Math.random() * 40));
				}
	            
				Powerups.tint += Powerups.tintMod;
	            Powerups.sprite[i].tint = rgbToHex(255,Math.min(255,Math.max(Powerups.tint,0)),0);
				
	            if (Powerups.tint >= 255 || Powerups.tint <= 0)
                    Powerups.tintMod *= -1;

	            if (Ships.detectCollision(PlayerShip.playerShip, Powerups.sprite[i].position.x - 10, Powerups.sprite[i].position.y) ||
                    Ships.detectCollision(PlayerShip.playerShip, Powerups.sprite[i].position.x + 10, Powerups.sprite[i].position.y) ||
                    Ships.detectCollision(PlayerShip.playerShip, Powerups.sprite[i].position.x, Powerups.sprite[i].position.y - 10) ||
                    Ships.detectCollision(PlayerShip.playerShip, Powerups.sprite[i].position.x, Powerups.sprite[i].position.y + 10)) {
			
			Sounds.powerup.play();
	                var number = Math.random();

	                if (number > 0.6) {
	                    GameText.bigText.newBigText("Spread shot!");
	                    Powerups.sprite[i].visible = false;
	                    PlayerShip.playerShip.powerupTime = 0;
	                    PlayerShip.playerShip.spreadShot = 1;
	                } else if (number > 0.2 ){
	                    GameText.bigText.newBigText("Cross shot!");
	                    Powerups.sprite[i].visible = false;
	                    PlayerShip.playerShip.powerupTime = 0;
	                    PlayerShip.playerShip.crossShot = 1;
	                } else {
	                    GameText.bigText.newBigText("Double credits!");
	                    Powerups.sprite[i].visible = false;
	                    addCredits(gameModel.p1.credits);
	                }
	            }
	        }
	    }
	},
	newPowerup : function (x, y) {
	    if (Powerups.lastPowerupSpawned > Powerups.minFrequency && Math.random() > Powerups.chance) {
		    Powerups.lastPowerupSpawned = 0;
		    Powerups.sprite[Powerups.currPowerup].visible = true;
		    
		    Powerups.sprite[Powerups.currPowerup].position = { x: x, y: y };
		    Powerups.sprite[Powerups.currPowerup].rotation = Math.random() * 5;
		    Powerups.rotSpeed[Powerups.currPowerup] = -2 + Math.random() * 4;

		    var xDiff = (canvasWidth / 2) - x;
		    var yDiff = (canvasHeight / 2) - y;
		    var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

		    Powerups.xSpeed[Powerups.currPowerup] = xDiff / multi * Powerups.maxSpeed;
		    Powerups.ySpeed[Powerups.currPowerup] = yDiff / multi * Powerups.maxSpeed;
		}
	}
};