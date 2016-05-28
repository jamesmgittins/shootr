var Bullets = {};

Bullets.blasts = {
    texture: (function () {
        var blast = document.createElement('canvas');
        blast.width = 32;
        blast.height = 32;
        var blastCtx = blast.getContext('2d');

        var radgrad = blastCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        radgrad.addColorStop(0, 'rgba(255,255,255,1)');
        radgrad.addColorStop(0.8, 'rgba(255,255,128,0.2)');
        radgrad.addColorStop(1, 'rgba(255,180,0,0)');

        // draw shape
        blastCtx.fillStyle = radgrad;
        blastCtx.fillRect(0, 0, 32, 32);

        return PIXI.Texture.fromCanvas(blast);
    }()),
    maxBlasts: 20,
    currentBlast: 0,
	sprite:[],
	newBlast : function(x, y) {
		if (Bullets.blasts.currentBlast >= Bullets.blasts.maxBlasts)
        	Bullets.blasts.currentBlast = 0;

		Bullets.blasts.sprite[Bullets.blasts.currentBlast].visible = true;
		Bullets.blasts.sprite[Bullets.blasts.currentBlast].scale = {x:1,y:1};
		Bullets.blasts.sprite[Bullets.blasts.currentBlast].position.x = x;
		Bullets.blasts.sprite[Bullets.blasts.currentBlast].position.y = y;

		Bullets.blasts.currentBlast++;
	},
	initialize:function() {
		Bullets.blasts.sprites = new PIXI.Container();
		for (var i=0; i<Bullets.blasts.maxBlasts;i++){
			Bullets.blasts.sprite[i] = new PIXI.Sprite(Bullets.blasts.texture);
			Bullets.blasts.sprite[i].visible = false;
			Bullets.blasts.sprite[i].anchor = { x: 0.5, y: 0.5 };
			Bullets.blasts.sprites.addChild(Bullets.blasts.sprite[i]);
		}
		explosionContainer.addChild(Bullets.blasts.sprites);
	},
	updateBlasts : function(timeDiff) {
	    for (var i=0; i< Bullets.blasts.maxBlasts; i++) {
	        if (Bullets.blasts.sprite[i].visible) {
	            Bullets.blasts.sprite[i].scale.y -= (5 * timeDiff);
	            Bullets.blasts.sprite[i].scale.x = Bullets.blasts.sprite[i].scale.y;
	            if (Bullets.blasts.sprite[i].scale.x <= 0)
	                Bullets.blasts.sprite[i].visible = false;
	        }
	    }	
	}
};

Bullets.enemyBullets = {
    texture: (function () {
        var blast = document.createElement('canvas');
        blast.width = 8;
        blast.height = 8;
        var blastCtx = blast.getContext('2d');

        var radgrad = blastCtx.createRadialGradient(4, 4, 0, 4, 4, 4);
        radgrad.addColorStop(0, 'rgba(255,255,128,1)');
        radgrad.addColorStop(0.8, 'rgba(255,0,0,0.4)');
        radgrad.addColorStop(1, 'rgba(255,180,0,0)');

        // draw shape
        blastCtx.fillStyle = radgrad;
        blastCtx.fillRect(0, 0, 8, 8);

        return PIXI.Texture.fromCanvas(blast);
    })(),
    maxEnemyBullets : 20,
    currentEnemyBullet : 0,
    enemyShotSpeed : 100,
    enemyShotStrength: 1,
    xLoc: [],
    yLoc: [],
    ySpeed: [],
    xSpeed: [],
    inPlay: [],
	sprite: [],
	resetAll: function (){
		for (var i=0; i<Bullets.enemyBullets.maxEnemyBullets; i++) {
			Bullets.enemyBullets.inPlay[i]=0;
			Bullets.enemyBullets.sprite[i].visible=false;
		}
	},
    newEnemyBullet : function (ship) {
        if (Bullets.enemyBullets.currentEnemyBullet >= Bullets.enemyBullets.maxEnemyBullets) {
            Bullets.enemyBullets.currentEnemyBullet = 0;
        }

				if (ship.xLoc < 0 || ship.xLoc > canvasWidth || ship.yLoc < 0 || ship.yLoc > canvasHeight)
					return;
			
        Bullets.enemyBullets.xLoc[Bullets.enemyBullets.currentEnemyBullet] = ship.xLoc;
        Bullets.enemyBullets.yLoc[Bullets.enemyBullets.currentEnemyBullet] = ship.yLoc + 16;
    
        var xDiff = PlayerShip.playerShip.xLoc - ship.xLoc;
        var yDiff = ship.yLoc - PlayerShip.playerShip.yLoc;
        var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

        Bullets.enemyBullets.xSpeed[Bullets.enemyBullets.currentEnemyBullet] = xDiff / multi * Bullets.enemyBullets.enemyShotSpeed;
        Bullets.enemyBullets.ySpeed[Bullets.enemyBullets.currentEnemyBullet] = yDiff / multi * Bullets.enemyBullets.enemyShotSpeed;

        Bullets.enemyBullets.inPlay[Bullets.enemyBullets.currentEnemyBullet] = 1;
			
				Sounds.enemyShot.play();

				Bullets.enemyBullets.sprite[Bullets.enemyBullets.currentEnemyBullet].visible = true;
        Bullets.enemyBullets.sprite[Bullets.enemyBullets.currentEnemyBullet].position.x = ship.xLoc;
        Bullets.enemyBullets.sprite[Bullets.enemyBullets.currentEnemyBullet].position.y = ship.yLoc - 16;
		
        Bullets.enemyBullets.currentEnemyBullet++;
    },
    initialize : function () {
        Bullets.enemyBullets.sprites = new PIXI.Container();
        for (var i = 0; i < Bullets.enemyBullets.maxEnemyBullets; i++) {
            Bullets.enemyBullets.sprite[i] = new PIXI.Sprite(Bullets.enemyBullets.texture);
            Bullets.enemyBullets.sprite[i].visible = false;
            Bullets.enemyBullets.sprite[i].anchor = { x: 0.5, y: 0.5 };
            Bullets.enemyBullets.sprites.addChild(Bullets.enemyBullets.sprite[i]);
        }
        bulletContainer.addChild(Bullets.enemyBullets.sprites);
    }
};

Bullets.playerBullets = {
    texture: (function () {
        var blast = document.createElement('canvas');
        blast.width = 8;
        blast.height = 8;
        var blastCtx = blast.getContext('2d');

        var radgrad = blastCtx.createRadialGradient(4, 4, 0, 4, 4, 4);
        radgrad.addColorStop(0, 'rgba(255,255,0,1)');
        radgrad.addColorStop(0.8, 'rgba(255,255,255,0.5)');
        radgrad.addColorStop(1, 'rgba(255,255,255,0)');

        // draw shape
        blastCtx.fillStyle = radgrad;
        blastCtx.fillRect(0, 0, 8, 8);

        return PIXI.Texture.fromCanvas(blast);
    })(),
	maxPlayerBullets : 100,
	currBullet:0,
	shotFrequency : 200,
	lastPlayerShot : 0,
	shotSpeed : 300,
	strength : 0.25,
	xLoc: [],
	yLoc: [],
	ySpeed : [],
	xSpeed : [],
	inPlay: [],
	sprite: [],
	bulletStrength :[],
	resetAll: function (){
		for (var i=0; i<Bullets.playerBullets.maxPlayerBullets; i++) {
			Bullets.playerBullets.inPlay[i]=0;
			Bullets.playerBullets.sprite[i].visible=false;
		}
	},
    resetPlayerBullet: function (i) {          
			Bullets.playerBullets.bulletStrength[i] = Bullets.playerBullets.strength;
        Bullets.playerBullets.xLoc[i] = PlayerShip.playerShip.xLoc;
        Bullets.playerBullets.yLoc[i] = PlayerShip.playerShip.yLoc - 16;
        Bullets.playerBullets.ySpeed[i] = Bullets.playerBullets.shotSpeed;
        Bullets.playerBullets.xSpeed[i] = 0;
        Bullets.playerBullets.inPlay[i] = 1;
        Bullets.playerBullets.sprite[i].visible = true;
        Bullets.playerBullets.sprite[i].position.x = PlayerShip.playerShip.xLoc;
        Bullets.playerBullets.sprite[i].position.y = PlayerShip.playerShip.yLoc - 16;
        
    },
    initialize : function () {
        Bullets.playerBullets.sprites = new PIXI.Container();
        for (var i = 0; i < Bullets.playerBullets.maxPlayerBullets; i++) {
            Bullets.playerBullets.sprite[i] = new PIXI.Sprite(Bullets.playerBullets.texture);
            Bullets.playerBullets.sprite[i].visible = false;
            Bullets.playerBullets.sprite[i].anchor = { x: 0.5, y: 0.5 };
            Bullets.playerBullets.sprites.addChild(Bullets.playerBullets.sprite[i]);
        }
        bulletContainer.addChild(Bullets.playerBullets.sprites);
    },
	newBullet : function(speed) {
		Bullets.playerBullets.resetPlayerBullet(Bullets.playerBullets.currBullet);
		Bullets.playerBullets.xSpeed[Bullets.playerBullets.currBullet] = speed.x;
		Bullets.playerBullets.ySpeed[Bullets.playerBullets.currBullet] = speed.y;
		Bullets.playerBullets.currBullet++;
		if (Bullets.playerBullets.currBullet >= Bullets.playerBullets.maxPlayerBullets) {
			Bullets.playerBullets.currBullet = 0;
		}
	},
	fireBullets : function () {
		
		var speed = {
			x:0,
			y:Bullets.playerBullets.shotSpeed
		};

		if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {

			var multi = Math.sqrt(Math.pow(playerOneAxes[2], 2) + Math.pow(playerOneAxes[3], 2));

			speed.x = playerOneAxes[2] / multi * Bullets.playerBullets.shotSpeed;
			speed.y = -1 * playerOneAxes[3] / multi * Bullets.playerBullets.shotSpeed;

		} else if (aimLocX && aimLocY) {

			var xDiff = aimLocX - PlayerShip.playerShip.xLoc;
			var yDiff = (PlayerShip.playerShip.yLoc - 16) - aimLocY;
			var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

			speed.x = xDiff / multi * Bullets.playerBullets.shotSpeed;
			speed.y = yDiff / multi * Bullets.playerBullets.shotSpeed;
		}
		
		Bullets.playerBullets.newBullet(speed);

		Sounds.playerBullets.play();
		
		if (PlayerShip.playerShip.spreadShot) {
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, -0.12));
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, 0.12));
		} else if (PlayerShip.playerShip.crossShot) {
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, Math.PI));
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, Math.PI/2));
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, -Math.PI/2));
		}
		Bullets.playerBullets.lastPlayerShot = 0;
	}
};

Bullets.explosionBits = {
    bitsPerExplosion: 12,
    maxExplosionBits: 128,
    currentExplosionBit: 0,
    sprite:[],
    xSpeed: [],
    ySpeed: [],
    update:function(timeDiff){
        for (var i = 0; i < Bullets.explosionBits.maxExplosionBits; i++) {
            if (Bullets.explosionBits.sprite[i].visible) {
                Bullets.explosionBits.sprite[i].alpha -= 2 * timeDiff;
                if (Bullets.explosionBits.sprite[i].alpha <= 0) {
                    Bullets.explosionBits.sprite[i].visible = false;
                } else {
                    Bullets.explosionBits.sprite[i].position.x += Bullets.explosionBits.xSpeed[i] * timeDiff;
                    Bullets.explosionBits.sprite[i].position.y += Bullets.explosionBits.ySpeed[i] * timeDiff;
                }
            }
        }
    },
    initialize:function(){
        Bullets.explosionBits.sprites = new PIXI.Container();
        for (var i = 0; i < Bullets.explosionBits.maxExplosionBits; i++) {
            Bullets.explosionBits.sprite[i] = new PIXI.Sprite(Stars.stars.texture);
            Bullets.explosionBits.sprite[i].visible = false;
            Bullets.explosionBits.sprites.addChild(Bullets.explosionBits.sprite[i]);
        }
        starContainer.addChild(Bullets.explosionBits.sprites);
    },
    newExplosionBit: function (x, y) {

        if (Bullets.explosionBits.currentExplosionBit >= Bullets.explosionBits.maxExplosionBits)
            Bullets.explosionBits.currentExplosionBit = 0;

        Bullets.explosionBits.sprite[Bullets.explosionBits.currentExplosionBit].visible = true;
        Bullets.explosionBits.sprite[Bullets.explosionBits.currentExplosionBit].alpha = 1;
        Bullets.explosionBits.sprite[Bullets.explosionBits.currentExplosionBit].position.x = x;
        Bullets.explosionBits.sprite[Bullets.explosionBits.currentExplosionBit].position.y = y;
		Bullets.explosionBits.sprite[Bullets.explosionBits.currentExplosionBit].scale.x = 
			Bullets.explosionBits.sprite[Bullets.explosionBits.currentExplosionBit].scale.y = 1 + Math.random();
        Bullets.explosionBits.xSpeed[Bullets.explosionBits.currentExplosionBit] = -100 + Math.random() * 200;
        Bullets.explosionBits.ySpeed[Bullets.explosionBits.currentExplosionBit] = -100 + Math.random() * 200;
        
        Bullets.explosionBits.currentExplosionBit++;
    }
};

Bullets.generateExplosion = function (x, y) {
    for (var i = 0; i < Bullets.explosionBits.bitsPerExplosion; i++) {
        Bullets.explosionBits.newExplosionBit(x, y);
    }
	Bullets.blasts.newBlast(x,y);
};

Bullets.updatePlayerBullets = function (timeDiff) {

    Bullets.playerBullets.lastPlayerShot += timeDiff * 1000;

    for (var i = 0; i < Bullets.playerBullets.maxPlayerBullets; i++) {
        if (Bullets.playerBullets.inPlay[i] === 1) {
            Bullets.playerBullets.xLoc[i] += Bullets.playerBullets.xSpeed[i] * timeDiff;
            Bullets.playerBullets.yLoc[i] -= Bullets.playerBullets.ySpeed[i] * timeDiff;

            Bullets.playerBullets.sprite[i].position.x = Bullets.playerBullets.xLoc[i];
            Bullets.playerBullets.sprite[i].position.y = Bullets.playerBullets.yLoc[i];

            if (Bullets.playerBullets.yLoc[i] < -16 || Bullets.playerBullets.yLoc[i] > canvasHeight ||
                    Bullets.playerBullets.xLoc[i] < 0 || Bullets.playerBullets.xLoc[i] > canvasWidth) {
                Bullets.playerBullets.inPlay[i] = 0;
                Bullets.playerBullets.sprite[i].visible = false;
            }
        }
    }
	
	if (Bullets.playerBullets.lastPlayerShot >= Bullets.playerBullets.shotFrequency && EnemyShips.allDeadTimer == 0 && PlayerShip.playerShip.inPlay) {
		Bullets.playerBullets.fireBullets();
	}
};



Bullets.updateEnemyBullets = function (timeDiff) {
    for (var i = 0; i < Bullets.enemyBullets.maxEnemyBullets; i++) {
        
        if (Bullets.enemyBullets.inPlay[i] === 1) {

            if (enemiesKilled >= enemiesToKill) {
                Bullets.enemyBullets.inPlay[i] = 0;
                Bullets.generateExplosion(Bullets.enemyBullets.xLoc[i], Bullets.enemyBullets.yLoc[i]);
                Bullets.enemyBullets.sprite[i].visible = false;
            } else {
                Bullets.enemyBullets.xLoc[i] += Bullets.enemyBullets.xSpeed[i] * timeDiff;
                Bullets.enemyBullets.yLoc[i] -= Bullets.enemyBullets.ySpeed[i] * timeDiff;
				
                if (Bullets.enemyBullets.yLoc[i] < 0 || Bullets.enemyBullets.yLoc[i] > canvasHeight ||
                    Bullets.enemyBullets.xLoc[i] < 0 || Bullets.enemyBullets.xLoc[i] > canvasWidth) {
                    Bullets.enemyBullets.inPlay[i] = 0;
					Bullets.enemyBullets.sprite[i].visible=false;
                } else {
                    if (Ships.detectCollision(PlayerShip.playerShip, Bullets.enemyBullets.xLoc[i], Bullets.enemyBullets.yLoc[i])) {
                        Bullets.enemyBullets.inPlay[i] = 0;
                        Bullets.enemyBullets.sprite[i].visible = false;
                        Bullets.generateExplosion(Bullets.enemyBullets.xLoc[i], Bullets.enemyBullets.yLoc[i]);
                        PlayerShip.damagePlayerShip(PlayerShip.playerShip, Bullets.enemyBullets.enemyShotStrength);
                    } else {
						Bullets.enemyBullets.sprite[i].position.x = Bullets.enemyBullets.xLoc[i];
			            Bullets.enemyBullets.sprite[i].position.y = Bullets.enemyBullets.yLoc[i];
					}
                }
            }
        }
    }
};
