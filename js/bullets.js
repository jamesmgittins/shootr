var Bullets = {};

Bullets.enemyBullets = [];
Bullets.maxEnemyBullets = 100;
Bullets.currentEnemyBullet = 0;
Bullets.enemyShotSpeed = 100;
Bullets.enemyShotStrength = 1;

Bullets.playerBullets = [];
Bullets.maxPlayerBullets = 100;
Bullets.lastPlayerShot = 0;
Bullets.shotSpeed = 100;

Bullets.shotFrequency = 1000;
Bullets.frequencyUpgrades = 0;

Bullets.shotStrength = 1;

Bullets.explosionBits = [];
Bullets.bitsPerExplosion = 16;
Bullets.maxExplosionBits = 256;
Bullets.currentExplosionBit = 0;

Bullets.upgradeFrequency = function () {
    if (credits > upgradePrice(10, 1.2, Bullets.frequencyUpgrades)) {
        credits -= upgradePrice(10, 1.2, Bullets.frequencyUpgrades);
        Bullets.frequencyUpgrades++;
        Bullets.shotFrequency -= 10;
        $('#btn-freq span').text('₡' + upgradePrice(10, 1.2, Bullets.frequencyUpgrades).toFixed(0));
    }
};

Bullets.generateExplosion = function (bullet) {
    for (var i = 0; i < Bullets.bitsPerExplosion; i++) {

        if (Bullets.currentExplosionBit >= Bullets.maxExplosionBits)
            Bullets.currentExplosionBit = 0;

        Bullets.explosionBits[Bullets.currentExplosionBit] = {
            opacity: 255,
            xLoc: bullet.x,
            yLoc: bullet.y,
            color: { r: bullet.r, g: bullet.g, b: bullet.b },
            xSpeed: -100 + Math.random() * 200,
            ySpeed: -100 + Math.random() * 200
        };

        Bullets.currentExplosionBit++;
    }
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

Bullets.playerBullet = function () {
    this.reset = function () {
        this.x = PlayerShip.playerShip.xLoc;
        this.y = PlayerShip.playerShip.yLoc - 16;
        this.ySpeed = Bullets.shotSpeed;
        this.xSpeed = 0;
        this.r = 256;
        this.g = 256;
        this.b = 256;
        this.inPlay = 1;
        this.strength = Bullets.shotStrength;
    }
    this.reset();
};

Bullets.updatePlayerBullets = function (timeDiff) {

    Bullets.lastPlayerShot += timeDiff * 1000;

    for (var i = 0; i < Bullets.maxPlayerBullets; i++) {
        if (!Bullets.playerBullets[i] || Bullets.playerBullets[i].inPlay !== 1) {
            if (Bullets.lastPlayerShot >= Bullets.shotFrequency) {
                if (Bullets.playerBullets[i]) {
                    Bullets.playerBullets[i].reset();
                } else {
                    Bullets.playerBullets[i] = new Bullets.playerBullet();
                }
                if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[2] < -0.25) {
                    var multi = Math.sqrt(Math.pow(playerOneAxes[2], 2) + Math.pow(playerOneAxes[3], 2));
                    Bullets.playerBullets[i].xSpeed = playerOneAxes[2] / multi * Bullets.shotSpeed;
                    Bullets.playerBullets[i].ySpeed = -1 * playerOneAxes[3] / multi * Bullets.shotSpeed;
                }
                Bullets.lastPlayerShot = 0;
            }
        } else {
            Bullets.playerBullets[i].x += Bullets.playerBullets[i].xSpeed * timeDiff;
            Bullets.playerBullets[i].y -= Bullets.playerBullets[i].ySpeed * timeDiff;
            if (Bullets.playerBullets[i].y < 0 || Bullets.playerBullets[i].y > canvasHeight || Bullets.playerBullets[i].x < 0 || Bullets.playerBullets[i].x > canvasWidth) {
                Bullets.playerBullets[i].inPlay = 0;
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
                    Bullets.generateExplosion(Bullets.enemyBullets[i]);
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

Bullets.drawPlayerBullet = function (playerBullet) {
    drawPixel(Math.round(playerBullet.x), Math.round(playerBullet.y - 1), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x), Math.round(playerBullet.y), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x), Math.round(playerBullet.y + 1), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x - 1), Math.round(playerBullet.y), playerBullet.r, playerBullet.g, playerBullet.b, 255);
    drawPixel(Math.round(playerBullet.x + 1), Math.round(playerBullet.y), playerBullet.r, playerBullet.g, playerBullet.b, 255);
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
    for (var i = 0; i < Bullets.playerBullets.length; i++) {
        if (Bullets.playerBullets[i].inPlay)
            Bullets.drawPlayerBullet(Bullets.playerBullets[i]);
    }
    for (var i = 0; i < Bullets.enemyBullets.length; i++) {
        if (Bullets.enemyBullets[i].inPlay)
            Bullets.drawEnemyBullet(Bullets.enemyBullets[i]);
    }
};