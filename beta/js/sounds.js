var Sounds = {};

var createMusicBank = function(audiofiles, volume) {
  var soundBank = {
    sounds : [],
    soundCount:0,
    volume: volume,
    play:function(){
      this.sounds[this.soundCount].volume = this.volume * gameModel.masterVolume;
      this.sounds[this.soundCount].play();
    },
    pause:function() {
      this.sounds[this.soundCount].pause();
    },
    reset: function() {
      this.sounds[this.soundCount].currentTime = 0;
      this.soundCount++;
      if (this.soundCount >= this.sounds.length)
        this.soundCount=0;
    }
  };

  for (var i=0; i<audiofiles.length;i++) {
    soundBank.sounds[i] = new Audio(audiofiles[i]);
  }

  return soundBank;
};

var createSoundBank = function(audiofile, maxsamples, volume, maxFreq) {
  var soundBank = {
    sounds : [],
    soundCount:0,
    lastPlayed :0,
    volume: volume,
    maxFreq : maxFreq || 100,
    play:function(){
      var updateTime = new Date().getTime();
      if (this.lastPlayed + this.maxFreq < updateTime) {
        this.lastPlayed = updateTime;
        this.sounds[this.soundCount].volume = this.volume * gameModel.masterVolume;
        this.sounds[this.soundCount].play();
        this.soundCount++;
        if (this.soundCount >= this.sounds.length)
          this.soundCount=0;
      }

    }
  };

  for (var i=0; i<maxsamples;i++) {
    soundBank.sounds[i] = new Audio(audiofile);
  }

  return soundBank;
};

var createRandomSoundBank = function(audioFiles, maxSamples, volume) {
  var soundBank = {
    internalBanks : [],
    play : function () {
      this.internalBanks[Math.floor(Math.random() * this.internalBanks.length)].play();
    }
  }

  audioFiles.forEach(function(audioFile) {
    soundBank.internalBanks.push(createSoundBank(audioFile, maxSamples, volume));
  })

  return soundBank;
}

Sounds.powerup = createSoundBank("sounds/18_ITEM.wav",3,1);
Sounds.pickupCoin = createRandomSoundBank(["sounds/Pickup_Coin1.wav","sounds/Pickup_Coin2.wav","sounds/Pickup_Coin3.wav"],3,0.5);
Sounds.shipExplosion = createSoundBank("sounds/11_EXPRETAP.wav",5,0.5);
Sounds.enemyShot = createSoundBank("sounds/03_TEMP10.wav",5,0.7);
Sounds.damage = createSoundBank("sounds/08_EXP1RT.wav",7,0.6);
Sounds.enemyDamage = createSoundBank("sounds/08_EXP1RT.wav",15,0.5);
Sounds.playerBullets = createSoundBank("sounds/25_SCALEDN1.wav",10,0.3);
Sounds.playerLaser = createSoundBank("sounds/15_LAZGUN2.wav",10,0.3, 350);
Sounds.playerMissile = createSoundBank("sounds/07_BYPASS1.wav",10,0.3, 500);
Sounds.dodge = createSoundBank("sounds/05_PASS3.wav",2,0.7);
Sounds.winChimes = createSoundBank("sounds/winchimes.wav",1,0.3);
Sounds.music = createMusicBank(["music/GameMusic1.mp3"],0.7);
