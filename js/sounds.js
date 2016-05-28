var Sounds = {};

var createSoundBank = function(audiofile, maxsamples, volume) {
  var soundBank = {
    sounds : [],
    soundCount:0,
    lastPlayed :0,
    volume: volume,
    maxFreq : 100,
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

Sounds.powerup = createSoundBank("sounds/18_ITEM.wav",3,1);
Sounds.shipExplosion = createSoundBank("sounds/11_EXPRETAP.wav",5,0.5);
Sounds.enemyShot = createSoundBank("sounds/03_TEMP10.wav",5,0.7);
Sounds.damage = createSoundBank("sounds/08_EXP1RT.wav",7,0.6);
Sounds.enemyDamage = createSoundBank("sounds/08_EXP1RT.wav",15,0.5);
Sounds.playerBullets = createSoundBank("sounds/25_SCALEDN1.wav",10,0.3);
Sounds.dodge = createSoundBank("sounds/05_PASS3.wav",2,0.7);