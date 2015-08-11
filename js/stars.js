var Stars = {};

Stars.NUM_STARS = 300;

Stars.stars = {
	xLoc : [],
	yLoc : [],
	speed : [],
	opacity : [],
	r : [],
	g : [],
	b : []
};

Stars.resetStar = function(i) {
        Stars.stars.xLoc[i] = Math.random() * canvasWidth;
        Stars.stars.yLoc[i] = 0;
        Stars.stars.speed[i] = 10 + Math.random() * 30;
        Stars.stars.opacity[i] = 10 + Math.floor(Stars.stars.speed[i] / 40 * 245);
        Stars.stars.r[i] = 128 + Math.random() * 128 | 0;
        Stars.stars.g[i] = 128 + Math.random() * 128 | 0;
        Stars.stars.b[i] = 128 + Math.random() * 128 | 0;
};

Stars.resetStars = function() {
    for (var i = 0; i < Stars.NUM_STARS; i++) {
        Stars.resetStar(i);
        Stars.stars.yLoc[i] = Math.random() * canvasHeight;
    }
};

Stars.drawStars = function (timeDiff) {

	for (var i = 0; i < Stars.NUM_STARS; i++) {
        Stars.stars.yLoc[i] += Stars.stars.speed[i] * timeDiff;
        if (Stars.stars.yLoc[i] > canvasHeight) {
            Stars.resetStar(i);
        }
        drawPixel(Math.round(Stars.stars.xLoc[i]), Math.round(Stars.stars.yLoc[i]), 
				  Stars.stars.r[i], Stars.stars.g[i], Stars.stars.b[i], Stars.stars.opacity[i]);
    }
};

Stars.shipTrail = function (ship) {
    this.xLoc = [];
    this.yLoc = [];
    this.speed = [];
    this.xSpeed = [];
    this.opacity = [];
    this.r = [];
    this.b = [];
    this.g = [];
    this.ship = ship;
};

Stars.resetTrail = function (shipTrail, i) {

    shipTrail.xLoc[i] = shipTrail.ship.trailX - 2 + Math.random() * 4;
    shipTrail.yLoc[i] = shipTrail.ship.trailY;

    if (shipTrail.ship.enemyShip) {    
        shipTrail.speed[i] = -100 + Math.random() * -100;
        shipTrail.opacity[i] = 150 + Math.floor(-1 * shipTrail.speed[i] / 200 * 105);
    } else {
        shipTrail.speed[i] = 100 + Math.random() * 100;
        shipTrail.opacity[i] = 150 + Math.floor(shipTrail.speed[i] / 200 * 105);
    }
    shipTrail.xSpeed[i] = -20 + Math.random() * 40;

    shipTrail.r[i] = 128 + Math.random() * 128 | 0;
    shipTrail.g[i] = 128 + Math.random() * 128 | 0;
    shipTrail.b[i] = 0;
};

Stars.drawShipTrails = function (timeDiff) {
    if (PlayerShip.playerShip.inPlay === 1) {
        Stars.drawShipTrail(PlayerShip.playerShip.shipTrail, timeDiff);
    }
	
	if (EnemyShips.waves.length > 0) {
		for (var i = 0; i < EnemyShips.waves.length; i++) {
			if (EnemyShips.waves[i] && !EnemyShips.waves[i].finished) {
				for (var j = 0; j < EnemyShips.waves[i].shipsInWave; j++) {
					if (EnemyShips.waves[i].ships[j] && EnemyShips.waves[i].ships[j].inPlay) {
						Stars.drawShipTrail(EnemyShips.waves[i].ships[j].shipTrail, timeDiff);
					}
				}			
			}
		}		
	}
};

Stars.drawExplosions = function (timeDiff) {
    for (var i = 0; i < Bullets.explosionBits.maxExplosionBits; i++) {

        if (Bullets.explosionBits.opacity[i] && Bullets.explosionBits.opacity[i] > 0) {

            Bullets.explosionBits.xLoc[i] += Bullets.explosionBits.xSpeed[i] * timeDiff;
            Bullets.explosionBits.yLoc[i] += Bullets.explosionBits.ySpeed[i] * timeDiff;

            drawPixel(Math.round(Bullets.explosionBits.xLoc[i]), Math.round(Bullets.explosionBits.yLoc[i]), Bullets.explosionBits.color.r,
                        Bullets.explosionBits.color.g, Bullets.explosionBits.color.b, Bullets.explosionBits.opacity[i]);

            Bullets.explosionBits.opacity[i] -= 30000 * timeDiff / Bullets.explosionBits.opacity[i];
        }
    }
    for (var i = 0; i < EnemyShips.explosionBits.maxExplosionBits; i++) {

        if (EnemyShips.explosionBits.opacity[i] && EnemyShips.explosionBits.opacity[i] > 0) {

            EnemyShips.explosionBits.xLoc[i] += EnemyShips.explosionBits.xSpeed[i] * timeDiff;
            EnemyShips.explosionBits.yLoc[i] += EnemyShips.explosionBits.ySpeed[i] * timeDiff;

            drawPixel(Math.round(EnemyShips.explosionBits.xLoc[i]), Math.round(EnemyShips.explosionBits.yLoc[i]), EnemyShips.explosionBits.color[i].r,
                    EnemyShips.explosionBits.color[i].g, EnemyShips.explosionBits.color[i].b, EnemyShips.explosionBits.opacity[i]);

            if (EnemyShips.explosionBits.vertical[i]) {
                drawPixel(Math.round(EnemyShips.explosionBits.xLoc[i]), Math.round(EnemyShips.explosionBits.yLoc[i] + 1), EnemyShips.explosionBits.color[i].r,
                    EnemyShips.explosionBits.color[i].g, EnemyShips.explosionBits.color[i].b, EnemyShips.explosionBits.opacity[i]);
                drawPixel(Math.round(EnemyShips.explosionBits.xLoc[i]), Math.round(EnemyShips.explosionBits.yLoc[i] - 1), EnemyShips.explosionBits.color[i].r,
                    EnemyShips.explosionBits.color[i].g, EnemyShips.explosionBits.color[i].b, EnemyShips.explosionBits.opacity[i]);
            } else {
                drawPixel(Math.round(EnemyShips.explosionBits.xLoc[i] + 1), Math.round(EnemyShips.explosionBits.yLoc[i]), EnemyShips.explosionBits.color[i].r,
                    EnemyShips.explosionBits.color[i].g, EnemyShips.explosionBits.color[i].b, EnemyShips.explosionBits.opacity[i]);
                drawPixel(Math.round(EnemyShips.explosionBits.xLoc[i] - 1), Math.round(EnemyShips.explosionBits.yLoc[i]), EnemyShips.explosionBits.color[i].r,
                    EnemyShips.explosionBits.color[i].g, EnemyShips.explosionBits.color[i].b, EnemyShips.explosionBits.opacity[i]);
            }
            EnemyShips.explosionBits.opacity[i] -= 20000 * timeDiff / EnemyShips.explosionBits.opacity[i];
        }
    }
};

Stars.drawShipTrail = function (shipTrail, timeDiff) {
    var shipTrailCount = shipTrail.ship.enemyShip && shipTrail.ship.health < shipTrail.ship.wave.shipHealth ? 10 : shipTrail.ship.SHIP_TRAIL_COUNT;
    //var shipTrailCount = shipTrail.ship.SHIP_TRAIL_COUNT;

    for (var i = 0; i < shipTrailCount; i++) {

        if (shipTrail.opacity[i] && shipTrail.opacity[i] > 10) {
            drawPixel(Math.round(shipTrail.xLoc[i]), Math.round(shipTrail.yLoc[i]), shipTrail.r[i],
                    shipTrail.g[i], shipTrail.b[i], shipTrail.opacity[i]);

            shipTrail.yLoc[i] += shipTrail.speed[i] * timeDiff;
            shipTrail.xLoc[i] += shipTrail.xSpeed[i] * timeDiff;

            shipTrail.opacity[i] -= 1500 / shipTrail.opacity[i];
        } else {
            Stars.resetTrail(shipTrail, i);
        }
    }
};