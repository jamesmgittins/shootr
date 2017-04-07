Boss = {
  health:100,
  maxSpeed:75,
  initialized :false,
  lastDamaged :0,
  rotation:0,
  lastTrail:0,
  inPlay:1,
  lastBullet:0,
  bulletsLeft:0,
  maxBulletsPerShot:20,
  enemyShip : true
};

Boss.flightPatterns = [
    {
        xCoords: [0.8, 0.2],
        yCoords: [0.2, 0.2]
    }
];
Boss.hardFlightPatterns = [
    {
        xCoords: [0.5, 0.2, 0.5, 0.8],
        yCoords: [0.2, 0.7, 0.2, 0.7]
    }
];

Boss.isInTargetSystem = function() {
  return gameModel.bossPosition && gameModel.bossPosition.x == gameModel.targetSystem.x && gameModel.targetSystem.y == gameModel.bossPosition.y;
};

Boss.bossActive = function() {
  return Boss.isInTargetSystem() && Boss.health > 0;
};

Boss.randomLocation = function() {
  if (!gameModel.bossesDefeated)
    gameModel.bossesDefeated = 0;

    Math.seedrandom(new Date().getTime());

  var currentLevel = Constants.levelsPerBoss * (gameModel.bossesDefeated + 1);
  var xLocation = 0;
  var yLocation = 0;

  if (Math.random() > 0.5) {
    xLocation = Math.random() > 0.5 ? currentLevel : currentLevel * -1;
    yLocation = Math.round(-currentLevel + Math.random() * currentLevel);
  } else {
    yLocation = Math.random() > 0.5 ? currentLevel : currentLevel * -1;
    xLocation = Math.round(-currentLevel + Math.random() * currentLevel);
  }

  gameModel.bossPosition = {x:xLocation, y:yLocation};
  console.log("boss position set to - " + gameModel.bossPosition);

};

Boss.nudgeLocation = function() {
  var currentLevel = Constants.levelsPerBoss * (gameModel.bossesDefeated + 1);

  var xLocation = gameModel.bossPosition.x + (Math.random() > 0.5 ? 1 : -1);
  var yLocation = gameModel.bossPosition.y + (Math.random() > 0.5 ? 1 : -1);

  if (xLocation < -currentLevel)
    xLocation = -currentLevel;
  if (xLocation > currentLevel)
    xLocation = currentLevel;
  if (yLocation < -currentLevel)
    yLocation = -currentLevel;
  if (yLocation > currentLevel)
    yLocation = currentLevel;

  gameModel.bossPosition = {x:xLocation, y:yLocation};

};

Boss.update = function(timeDiff) {

  if (!Boss.initialized) {
    var size = Math.round(96 + Math.random() * 32);
    Boss.offset = Math.round(size / 2);
    Boss.colors = Ships.enemyColors[Math.floor(Math.random() * Ships.enemyColors.length)];
    Boss.flightPattern = Boss.flightPatterns[Math.floor(Math.random() * Boss.flightPatterns.length)];
    Boss.nextCoord = 0;
    Boss.lastBullet = 0;
    Boss.maxHealth = Boss.health;
    Boss.maxSpeed = 75;
    Boss.patternChanged = false;
    var seed = Date.now();

    Boss.texture = glowTexture(PIXI.Texture.fromCanvas(Ships.shipArt(size, seed, true, this.colors)));
    Boss.damageTexture = glowTexture(PIXI.Texture.fromCanvas(Ships.shipArt(size, seed, true, this.colors, true)));

    if (EnemyShips.discardedSprites.length > 0) {
      Boss.sprite = EnemyShips.discardedSprites.pop();
      Boss.sprite.texture = Boss.texture;
      Boss.sprite.tint = 0xFFFFFF;
    } else {
      Boss.sprite = new PIXI.Sprite(Boss.texture);
      enemyShipContainer.addChild(Boss.sprite);
      EnemyShips.sprites.push(Boss.sprite);
    }



    Boss.xLoc = canvasWidth * 0.5;
    Boss.xTar = canvasWidth * 0.5;
    Boss.yLoc = canvasHeight * -0.2;
    Boss.yTar = canvasHeight * 0.3;

    Boss.sprite.position.x = Boss.xLoc * scalingFactor;
  	Boss.sprite.position.y = Boss.yLoc * scalingFactor;
  	Boss.sprite.anchor = {x:0.5,y:0.5};

    Boss.inPlay=1;
    Boss.initialized = true;
    Boss.collisionAllowed = false;
    Boss.shield.init();
  }

  Stars.shipTrails.updateShip(Boss, timeDiff);
  if (Boss.health > 0) {
    Boss.sprite.visible = true;
  }

  if (Math.sqrt(Math.pow(Boss.xLoc - Boss.xTar, 2) +
          Math.pow(Boss.yLoc - Boss.yTar, 2)) > 5) {

    var xDiff = Boss.xTar - Boss.xLoc;
    var yDiff = Boss.yTar - Boss.yLoc;

    Ships.updateShipSpeed(Boss, xDiff, yDiff, timeDiff);
    Ships.updateRotation(Boss, timeDiff);

    Boss.sprite.position.x = Boss.xLoc * scalingFactor;
    Boss.sprite.position.y = Boss.yLoc * scalingFactor;
    Boss.sprite.rotation = -Boss.rotation;
    Boss.lastDamaged += timeDiff;

    if (Boss.lastDamaged > 0.06)
      Boss.sprite.texture = Boss.texture;

  } else {
    Boss.nextCoord++;

    if (Boss.nextCoord >= Boss.flightPattern.xCoords.length)
      Boss.nextCoord = 0;

    Boss.collisionAllowed = true;

    Boss.xTar = canvasWidth * Boss.flightPattern.xCoords[Boss.nextCoord];
    Boss.yTar = canvasHeight * Boss.flightPattern.yCoords[Boss.nextCoord];
  }

  if (Boss.collisionAllowed) {
    EnemyShips.activeShips.push(Boss);
    EnemyShips.checkForPlayerCollision(Boss);
    Boss.shield.update();

    if (Boss.lastBullet >= 1.5 && Math.random() > 0.9 || Boss.bulletsLeft > 0) {
      if (Boss.bulletsLeft <= 0) {
        Boss.bulletsLeft = Math.max(5,Math.round(Math.random() * Boss.maxBulletsPerShot));
      }
      if (Boss.lastBullet >= 0.15) {
        Bullets.enemyBullets.newEnemyBullet(Boss);
        if (Math.random() > 0.9) {
          Bullets.enemyBullets.newEnemyBullet(Boss, -0.15);
          Bullets.enemyBullets.newEnemyBullet(Boss, -0.3);
          Bullets.enemyBullets.newEnemyBullet(Boss, 0.15);
          Bullets.enemyBullets.newEnemyBullet(Boss, 0.3);
        }
        Boss.lastBullet = 0;
        Boss.bulletsLeft--;
      }
    }
    Boss.lastBullet+=timeDiff;

    if (!Boss.patternChanged && Boss.health < Boss.maxHealth / 2) {
      Boss.maxSpeed = 100;
      Boss.flightPattern = Boss.hardFlightPatterns[Math.floor(Math.random() * Boss.hardFlightPatterns.length)];
      Boss.nextCoord = 0;
      Boss.xTar = canvasWidth * Boss.flightPattern.xCoords[Boss.nextCoord];
      Boss.yTar = canvasHeight * Boss.flightPattern.yCoords[Boss.nextCoord];
      Bullets.enemyBullets.enemyShotSpeed *= 1.2;
      Boss.patternChanged = true;
    }

  }


};


Boss.shield = {
  init:function() {

    // Boss.shield.shieldBarBackground = new PIXI.Graphics();
    // Boss.shield.shieldBarBackground.beginFill(0x200000);
    // Boss.shield.shieldBarBackground.drawRect(sideSpace + canvasWidth * 0.1, canvasHeight * 0.05, canvasWidth * 0.8, canvasHeight * 0.05);
    //
    // GameText.status.container.addChild(Boss.shield.shieldBarBackground);

    if (!Boss.shield.shieldBar) {
      Boss.shield.shieldBar = new PIXI.Graphics();
      uiContainer.addChild(Boss.shield.shieldBar);
      Boss.shield.shieldOutline = new PIXI.Graphics();
      uiContainer.addChild(Boss.shield.shieldOutline);
    }

    Boss.shield.shieldOutline.lineStyle(1, 0xFFFFFF);
    Boss.shield.shieldOutline.drawRect(
    canvasWidth * 0.05 * scalingFactor - 2,
    canvasHeight * 0.02 * scalingFactor - 2,
    canvasWidth * 0.9 * scalingFactor + 2,
    canvasHeight * 0.02 * scalingFactor + 2);
    Boss.shield.shieldOutline.tint = 0x005500;

    Boss.shield.shieldOutline.visible = true;
    Boss.shield.shieldBar.visible = true;
  },
  update:function() {
    var barWidth = Math.round(Boss.health / Boss.maxHealth * canvasWidth * 0.9);
    Boss.shield.shieldBar.clear();
    Boss.shield.shieldBar.beginFill(0xFF0000);
    Boss.shield.shieldBar.alpha = 0.6;
    Boss.shield.shieldBar.drawRect(
      canvasWidth * 0.05 * scalingFactor,
      canvasHeight * 0.02 * scalingFactor,
      barWidth * scalingFactor,
      canvasHeight * 0.02 * scalingFactor);
  },
  hide:function() {
    if (Boss.shield.shieldOutline) {
      Boss.shield.shieldOutline.visible = false;
      Boss.shield.shieldBar.visible = false;
    }
  }
};
