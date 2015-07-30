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

Stars.shipTrailPart = function (ship) {
    this.reset = function (ship) {
        var tempX = -2 + Math.random() * 4;
        var tempY = ship.enemyShip ? -20 : 20;
        var tempRotation = ship.enemyShip ? ship.rotation * -1 : ship.rotation;

        var x = Math.cos(tempRotation) * tempX - Math.sin(tempRotation) * tempY + ship.xLoc;
        var y = Math.sin(tempRotation) * tempX + Math.cos(tempRotation) * tempY + ship.yLoc;
        
        this.y = y;
        this.x = x;

		if (ship.enemyShip) {    
	        this.speed = -100 + Math.random() * -100;
	        this.opacity = 10 + Math.floor(-1 * this.speed / 200 * 245);
		} else {
	        this.speed = 100 + Math.random() * 100;
	        this.opacity = 10 + Math.floor(this.speed / 200 * 245);
		}

        this.r = 128 + Math.random() * 128 | 0;
        this.g = 128 + Math.random() * 128 | 0;
        this.b = 0;
    };
    this.reset(ship);
};

Stars.drawShipTrails = function (timeDiff) {
	Stars.drawShipTrail(PlayerShip.playerShip, timeDiff);
	
	if (EnemyShips.waves.length > 0) {
		for (var i = 0; i < EnemyShips.waves.length; i++) {
			if (EnemyShips.waves[i] && !EnemyShips.waves[i].finished) {
				for (var j = 0; j < EnemyShips.waves[i].shipsInWave; j++) {
					if (EnemyShips.waves[i].ships[j] && EnemyShips.waves[i].ships[j].inPlay) {
						Stars.drawShipTrail(EnemyShips.waves[i].ships[j], timeDiff);
					}
				}			
			}
		}		
	}
};

Stars.drawExplosions = function (timeDiff) {
    for (var i = 0; i < Bullets.explosionBits.length; i++) {

        if (Bullets.explosionBits[i] && Bullets.explosionBits[i].opacity > 0) {

            Bullets.explosionBits[i].opacity -= 20000 * timeDiff / Bullets.explosionBits[i].opacity;

            if (Bullets.explosionBits[i].opacity > 0) {

                Bullets.explosionBits[i].xLoc += Bullets.explosionBits[i].xSpeed * timeDiff;
                Bullets.explosionBits[i].yLoc += Bullets.explosionBits[i].ySpeed * timeDiff;
                Bullets.explosionBits[i].opacity -= 100 * timeDiff;

                drawPixel(Math.round(Bullets.explosionBits[i].xLoc), Math.round(Bullets.explosionBits[i].yLoc), Bullets.explosionBits[i].color.r,
                        Bullets.explosionBits[i].color.g, Bullets.explosionBits[i].color.b, Bullets.explosionBits[i].opacity);
            }
        }
    }
    for (var i = 0; i < EnemyShips.explosionBits.length; i++) {

        if (EnemyShips.explosionBits[i] && EnemyShips.explosionBits[i].opacity > 0) {

            EnemyShips.explosionBits[i].opacity -= 20000 * timeDiff / EnemyShips.explosionBits[i].opacity;

            if (EnemyShips.explosionBits[i].opacity > 0) {

                EnemyShips.explosionBits[i].xLoc += EnemyShips.explosionBits[i].xSpeed * timeDiff;
                EnemyShips.explosionBits[i].yLoc += EnemyShips.explosionBits[i].ySpeed * timeDiff;

                drawPixel(Math.round(EnemyShips.explosionBits[i].xLoc), Math.round(EnemyShips.explosionBits[i].yLoc), EnemyShips.explosionBits[i].color.r,
                        EnemyShips.explosionBits[i].color.g, EnemyShips.explosionBits[i].color.b, EnemyShips.explosionBits[i].opacity);

                if (EnemyShips.explosionBits[i].vertical) {
                    drawPixel(Math.round(EnemyShips.explosionBits[i].xLoc), Math.round(EnemyShips.explosionBits[i].yLoc + 1), EnemyShips.explosionBits[i].color.r,
                        EnemyShips.explosionBits[i].color.g, EnemyShips.explosionBits[i].color.b, EnemyShips.explosionBits[i].opacity);
                    drawPixel(Math.round(EnemyShips.explosionBits[i].xLoc), Math.round(EnemyShips.explosionBits[i].yLoc - 1), EnemyShips.explosionBits[i].color.r,
                        EnemyShips.explosionBits[i].color.g, EnemyShips.explosionBits[i].color.b, EnemyShips.explosionBits[i].opacity);
                } else {
                    drawPixel(Math.round(EnemyShips.explosionBits[i].xLoc + 1), Math.round(EnemyShips.explosionBits[i].yLoc), EnemyShips.explosionBits[i].color.r,
                        EnemyShips.explosionBits[i].color.g, EnemyShips.explosionBits[i].color.b, EnemyShips.explosionBits[i].opacity);
                    drawPixel(Math.round(EnemyShips.explosionBits[i].xLoc - 1), Math.round(EnemyShips.explosionBits[i].yLoc), EnemyShips.explosionBits[i].color.r,
                        EnemyShips.explosionBits[i].color.g, EnemyShips.explosionBits[i].color.b, EnemyShips.explosionBits[i].opacity);
                }
            }
        }
    }
};

Stars.drawShipTrail = function (ship, timeDiff) {
    var shipTrailCount = ship.enemyShip && ship.health < ship.wave.shipHealth ? 10 : ship.SHIP_TRAIL_COUNT;

    for (var i = 0; i < shipTrailCount; i++) {
        ship.shipTrail[i].y += ship.shipTrail[i].speed * timeDiff;
        //ship.shipTrail[i].x += -1 + Math.random() * 2;
        ship.shipTrail[i].opacity -= (1500 / ship.shipTrail[i].opacity);
        if (ship.shipTrail[i].opacity < 10) {
            ship.shipTrail[i].reset(ship);
        }
        drawPixel(Math.round(ship.shipTrail[i].x), Math.round(ship.shipTrail[i].y), ship.shipTrail[i].r,
                    ship.shipTrail[i].g, ship.shipTrail[i].b, ship.shipTrail[i].opacity);
    }
};