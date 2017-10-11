Weapons = {
  types : {
    plasmaCannon:0,
  	railGun:1,
	  missileLauncher:2,
    vulcanCannon:3,
    bioGelGun: 4,
    sonicWave: 5
  },
  rarity : [
    {
      factor:1,
      chance:1,
      prefix: ""
    },
    {
      super:true,
      factor:1.5,
      chance:0.3,
      prefix : "Super "
    },
    {
      ultra:true,
      factor:2,
      chance:0.08,
      prefix : "Ultra "
    },
    {
      hyper:true,
      factor:3.5,
      chance:0.03,
      prefix : "Hyper "
    }
  ]
};





Weapons.missileLauncher = function(level, seed, rarity) {

	var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
	Math.seedrandom(seed);
	var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * rarity.factor;
	var shotsPerSecond = 1 + Math.random();
	var damagePerShot = dps / shotsPerSecond;
	var missileLauncher = {
    super:rarity.super,
		ultra:rarity.ultra,
    hyper:rarity.hyper,
		type: Constants.itemTypes.weapon,
		name: rarity.prefix + "Missile Launcher",
		seed: seed,
		level: level,
		dps: dps,
		shotsPerSecond: shotsPerSecond,
		damagePerShot: damagePerShot,
		accuracy: 0.5 + Math.random() * 0.5,
		price: Math.round(dps * 30),
		id: gameModel.weaponIdCounter++,
		weaponType : Weapons.types.missileLauncher
	};

	if (rarity.ultra || rarity.hyper) {
		missileLauncher.lowHealthSeek = true;
		missileLauncher.ultraText = "Missiles automatically lock on to the most damaged enemy ship";
		missileLauncher.ultraName = "Widowmaker";
	}

	return missileLauncher;
};

Weapons.getIconSvg =  function(item) {
  if (item.weaponType == Weapons.types.plasmaCannon) {
    if (item.alternateTexture == "hotdog")
      return "img/hot-dog-icon.svg";
    if (item.bullets == 3)
      return "img/level-three.svg";
    if (item.bullets == 2)
      return "img/level-two.svg";
    return "img/level-one.svg";
  }
  if (item.weaponType == Weapons.types.railGun)
    return "img/target-laser.svg";
  if (item.weaponType == Weapons.types.missileLauncher)
    return "img/barbed-arrow.svg";
  if (item.weaponType == Weapons.types.vulcanCannon)
      return "img/blaster.svg";
  if (item.weaponType == Weapons.types.bioGelGun)
      return "img/biohazard.svg";
  if (item.weaponType == Weapons.types.sonicWave)
      return "img/wifi.svg";
};

Weapons.generateWeapon = function(level, seed, ultra, rarity) {

  var weaponRarity = Weapons.rarity[0];

  for (var i=0; i<Weapons.rarity.length; i++) {
    if (ultra && Math.random() < Weapons.rarity[i].chance) {
      weaponRarity = Weapons.rarity[i];
    }
  }

  weaponRarity = rarity || weaponRarity;

  var weaponGenFunctions = [
    RailGun.laserCannon,
    Weapons.missileLauncher,
    VulcanCannon.vulcanCannon,
    BioGelGun.bioGelGun,
    PlasmaCannon.plasmaCannon,
    SonicWave.sonicWave
  ];

  return weaponGenFunctions[Math.floor(Math.random() * weaponGenFunctions.length)](level,seed,weaponRarity);
};



Weapons.createWeaponLogic = function(weapon, container) {
  if (weapon.weaponType == Weapons.types.plasmaCannon)
    return new PlasmaCannon.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.vulcanCannon)
    return new VulcanCannon.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.railGun)
    return new RailGun.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.missileLauncher)
    return new MissileLauncher.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.bioGelGun)
    return new BioGelGun.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.sonicWave)
    return new SonicWave.weaponLogic(weapon, container);
};

Weapons.attackDrone = {
  xLoc : 0,
  yLoc : 0,
  xSpeed : 0,
  ySpeed : 0,
  acceleration : 150,
  maxSpeed : 70
};

Weapons.weaponLogic = {};


Weapons.update = function(timeDiff) {

  var shouldPlayerShoot = PlayerShip.playerShip.inPlay && PlayerShip.playerShip.rolling > 1 && (timeLeft > 0 || Boss.bossActive() || Enemies.waves.length > 0);
  var fireRateModifier = Talents.fireRateModifier();

  if (Talents.attackDrone()) {
    if (!Weapons.attackDrone.sprite) {
      Weapons.attackDrone.sprite = new PIXI.Sprite(glowTexture(PIXI.Texture.fromCanvas(Ships.shipArt(PlayerShip.SHIP_SIZE / 3, gameModel.p1.ship.seed + 1, Ships.enemyColors[gameModel.p1.ship.colorIndex]))));
      // Weapons.attackDrone.sprite.scale = {x:0.4, y:0.4};
      Weapons.attackDrone.sprite.anchor = {x:0.5, y: 0.5};
      Weapons.attackDrone.sprite.tint = 0xEEEEEE;
      Weapons.attackDrone.colors = PlayerShip.playerShip.colors;
      Weapons.attackDroneContainer.addChild(Weapons.attackDrone.sprite);
    }
    var distanceFromPlayer = distanceBetweenPoints(Weapons.attackDrone.xLoc, Weapons.attackDrone.yLoc, PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc);
    if (distanceFromPlayer > 100)  {
      var accelX = PlayerShip.playerShip.xLoc - Weapons.attackDrone.xLoc;
      var accelY = PlayerShip.playerShip.yLoc - Weapons.attackDrone.yLoc;
      var factor = Weapons.attackDrone.acceleration / magnitude(accelX, accelY);

      Weapons.attackDrone.xSpeed += accelX * factor * timeDiff;
      Weapons.attackDrone.ySpeed += accelY * factor * timeDiff;

      if (magnitude(Weapons.attackDrone.xSpeed, Weapons.attackDrone.ySpeed) > 100) {
        var speedFactor = 100 / magnitude(Weapons.attackDrone.xSpeed, Weapons.attackDrone.ySpeed);
        Weapons.attackDrone.xSpeed *= speedFactor;
        Weapons.attackDrone.ySpeed *= speedFactor;
      }

      Weapons.attackDrone.trailX = Weapons.attackDrone.xLoc += Weapons.attackDrone.xSpeed * timeDiff;
      Weapons.attackDrone.trailY = Weapons.attackDrone.yLoc += Weapons.attackDrone.ySpeed * timeDiff;
    } else {
      Weapons.attackDrone.xSpeed *= 0.95;
      Weapons.attackDrone.ySpeed *= 0.95;
      Weapons.attackDrone.trailX = Weapons.attackDrone.xLoc += Weapons.attackDrone.xSpeed * timeDiff;
      Weapons.attackDrone.trailY = Weapons.attackDrone.yLoc += Weapons.attackDrone.ySpeed * timeDiff;
    }

    Weapons.attackDrone.sprite.position = {x : Weapons.attackDrone.xLoc * scalingFactor, y : Weapons.attackDrone.yLoc * scalingFactor};

    if (Math.random() > 0.92 && Weapons.attackDrone.sprite.visible)
      Stars.shipTrails.newPart(Weapons.attackDrone);

  }

  if (gameModel.p1.frontWeapon && !Weapons.weaponLogic.frontWeapon)
    Weapons.weaponLogic.frontWeapon = Weapons.createWeaponLogic(gameModel.p1.frontWeapon, playerBulletContainer);

  if (gameModel.p1.turretWeapon && !Weapons.weaponLogic.turretWeapon)
    Weapons.weaponLogic.turretWeapon = Weapons.createWeaponLogic(gameModel.p1.turretWeapon, playerBulletContainer);

  if (gameModel.p1.rearWeapon && !Weapons.weaponLogic.rearWeapon)
    Weapons.weaponLogic.rearWeapon = Weapons.createWeaponLogic(gameModel.p1.rearWeapon, playerBulletContainer);


  if (Weapons.weaponLogic.frontWeapon) {
    Weapons.weaponLogic.frontWeapon.update(timeDiff);
    if (Weapons.weaponLogic.frontWeapon.readyToFire(shouldPlayerShoot, timeDiff, fireRateModifier)) {
      Weapons.weaponLogic.frontWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc - 8, angle:0}, 1);
      if (Talents.attackDrone()) {
        Weapons.weaponLogic.frontWeapon.fireShot({x: Weapons.attackDrone.xLoc, y: Weapons.attackDrone.yLoc - 2, angle:0}, 0.5);
      }
    }
  }

  if (Weapons.weaponLogic.turretWeapon) {
    Weapons.weaponLogic.turretWeapon.update(timeDiff);
    if (Weapons.weaponLogic.turretWeapon.readyToFire(shouldPlayerShoot, timeDiff, fireRateModifier)) {
      Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle()}, 1);

      if (Buffs.isBuffActive(Buffs.buffNames.spreadShot)) {
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() - 0.12}, 1);
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() + 0.12}, 1);
      } else if (Buffs.isBuffActive(Buffs.buffNames.crossShot)) {
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() + Math.PI}, 1);
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() + Math.PI / 2}, 1);
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() - Math.PI / 2}, 1);
      }
    }

  }

  if (Weapons.weaponLogic.rearWeapon) {
    Weapons.weaponLogic.rearWeapon.update(timeDiff);
    if (Weapons.weaponLogic.rearWeapon.readyToFire(shouldPlayerShoot, timeDiff, fireRateModifier)) {
      Weapons.weaponLogic.rearWeapon.fireShot({x: PlayerShip.playerShip.xLoc + 16, y: PlayerShip.playerShip.yLoc + 16, angle: (Math.PI / 8), rear:true}, 0.5);
      Weapons.weaponLogic.rearWeapon.fireShot({x: PlayerShip.playerShip.xLoc - 16, y: PlayerShip.playerShip.yLoc + 16, angle:(-Math.PI / 8), rear:true}, 0.5);
    }
  }

  EMP.update(timeDiff);
};

Weapons.reset = function() {

  PlayerShip.playerShip.spreadShot = 0;
  PlayerShip.playerShip.crossShot = 0;

  if (Weapons.attackDrone.sprite) {
    Weapons.attackDrone.sprite.destroy();
    Weapons.attackDrone.sprite = false;
  }

  Bullets.enemyBullets.destroy();
  EMP.destroy();

  if (Weapons.weaponLogic.frontWeapon) {
    Weapons.weaponLogic.frontWeapon.destroy();
  }
  if (Weapons.weaponLogic.turretWeapon){
    Weapons.weaponLogic.turretWeapon.destroy();
  }
  if (Weapons.weaponLogic.rearWeapon) {
    Weapons.weaponLogic.rearWeapon.destroy();
  }
  Weapons.weaponLogic = {};

  if (playerBulletContainer)
    playerBulletContainer.removeChildren(0);
};
