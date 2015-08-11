var Bullets = {};

Bullets.blasts = {
    art: (function () {
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

        return blast;
    }()),
    maxBlasts: 20,
    currentBlast: 0,
    xLoc: [],
    yLoc: [],
    opacity:[]
};



Bullets.enemyBullets = {
    art: (function () {
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

        return blast;
    })(),
    offset: -4,
    maxEnemyBullets : 10,
    currentEnemyBullet : 0,
    enemyShotSpeed : 100,
    enemyShotStrength: 1,

    xLoc: [],
    yLoc: [],
    ySpeed: [],
    xSpeed: [],
    inPlay: [],

    r: 256,
    g: 256,
    b: 256,

    newEnemyBullet : function (ship) {
        if (Bullets.enemyBullets.currentEnemyBullet >= Bullets.enemyBullets.maxEnemyBullets) {
            Bullets.enemyBullets.currentEnemyBullet = 0;
        }

        Bullets.enemyBullets.xLoc[Bullets.enemyBullets.currentEnemyBullet] = ship.xLoc;
        Bullets.enemyBullets.yLoc[Bullets.enemyBullets.currentEnemyBullet] = ship.yLoc + 16;
    
        var xDiff = PlayerShip.playerShip.xLoc - ship.xLoc;
        var yDiff = ship.yLoc - PlayerShip.playerShip.yLoc;
        var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

        Bullets.enemyBullets.xSpeed[Bullets.enemyBullets.currentEnemyBullet] = xDiff / multi * Bullets.enemyBullets.enemyShotSpeed;
        Bullets.enemyBullets.ySpeed[Bullets.enemyBullets.currentEnemyBullet] = yDiff / multi * Bullets.enemyBullets.enemyShotSpeed;

        Bullets.enemyBullets.inPlay[Bullets.enemyBullets.currentEnemyBullet] = 1;

        Bullets.enemyBullets.currentEnemyBullet++;
    }
};

Bullets.playerBullets = {
    art: (function () {
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

        return blast;
    })(),
    offset : -4,
	maxPlayerBullets : 100,
	shotFrequency : 1000,
	lastPlayerShot : 0,
	shotSpeed : 150,
	strength : 1,
	
	xLoc : [],
    yLoc : [],
    ySpeed : [],
    xSpeed : [],
	inPlay : [],
    
	r : 255,
    g : 255,
    b : 255,
	
	resetPlayerBullet : function (i) {
        Bullets.playerBullets.xLoc[i] = PlayerShip.playerShip.xLoc;
        Bullets.playerBullets.yLoc[i] = PlayerShip.playerShip.yLoc - 16;
        Bullets.playerBullets.ySpeed[i] = Bullets.playerBullets.shotSpeed;
        Bullets.playerBullets.xSpeed[i] = 0;
        Bullets.playerBullets.inPlay[i] = 1;
	}
};

Bullets.explosionBits = {
    bitsPerExplosion: 16,
    maxExplosionBits: 256,
    currentExplosionBit: 0,
    opacity: [],
    xLoc: [],
    yLoc: [],
    color: { r: Bullets.playerBullets.r, g: Bullets.playerBullets.g, b: Bullets.playerBullets.b },
    xSpeed: [],
    ySpeed: [],

    newExplosionBit: function (x, y) {

        if (Bullets.explosionBits.currentExplosionBit >= Bullets.explosionBits.maxExplosionBits)
            Bullets.explosionBits.currentExplosionBit = 0;

        Bullets.explosionBits.opacity[Bullets.explosionBits.currentExplosionBit] = 255;
        Bullets.explosionBits.xLoc[Bullets.explosionBits.currentExplosionBit] = x;
        Bullets.explosionBits.yLoc[Bullets.explosionBits.currentExplosionBit] = y;
        Bullets.explosionBits.xSpeed[Bullets.explosionBits.currentExplosionBit] = -100 + Math.random() * 200;
        Bullets.explosionBits.ySpeed[Bullets.explosionBits.currentExplosionBit] = -100 + Math.random() * 200;
        
        Bullets.explosionBits.currentExplosionBit++;
    }
};

Bullets.frequencyUpgrades = 0;

Bullets.upgradeFrequency = function () {
    if (gameModel.p1.credits > upgradePrice(10, 1.2, Bullets.frequencyUpgrades)) {
        gameModel.p1.credits -= upgradePrice(10, 1.2, Bullets.frequencyUpgrades);
        Bullets.frequencyUpgrades++;
        Bullets.playerBullets.shotFrequency -= 10;
        $('#btn-freq span').text('₡' + upgradePrice(10, 1.2, Bullets.frequencyUpgrades).toFixed(0));
		save();
    }
};

Bullets.generateExplosion = function (x, y) {
    for (var i = 0; i < Bullets.explosionBits.bitsPerExplosion; i++) {
        Bullets.explosionBits.newExplosionBit(x, y);
    }

    if (Bullets.blasts.currentBlast > Bullets.blasts.maxBlasts)
        Bullets.blasts.currentBlast = 0;

    Bullets.blasts.opacity[Bullets.blasts.currentBlast] = 1;
    Bullets.blasts.xLoc[Bullets.blasts.currentBlast] = x - 16;
    Bullets.blasts.yLoc[Bullets.blasts.currentBlast] = y - 16;

    Bullets.blasts.currentBlast++;
};

Bullets.updatePlayerBullets = function (timeDiff) {

    Bullets.playerBullets.lastPlayerShot += timeDiff * 1000;

    for (var i = 0; i < Bullets.playerBullets.maxPlayerBullets; i++) {
        if (Bullets.playerBullets.inPlay[i] !== 1 && PlayerShip.playerShip.inPlay) {

            if (Bullets.playerBullets.lastPlayerShot >= Bullets.playerBullets.shotFrequency) {

                Bullets.playerBullets.resetPlayerBullet(i);

                if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {
                    var multi = Math.sqrt(Math.pow(playerOneAxes[2], 2) + Math.pow(playerOneAxes[3], 2));

                    Bullets.playerBullets.xSpeed[i] = playerOneAxes[2] / multi * Bullets.playerBullets.shotSpeed;
                    Bullets.playerBullets.ySpeed[i] = -1 * playerOneAxes[3] / multi * Bullets.playerBullets.shotSpeed;
                } else if (aimLocX && aimLocY) {
                    var xDiff = aimLocX - Bullets.playerBullets.xLoc[i];
                    var yDiff = Bullets.playerBullets.yLoc[i] - aimLocY;
                    var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

                    Bullets.playerBullets.xSpeed[i] = xDiff / multi * Bullets.playerBullets.shotSpeed;
                    Bullets.playerBullets.ySpeed[i] = yDiff / multi * Bullets.playerBullets.shotSpeed;
                }
                Bullets.playerBullets.lastPlayerShot = 0;
            }
        } else {
            Bullets.playerBullets.xLoc[i] += Bullets.playerBullets.xSpeed[i] * timeDiff;
            Bullets.playerBullets.yLoc[i] -= Bullets.playerBullets.ySpeed[i] * timeDiff;
            if (Bullets.playerBullets.yLoc[i] < 0 || Bullets.playerBullets.yLoc[i] > canvasHeight ||
                    Bullets.playerBullets.xLoc[i] < 0 || Bullets.playerBullets.xLoc[i] > canvasWidth) {
                Bullets.playerBullets.inPlay[i] = 0;
            }
        }
    }
};

Bullets.updateEnemyBullets = function (timeDiff) {
    for (var i = 0; i < Bullets.enemyBullets.maxEnemyBullets; i++) {
        
        if (Bullets.enemyBullets.inPlay[i] === 1) {

            if (enemiesKilled >= enemiesToKill) {
                Bullets.enemyBullets.inPlay[i] = 0;
                Bullets.generateExplosion(Bullets.enemyBullets.xLoc[i], Bullets.enemyBullets.yLoc[i]);
            } else {
                Bullets.enemyBullets.xLoc[i] += Bullets.enemyBullets.xSpeed[i] * timeDiff;
                Bullets.enemyBullets.yLoc[i] -= Bullets.enemyBullets.ySpeed[i] * timeDiff;

                if (Bullets.enemyBullets.yLoc[i] < 0 || Bullets.enemyBullets.yLoc[i] > canvasHeight ||
                    Bullets.enemyBullets.xLoc[i] < 0 || Bullets.enemyBullets.xLoc[i] > canvasWidth) {
                    Bullets.enemyBullets.inPlay[i] = 0;
                } else {
                    if (Ships.detectCollision(PlayerShip.playerShip, Bullets.enemyBullets.xLoc[i], Bullets.enemyBullets.yLoc[i])) {
                        Bullets.enemyBullets.inPlay[i] = 0;
                        Bullets.generateExplosion(Bullets.enemyBullets.xLoc[i], Bullets.enemyBullets.yLoc[i]);
                        PlayerShip.damagePlayerShip(PlayerShip.playerShip, Bullets.enemyBullets.enemyShotStrength);
                    }
                }
            }
        }
    }
};




Bullets.drawPlayerBullets = function () {
    for (var i = 0; i < Bullets.playerBullets.maxPlayerBullets; i++) {
        if (Bullets.playerBullets.inPlay[i]) {
            ctx.drawImage(Bullets.playerBullets.art, Bullets.playerBullets.xLoc[i] + Bullets.playerBullets.offset, Bullets.playerBullets.yLoc[i] + Bullets.playerBullets.offset);
        }
            
    }
    for (var i = 0; i < Bullets.enemyBullets.maxEnemyBullets; i++) {
        if (Bullets.enemyBullets.inPlay[i]) {
            ctx.drawImage(Bullets.enemyBullets.art, Bullets.enemyBullets.xLoc[i] + Bullets.enemyBullets.offset, Bullets.enemyBullets.yLoc[i] + Bullets.enemyBullets.offset);
        }   
    }
};