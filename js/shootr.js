var canvas;
var canvasWidth = 480;
var canvasHeight = 640;

var isIE = false;

var ctx;
var canvasData;
var canvasDataArr;



var clickLocX, clickLocY;

var credits = 0;

var lastUpdate = 0;
var playerOneAxes = [];

function update() {

	requestAnimationFrame(update);
	//setTimeout(update); // use instead of request animation frame to turn of v-sync

    // get time difference since last frame
    var updateTime = new Date().getTime();
    var timeDiff = (Math.min(100, Math.max(updateTime - lastUpdate, 0))) / 1000;
    lastUpdate = updateTime;

    // Update gamepad state
    if (player1Gamepad > -1 && typeof navigator.getGamepads !== 'undefined' && navigator.getGamepads()[player1Gamepad]) {
        playerOneAxes = navigator.getGamepads()[player1Gamepad].axes;
    }

    if (!ShootrUI.paused) {
        // update game state
        PlayerShip.updatePlayerShip(timeDiff);
        Bullets.updatePlayerBullets(timeDiff);
        EnemyShips.update(timeDiff);
        Bullets.updateEnemyBullets(timeDiff);
    }
    
	resetCanvas();

    // render current game state
	Stars.drawStars(timeDiff);

	Stars.drawShipTrails(timeDiff);
	Stars.drawExplosions(timeDiff);
	
	
	ctx.putImageData(canvasData, 0, 0);

	Bullets.drawPlayerBullets();

    EnemyShips.drawShips(ctx, timeDiff);
    EnemyShips.drawShipFragments(ctx, timeDiff);

    PlayerShip.drawPlayerShipLine(ctx);
    PlayerShip.drawPlayerShip(ctx, timeDiff);
    
    ShootrUI.updateFps(updateTime);
}

function resetCanvas() {
	// reset canvas data
	var len = canvasWidth * canvasHeight * 4;
	for (var i =3; i < len; i+=4) {
		if (canvasDataArr[i] !== 0)
			canvasDataArr[i] = 0;
	}
}

var coords;

function startGame() {

	// create game canvas
    canvas = document.getElementById('game_canvas');
    ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
		
	canvasData = ctx.createImageData(canvasWidth, canvasHeight);
	canvasDataArr = canvasData.data;

    canvas.addEventListener('click', function (event) {
        coords = canvas.relMouseCoords(event);
        clickLocX = coords.x;
        clickLocY = coords.y;
    });
	
    Stars.resetStars();
    
    PlayerShip.playerShip.art = Ships.shipArt(PlayerShip.SHIP_SIZE, PlayerShip.playerShip.seed, false, Ships.playerColors[Math.floor(Math.random() * Ships.playerColors.length)]);
    PlayerShip.playerShip.xLoc = canvasWidth / 2;
    PlayerShip.playerShip.yLoc = canvasHeight - (canvasHeight / 6);
    
    for (var i = 0; i < PlayerShip.playerShip.SHIP_TRAIL_COUNT; i++) {
        PlayerShip.playerShip.shipTrail[i] = new Stars.shipTrailPart(PlayerShip.playerShip);
    }

    ShootrUI.updateGamepadSelect();

    update();
    ShootrUI.updateUI();
}

startGame();