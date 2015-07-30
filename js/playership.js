var PlayerShip = {};

PlayerShip.SHIP_SIZE = 64;

PlayerShip.playerShip = {
    seed: 1,
    xLoc: 320,
    yLoc: 480,
    maxSpeed: 100,
    offset: PlayerShip.SHIP_SIZE / 2,
    rotation: 0,
    shipTrail: [],
    SHIP_TRAIL_COUNT: Ships.shipTrailCount,
    health: 10
};

PlayerShip.newShip = function () {
    PlayerShip.playerShip.seed = Date.now();
    PlayerShip.playerShip.art = Ships.shipArt(PlayerShip.SHIP_SIZE, PlayerShip.playerShip.seed, false, Ships.playerColors[Math.floor(Math.random() * Ships.playerColors.length)]);
};

PlayerShip.updatePlayerShip = function (timeDiff) {
    if (playerOneAxes[0] > 0.25 || playerOneAxes[0] < -0.25 || playerOneAxes[1] > 0.25 || playerOneAxes[1] < -0.25) {
        Ships.updateShipSpeed(PlayerShip.playerShip, playerOneAxes[0], playerOneAxes[1], timeDiff);
    } else if (clickLocX && clickLocY && Math.sqrt(Math.pow(PlayerShip.playerShip.xLoc - clickLocX, 2) + Math.pow(PlayerShip.playerShip.yLoc - clickLocY, 2)) > 5) {

        var xDiff = clickLocX - PlayerShip.playerShip.xLoc;
        var yDiff = clickLocY - PlayerShip.playerShip.yLoc;

        Ships.updateShipSpeed(PlayerShip.playerShip, xDiff, yDiff, timeDiff);
    } else {
        clickLocX = null;
        clickLocY = null;
        PlayerShip.playerShip.xSpeed = 0;
        PlayerShip.playerShip.ySpeed = 0;
    }
    var maxRot = PlayerShip.playerShip.xSpeed / 500;
    var timeMult = timeDiff;

	Ships.updateRotation(PlayerShip.playerShip, timeDiff);
};

PlayerShip.drawPlayerShip = function (ctx, timeDiff) {
    ctx.save();
    ctx.translate(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc);
    ctx.rotate(PlayerShip.playerShip.rotation);
    ctx.drawImage(PlayerShip.playerShip.art, -PlayerShip.playerShip.offset, -PlayerShip.playerShip.offset);
    ctx.restore();
};

PlayerShip.drawPlayerShipLine = function (ctx) {
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
};