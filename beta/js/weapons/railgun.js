RailGun = {

	laserCannon : function(level,seed,rarity) {

		var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
		Math.seedrandom(seed);
		var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * rarity.factor;
		var shotsPerSecond = 0.6 + Math.random() * 1.3;
		var damagePerShot = dps / shotsPerSecond;
		var laserCannon = {
	    super:rarity.super,
			ultra:rarity.ultra,
	    hyper:rarity.hyper,
			type: Constants.itemTypes.weapon,
			name: rarity.prefix + "Railgun",
			seed: seed,
			level: level,
			dps: dps,
			shotsPerSecond: shotsPerSecond,
			damagePerShot: damagePerShot,
			accuracy: 0.5 + Math.random() * 0.5,
			price: Math.round(dps * 30),
			id: gameModel.weaponIdCounter++,
			weaponType : Weapons.types.railGun
		};

		if (rarity.ultra || rarity.hyper) {
			if (Math.random() > 0.5) {
				laserCannon.splitBeamOnKill = true;
				laserCannon.ultraName = "Chain Reaction";
				laserCannon.ultraText = "Whenever this gun destroys an enemy, the beam will split";
			} else {
				laserCannon.emp = damagePerShot * 0.2;
				laserCannon.empChance = 0.08 + Math.random() * 0.04;
				laserCannon.ultraName = "Focus Charge";
				laserCannon.ultraText = Math.round(laserCannon.empChance * 100) + "% chance on hit to trigger a shockwave for " + formatMoney(laserCannon.emp) + " damage";
			}

		}

		return laserCannon;
	},

	generateTexture : function() {
    return Stars.stars.getTexture();
  },

	updateBullets : function(timeDiff, spritePool) {

		if (spritePool.destroyed)
			return;

    for (var i = 0; i < spritePool.sprites.length; i++) {
      var sprite = spritePool.sprites[i];
      if (sprite.visible) {
        sprite.position.x += sprite.speed.x * timeDiff * scalingFactor;
        sprite.position.y += sprite.speed.y * timeDiff * scalingFactor;
        sprite.scale.x = Math.max(sprite.scale.x - 16 * scalingFactor * timeDiff, 0);
        sprite.alpha -= 0.5 * timeDiff;
        if (sprite.scale.x <= 0) {
          spritePool.discardSprite(sprite);
        }
      }
    }
	},

  create: function(weapon, container) {

		weapon.lastShot = 0;

		return {
			weapon : weapon,
			spritePool : SpritePool.create(RailGun.generateTexture(), container),
			resize : function(){
				this.spritePool.changeTexture(RailGun.generateTexture());
			},
			update : function(timeDiff) {
				this.beamTrails.update(timeDiff);
				RailGun.updateBullets(timeDiff, this.spritePool);
			},
			readyToFire : function(isWeaponFiring, timeDiff) {
				if (isWeaponFiring) {
					this.weapon.lastShot += timeDiff;
					return this.weapon.lastShot > 1 / this.weapon.shotsPerSecond;
				}
			},
			fireShot : function(position, damageModifier) {
				this.weapon.lastShot = 0;
        Sounds.playerLaser.play(position.x);
        var sprite = this.spritePool.nextSprite();
        sprite.anchor = {
          x: 0.5,
          y: 1
        };
        sprite.tint = 0x6030E0;
        sprite.scale.y = 640 * scalingFactor;
        sprite.xLoc = position.x;
        sprite.yLoc = position.y;
        sprite.position.x = position.x * scalingFactor;
        sprite.position.y = position.y * scalingFactor;
        sprite.visible = true;
        sprite.alpha = 1;
        sprite.speed = RotateVector2d(0, -200, position.angle);
        sprite.scale.x = 7 * scalingFactor;
        var wobble = (1 - this.weapon.accuracy) * 0.03;
        sprite.rotation = position.angle - wobble + (Math.random() * wobble * 2);

        // perform hitscan
        var vector = RotateVector2d(0, -3, position.angle);
        var location = {
          x: position.x,
          y: position.y
        };
       	var damage = this.weapon.damagePerShot * damageModifier;

			 	var empFired = false;

        for (var i = 0; i < 256; i++) {
          location.x += vector.x;
          location.y += vector.y;
          if (location.x < 0 || location.x > canvasWidth || location.y < 0 || location.y > canvasHeight)
            i = 256;

          if (Math.random() > 0.9)
            this.beamTrails.newPart(location.x * scalingFactor, location.y * scalingFactor);

          for (var j = 0; j < Enemies.activeShips.length; j ++) {
            if (!Enemies.activeShips[j].damagedByRailgun &&
								distanceBetweenPoints(location.x, location.y, Enemies.activeShips[j].xLoc, Enemies.activeShips[j].yLoc) <= 100 &&
								Enemies.activeShips[j].detectCollision(Enemies.activeShips[j], location.x, location.y)) {

              Enemies.damageEnemy(Enemies.activeShips[j], location.x, location.y, damage);
              Enemies.activeShips[j].damagedByRailgun = true;

							if (!Enemies.activeShips[j].inPlay && this.weapon.splitBeamOnKill) {
								this.fireShot({x:location.x, y:location.y, angle:Math.random() * 2 * Math.PI}, 0.5);
							}
							if (Math.random() < this.weapon.empChance && !empFired) {
								EMP.newEmp(location.x, location.y, this.weapon.emp, sprite.tint, 300);
								empFired = true;
							}
              damage *= 0.5;
            }
          }
        }
        for (var k = 0; k < Enemies.activeShips.length; k ++) {
          Enemies.activeShips[k].damagedByRailgun = false;
        }
			},
			beamTrails : {
				spritePool : SpritePool.create(Stars.stars.getTexture(), container),
				update:function(timeDiff) {
					for (var i = 0; i < this.spritePool.sprites.length; i++) {
						var sprite = this.spritePool.sprites[i];
						if (sprite.visible) {

							sprite.scale.x -= sprite.fadeSpeed * timeDiff;
							sprite.scale.y -= sprite.fadeSpeed * timeDiff;

							if (sprite.scale.x <= 0) {
								this.spritePool.discardSprite(sprite);
							} else {
								sprite.position.y += sprite.ySpeed * timeDiff;
								sprite.position.x += sprite.xSpeed * timeDiff;
							}

						}
					}
				},
				newPart:function(x, y) {
					var scale = 1 + Math.random() * 2;
					var part = this.spritePool.nextSprite();
					part.tint = 0x6060A0;
					part.fadeSpeed= 1 * scalingFactor;
					// part.tint = tint || (Math.random() > 0.4 ? 0xffff00 : 0xff5600);
					part.visible = true;
					// part.alpha = Math.random();
					part.position = {
						x: x,
						y: y
					};
					part.scale.x = scale * scalingFactor;
					part.scale.y = scale * scalingFactor;
					part.xSpeed = (-40 + Math.random() * 80) * scalingFactor;
					part.ySpeed = (-40 + Math.random() * 80) * scalingFactor;
				}
			},
			destroy : function() {
        this.spritePool.destroy();
      }
		};
  }
};
