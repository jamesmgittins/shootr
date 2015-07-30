var Bullets = {};

Bullets.enemyBullets = [];
Bullets.maxEnemyBullets = 100;
Bullets.currentEnemyBullet = 0;
Bullets.enemyShotSpeed = 100;
Bullets.enemyShotStrength = 1;

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

Bullets.enemyBulletArt = (function () {
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
})();

Bullets.playerBullets = {
    art: (function () {
        var blast = document.createElement('canvas');
        blast.width = 8;
        blast.height = 8;
        var blastCtx = blast.getContext('2d');

        var radgrad = blastCtx.createRadialGradient(4, 4, 0, 4, 4, 4);
        radgrad.addColorStop(0, 'rgba(255,255,255,1)');
        radgrad.addColorStop(0.8, 'rgba(255,255,128,0.2)');
        radgrad.addColorStop(1, 'rgba(255,255,0,0)');

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
    
	r : 256,
    g : 256,
    b : 256,
	
	resetPlayerBullet : function (i) {
        Bullets.playerBullets.xLoc[i] = PlayerShip.playerShip.xLoc;
        Bullets.playerBullets.yLoc[i] = PlayerShip.playerShip.yLoc - 16;
        Bullets.playerBullets.ySpeed[i] = Bullets.playerBullets.shotSpeed;
        Bullets.playerBullets.xSpeed[i] = 0;
        Bullets.playerBullets.inPlay[i] = 1;
	}
};

Bullets.frequencyUpgrades = 0;


Bullets.explosionBits = [];
Bullets.bitsPerExplosion = 16;
Bullets.maxExplosionBits = 256;
Bullets.currentExplosionBit = 0;

Bullets.upgradeFrequency = function () {
    if (credits > upgradePrice(10, 1.2, Bullets.frequencyUpgrades)) {
        credits -= upgradePrice(10, 1.2, Bullets.frequencyUpgrades);
        Bullets.frequencyUpgrades++;
        Bullets.playerBullets.shotFrequency -= 10;
        $('#btn-freq span').text('₡' + upgradePrice(10, 1.2, Bullets.frequencyUpgrades).toFixed(0));
    }
};

Bullets.generateExplosion = function (x, y) {
    for (var i = 0; i < Bullets.bitsPerExplosion; i++) {

        if (Bullets.currentExplosionBit >= Bullets.maxExplosionBits)
            Bullets.currentExplosionBit = 0;

        Bullets.explosionBits[Bullets.currentExplosionBit] = {
            opacity: 255,
            xLoc: x,
            yLoc: y,
            color: { r: Bullets.playerBullets.r, g: Bullets.playerBullets.g, b: Bullets.playerBullets.b },
            xSpeed: -100 + Math.random() * 200,
            ySpeed: -100 + Math.random() * 200
        };

        Bullets.currentExplosionBit++;
    }

    if (Bullets.blasts.currentBlast > Bullets.blasts.maxBlasts)
        Bullets.blasts.currentBlast = 0;

    Bullets.blasts.opacity[Bullets.blasts.currentBlast] = 1;
    Bullets.blasts.xLoc[Bullets.blasts.currentBlast] = x - 16;
    Bullets.blasts.yLoc[Bullets.blasts.currentBlast] = y - 16;

    Bullets.blasts.currentBlast++;
};

Bullets.enemyBullet = function (ship, playerShip) {
    this.reset = function (ship, playerShip) {
        this.x = ship.xLoc;
        this.y = ship.yLoc + 16;

        var xDiff = playerShip.xLoc - ship.xLoc;
        var yDiff = ship.yLoc - playerShip.yLoc;
        var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

        this.xSpeed = xDiff / multi * Bullets.enemyShotSpeed;
        this.ySpeed = yDiff / multi * Bullets.enemyShotSpeed;

        this.r = 256;
        this.g = 196;
        this.b = 0;
        this.inPlay = 1;
        this.strength = Bullets.enemyShotStrength;
    }
    this.reset(ship, playerShip);
};

Bullets.updatePlayerBullets = function (timeDiff) {

    Bullets.playerBullets.lastPlayerShot += timeDiff * 1000;

    for (var i = 0; i < Bullets.playerBullets.maxPlayerBullets; i++) {
        if (Bullets.playerBullets.inPlay[i] !== 1) {

            if (Bullets.playerBullets.lastPlayerShot >= Bullets.playerBullets.shotFrequency) {

                Bullets.playerBullets.resetPlayerBullet(i);

                if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[2] < -0.25) {
                    var multi = Math.sqrt(Math.pow(playerOneAxes[2], 2) + Math.pow(playerOneAxes[3], 2));

                    Bullets.playerBullets.xSpeed[i] = playerOneAxes[2] / multi * Bullets.playerBullets.shotSpeed;
                    Bullets.playerBullets.ySpeed[i] = -1 * playerOneAxes[3] / multi * Bullets.playerBullets.shotSpeed;
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
    for (var i = 0; i < Bullets.enemyBullets.length; i++) {
        if (Bullets.enemyBullets[i] && Bullets.enemyBullets[i].inPlay === 1) {

            Bullets.enemyBullets[i].x += Bullets.enemyBullets[i].xSpeed * timeDiff;
            Bullets.enemyBullets[i].y -= Bullets.enemyBullets[i].ySpeed * timeDiff;

            if (Bullets.enemyBullets[i].y < 0 || Bullets.enemyBullets[i].y > canvasHeight || Bullets.enemyBullets[i].x < 0 || Bullets.enemyBullets[i].x > canvasWidth) {
                Bullets.enemyBullets[i].inPlay = 0;
            } else {
                if (Ships.detectCollision(PlayerShip.playerShip, Bullets.enemyBullets[i].x, Bullets.enemyBullets[i].y)) {
                    Bullets.enemyBullets[i].inPlay = 0;
                    Bullets.generateExplosion(Bullets.enemyBullets[i].x, Bullets.enemyBullets[i].y);
                    PlayerShip.playerShip.health -= Bullets.enemyBullets[i].strength;
                    
                    //TODO destroy player ship?
                }
            }
        }
    }
};

Bullets.newEnemyBullet = function (ship) {
    if (Bullets.currentEnemyBullet >= Bullets.maxEnemyBullets) {
        Bullets.currentEnemyBullet = 0;
    }

    Bullets.enemyBullets[Bullets.currentEnemyBullet] = new Bullets.enemyBullet(ship, PlayerShip.playerShip);
    Bullets.currentEnemyBullet++;
};

Bullets.drawPlayerBullet = function (i) {
    
    drawPixel(Math.round(Bullets.playerBullets.xLoc[i]), Math.round(Bullets.playerBullets.yLoc[i] - 1), Bullets.playerBullets.r, Bullets.playerBullets.g, Bullets.playerBullets.b, 255);
    drawPixel(Math.round(Bullets.playerBullets.xLoc[i]), Math.round(Bullets.playerBullets.yLoc[i]), Bullets.playerBullets.r, Bullets.playerBullets.g, Bullets.playerBullets.b, 255);
    drawPixel(Math.round(Bullets.playerBullets.xLoc[i]), Math.round(Bullets.playerBullets.yLoc[i] + 1), Bullets.playerBullets.r, Bullets.playerBullets.g, Bullets.playerBullets.b, 255);
    drawPixel(Math.round(Bullets.playerBullets.xLoc[i] - 1), Math.round(Bullets.playerBullets.yLoc[i]), Bullets.playerBullets.r, Bullets.playerBullets.g, Bullets.playerBullets.b, 255);
    drawPixel(Math.round(Bullets.playerBullets.xLoc[i] + 1), Math.round(Bullets.playerBullets.yLoc[i]), Bullets.playerBullets.r, Bullets.playerBullets.g, Bullets.playerBullets.b, 255);
};

Bullets.drawEnemyBullet = function (playerBullet) {
    drawPixel(Math.round(playerBullet.x), Math.round(playerBullet.y - 2), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x), Math.round(playerBullet.y - 1), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x), Math.round(playerBullet.y), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x), Math.round(playerBullet.y + 1), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x), Math.round(playerBullet.y + 2), playerBullet.r, playerBullet.g, playerBullet.b, 255);

    drawPixel(Math.round(playerBullet.x - 2), Math.round(playerBullet.y), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x - 1), Math.round(playerBullet.y), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x + 1), Math.round(playerBullet.y), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x + 2), Math.round(playerBullet.y), playerBullet.r, playerBullet.g, playerBullet.b, 255);
};

Bullets.drawPlayerBullets = function () {
    for (var i = 0; i < Bullets.playerBullets.maxPlayerBullets; i++) {
        if (Bullets.playerBullets.inPlay[i]) {
            //Bullets.drawPlayerBullet(i);
            ctx.drawImage(Bullets.playerBullets.art, Bullets.playerBullets.xLoc[i] + Bullets.playerBullets.offset, Bullets.playerBullets.yLoc[i] + Bullets.playerBullets.offset);
        }
            
    }
    for (var i = 0; i < Bullets.enemyBullets.length; i++) {
        if (Bullets.enemyBullets[i].inPlay) {
            //Bullets.drawEnemyBullet(Bullets.enemyBullets[i]);
            ctx.drawImage(Bullets.enemyBulletArt, Bullets.enemyBullets[i].x + Bullets.playerBullets.offset, Bullets.enemyBullets[i].y + Bullets.playerBullets.offset);
        }   
    }
};