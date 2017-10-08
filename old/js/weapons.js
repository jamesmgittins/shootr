Weapons = {
  types : {
    plasmaCannon:0,
  	laserCannon:1,
	  missileLauncher:2
  }
};

Weapons.plasmaCannon = function(level,seed,ultra) {
	var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
	Math.seedrandom(seed);
	var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * (ultra ? 1.5 : 1);
	var shotsPerSecond = 6 + Math.random() * 5;
	var damagePerShot = dps / shotsPerSecond;
  var bulletsPerShot = 1;

  if (level >= 5 && Math.random() > 0.7)
	  bulletsPerShot++;

  if (level >= 10 && Math.random() > 0.7)
	  bulletsPerShot++;

	var plasmaCannon =  {
		ultra:ultra,
		type: "weapon",
		name: (bulletsPerShot == 3 ? "Triple " : (bulletsPerShot == 2 ? "Double " : "")) + (ultra ? "Ultra " : "") + "Plasma Cannon",
		bullets : bulletsPerShot,
		seed: seed,
		level: level,
		dps: dps,
		shotsPerSecond: shotsPerSecond,
		damagePerShot: damagePerShot,
		accuracy: 0.5 + Math.random() * 0.5,
		bulletSpeed: 400,
		price: Math.round(dps * 30),
		id: gameModel.weaponIdCounter++,
		weaponType : Weapons.types.plasmaCannon
	}

	if (ultra) {
		if (Math.random() > 0.7 ) {
			plasmaCannon.ricochet = 0.1 + (Math.random() * 0.2);
			plasmaCannon.ultraName = "Second Chances";
			plasmaCannon.ultraText = "Bullets have a " + Math.round(plasmaCannon.ricochet * 100) + "% chance to ricochet off the edge of the screen";
		} else {
			plasmaCannon.passThrough = 0.1 + (Math.random() * 0.2);
			plasmaCannon.ultraName = "Deep Thunder";
			plasmaCannon.ultraText = "Bullets have a " + Math.round(plasmaCannon.passThrough * 100) + "% chance to not be destroyed";
		}

	}

	return plasmaCannon;
}

Weapons.laserCannon = function(level,seed,ultra) {
	var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
	Math.seedrandom(seed);
	var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * (ultra ? 1.5 : 1);
	var shotsPerSecond = 0.6 + Math.random() * 1.3;
	var damagePerShot = dps / shotsPerSecond;
	var laserCannon = {
		ultra:ultra,
		type: "weapon",
		name: (ultra ? "Ultra " : "") + "Railgun",
		seed: seed,
		level: level,
		dps: dps,
		shotsPerSecond: shotsPerSecond,
		damagePerShot: damagePerShot,
		accuracy: 0.5 + Math.random() * 0.5,
		price: Math.round(dps * 30),
		id: gameModel.weaponIdCounter++,
		weaponType : Weapons.types.laserCannon
	}

	if (ultra) {
		laserCannon.splitBeamOnKill = true;
		laserCannon.ultraName = "Chain Reaction";
		laserCannon.ultraText = "Whenever this gun destroys an enemy, the beam will split"
	}

	return laserCannon;
}

Weapons.missileLauncher = function(level,seed,ultra) {
	var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
	Math.seedrandom(seed);
	var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * (ultra ? 1.5 : 1);
	var shotsPerSecond = 1 + Math.random() * 3;
	var damagePerShot = dps / shotsPerSecond;
	var missileLauncher = {
		ultra:ultra,
		type: "weapon",
		name: (ultra ? "Ultra " : "") + "Missile Launcher",
		seed: seed,
		level: level,
		dps: dps,
		shotsPerSecond: shotsPerSecond,
		damagePerShot: damagePerShot,
		accuracy: 0.5 + Math.random() * 0.5,
		price: Math.round(dps * 30),
		id: gameModel.weaponIdCounter++,
		weaponType : Weapons.types.missileLauncher
	}

	if (ultra) {
		missileLauncher.lowHealthSeek = true;
		missileLauncher.ultraText = "Missiles automatically lock on to the most damaged enemy ship";
		missileLauncher.ultraName = "Widowmaker";
	}

	return missileLauncher;
}

Weapons.generateWeapon = function(level, seed, ultra) {
	if (Math.random() > 0.7)
		return Weapons.laserCannon(level,seed,ultra);

  if (Math.random() > 0.7)
		return Weapons.missileLauncher(level,seed,ultra);

	return Weapons.plasmaCannon(level,seed,ultra);
};

Weapons.update = function(timeDiff) {
  Bullets.updatePlasmaBullets(timeDiff);
  Bullets.railgunBeams.update(timeDiff);
  Bullets.missiles.update(timeDiff);
}

Weapons.reset = function() {
  Bullets.missiles.reset();
  Bullets.playerBullets.resetAll();
}
