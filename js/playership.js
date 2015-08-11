var PlayerShip = {};

PlayerShip.allPlayersDead = 0;
PlayerShip.allDeadTimer = 0;
PlayerShip.allDeadTime = 3000;

PlayerShip.colorsRgb = [];
for (var i = 0; i < Ships.playerColors[0].length; i++) {
    PlayerShip.colorsRgb[i] = hexToRgb(Ships.playerColors[0][i]);
}

PlayerShip.shipFragments = Ships.shipFragments(PlayerShip.colorsRgb);

PlayerShip.SHIP_SIZE = 64;

PlayerShip.playerShip = {
    seed: 1,
    xLoc: 320,
    yLoc: 480,
    maxSpeed: 100,
    offset: PlayerShip.SHIP_SIZE / 2,
    rotation: 0,
    SHIP_TRAIL_COUNT: Ships.shipTrailCount,
    maxShield: 10,
    currShield: 10,
    shieldRegen: 2,
    shieldDelay: 5000,
    lastDmg: 0,
    inPlay: 1
};

PlayerShip.newShip = function () {
    PlayerShip.playerShip.seed = Date.now();
    PlayerShip.playerShip.art = Ships.shipArt(PlayerShip.SHIP_SIZE, PlayerShip.playerShip.seed, false, Ships.playerColors[Math.floor(Math.random() * Ships.playerColors.length)]);
    PlayerShip.playerShip.shipTrail = new Stars.shipTrail(PlayerShip.playerShip);
};

PlayerShip.updatePlayerShip = function (timeDiff) {
    if (PlayerShip.allPlayersDead === 1) {
        PlayerShip.allDeadTimer += (timeDiff * 1000);
        if (PlayerShip.allDeadTimer > PlayerShip.allDeadTime) {
            changeState(states.levelFailed);
        }
        return;
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

        var xDiff = clickLocX - PlayerShip.playerShip.xLoc;
        var yDiff = clickLocY - PlayerShip.playerShip.yLoc;

        Ships.updateShipSpeed(PlayerShip.playerShip, xDiff, yDiff, timeDiff);
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
};

PlayerShip.damagePlayerShip = function (playerShip, damage) {
    playerShip.currShield -= damage;
    playerShip.lastDmg = 0;
    if (playerShip.currShield <= 0 && playerShip.inPlay === 1) {
        playerShip.inPlay = 0;
        PlayerShip.allPlayersDead = 1;
        PlayerShip.allDeadTimer = 0;
        PlayerShip.generateExplosion(playerShip);
    }
};

PlayerShip.drawPlayerShip = function (ctx, timeDiff) {
    if (PlayerShip.playerShip.inPlay === 1) {
        ctx.save();
        ctx.translate(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc);
        ctx.rotate(PlayerShip.playerShip.rotation);
        ctx.drawImage(PlayerShip.playerShip.art, -PlayerShip.playerShip.offset, -PlayerShip.playerShip.offset);
        ctx.restore();
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

PlayerShip.generateExplosion = function (ship) {
    for (var i = 0; i < EnemyShips.explosionBits.bitsPerExplosion; i++) {
        EnemyShips.explosionBits.newExplosionBit(ship, PlayerShip.colorsRgb);
    }

    var fragmentCount = 15;

    for (var i = 0; i < fragmentCount; i++) {

        if (EnemyShips.currentExplosionFragment >= EnemyShips.maxExplosionFragments)
            EnemyShips.currentExplosionFragment = 0;

        EnemyShips.fragments[EnemyShips.currentExplosionFragment] = {
            opacity: 1,
            xLoc: ship.xLoc - 5 + Math.random() * 10,
            yLoc: ship.yLoc - 5 + Math.random() * 10,
            bitmap: PlayerShip.shipFragments[Math.floor(Math.random() * PlayerShip.shipFragments.length)],
            xSpeed: (ship.xSpeed / 2) - 50 + Math.random() * 100,
            ySpeed: (ship.ySpeed / 2) - 50 + Math.random() * 100,
            rotation: Math.random() * 3.14,
            rotationSpeed: -1 + Math.random() * 2
        };
        EnemyShips.fragments[EnemyShips.currentExplosionFragment].width =
			EnemyShips.fragments[EnemyShips.currentExplosionFragment].bitmap.width;

        EnemyShips.currentExplosionFragment++;
    }

    if (Ships.currentBlast > Ships.maxBlasts)
        Ships.currentBlast = 0;

    Ships.blasts[Ships.currentBlast] = {
        opacity: 1,
        xLoc: ship.xLoc - 32,
        yLoc: ship.yLoc - 32
    };

    Ships.currentBlast++;
};