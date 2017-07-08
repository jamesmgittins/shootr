Enemies = {
  allDeadTimer : 0,
  lastWave : 6000,
  waveFrequency : 5000,
  maxWaves : 3,
  waves:[],
  activeWaves:[],
  activeShips:[],
  enemiesKilled:0,
  enemiesSpawned:0,
  difficultyFactor:1,
  difficultyCheck : 0,
  currShipId : 1,



  update:function(timeDiff) {

    // reset active ships
    Enemies.activeShips = [];

  	if (timeLeft > 0) {
  		Enemies.allDeadTimer = 2000;
  	}

    // test for end of the level
  	if (timeLeft < 0 && Enemies.waves.length === 0) {
  		Enemies.allDeadTimer += (timeDiff * 1000);
  		if (Enemies.allDeadTimer > PlayerShip.allDeadTime && !Powerups.inPlay() && !MoneyPickup.inPlay()) {
  			if (Boss.bossActive()) {
  				Boss.update(timeDiff);
  			} else {
  				Boss.shield.hide();
  				changeState(states.levelComplete);
  				Weapons.reset();
  			}
  		}
  	}

    // auto adjust difficultyFactor every 10 kills
    if (Enemies.difficultyCheck + 10 < Enemies.enemiesKilled) {
      Enemies.difficultyCheck = Enemies.enemiesKilled;

      if (Enemies.enemiesKilled > Enemies.enemiesSpawned * 0.7 * Enemies.difficultyFactor) {
        Enemies.difficultyFactor = Math.min(Enemies.difficultyFactor + 0.1, 1.8);
      } else {
        Enemies.difficultyFactor = Math.max(Enemies.difficultyFactor - 0.1, 1);
      }
    }

    // see which waves are still active
    Enemies.activeWaves = [];
    for (var w=0; w < Enemies.waves.length; w++) {
      if (!Enemies.waves[w].finished)
        Enemies.activeWaves.push(Enemies.waves[w]);
    }

    // do we need to create a new wave
    Enemies.lastWave += timeDiff * 1000;
    if (Enemies.activeWaves.length < Enemies.maxWaves && Enemies.lastWave >= Enemies.waveFrequency && timeLeft > 0) {
      Enemies.lastWave = Math.random() * -1000;
      Enemies.activeWaves.push(Enemies.getEnemyWave());
    }

    // update each active wave
    for (var a = 0; a < Enemies.activeWaves.length; a++) {
      Enemies.activeWaves[a].update(timeDiff);
    }

    Enemies.waves = Enemies.activeWaves;

  },



  damageEnemy:function(enemy, xLoc, yLoc, damage, noEffect) {
    enemy.damage(xLoc, yLoc, damage * getDamageModifier(), noEffect);
  },



  reset:function() {

    for (var c=0; c < Enemies.waves.length; c++) {
      if (Enemies.waves[c].destroy) {
        Enemies.waves[c].destroy();
      }
    }

    Enemies.difficultyFactor = 1;
    Enemies.difficultyCheck = 0;
    Enemies.enemiesKilled = 0;
    Enemies.enemiesSpawned = 0;
    Enemies.allDeadTimer = 0;

  },

  enemySpawners : [],
  getEnemySpawners : function() {
    if (this.enemySpawners.length === 0) {
      this.enemySpawners = [
        function(){return new EnemyShips.wave();},
        function(){return new UFOs.bulletWave();},
        function(){return new UFOs.railWave();},
        function(){return new EnemyShips.wave();}
      ];
    }
    return this.enemySpawners;
  },


  getEnemyWave:function() {

    if ((startStar.asteroids && timeLeft / levelTime > 0.8) || (endStar.asteroids && timeLeft / levelTime < 0.30)) {
      return new Asteroids.wave();
    }


    return this.getEnemySpawners()[Math.floor(Math.random() * this.getEnemySpawners().length)]();

    // return new EnemyShips.wave();
    // return new UFOs.bulletWave();
  }


};
