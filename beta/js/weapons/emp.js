EMP = {
  baseRadius : 512,
  createTexture : function () {
    var blast = document.createElement('canvas');
    blast.width = EMP.baseRadius * 2;
    blast.height = EMP.baseRadius * 2;
    var blastCtx = blast.getContext('2d');

    var radgrad = blastCtx.createRadialGradient(EMP.baseRadius, EMP.baseRadius, EMP.baseRadius/2, EMP.baseRadius, EMP.baseRadius, EMP.baseRadius);
    radgrad.addColorStop(0, 'rgba(255,255,255,0)');
    radgrad.addColorStop(0.8, 'rgba(255,255,255,0)');
    radgrad.addColorStop(0.97, 'rgba(255,225,225,0.5)');
    radgrad.addColorStop(0.98, 'rgba(255,225,225,1)');
    radgrad.addColorStop(1, 'rgba(255,225,225,0)');

    // draw shape
    blastCtx.fillStyle = radgrad;
    blastCtx.fillRect(0, 0, EMP.baseRadius * 2, EMP.baseRadius * 2);

    return PIXI.Texture.fromCanvas(blast);
  },
  getSpritePool : function () {
    if (!this.spritePool) {
      this.spritePool = SpritePool.create(EMP.createTexture(), playerBulletContainer);
    }
    return this.spritePool;
  },
  destroy : function() {
    if (this.spritePool) {
      this.spritePool.destroy();
      this.spritePool = false;
    }
  },
  update : function(timeDiff) {
    for (var i = 0; i < this.getSpritePool().sprites.length; i++) {
      var sprite = this.getSpritePool().sprites[i];
      if (sprite.visible) {
        sprite.radius += sprite.speed * timeDiff;
        sprite.scale.x = sprite.scale.y = (sprite.radius / EMP.baseRadius) * scalingFactor;
        sprite.position.x = sprite.xLoc * scalingFactor;
        sprite.position.y = sprite.yLoc * scalingFactor;
        if (sprite.radius > sprite.maxRadius) {
          this.spritePool.discardSprite(sprite);
        } else {
          for (var j = 0; j < Enemies.activeShips.length; j++) {
						var enemyShip = Enemies.activeShips[j];
            var shipAlreadyDamaged = false;
            for (var k = 0; k < sprite.shipsDamaged; k++) {
              if (sprite.shipsDamaged[k] == enemyShip.id)
                shipAlreadyDamaged = true;
            }
            if (!shipAlreadyDamaged) {
              if (sprite.radius > distanceBetweenPoints(enemyShip.xLoc, enemyShip.yLoc, sprite.xLoc, sprite.yLoc) && sprite.radius * 0.9 < distanceBetweenPoints(enemyShip.xLoc, enemyShip.yLoc, sprite.xLoc, sprite.yLoc)) {
                Enemies.damageEnemy(enemyShip, enemyShip.xLoc, enemyShip.yLoc, sprite.damage);
                sprite.shipsDamaged.push(enemyShip.id);
              }
            }
					}
        }
      }
    }
  },
  newEmp : function(x, y, damage, tint, speed) {
    var sprite = this.getSpritePool().nextSprite();
    sprite.anchor = {x:0.5, y:0.5};
    sprite.tint = tint;
    sprite.speed = speed;
    sprite.xLoc = x;
    sprite.position.x = x * scalingFactor;
    sprite.yLoc = y;
    sprite.position.y = y * scalingFactor;
    sprite.visible = true;
    sprite.damage = damage;
    sprite.alpha = 1;
    sprite.scale.x = sprite.scale.y = 0;
    sprite.radius = 0;
    sprite.shipsDamaged = [];
    sprite.maxRadius = Math.max(
      distanceBetweenPoints(x,y,0,0),
      distanceBetweenPoints(x,y,0,canvasHeight),
      distanceBetweenPoints(x,y,canvasWidth,0),
      distanceBetweenPoints(x,y,canvasWidth,canvasHeight));
  }
};
